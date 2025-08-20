#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { build, watch, clean, analyze } from '../src/build/index.js'
import { createDefaultConfig } from '../src/config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '../package.json'), 'utf-8'))

const program = new Command()

program
  .name('numark')
  .description('A highly flexible static page framework')
  .version(packageJson.version)

// Create new project command
program
  .command('create <project-name>')
  .description('Create a new NuMark project')
  .option('-t, --template <template>', 'Project template', 'default')
  .option('--skip-install', 'Skip npm install')
  .action(async (projectName, options) => {
    const spinner = ora('Creating new SideGen project...').start()
    
    try {
      const projectPath = path.resolve(projectName)
      
      // Check if directory already exists
      if (await fs.pathExists(projectPath)) {
        spinner.fail(`Directory ${projectName} already exists`)
        process.exit(1)
      }
      
      // Create project structure
      await createProjectStructure(projectPath, options.template)
      
      spinner.succeed(`Created project: ${projectName}`)
      
      // Install dependencies
      if (!options.skipInstall) {
        spinner.start('Installing dependencies...')
        
        const { spawn } = await import('child_process')
        const npmInstall = spawn('npm', ['install'], {
          cwd: projectPath,
          stdio: 'pipe'
        })
        
        await new Promise((resolve, reject) => {
          npmInstall.on('close', (code) => {
            if (code === 0) {
              resolve()
            } else {
              reject(new Error(`npm install failed with code ${code}`))
            }
          })
        })
        
        spinner.succeed('Dependencies installed')
      }
      
      console.log(chalk.green('\n✨ Project created successfully!'))
      console.log(chalk.gray('\nNext steps:'))
      console.log(chalk.gray(`  cd ${projectName}`))
      if (options.skipInstall) {
        console.log(chalk.gray('  npm install'))
      }
      console.log(chalk.gray('  npm run dev'))
      
    } catch (error) {
      spinner.fail('Failed to create project')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// Build command
program
  .command('build')
  .description('Build the site for production')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    const success = await build(options)
    process.exit(success ? 0 : 1)
  })

// Development server command
program
  .command('dev')
  .alias('serve')
  .description('Start development server')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-p, --port <port>', 'Port number', '3000')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    await watch(options)
  })

// Clean command
program
  .command('clean')
  .description('Clean build directory')
  .option('-c, --config <path>', 'Configuration file path')
  .action(async (options) => {
    const success = await clean(options)
    process.exit(success ? 0 : 1)
  })

// Analyze command
program
  .command('analyze')
  .description('Analyze build output')
  .option('-c, --config <path>', 'Configuration file path')
  .action(async (options) => {
    const success = await analyze(options)
    process.exit(success ? 0 : 1)
  })

// Init command
program
  .command('init')
  .description('Initialize NuMark in current directory')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    const spinner = ora('Initializing SideGen project...').start()
    
    try {
      const currentDir = process.cwd()
      
      // Check if already initialized
      const configExists = await fs.pathExists('sidegen.config.js') || 
                          await fs.pathExists('sidegen.config.json')
      
      if (configExists && !options.force) {
        spinner.fail('SideGen already initialized. Use --force to overwrite.')
        process.exit(1)
      }
      
      // Create basic structure
      await createBasicStructure(currentDir)
      
      spinner.succeed('SideGen initialized successfully!')
      
      console.log(chalk.green('\n✨ Initialization complete!'))
      console.log(chalk.gray('\nCreated:'))
      console.log(chalk.gray('  sidegen.config.js'))
      console.log(chalk.gray('  content/'))
      console.log(chalk.gray('  templates/'))
      console.log(chalk.gray('  assets/'))
      console.log(chalk.gray('\nNext steps:'))
      console.log(chalk.gray('  npm run dev'))
      
    } catch (error) {
      spinner.fail('Initialization failed')
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// New page command
program
  .command('new <type> <name>')
  .description('Create a new page or post')
  .option('-t, --template <template>', 'Template to use')
  .action(async (type, name, options) => {
    const spinner = ora(`Creating new ${type}...`).start()
    
    try {
      const validTypes = ['page', 'post']
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`)
      }
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const dir = type === 'post' ? 'content/posts' : 'content/pages'
      const filePath = path.join(dir, `${slug}.md`)
      
      // Check if file already exists
      if (await fs.pathExists(filePath)) {
        throw new Error(`File already exists: ${filePath}`)
      }
      
      // Create directory if it doesn't exist
      await fs.ensureDir(dir)
      
      // Create frontmatter
      const frontmatter = {
        title: name,
        slug: slug,
        template: options.template || type,
        date: new Date().toISOString().split('T')[0],
        draft: true
      }
      
      if (type === 'post') {
        frontmatter.author = 'Your Name'
        frontmatter.tags = []
        frontmatter.categories = []
      }
      
      // Create content
      const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`
    }
    return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`
  })
  .join('\n')}
---

# ${name}

Your content goes here...
`
      
      await fs.writeFile(filePath, content)
      
      spinner.succeed(`Created ${type}: ${filePath}`)
      
      console.log(chalk.green(`\n✨ ${type} created successfully!`))
      console.log(chalk.gray(`Edit: ${filePath}`))
      
    } catch (error) {
      spinner.fail(`Failed to create ${type}`)
      console.error(chalk.red(error.message))
      process.exit(1)
    }
  })

