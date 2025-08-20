import fs from 'fs-extra'
import path from 'path'
import React from 'react'
import { renderToString } from 'react-dom/server'

/**
 * Template renderer class for processing React templates
 */
export class TemplateRenderer {
  constructor(config = {}) {
    this.config = config
    this.templates = new Map()
    this.layouts = new Map()
    this.components = new Map()
  }

  /**
   * Load all templates from the templates directory
   */
  async loadTemplates() {
    const templatesDir = this.config.templatesDir || 'templates'
    
    if (!(await fs.pathExists(templatesDir))) {
      console.warn(`Templates directory not found: ${templatesDir}`)
      return
    }
    
    await this.loadTemplatesFromDir(templatesDir)
  }

  /**
   * Load templates from a directory recursively
   */
  async loadTemplatesFromDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        await this.loadTemplatesFromDir(fullPath)
      } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
        await this.loadTemplate(fullPath)
      }
    }
  }

  /**
   * Load a single template file
   */
  async loadTemplate(filePath) {
    try {
      const relativePath = path.relative(this.config.templatesDir || 'templates', filePath)
      const templateName = path.parse(relativePath).name
      
      // Dynamic import of the template
      const templateModule = await import(filePath)
      const Template = templateModule.default || templateModule[templateName]
      
      if (typeof Template === 'function') {
        this.templates.set(templateName, Template)
        console.log(`Loaded template: ${templateName}`)
      } else {
        console.warn(`Template ${templateName} does not export a valid React component`)
      }
    } catch (error) {
      console.error(`Error loading template ${filePath}:`, error)
    }
  }

  /**
   * Render a template with data
   */
  async render(templateName, data = {}) {
    // Load templates if not already loaded
    if (this.templates.size === 0) {
      await this.loadTemplates()
    }
    
    const Template = this.templates.get(templateName)
    
    if (!Template) {
      // Fallback to default template
      return this.renderDefault(data)
    }
    
    try {
      const element = React.createElement(Template, data)
      const html = renderToString(element)
      
      return this.wrapWithLayout(html, data, templateName)
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error)
      return this.renderError(error, data)
    }
  }

  /**
   * Wrap rendered content with layout
   */
  wrapWithLayout(content, data, templateName) {
    const layoutName = data.page?.layout || data.layout || 'default'
    const Layout = this.layouts.get(layoutName)
    
    if (Layout) {
      try {
        const layoutElement = React.createElement(Layout, {
          ...data,
          children: content
        })
        return renderToString(layoutElement)
      } catch (error) {
        console.error(`Error rendering layout ${layoutName}:`, error)
      }
    }
    
    // Default HTML wrapper
    return this.wrapWithDefaultLayout(content, data)
  }

  /**
   * Wrap content with default HTML layout
   */
  wrapWithDefaultLayout(content, data) {
    const page = data.page || {}
    const site = data.site || {}
    
    return `<!DOCTYPE html>
<html lang="${site.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${page.title ? `${page.title} | ${site.title || 'My Site'}` : site.title || 'My Site'}</title>
  <meta name="description" content="${page.excerpt || site.description || ''}">
  <meta name="author" content="${page.author || site.author || ''}">
  <meta name="generator" content="NuMark Static Site Generator">
  ${page.frontmatter?.canonical ? `<link rel="canonical" href="${page.frontmatter.canonical}">` : ''}
  ${page.frontmatter?.robots ? `<meta name="robots" content="${page.frontmatter.robots}">` : ''}
  ${this.generateMetaTags(page, site)}
  ${this.generateStyles(data)}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
</head>
<body class="antialiased">
  <div id="root">
    <main class="container">
      ${content}
    </main>
  </div>
  ${this.generateScripts(data)}
</body>
</html>`
  }

  /**
   * Generate meta tags for SEO
   */
  generateMetaTags(page, site) {
    const tags = []
    
    // Open Graph tags
    if (page.title) {
      tags.push(`<meta property="og:title" content="${page.title}">`)
    }
    
    if (page.excerpt) {
      tags.push(`<meta property="og:description" content="${page.excerpt}">`)
    }
    
    if (page.frontmatter?.image) {
      tags.push(`<meta property="og:image" content="${page.frontmatter.image}">`)
    }
    
    tags.push(`<meta property="og:type" content="article">`)
    
    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="summary_large_image">`)
    
    if (site.author) {
      tags.push(`<meta name="twitter:creator" content="@${site.author}">`)
    }
    
    // Article tags
    if (page.date) {
      tags.push(`<meta property="article:published_time" content="${page.date}">`)
    }
    
    if (page.tags && page.tags.length > 0) {
      page.tags.forEach(tag => {
        tags.push(`<meta property="article:tag" content="${tag}">`)
      })
    }
    
    return tags.join('\n  ')
  }

  /**
   * Generate stylesheet links
   */
  generateStylesheets(data) {
    const stylesheets = []

    // Add core responsive CSS
    styles.push('<style>' + this.getCoreCSS() + '</style>')

    // Add theme stylesheets
    if (data.theme?.stylesheets) {
      data.theme.stylesheets.forEach(href => {
        stylesheets.push(`<link rel="stylesheet" href="${href}">`)
      })
    }

    // Add default stylesheet
    stylesheets.push(`<link rel="stylesheet" href="/assets/css/main.css">`)

    return stylesheets.join('\n  ')
  }

  /**
   * Get core CSS for responsive design and button functionality
   */
  getCoreCSS() {
    return `
/* NuMark Core CSS - Responsive Design & Components */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

/* Responsive Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  color: white;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
  border-color: #6b7280;
}

.btn-secondary:hover {
  background-color: #4b5563;
  border-color: #4b5563;
  color: white;
}

.btn-outline {
  background-color: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline:hover {
  background-color: #3b82f6;
  color: white;
}

/* Responsive Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 1rem 0;
  font-weight: 600;
  line-height: 1.25;
}

h1 { font-size: 2.25rem; }
h2 { font-size: 1.875rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

@media (max-width: 640px) {
  h1 { font-size: 1.875rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
}

p {
  margin: 0 0 1rem 0;
}

/* Responsive Images */
img {
  max-width: 100%;
  height: auto;
}

/* Responsive Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  font-weight: 600;
  background-color: #f9fafb;
}

@media (max-width: 640px) {
  table {
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.5rem;
  }
}

/* Responsive Grid */
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }

