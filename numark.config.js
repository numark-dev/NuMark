export default {
  // Site information
  title: 'NuMark Demo Site',
  description: 'A modern static site built with NuMark - the flexible static site generator',
  author: 'NuMark Team',
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
