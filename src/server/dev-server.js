import express from 'express'
import { WebSocketServer } from 'ws'
import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs-extra'
import { createServer } from 'http'
import { SiteGenerator } from '../lib/generator.js'
import { loadConfig } from '../config/index.js'
import chalk from 'chalk'
import mime from 'mime-types'

/**
 * Development server with live reloading
 */
export class DevServer {
  constructor(options = {}) {
    this.options = {
      port: 3001,
      host: 'localhost',
      open: true,
      livereload: true,
      ...options
    }
    
    this.app = express()
    this.server = createServer(this.app)
    this.wss = null
    this.generator = null
    this.config = null
    this.isBuilding = false
  }

  /**
   * Start the development server
   */
  async start() {
    try {
      // Load configuration
      this.config = await loadConfig(this.options.config)
      this.config.development = true
      
      // Create generator
      this.generator = new SiteGenerator(this.config)
      
      // Setup WebSocket for live reloading
      if (this.options.livereload) {
        this.setupWebSocket()
      }
      
      // Setup Express middleware
      this.setupMiddleware()
      
      // Initial build
      console.log(chalk.blue('Building site...'))
      await this.generator.generate()
      console.log(chalk.green('Initial build complete'))
      
      // Setup file watching
      this.setupWatcher()
      
      // Start server
      await new Promise((resolve, reject) => {
        this.server.listen(this.options.port, this.options.host, (error) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        })
      })
      
      const url = `http://${this.options.host}:${this.options.port}`
      console.log(chalk.green(`\n🚀 Development server running at ${url}`))
      console.log(chalk.gray('Press Ctrl+C to stop'))
      
      // Open browser
      if (this.options.open) {
        const { default: open } = await import('open')
        await open(url)
      }
      
      return this.server
    } catch (error) {
      console.error(chalk.red('Failed to start development server:'), error)
      throw error
    }
  }

  /**
   * Stop the development server
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close()
    }
    
    if (this.wss) {
      this.wss.close()
    }
    
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve)
      })
    }
    
    console.log(chalk.yellow('Development server stopped'))
  }

  /**
   * Setup WebSocket for live reloading
   */
  setupWebSocket() {
    this.wss = new WebSocketServer({ server: this.server })
    
    this.wss.on('connection', (ws) => {
      console.log(chalk.gray('Client connected for live reload'))
      
      ws.on('close', () => {
        console.log(chalk.gray('Client disconnected'))
      })
    })
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Serve static files from build directory
    this.app.use(express.static(this.config.outputDir, {
      index: 'index.html',
      extensions: ['html']
    }))
    
    // API endpoints for development
    this.app.get('/_dev/status', (req, res) => {
      res.json({
        status: 'running',
        building: this.isBuilding,
        config: {
          title: this.config.title,
          version: this.config.version
        }
      })
    })
    
    this.app.get('/_dev/rebuild', async (req, res) => {
      try {
        await this.rebuild()
        res.json({ success: true })
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })
    
    // Inject live reload script
    if (this.options.livereload) {
      this.app.use(this.injectLiveReloadScript.bind(this))
    }
    
    // SPA fallback - serve index.html for unknown routes
    this.app.get('*', async (req, res) => {
      try {
        const indexPath = path.join(this.config.outputDir, 'index.html')
        
        if (await fs.pathExists(indexPath)) {
          let html = await fs.readFile(indexPath, 'utf-8')
          
          // Inject live reload script
          if (this.options.livereload) {
            html = this.addLiveReloadScript(html)
          }
          
          res.send(html)
        } else {
          res.status(404).send('Page not found')
        }
      } catch (error) {
        console.error('Error serving page:', error)
        res.status(500).send('Internal server error')
      }
    })
  }

  /**
   * Setup file watcher
   */
  setupWatcher() {
    const watchPaths = [
      this.config.inputDir,
      this.config.templatesDir,
      this.config.themesDir,
      this.config.assetsDir,
      'sidegen.config.js',
      'sidegen.config.json'
    ]
    
    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        /node_modules/,
        this.config.outputDir,
        /\.git/
      ],
      persistent: true,
      ignoreInitial: true
    })
    
    // Debounce rebuilds
    let rebuildTimeout
    const debouncedRebuild = () => {
      clearTimeout(rebuildTimeout)
      rebuildTimeout = setTimeout(() => {
        this.rebuild()
      }, 100)
    }
    
    this.watcher.on('change', (filePath) => {
      console.log(chalk.gray(`File changed: ${path.relative(process.cwd(), filePath)}`))
      debouncedRebuild()
    })
    
    this.watcher.on('add', (filePath) => {
      console.log(chalk.gray(`File added: ${path.relative(process.cwd(), filePath)}`))
      debouncedRebuild()
    })
    
    this.watcher.on('unlink', (filePath) => {
      console.log(chalk.gray(`File removed: ${path.relative(process.cwd(), filePath)}`))
      debouncedRebuild()
    })
    
    console.log(chalk.blue('👀 Watching for changes...'))
  }

  /**
   * Rebuild the site
   */
  async rebuild() {
    if (this.isBuilding) {
      return
    }
    
    this.isBuilding = true
    
    try {
      console.log(chalk.blue('Rebuilding...'))
      const startTime = Date.now()
      
      // Reload configuration
      this.config = await loadConfig(this.options.config)
      this.config.development = true
      
      // Update generator config
      this.generator.config = this.config
      
      // Regenerate site
      await this.generator.generate()
      
      const duration = Date.now() - startTime
      console.log(chalk.green(`✅ Rebuilt in ${duration}ms`))
      
      // Notify clients to reload
      if (this.wss) {
        this.broadcast({ type: 'reload' })
      }
    } catch (error) {
      console.error(chalk.red('❌ Build error:'), error.message)
      
      // Notify clients of error
      if (this.wss) {
        this.broadcast({ 
          type: 'error', 
          message: error.message 
        })
      }
    } finally {
      this.isBuilding = false
    }
  }

  /**
   * Broadcast message to all WebSocket clients
   */
  broadcast(message) {
    if (!this.wss) return
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message))
      }
    })
  }

  /**
   * Middleware to inject live reload script
   */
  injectLiveReloadScript(req, res, next) {
    const originalSend = res.send
    
    res.send = function(body) {
      if (typeof body === 'string' && body.includes('</body>')) {
        body = this.addLiveReloadScript(body)
      }
      originalSend.call(this, body)
    }.bind(this)
    
    next()
  }

  /**
   * Add live reload script to HTML
   */
  addLiveReloadScript(html) {
    const script = `
<script>
(function() {
  const ws = new WebSocket('ws://${this.options.host}:${this.options.port}');
  
  ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    if (data.type === 'reload') {
      console.log('🔄 Reloading page...');
      window.location.reload();
    } else if (data.type === 'error') {
      console.error('❌ Build error:', data.message);
      // Could show error overlay here
    }
  };
  
  ws.onopen = function() {
    console.log('🔗 Connected to dev server');
  };
  
  ws.onclose = function() {
    console.log('🔌 Disconnected from dev server');
    // Try to reconnect
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
})();
</script>
`
    
    return html.replace('</body>', script + '</body>')
  }
}

/**
 * Start development server
 */
export async function startDevServer(options = {}) {
  const server = new DevServer(options)
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n🛑 Shutting down development server...'))
    await server.stop()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await server.stop()
    process.exit(0)
  })
  
  return server.start()
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    port: parseInt(process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1]) || 3001,
    host: process.argv.find(arg => arg.startsWith('--host='))?.split('=')[1] || 'localhost',
    open: !process.argv.includes('--no-open'),
    livereload: !process.argv.includes('--no-livereload'),
    config: process.argv.find(arg => arg.startsWith('--config='))?.split('=')[1]
  }
  
  startDevServer(options).catch(error => {
    console.error(chalk.red('Failed to start development server:'), error)
    process.exit(1)
  })
}
