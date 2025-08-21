export default {
  "title": "My NuMark Site",
  "description": "A modern static site built with NuMark",
  "author": "",
  "baseUrl": "",
  "language": "en",
  "inputDir": "content",
  "outputDir": "dist",
  "templatesDir": "templates",
  "themesDir": "themes",
  "assetsDir": "assets",
  "publicDir": "public",
  "defaultTemplate": "default",
  "defaultLayout": "default",
  "excerptLength": 200,
  "dateFormat": "YYYY-MM-DD",
  "minifyHTML": true,
  "minifyCSS": true,
  "minifyJS": true,
  "optimizeImages": true,
  "generateSitemap": true,
  "generateRSS": true,
  "development": false,
  "devServer": {
    "port": 3000,
    "host": "localhost",
    "open": true,
    "livereload": true
  },
  "seo": {
    "generateMetaTags": true,
    "generateOpenGraph": true,
    "generateTwitterCard": true,
    "generateJsonLd": true
  },
  "collections": {
    "posts": {
      "pattern": "posts/**/*.md",
      "sortBy": "date",
      "sortOrder": "desc",
      "template": "post",
      "permalink": "/posts/:slug/"
    },
    "pages": {
      "pattern": "pages/**/*.md",
      "sortBy": "title",
      "sortOrder": "asc",
      "template": "page",
      "permalink": "/:slug/"
    }
  },
  "markdown": {
    "gfm": true,
    "frontmatter": true,
    "highlight": true,
    "toc": true,
    "anchorLinks": true
  },
  "theme": {
    "name": "default",
    "customCSS": [],
    "customJS": []
  },
  "plugins": []
}