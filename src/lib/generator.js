import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'
import { MarkdownProcessor } from './markdown.js'
import { TemplateRenderer } from './template.js'
import { AssetProcessor } from './assets.js'
import { slugify } from '../utils/index.js'

/**
 * Static site generator core class
 */
export class SiteGenerator {
  constructor(config = {}) {
    this.config = {
      inputDir: 'content',
      outputDir: 'dist',
      templatesDir: 'templates',
      themesDir: 'themes',
      assetsDir: 'assets',
      publicDir: 'public',
      baseUrl: '',
      ...config
    }
    
    this.markdownProcessor = new MarkdownProcessor()
    this.templateRenderer = new TemplateRenderer(this.config)
    this.assetProcessor = new AssetProcessor(this.config)
    
    this.pages = new Map()
    this.collections = new Map()
    this.assets = new Map()
  }

  /**
   * Initialize the generator
   */
  async init() {
    await this.ensureDirectories()
    await this.loadConfig()
    await this.loadTheme()
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = [
      this.config.inputDir,
      this.config.outputDir,
      this.config.templatesDir,
      this.config.themesDir,
      this.config.assetsDir,
      this.config.publicDir
    ]
    
    for (const dir of dirs) {
      await fs.ensureDir(dir)
    }
  }

  /**
   * Load site configuration
   */
  async loadConfig() {
    const configPath = path.join(process.cwd(), 'sidegen.config.js')
    
    if (await fs.pathExists(configPath)) {
      try {
        const configModule = await import(configPath)
        this.config = { ...this.config, ...configModule.default }
      } catch (error) {
        console.warn('Error loading config:', error.message)
      }
    }
  }

  /**
   * Load active theme
   */
  async loadTheme() {
    // This will be implemented when we have the theme system
    // For now, use default theme
    this.theme = {
      name: 'default',
      templates: {},
      assets: {},
      config: {}
    }
  }

  /**
   * Discover and load all content files
   */
  async loadContent() {
    const contentPattern = path.join(this.config.inputDir, '**/*.{md,mdx}')
    const files = await glob(contentPattern)
    
    for (const file of files) {
      await this.loadContentFile(file)
    }
    
    this.organizeCollections()
  }

  /**
   * Load a single content file
   */
  async loadContentFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const processed = await this.markdownProcessor.process(content)
      
      const relativePath = path.relative(this.config.inputDir, filePath)
      const parsedPath = path.parse(relativePath)
      
      const page = {
        id: this.generatePageId(relativePath),
        filePath,
        relativePath,
        slug: this.generateSlug(processed.frontmatter, parsedPath),
        title: processed.frontmatter.title || parsedPath.name,
        content: processed.content,
        html: processed.html,
        frontmatter: processed.frontmatter,
        excerpt: processed.excerpt,
        wordCount: this.markdownProcessor.getWordCount(processed.content),
        readingTime: this.markdownProcessor.getReadingTime(processed.content),
        toc: this.markdownProcessor.getToc(processed.content),
        template: processed.frontmatter.template || 'default',
        layout: processed.frontmatter.layout || 'default',
        date: this.parseDate(processed.frontmatter.date, filePath),
        draft: processed.frontmatter.draft || false,
        tags: this.parseTags(processed.frontmatter.tags),
        categories: this.parseCategories(processed.frontmatter.categories),
        collection: this.determineCollection(relativePath, processed.frontmatter)
      }
      
