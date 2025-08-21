// src/build/build.js

import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import SiteLayout from '../components/SiteLayout.jsx';

const templates = {
    'default': () => import('../templates/default.jsx'),
    'landing': () => import('../templates/landing.jsx'),
    'post': () => import('../templates/post.jsx'),
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processMarkdown(markdownContent) {
    const file = await remark().use(html).process(markdownContent);
    return String(file);
}

export async function build() {
    console.log(chalk.blue.bold("Starting website build process..."));
    const distPath = path.resolve(__dirname, '../../dist');
    fs.emptyDirSync(distPath);

    const markdownPath = path.resolve(__dirname, '../../content/index.md');
    if (!fs.existsSync(markdownPath)) {
        console.error(chalk.red.bold(`Markdown file not found at: ${markdownPath}`));
        return;
    }
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');

    const { data: frontmatter, content: markdownBody } = matter(markdownContent);
    const templateName = frontmatter.layout || 'default';

    const markdownHtml = await processMarkdown(markdownBody);

    if (!templates[templateName]) {
        console.error(chalk.red.bold(`Template '${templateName}' not found!`));
        return;
    }

    const { default: TemplateComponent } = await templates[templateName]();

    const pageData = {
        title: frontmatter.title || 'Seite ohne Titel',
        excerpt: frontmatter.excerpt || '',
        date: frontmatter.date || new Date().toISOString(),
        tags: frontmatter.tags || [],
        html: markdownHtml
    };

    const pageElement = React.createElement(TemplateComponent, {
        page: pageData,
        site: {},
        collections: {}
    });

    const finalHtmlContent = ReactDOMServer.renderToString(
        React.createElement(SiteLayout, null, pageElement)
    );

    const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.title}</title>
</head>
<body>
    <div id="root">${finalHtmlContent}</div>
</body>
</html>
    `;

    const outputPath = path.resolve(distPath, 'index.html');
    fs.writeFileSync(outputPath, finalHtml);

    console.log(chalk.green.bold("Website build complete!"));
}

// Füge die fehlenden Funktionen hinzu, damit sie exportiert werden können
export async function watch() {
    console.log(chalk.blue.bold("Watching files for changes..."));
}

export async function clean() {
    console.log(chalk.blue.bold("Cleaning build files..."));
}

export async function analyze() {
    console.log(chalk.blue.bold("Analyzing build..."));
}