import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'

/**
 * Default configuration
 */
const defaultConfig = {
  // Site information
  title: 'My NuMark Site',
  description: 'A modern static site built with NuMark',
  author: '',
  baseUrl: '',
  language: 'en',
  
  // Build settings
  inputDir: 'content',
  outputDir: 'dist',
  templatesDir: 'templates',
  themesDir: 'themes',
  assetsDir: 'assets',
  publicDir: 'public',
  
  // Content settings
  defaultTemplate: 'default',
  defaultLayout: 'default',
  excerptLength: 200,
  dateFormat: 'YYYY-MM-DD',
  
  // Build options
  minifyHTML: true,
  minifyCSS: true,
  minifyJS: true,
  optimizeImages: true,
  generateSitemap: true,
  generateRSS: true,
  
  // Development settings
  development: false,
  devServer: {
    port: 3000,
    host: 'localhost',
    open: true,
    livereload: true
  },
  
  // SEO settings
  seo: {
    generateMetaTags: true,
    generateOpenGraph: true,
    generateTwitterCard: true,
    generateJsonLd: true
  },
  
  // Collections
  collections: {
    posts: {
      pattern: 'posts/**/*.md',
      sortBy: 'date',
      sortOrder: 'desc',
      template: 'post',
      permalink: '/posts/:slug/'
    },
    pages: {
      pattern: 'pages/**/*.md',
      sortBy: 'title',
      sortOrder: 'asc',
      template: 'page',
      permalink: '/:slug/'
    }
  },
  
  // Markdown settings
  markdown: {
    gfm: true,
    frontmatter: true,
    highlight: true,
    toc: true,
    anchorLinks: true
  },
  
  // Theme settings
  theme: {
    name: 'default',
    customCSS: [],
    customJS: []
  },
  
  // Plugin settings
  plugins: []
}

/**
 * Load configuration from file
 */
export async function loadConfig(configPath) {
  let config = { ...defaultConfig }
  
  // Try to load from specified path or default locations
  const possiblePaths = configPath ? [configPath] : [
    'numark.config.js',
    'numark.config.json',
    'numark.config.yaml',
    'numark.config.yml',
    'sidegen.config.js', // Legacy support
    '_config.yml',
    '_config.yaml'
  ]
  
  for (const filePath of possiblePaths) {
    if (await fs.pathExists(filePath)) {
      try {
        const userConfig = await loadConfigFile(filePath)
        config = mergeConfig(config, userConfig)
        console.log(`Loaded config from: ${filePath}`)
        break
      } catch (error) {
        console.warn(`Error loading config from ${filePath}:`, error.message)
      }
    }
  }
  
  // Validate and normalize configuration
  config = validateConfig(config)
  
  return config
}

/**
 * Load configuration from a specific file
 */
async function loadConfigFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const content = await fs.readFile(filePath, 'utf-8')
  
  switch (ext) {
    case '.js':
      // Dynamic import for ES modules
      const configModule = await import(path.resolve(filePath))
      return configModule.default || configModule
      
    case '.json':
      return JSON.parse(content)
      
    case '.yaml':
    case '.yml':
      return yaml.parse(content)
      
    default:
      throw new Error(`Unsupported config file format: ${ext}`)
  }
}

/**
 * Merge user configuration with defaults
 */
function mergeConfig(defaultConfig, userConfig) {
  const merged = { ...defaultConfig }
  
  for (const [key, value] of Object.entries(userConfig)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Deep merge objects
      merged[key] = mergeConfig(merged[key] || {}, value)
    } else {
      // Direct assignment for primitives and arrays
      merged[key] = value
    }
  }
  
  return merged
}

/**
 * Validate and normalize configuration
 */
