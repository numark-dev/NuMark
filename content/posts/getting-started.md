---
title: Getting Started with NuMark
slug: getting-started
template: post
layout: default
date: 2025-08-20
author: NuMark Team
tags: [tutorial, getting-started, guide]
categories: [documentation]
description: Learn how to get started with NuMark and create your first static site
---

# Getting Started with NuMark

Welcome to NuMark! This guide will walk you through creating your first static site with our modern, flexible framework.

## Installation

First, make sure you have Node.js 18 or later installed. Then create a new NuMark project:

```bash
npm create numark@latest my-site
cd my-site
npm install
```

## Project Structure

A NuMark project has the following structure:

```
my-site/
├── content/           # Your Markdown content
│   ├── pages/         # Static pages
│   └── posts/         # Blog posts
├── templates/         # React templates
├── themes/           # Theme files
├── assets/           # CSS, JS, images
├── public/           # Static files
├── numark.config.js # Configuration
└── package.json
```

## Creating Content

### Pages

Create pages in the `content/pages/` directory:

```markdown
---
title: My First Page
slug: my-first-page
template: page
date: 2025-08-20
---

# My First Page

This is my first page created with SideGen!
```

### Posts

Create blog posts in the `content/posts/` directory:

```markdown
---
title: My First Post
slug: my-first-post
template: post
date: 2025-08-20
author: Your Name
tags: [blog, first-post]
categories: [general]
---

# My First Post

Welcome to my blog! This is my first post using NuMark.
```

## Configuration

Customize your site in `sidegen.config.js`:

```javascript
export default {
  title: 'My Awesome Site',
  description: 'Built with SideGen',
  author: 'Your Name',
  baseUrl: 'https://mysite.com',
  
  // Collections
  collections: {
    posts: {
      pattern: 'posts/**/*.md',
      sortBy: 'date',
      sortOrder: 'desc',
      template: 'post'
    }
  },
  
  // Theme
  theme: {
    name: 'default'
  }
}
```

## Development

Start the development server:

```bash
npm run dev
```

This will start a local server with hot reloading. Your site will automatically update when you make changes to your content or templates.

## Building

Build your site for production:

```bash
npm run build
```

This generates static HTML files in the `dist/` directory, ready for deployment to any static hosting service.

## Next Steps

Now that you have a basic site running, you can:

1. **Customize the theme** - Modify colors, fonts, and layouts
2. **Create custom templates** - Build React components for your content
3. **Add plugins** - Extend functionality with the plugin system
4. **Deploy your site** - Host on Netlify, Vercel, or any static host

## Need Help?

- Check out the [documentation](/docs)
- Join our [Discord community](https://discord.gg/sidegen)
- Browse [examples](https://github.com/sidegen/examples)

Happy building with NuMark! 🚀