      this.pages.set(page.id, page)
      return page
    } catch (error) {
      console.error(`Error loading content file ${filePath}:`, error)
      return null
    }
  }

  /**
   * Generate unique page ID
   */
  generatePageId(relativePath) {
    return relativePath.replace(/[^a-zA-Z0-9]/g, '_')
  }

  /**
   * Generate page slug
   */
  generateSlug(frontmatter, parsedPath) {
    if (frontmatter.slug) {
      return slugify(frontmatter.slug)
    }
    
    if (frontmatter.title) {
      return slugify(frontmatter.title)
    }
    
    return slugify(parsedPath.name)
  }

  /**
   * Parse date from frontmatter or file stats
   */
  parseDate(dateValue, filePath) {
    if (dateValue) {
      return new Date(dateValue)
    }
    
    // Fallback to file modification time
    try {
      const stats = fs.statSync(filePath)
      return stats.mtime
    } catch {
      return new Date()
    }
  }

  /**
   * Parse tags from frontmatter
   */
  parseTags(tags) {
    if (!tags) return []
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim())
    }
    return []
  }

  /**
   * Parse categories from frontmatter
   */
  parseCategories(categories) {
    if (!categories) return []
    if (Array.isArray(categories)) return categories
    if (typeof categories === 'string') {
      return categories.split(',').map(cat => cat.trim())
    }
    return []
  }

  /**
   * Determine collection based on file path and frontmatter
   */
  determineCollection(relativePath, frontmatter) {
    if (frontmatter.collection) {
      return frontmatter.collection
    }
    
    const pathParts = relativePath.split(path.sep)
    if (pathParts.length > 1) {
      return pathParts[0]
    }
    
    return 'pages'
  }

  /**
   * Organize pages into collections
   */
  organizeCollections() {
    this.collections.clear()
    
    for (const page of this.pages.values()) {
      if (!this.collections.has(page.collection)) {
        this.collections.set(page.collection, [])
      }
      
      this.collections.get(page.collection).push(page)
    }
    
    // Sort collections by date (newest first)
    for (const [name, pages] of this.collections) {
      pages.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  }

  /**
   * Generate all pages
   */
  async generate() {
    console.log('Starting site generation...')
    
    await this.init()
    await this.loadContent()
    await this.generatePages()
    await this.generateCollectionPages()
    await this.generateAssets()
    await this.copyPublicFiles()
    
    console.log('Site generation complete!')
  }

  /**
   * Generate individual pages
   */
  async generatePages() {
    for (const page of this.pages.values()) {
      if (page.draft && process.env.NODE_ENV === 'production') {
        continue
      }
      
      await this.generatePage(page)
    }
  }

  /**
   * Generate a single page
   */
  async generatePage(page) {
    try {
      const html = await this.templateRenderer.render(page.template, {
        page,
        site: this.getSiteData(),
        collections: Object.fromEntries(this.collections)
      })
      
      const outputPath = this.getPageOutputPath(page)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, html)
      
      console.log(`Generated: ${outputPath}`)
    } catch (error) {
      console.error(`Error generating page ${page.slug}:`, error)
    }
  }

  /**
   * Get output path for a page
   */
  getPageOutputPath(page) {
    const fileName = page.slug === 'index' ? 'index.html' : `${page.slug}/index.html`
    return path.join(this.config.outputDir, fileName)
  }

  /**
   * Generate collection pages (like blog index, tag pages, etc.)
   */
  async generateCollectionPages() {
    for (const [name, pages] of this.collections) {
      if (name === 'pages') continue // Skip default pages collection
      
      await this.generateCollectionIndex(name, pages)
      await this.generateTagPages(pages)
      await this.generateCategoryPages(pages)
    }
  }

  /**
   * Generate collection index page
   */
  async generateCollectionIndex(collectionName, pages) {
    try {
      const html = await this.templateRenderer.render('collection', {
        collection: {
          name: collectionName,
          pages: pages.filter(p => !p.draft || process.env.NODE_ENV !== 'production')
        },
        site: this.getSiteData()
      })
      
      const outputPath = path.join(this.config.outputDir, collectionName, 'index.html')
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, html)
      
      console.log(`Generated collection: ${outputPath}`)
    } catch (error) {
      console.error(`Error generating collection ${collectionName}:`, error)
    }
  }

  /**
   * Generate tag pages
   */
  async generateTagPages(pages) {
    const tagMap = new Map()
    
    for (const page of pages) {
      for (const tag of page.tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, [])
        }
        tagMap.get(tag).push(page)
      }
    }
    
    for (const [tag, tagPages] of tagMap) {
      try {
        const html = await this.templateRenderer.render('tag', {
          tag,
          pages: tagPages.filter(p => !p.draft || process.env.NODE_ENV !== 'production'),
          site: this.getSiteData()
        })
        
        const outputPath = path.join(this.config.outputDir, 'tags', slugify(tag), 'index.html')
        await fs.ensureDir(path.dirname(outputPath))
        await fs.writeFile(outputPath, html)
        
        console.log(`Generated tag page: ${outputPath}`)
      } catch (error) {
        console.error(`Error generating tag page ${tag}:`, error)
      }
    }
  }

  /**
   * Generate category pages
   */
  async generateCategoryPages(pages) {
    const categoryMap = new Map()
    
    for (const page of pages) {
      for (const category of page.categories) {
        if (!categoryMap.has(category)) {
          categoryMap.set(category, [])
        }
        categoryMap.get(category).push(page)
      }
    }
    
    for (const [category, categoryPages] of categoryMap) {
      try {
        const html = await this.templateRenderer.render('category', {
          category,
          pages: categoryPages.filter(p => !p.draft || process.env.NODE_ENV !== 'production'),
          site: this.getSiteData()
        })
        
        const outputPath = path.join(this.config.outputDir, 'categories', slugify(category), 'index.html')
        await fs.ensureDir(path.dirname(outputPath))
        await fs.writeFile(outputPath, html)
        
        console.log(`Generated category page: ${outputPath}`)
      } catch (error) {
        console.error(`Error generating category page ${category}:`, error)
      }
    }
  }

  /**
   * Generate and process assets
   */
  async generateAssets() {
    await this.assetProcessor.process()
  }

  /**
   * Copy public files to output directory
   */
  async copyPublicFiles() {
    if (await fs.pathExists(this.config.publicDir)) {
      await fs.copy(this.config.publicDir, this.config.outputDir)
      console.log('Copied public files')
    }
  }

  /**
   * Get site data for templates
   */
  getSiteData() {
    return {
      title: this.config.title || 'My Site',
      description: this.config.description || '',
      baseUrl: this.config.baseUrl || '',
      author: this.config.author || '',
      buildTime: new Date().toISOString(),
      pages: Array.from(this.pages.values()),
      collections: Object.fromEntries(this.collections)
    }
  }

  /**
   * Watch for changes in development
   */
  async watch() {
    const chokidar = await import('chokidar')
    
    const watcher = chokidar.watch([
      this.config.inputDir,
      this.config.templatesDir,
      this.config.themesDir
    ], {
      ignored: /node_modules/,
      persistent: true
    })
    
    watcher.on('change', async (filePath) => {
      console.log(`File changed: ${filePath}`)
      await this.generate()
    })
    
    watcher.on('add', async (filePath) => {
      console.log(`File added: ${filePath}`)
      await this.generate()
    })
    
    watcher.on('unlink', async (filePath) => {
      console.log(`File removed: ${filePath}`)
      await this.generate()
    })
    
    console.log('Watching for changes...')
    return watcher
  }
}
