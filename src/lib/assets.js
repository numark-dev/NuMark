import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'
import sharp from 'sharp'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

/**
 * Asset processor class for handling CSS, images, and other assets
 */
export class AssetProcessor {
  constructor(config = {}) {
    this.config = {
      assetsDir: 'assets',
      outputDir: 'dist/assets',
      imageOptimization: true,
      cssMinification: true,
      ...config
    }
    
    this.processedAssets = new Map()
  }

  /**
   * Process all assets
   */
  async process() {
    await this.ensureOutputDir()
    await this.processCSS()
    await this.processImages()
    await this.processJavaScript()
    await this.copyOtherAssets()
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    await fs.ensureDir(this.config.outputDir)
  }

  /**
   * Process CSS files
   */
  async processCSS() {
    const cssPattern = path.join(this.config.assetsDir, '**/*.css')
    const cssFiles = await glob(cssPattern)
    
    for (const file of cssFiles) {
      await this.processCSSFile(file)
    }
    
    // Generate main CSS file with Tailwind
    await this.generateMainCSS()
  }

  /**
   * Process a single CSS file
   */
  async processCSSFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const relativePath = path.relative(this.config.assetsDir, filePath)
      
      const result = await postcss([
        tailwindcss,
        autoprefixer
      ]).process(content, { from: filePath })
      
      const outputPath = path.join(this.config.outputDir, 'css', relativePath)
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, result.css)
      
      if (result.map) {
        await fs.writeFile(`${outputPath}.map`, result.map.toString())
      }
      
      this.processedAssets.set(filePath, outputPath)
      console.log(`Processed CSS: ${outputPath}`)
    } catch (error) {
      console.error(`Error processing CSS file ${filePath}:`, error)
    }
  }

  /**
   * Generate main CSS file with Tailwind
   */
  async generateMainCSS() {
    const mainCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
.prose {
  @apply max-w-none;
}

.prose h1 {
  @apply text-4xl font-bold mb-6 text-gray-900 dark:text-white;
}

.prose h2 {
  @apply text-3xl font-semibold mb-4 text-gray-900 dark:text-white;
}

.prose h3 {
  @apply text-2xl font-semibold mb-3 text-gray-900 dark:text-white;
}

.prose p {
  @apply mb-4 text-gray-700 dark:text-gray-300 leading-relaxed;
}

.prose a {
  @apply text-blue-600 dark:text-blue-400 hover:underline;
}

.prose ul {
  @apply list-disc list-inside mb-4 text-gray-700 dark:text-gray-300;
}

.prose ol {
  @apply list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-4;
}

.prose code {
  @apply bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose pre code {
  @apply bg-transparent p-0;
}

.prose img {
  @apply max-w-full h-auto rounded-lg shadow-md;
}

.prose table {
  @apply w-full border-collapse border border-gray-300 dark:border-gray-600 mb-4;
}

.prose th,
.prose td {
  @apply border border-gray-300 dark:border-gray-600 px-4 py-2 text-left;
}

.prose th {
  @apply bg-gray-100 dark:bg-gray-800 font-semibold;
}

/* Anchor links */
.anchor-link {
  @apply no-underline hover:underline;
}

.anchor-link::before {
  content: '#';
  @apply opacity-0 hover:opacity-100 transition-opacity mr-2;
}

/* Tags */
.tag {
  @apply inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm mr-2 mb-2;
}

/* Navigation */
.nav-link {
  @apply text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors;
}

.nav-link.active {
  @apply text-blue-600 dark:text-blue-400 font-semibold;
}

/* Cards */
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6;
}

.card-title {
  @apply text-xl font-semibold mb-3 text-gray-900 dark:text-white;
}

.card-content {
  @apply text-gray-700 dark:text-gray-300;
}

/* Buttons */
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white;
}

/* Dark mode toggle */
.dark-mode-toggle {
  @apply p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors;
}