// Theme command
program
  .command('theme')
  .description('Theme management')
  .option('--list', 'List available themes')
  .option('--install <name>', 'Install a theme')
  .option('--create <name>', 'Create a new theme')
  .action(async (options) => {
    if (options.list) {
      console.log(chalk.blue('Available themes:'))
      console.log(chalk.gray('  default - Default SideGen theme'))
      console.log(chalk.gray('  minimal - Minimal theme'))
      console.log(chalk.gray('  blog - Blog-focused theme'))
    } else if (options.create) {
      await createTheme(options.create)
    } else {
      console.log(chalk.yellow('Use --list to see available themes'))
    }
  })

/**
 * Create project structure
 */
async function createProjectStructure(projectPath, template) {
  // Create directories
  const dirs = [
    'content/pages',
    'content/posts',
    'templates',
    'themes',
    'assets/css',
    'assets/js',
    'assets/images',
    'public'
  ]
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir))
  }
  
  // Copy template files
  const templatePath = path.join(__dirname, '../templates/project')
  if (await fs.pathExists(templatePath)) {
    await fs.copy(templatePath, projectPath)
  }
  
  // Create package.json
  const packageJson = {
    name: path.basename(projectPath),
    version: '1.0.0',
    description: 'A SideGen static site',
    scripts: {
      dev: 'sidegen dev',
      build: 'sidegen build',
      clean: 'sidegen clean',
      analyze: 'sidegen analyze'
    },
    dependencies: {
      sidegen: `^${packageJson.version}`
    }
  }
  
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )
  
  // Create config file
  await createDefaultConfig(path.join(projectPath, 'sidegen.config.js'))
  
  // Create sample content
  await createSampleContent(projectPath)
}

/**
 * Create basic structure for existing project
 */
async function createBasicStructure(projectPath) {
  const dirs = [
    'content/pages',
    'content/posts',
    'templates',
    'assets/css',
    'assets/js',
    'assets/images',
    'public'
  ]
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir))
  }
  
  await createDefaultConfig(path.join(projectPath, 'sidegen.config.js'))
  await createSampleContent(projectPath)
}

/**
 * Create sample content
 */
async function createSampleContent(projectPath) {
  // Sample index page
  const indexContent = `---
title: Welcome to SideGen
slug: index
template: landing
date: ${new Date().toISOString().split('T')[0]}
---

# Welcome to Your SideGen Site

This is your new static site built with SideGen!

## Getting Started

1. Edit this file in \`content/pages/index.md\`
2. Create new pages in \`content/pages/\`
3. Add blog posts to \`content/posts/\`
4. Customize your theme and templates

Happy building! 🚀
`
  
  await fs.writeFile(path.join(projectPath, 'content/pages/index.md'), indexContent)
  
  // Sample post
  const postContent = `---
title: My First Post
slug: my-first-post
template: post
date: ${new Date().toISOString().split('T')[0]}
author: Your Name
tags: ["welcome", "first-post"]
categories: ["general"]
draft: false
---

# My First Post

Welcome to my new SideGen blog! This is my first post.

## What's Next?

- Customize the theme
- Add more content
- Deploy your site

Enjoy using SideGen!
`
  
  await fs.writeFile(path.join(projectPath, 'content/posts/my-first-post.md'), postContent)
}

/**
 * Create a new theme
 */
async function createTheme(themeName) {
  const spinner = ora(`Creating theme: ${themeName}...`).start()
  
  try {
    const themePath = path.join('themes', themeName)
    
    if (await fs.pathExists(themePath)) {
      throw new Error(`Theme ${themeName} already exists`)
    }
    
    await fs.ensureDir(themePath)
    
    // Create theme structure
    const themeConfig = {
      name: themeName,
      version: '1.0.0',
      description: `Custom theme: ${themeName}`,
      colors: {
        primary: '#3b82f6',
        background: '#ffffff',
        text: '#111827'
      }
    }
    
    await fs.writeFile(
      path.join(themePath, 'theme.config.js'),
      `export default ${JSON.stringify(themeConfig, null, 2)}`
    )
    
    spinner.succeed(`Theme created: ${themePath}`)
    
  } catch (error) {
    spinner.fail('Failed to create theme')
    console.error(chalk.red(error.message))
    process.exit(1)
  }
}

// Parse command line arguments
program.parse()