function validateConfig(config) {
  const errors = []
  
  // Validate required fields
  if (!config.title) {
    errors.push('Site title is required')
  }
  
  if (!config.inputDir) {
    errors.push('Input directory is required')
  }
  
  if (!config.outputDir) {
    errors.push('Output directory is required')
  }
  
  // Validate directories
  const requiredDirs = ['inputDir', 'outputDir', 'templatesDir', 'assetsDir']
  for (const dir of requiredDirs) {
    if (config[dir] && typeof config[dir] !== 'string') {
      errors.push(`${dir} must be a string`)
    }
  }
  
  // Validate collections
  if (config.collections) {
    for (const [name, collection] of Object.entries(config.collections)) {
      if (!collection.pattern) {
        errors.push(`Collection '${name}' must have a pattern`)
      }
      
      if (collection.sortOrder && !['asc', 'desc'].includes(collection.sortOrder)) {
        errors.push(`Collection '${name}' sortOrder must be 'asc' or 'desc'`)
      }
    }
  }
  
  // Validate dev server settings
  if (config.devServer) {
    if (config.devServer.port && (typeof config.devServer.port !== 'number' || config.devServer.port < 1 || config.devServer.port > 65535)) {
      errors.push('Dev server port must be a number between 1 and 65535')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
  
  // Normalize paths
  config.inputDir = path.resolve(config.inputDir)
  config.outputDir = path.resolve(config.outputDir)
  config.templatesDir = path.resolve(config.templatesDir)
  config.themesDir = path.resolve(config.themesDir)
  config.assetsDir = path.resolve(config.assetsDir)
  config.publicDir = path.resolve(config.publicDir)
  
  // Ensure baseUrl doesn't end with slash
  if (config.baseUrl && config.baseUrl.endsWith('/')) {
    config.baseUrl = config.baseUrl.slice(0, -1)
  }
  
  return config
}

/**
 * Save configuration to file
 */
export async function saveConfig(config, filePath = 'sidegen.config.json') {
  const ext = path.extname(filePath).toLowerCase()
  let content
  
  switch (ext) {
    case '.json':
      content = JSON.stringify(config, null, 2)
      break
      
    case '.yaml':
    case '.yml':
      content = yaml.stringify(config)
      break
      
    case '.js':
      content = `export default ${JSON.stringify(config, null, 2)}`
      break
      
    default:
      throw new Error(`Unsupported config file format: ${ext}`)
  }
  
  await fs.writeFile(filePath, content)
}

/**
 * Create default configuration file
 */
export async function createDefaultConfig(filePath = 'numark.config.json') {
  await saveConfig(defaultConfig, filePath)
  console.log(`Created default configuration: ${filePath}`)
}

/**
 * Get configuration schema for validation
 */
export function getConfigSchema() {
  return {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      author: { type: 'string' },
      baseUrl: { type: 'string' },
      language: { type: 'string' },
      inputDir: { type: 'string' },
      outputDir: { type: 'string' },
      templatesDir: { type: 'string' },
      themesDir: { type: 'string' },
      assetsDir: { type: 'string' },
      publicDir: { type: 'string' },
      defaultTemplate: { type: 'string' },
      defaultLayout: { type: 'string' },
      excerptLength: { type: 'number' },
      dateFormat: { type: 'string' },
      minifyHTML: { type: 'boolean' },
      minifyCSS: { type: 'boolean' },
      minifyJS: { type: 'boolean' },
      optimizeImages: { type: 'boolean' },
      generateSitemap: { type: 'boolean' },
      generateRSS: { type: 'boolean' },
      development: { type: 'boolean' },
      devServer: {
        type: 'object',
        properties: {
          port: { type: 'number' },
          host: { type: 'string' },
          open: { type: 'boolean' },
          livereload: { type: 'boolean' }
        }
      },
      seo: {
        type: 'object',
        properties: {
          generateMetaTags: { type: 'boolean' },
          generateOpenGraph: { type: 'boolean' },
          generateTwitterCard: { type: 'boolean' },
          generateJsonLd: { type: 'boolean' }
        }
      },
      collections: {
        type: 'object',
        patternProperties: {
          '.*': {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              sortBy: { type: 'string' },
              sortOrder: { type: 'string', enum: ['asc', 'desc'] },
              template: { type: 'string' },
              permalink: { type: 'string' }
            },
            required: ['pattern']
          }
        }
      },
      markdown: {
        type: 'object',
        properties: {
          gfm: { type: 'boolean' },
          frontmatter: { type: 'boolean' },
          highlight: { type: 'boolean' },
          toc: { type: 'boolean' },
          anchorLinks: { type: 'boolean' }
        }
      },
      theme: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          customCSS: { type: 'array', items: { type: 'string' } },
          customJS: { type: 'array', items: { type: 'string' } }
        }
      },
      plugins: { type: 'array', items: { type: 'string' } }
    },
    required: ['title', 'inputDir', 'outputDir']
  }
}