/* Responsive utilities */
@media (max-width: 768px) {
  .prose h1 {
    @apply text-3xl;
  }
  
  .prose h2 {
    @apply text-2xl;
  }
  
  .prose h3 {
    @apply text-xl;
  }
}
`
    
    try {
      const result = await postcss([
        tailwindcss,
        autoprefixer
      ]).process(mainCSS, { from: undefined })
      
      const outputPath = path.join(this.config.outputDir, 'css', 'main.css')
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, result.css)
      
      console.log(`Generated main CSS: ${outputPath}`)
    } catch (error) {
      console.error('Error generating main CSS:', error)
    }
  }

  /**
   * Process images
   */
  async processImages() {
    if (!this.config.imageOptimization) return
    
    const imagePattern = path.join(this.config.assetsDir, '**/*.{jpg,jpeg,png,webp,gif,svg}')
    const imageFiles = await glob(imagePattern)
    
    for (const file of imageFiles) {
      await this.processImage(file)
    }
  }

  /**
   * Process a single image
   */
  async processImage(filePath) {
    try {
      const relativePath = path.relative(this.config.assetsDir, filePath)
      const outputPath = path.join(this.config.outputDir, 'images', relativePath)
      
      await fs.ensureDir(path.dirname(outputPath))
      
      const ext = path.extname(filePath).toLowerCase()
      
      if (ext === '.svg') {
        // Copy SVG files as-is
        await fs.copy(filePath, outputPath)
      } else {
        // Optimize other image formats
        await sharp(filePath)
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .png({ quality: 85 })
          .webp({ quality: 85 })
          .toFile(outputPath)
        
        // Generate WebP version for modern browsers
        const webpPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        await sharp(filePath)
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .webp({ quality: 85 })
          .toFile(webpPath)
      }
      
      this.processedAssets.set(filePath, outputPath)
      console.log(`Processed image: ${outputPath}`)
    } catch (error) {
      console.error(`Error processing image ${filePath}:`, error)
    }
  }

  /**
   * Process JavaScript files
   */
  async processJavaScript() {
    const jsPattern = path.join(this.config.assetsDir, '**/*.js')
    const jsFiles = await glob(jsPattern)
    
    for (const file of jsFiles) {
      await this.processJavaScriptFile(file)
    }
    
    // Generate main JavaScript file
    await this.generateMainJS()
  }

  /**
   * Process a single JavaScript file
   */
  async processJavaScriptFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const relativePath = path.relative(this.config.assetsDir, filePath)
      const outputPath = path.join(this.config.outputDir, 'js', relativePath)
      
      await fs.ensureDir(path.dirname(outputPath))
      await fs.writeFile(outputPath, content)
      
      this.processedAssets.set(filePath, outputPath)
      console.log(`Processed JS: ${outputPath}`)
    } catch (error) {
      console.error(`Error processing JS file ${filePath}:`, error)
    }
  }

  /**
   * Generate main JavaScript file
   */
  async generateMainJS() {
    const mainJS = `
// Main JavaScript for SideGen sites

// Dark mode toggle
function initDarkMode() {
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  const html = document.documentElement;
  
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.classList.toggle('dark', savedTheme === 'dark');
  
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initSmoothScrolling();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDarkMode,
    initSmoothScrolling
  };
}
`
    
    const outputPath = path.join(this.config.outputDir, 'js', 'main.js')
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, mainJS)
    
    console.log(`Generated main JS: ${outputPath}`)
  }

  /**
   * Copy other asset files
   */
  async copyOtherAssets() {
    const otherPattern = path.join(this.config.assetsDir, '**/*')
    const allFiles = await glob(otherPattern)
    
    // Filter out already processed files
    const otherFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return !this.processedAssets.has(file) && 
             !['.css', '.js', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)
    })
    
    for (const file of otherFiles) {
      const relativePath = path.relative(this.config.assetsDir, file)
      const outputPath = path.join(this.config.outputDir, relativePath)
      
      await fs.ensureDir(path.dirname(outputPath))
      await fs.copy(file, outputPath)
      
      console.log(`Copied asset: ${outputPath}`)
    }
  }

  /**
   * Get processed asset URL
   */
  getAssetUrl(originalPath) {
    const processedPath = this.processedAssets.get(originalPath)
    if (processedPath) {
      return path.relative(this.config.outputDir, processedPath)
    }
    return originalPath
  }

  /**
   * Clear processed assets cache
   */
  clear() {
    this.processedAssets.clear()
  }
}
