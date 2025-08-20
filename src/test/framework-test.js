/**
 * Comprehensive test suite for SideGen framework functionality
 */

import { Page } from '../entities/Page.js'
import { Theme } from '../entities/Theme.js'
import { SiteGenerator } from '../lib/generator.js'
import { MarkdownProcessor } from '../lib/markdown.js'
import { loadConfig } from '../config/index.js'

/**
 * Test results tracker
 */
class TestRunner {
  constructor() {
    this.tests = []
    this.passed = 0
    this.failed = 0
  }

  async test(name, testFn) {
    console.log(`🧪 Testing: ${name}`)
    try {
      await testFn()
      console.log(`✅ PASS: ${name}`)
      this.passed++
      this.tests.push({ name, status: 'PASS' })
    } catch (error) {
      console.error(`❌ FAIL: ${name}`)
      console.error(`   Error: ${error.message}`)
      this.failed++
      this.tests.push({ name, status: 'FAIL', error: error.message })
    }
  }

  summary() {
    console.log('\n📊 Test Summary')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${this.tests.length}`)
    console.log(`Passed: ${this.passed}`)
    console.log(`Failed: ${this.failed}`)
    console.log(`Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`)
    
    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.tests.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`)
      })
    }
  }
}

/**
 * Run all framework tests
 */
export async function runFrameworkTests() {
  const runner = new TestRunner()

  // Test 1: Page Entity Functionality
  await runner.test('Page Entity - Create, Read, Update, Delete', async () => {
    // Create a test page
    const pageData = {
      title: 'Test Page',
      slug: 'test-page',
      content: '# Test Page\n\nThis is a test page.',
      template: 'generic',
      status: 'draft'
    }
    
    const page = await Page.create(pageData)
    if (!page.id) throw new Error('Page creation failed - no ID generated')
    
    // Read the page
    const foundPage = await Page.findById(page.id)
    if (!foundPage) throw new Error('Page not found after creation')
    if (foundPage.title !== pageData.title) throw new Error('Page title mismatch')
    
    // Update the page
    const updatedPage = await Page.update(page.id, { title: 'Updated Test Page' })
    if (updatedPage.title !== 'Updated Test Page') throw new Error('Page update failed')
    
    // Delete the page
    await Page.delete(page.id)
    const deletedPage = await Page.findById(page.id)
    if (deletedPage) throw new Error('Page deletion failed')
  })

  // Test 2: Theme Entity Functionality
  await runner.test('Theme Entity - Create and Manage Themes', async () => {
    const themeData = {
      name: 'Test Theme',
      description: 'A test theme',
      settings: {
        colors: {
          primary: '#3b82f6',
          background: '#ffffff',
          text: '#111827'
        },
        typography: {
          fontFamily: 'Inter, sans-serif'
        }
      }
    }
    
    const theme = await Theme.create(themeData)
    if (!theme.id) throw new Error('Theme creation failed')
    
    const foundTheme = await Theme.findById(theme.id)
    if (!foundTheme) throw new Error('Theme not found after creation')
    if (foundTheme.name !== themeData.name) throw new Error('Theme name mismatch')
    
    // Clean up
    await Theme.delete(theme.id)
  })

  // Test 3: Markdown Processing
  await runner.test('Markdown Processing - Parse and Convert', async () => {
    const processor = new MarkdownProcessor()
    
    const markdownContent = `---
title: Test Post
date: 2025-08-20
tags: [test, markdown]
---

# Test Heading

This is a **bold** text and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log('Hello World');
\`\`\`
`
    
    const result = await processor.process(markdownContent)
    
    if (!result.frontmatter.title) throw new Error('Frontmatter parsing failed')
    if (result.frontmatter.title !== 'Test Post') throw new Error('Frontmatter title incorrect')
    if (!result.html.includes('<h1>')) throw new Error('HTML conversion failed')
    if (!result.html.includes('<strong>')) throw new Error('Bold text conversion failed')
  })

  // Test 4: Configuration Loading
  await runner.test('Configuration System - Load and Validate', async () => {
    const config = await loadConfig()
    
    if (!config.title) throw new Error('Config title missing')
    if (!config.inputDir) throw new Error('Config inputDir missing')
    if (!config.outputDir) throw new Error('Config outputDir missing')
    if (!config.collections) throw new Error('Config collections missing')
  })

  // Test 5: Site Generator Initialization
  await runner.test('Site Generator - Initialize and Setup', async () => {
    const config = await loadConfig()
    const generator = new SiteGenerator(config)
    
    await generator.init()
    
    if (!generator.markdownProcessor) throw new Error('Markdown processor not initialized')
    if (!generator.templateRenderer) throw new Error('Template renderer not initialized')
    if (!generator.assetProcessor) throw new Error('Asset processor not initialized')
  })

  // Test 6: Utility Functions
  await runner.test('Utility Functions - Slugify and Helpers', async () => {
    const { slugify, formatDate, extractExcerpt } = await import('../utils/index.js')
    
    const slug = slugify('Hello World! This is a Test.')
    if (slug !== 'hello-world-this-is-a-test') throw new Error('Slugify function failed')
    
    const date = formatDate('2025-08-20')
    if (!date.includes('2025')) throw new Error('Date formatting failed')
    
    const excerpt = extractExcerpt('This is a long text that should be truncated at some point to create a proper excerpt.', 50)
    if (excerpt.length > 53) throw new Error('Excerpt extraction failed') // 50 + "..."
  })

  // Test 7: Data Validation
  await runner.test('Data Validation - Page and Theme Validation', async () => {
    // Test page validation
    const invalidPageData = { title: '', content: '' }
    const pageValidation = Page.validate(invalidPageData)
    if (pageValidation.isValid) throw new Error('Page validation should fail for invalid data')
    
    // Test theme validation
    const invalidThemeData = { name: '', colors: null }
    const themeValidation = Theme.validate(invalidThemeData)
    if (themeValidation.isValid) throw new Error('Theme validation should fail for invalid data')
  })

  // Test 8: Collection Management
  await runner.test('Collection Management - Organize and Sort', async () => {
    // Create test pages for collection testing
    const pages = []
    for (let i = 1; i <= 3; i++) {
      const page = await Page.create({
        title: `Collection Test Page ${i}`,
        slug: `collection-test-${i}`,
        content: `# Page ${i}`,
        template: 'post',
        status: 'published'
      })
      pages.push(page)
    }
    
    const allPages = await Page.list()
    if (allPages.length < 3) throw new Error('Collection pages not created properly')
    
    const publishedPages = await Page.getPublished()
    if (publishedPages.length < 3) throw new Error('Published pages filter failed')
    
    // Clean up
    for (const page of pages) {
      await Page.delete(page.id)
    }
  })

  runner.summary()
  return runner.failed === 0
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFrameworkTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}
