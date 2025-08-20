import matter from 'gray-matter'

/**
 * Markdown processor class for parsing and converting markdown content
 */
export class MarkdownProcessor {
  constructor(options = {}) {
    this.options = {
      gfm: true,
      frontmatter: true,
      highlight: true,
      ...options
    }
    
    this.processor = this.createProcessor()
  }

  /**
   * Create the unified processor with plugins
   */
  createProcessor() {
    // Simplified processor for now
    return {
      process: async (content) => content
    }
  }

  /**
   * Parse markdown content with frontmatter
   */
  parse(content) {
    try {
      const parsed = matter(content)
      
      return {
        content: parsed.content,
        frontmatter: parsed.data,
        excerpt: parsed.excerpt || this.extractExcerpt(parsed.content),
        raw: content
      }
    } catch (error) {
      console.error('Error parsing markdown:', error)
      return {
        content: content,
        frontmatter: {},
        excerpt: this.extractExcerpt(content),
        raw: content
      }
    }
  }

  /**
   * Convert markdown to HTML
   */
  async toHtml(content) {
    try {
      // Process custom button syntax first
      content = this.processButtons(content)

      // Simple markdown to HTML conversion for now
      return content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<h|<\/p>)(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '')
    } catch (error) {
      console.error('Error converting markdown to HTML:', error)
      return content
    }
  }

  /**
   * Process custom button syntax in markdown
   * Syntax: [Button Text](button:action-type:parameters)
   * Examples:
   * - [Get Started](button:link:https://example.com)
   * - [Contact Us](button:email:contact@example.com)
   * - [Download](button:download:file.pdf)
   * - [Alert](button:alert:Hello World!)
   */
  processButtons(content) {
    return content.replace(
      /\[([^\]]+)\]\(button:([^:]+):([^)]+)\)/g,
      (match, text, action, parameter) => {
        const buttonId = `btn-${Math.random().toString(36).substr(2, 9)}`

        switch (action) {
          case 'link':
            return `<a href="${parameter}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">${text}</a>`

          case 'email':
            return `<a href="mailto:${parameter}" class="btn btn-secondary">${text}</a>`

          case 'download':
            return `<a href="${parameter}" class="btn btn-outline" download>${text}</a>`

          case 'alert':
            return `<button class="btn btn-primary" onclick="alert('${parameter.replace(/'/g, "\\'")}')">${text}</button>`

          case 'scroll':
            return `<button class="btn btn-secondary" onclick="document.getElementById('${parameter}').scrollIntoView({behavior: 'smooth'})">${text}</button>`

          case 'toggle':
            return `<button class="btn btn-outline" onclick="toggleElement('${parameter}')">${text}</button>`

          default:
            // Default to a styled button with custom onclick
            return `<button class="btn btn-primary" onclick="${action}('${parameter}')">${text}</button>`
        }
      }
    )
  }

  /**
   * Process markdown file with frontmatter and convert to HTML
   */
  async process(content) {
    const parsed = this.parse(content)
    const html = await this.toHtml(parsed.content)
    
    return {
      ...parsed,
      html
    }
  }

  /**
   * Extract excerpt from content
   */
  extractExcerpt(content, maxLength = 200) {
    // Remove markdown syntax for a clean excerpt
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()
    
    if (cleanContent.length <= maxLength) return cleanContent
    return cleanContent.slice(0, maxLength).trim() + '...'
  }

  /**
   * Validate markdown content
   */
  validate(content) {
    const errors = []
    
    try {
      const parsed = this.parse(content)
      
      // Check for required frontmatter fields
      if (!parsed.frontmatter.title) {
        errors.push('Missing title in frontmatter')
      }
      
      // Check for empty content
      if (!parsed.content.trim()) {
        errors.push('Content is empty')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        parsed
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`Invalid markdown: ${error.message}`],
        parsed: null
      }
    }
  }

  /**
   * Get table of contents from markdown content
   */
  getToc(content) {
    const headings = []
    const lines = content.split('\n')
    
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        headings.push({
          level,
          text,
          slug,
          anchor: `#${slug}`
        })
      }
    }
    
    return headings
  }

  /**
   * Add anchor links to headings
   */
  addAnchorLinks(html) {
    return html.replace(
      /<h([1-6])([^>]*)>([^<]+)<\/h[1-6]>/g,
      (match, level, attrs, text) => {
        const slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
        
        return `<h${level}${attrs} id="${slug}">
          <a href="#${slug}" class="anchor-link">${text}</a>
        </h${level}>`
      }
    )
  }

  /**
   * Process images in markdown
   */
  processImages(content, baseUrl = '') {
    return content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, src) => {
        // Handle relative URLs
        if (!src.startsWith('http') && !src.startsWith('/') && baseUrl) {
          src = `${baseUrl}/${src}`
        }
        
        return `![${alt}](${src})`
      }
    )
  }

  /**
   * Process links in markdown
   */
  processLinks(content, baseUrl = '') {
    return content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (match, text, href) => {
        // Handle relative URLs for internal links
        if (!href.startsWith('http') && !href.startsWith('/') && !href.startsWith('#') && baseUrl) {
          href = `${baseUrl}/${href}`
        }
        
        return `[${text}](${href})`
      }
    )
  }

  /**
   * Get word count from content
   */
  getWordCount(content) {
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()
    
    return cleanContent.split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Estimate reading time
   */
  getReadingTime(content, wordsPerMinute = 200) {
    const wordCount = this.getWordCount(content)
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return {
      wordCount,
      minutes,
      text: `${minutes} min read`
    }
  }
}