.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }

/* Responsive Utilities */
.hidden { display: none; }

@media (max-width: 640px) {
  .sm\\:hidden { display: none; }
  .sm\\:block { display: block; }
}

@media (max-width: 768px) {
  .md\\:hidden { display: none; }
  .md\\:block { display: block; }
}

@media (max-width: 1024px) {
  .lg\\:hidden { display: none; }
  .lg\\:block { display: block; }
}
    `
  }

  /**
   * Generate script tags
   */
  generateScripts(data) {
    const scripts = []

    // Add core functionality script
    scripts.push('<script>' + this.getCoreJavaScript() + '</script>')

    // Add theme scripts
    if (data.theme?.scripts) {
      data.theme.scripts.forEach(src => {
        scripts.push(`<script src="${src}"></script>`)
      })
    }

    // Add default scripts
    scripts.push(`<script src="/assets/js/main.js"></script>`)

    return scripts.join('\n  ')
  }

  /**
   * Get core JavaScript functionality for generated sites
   */
  getCoreJavaScript() {
    return `
// NuMark Core JavaScript Functions
function toggleElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  }
}

function smoothScrollTo(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'notification notification-' + type;
  notification.textContent = message;
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  \`;

  switch(type) {
    case 'success':
      notification.style.backgroundColor = '#10b981';
      break;
    case 'error':
      notification.style.backgroundColor = '#ef4444';
      break;
    case 'warning':
      notification.style.backgroundColor = '#f59e0b';
      break;
    default:
      notification.style.backgroundColor = '#3b82f6';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = \`
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
\`;
document.head.appendChild(style);
    `
  }

  /**
   * Render default template when specific template is not found
   */
  renderDefault(data) {
    const page = data.page || {}
    
    const content = `
      <article>
        <header>
          <h1>${page.title || 'Untitled'}</h1>
          ${page.date ? `<time datetime="${page.date}">${new Date(page.date).toLocaleDateString()}</time>` : ''}
        </header>
        <div class="content">
          ${page.html || page.content || ''}
        </div>
        ${page.tags && page.tags.length > 0 ? `
          <footer>
            <div class="tags">
              ${page.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </footer>
        ` : ''}
      </article>
    `
    
    return this.wrapWithDefaultLayout(content, data)
  }

  /**
   * Render error template
   */
  renderError(error, data) {
    const content = `
      <div class="error">
        <h1>Template Error</h1>
        <p>An error occurred while rendering the template:</p>
        <pre><code>${error.message}</code></pre>
        ${process.env.NODE_ENV === 'development' ? `
          <details>
            <summary>Stack Trace</summary>
            <pre><code>${error.stack}</code></pre>
          </details>
        ` : ''}
      </div>
    `
    
    return this.wrapWithDefaultLayout(content, data)
  }

  /**
   * Register a template programmatically
   */
  registerTemplate(name, component) {
    if (typeof component === 'function') {
      this.templates.set(name, component)
    } else {
      throw new Error('Template must be a React component function')
    }
  }

  /**
   * Register a layout programmatically
   */
  registerLayout(name, component) {
    if (typeof component === 'function') {
      this.layouts.set(name, component)
    } else {
      throw new Error('Layout must be a React component function')
    }
  }

  /**
   * Get all registered templates
   */
  getTemplates() {
    return Array.from(this.templates.keys())
  }

  /**
   * Get all registered layouts
   */
  getLayouts() {
    return Array.from(this.layouts.keys())
  }

  /**
   * Clear all templates and layouts
   */
  clear() {
    this.templates.clear()
    this.layouts.clear()
    this.components.clear()
  }
}
