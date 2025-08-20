import { generateId } from '../utils/index.js'

/**
 * Page entity class for managing page data
 */
export class Page {
  constructor(data = {}) {
    this.id = data.id || generateId()
    this.title = data.title || ''
    this.slug = data.slug || ''
    this.content = data.content || ''
    this.template = data.template || 'generic'
    this.status = data.status || 'draft'
    this.created_date = data.created_date || new Date().toISOString()
    this.updated_date = data.updated_date || new Date().toISOString()
    this.meta = data.meta || {}
    this.frontmatter = data.frontmatter || {}
  }

  /**
   * Create a new page
   */
  static async create(pageData) {
    const page = new Page({
      ...pageData,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    })
    
    // Save to localStorage for now (will be replaced with proper storage)
    const pages = await this.list()
    pages.push(page)
    localStorage.setItem('sidegen_pages', JSON.stringify(pages))
    
    return page
  }

  /**
   * Update an existing page
   */
  static async update(id, pageData) {
    const pages = await this.list()
    const index = pages.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error(`Page with id ${id} not found`)
    }
    
    pages[index] = {
      ...pages[index],
      ...pageData,
      updated_date: new Date().toISOString()
    }
    
    localStorage.setItem('sidegen_pages', JSON.stringify(pages))
    return pages[index]
  }

  /**
   * Delete a page
   */
  static async delete(id) {
    const pages = await this.list()
    const filteredPages = pages.filter(p => p.id !== id)
    localStorage.setItem('sidegen_pages', JSON.stringify(filteredPages))
    return true
  }

  /**
   * Get a page by ID
   */
  static async findById(id) {
    const pages = await this.list()
    return pages.find(p => p.id === id) || null
  }

  /**
   * Get a page by slug
   */
  static async findBySlug(slug) {
    const pages = await this.list()
    return pages.find(p => p.slug === slug) || null
  }

  /**
   * List all pages with optional sorting
   */
  static async list(sortBy = 'updated_date') {
    try {
      const stored = localStorage.getItem('sidegen_pages')
      let pages = stored ? JSON.parse(stored) : []
      
      // Ensure all pages have required fields
      pages = pages.map(page => new Page(page))
      
      // Sort pages
      if (sortBy.startsWith('-')) {
        const field = sortBy.substring(1)
        pages.sort((a, b) => new Date(b[field]) - new Date(a[field]))
      } else {
        pages.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]))
      }
      
      return pages
    } catch (error) {
      console.error('Error loading pages:', error)
      return []
    }
  }

  /**
   * Search pages by title or content
   */
  static async search(query) {
    const pages = await this.list()
    const lowercaseQuery = query.toLowerCase()
    
    return pages.filter(page => 
      page.title.toLowerCase().includes(lowercaseQuery) ||
      page.content.toLowerCase().includes(lowercaseQuery) ||
      page.slug.toLowerCase().includes(lowercaseQuery)
    )
  }

  /**
   * Get pages by status
   */
  static async getByStatus(status) {
    const pages = await this.list()
    return pages.filter(page => page.status === status)
  }

  /**
   * Get pages by template
   */
  static async getByTemplate(template) {
    const pages = await this.list()
    return pages.filter(page => page.template === template)
  }

  /**
   * Get published pages only
   */
  static async getPublished() {
    return this.getByStatus('published')
  }

  /**
   * Get draft pages only
   */
  static async getDrafts() {
    return this.getByStatus('draft')
  }

  /**
   * Validate page data
   */
  static validate(pageData) {
    const errors = []
    
    if (!pageData.title || pageData.title.trim() === '') {
      errors.push('Title is required')
    }
    
    if (!pageData.slug || pageData.slug.trim() === '') {
      errors.push('Slug is required')
    }
    
    if (!pageData.content || pageData.content.trim() === '') {
      errors.push('Content is required')
    }
    
    if (!['landing', 'post', 'generic'].includes(pageData.template)) {
      errors.push('Invalid template')
    }
    
    if (!['draft', 'published'].includes(pageData.status)) {
      errors.push('Invalid status')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Export page data
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug,
      content: this.content,
      template: this.template,
      status: this.status,
      created_date: this.created_date,
      updated_date: this.updated_date,
      meta: this.meta,
      frontmatter: this.frontmatter
    }
  }

  /**
   * Clone a page
   */
  clone() {
    return new Page({
      ...this.toJSON(),
      id: generateId(),
      title: `${this.title} (Copy)`,
      slug: `${this.slug}-copy`,
      status: 'draft',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    })
  }
}
