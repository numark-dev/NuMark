// src/build/build.js

import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import matter from 'gray-matter';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importiere deine React-Templates dynamisch
const templates = {
    'default': () => import('../templates/default.jsx'),
    'landing': () => import('../templates/landing.jsx'),
    'post': () => import('../templates/post.jsx'),
};

export async function build() {
  console.log(chalk.blue.bold("Starting website build process..."));

  // Lösche den "dist"-Ordner, bevor wir neu kompilieren
  const distPath = path.resolve(__dirname, '../../dist');
  fs.emptyDirSync(distPath);

  // Beispiel-Markdown-Datei (später Schleife über alle Dateien)
  const markdownPath = path.resolve(__dirname, '../../content/index.md');
  const markdownContent = fs.readFileSync(markdownPath, 'utf8');

  // Lese den Frontmatter
  const { data: frontmatter, content: markdownBody } = matter(markdownContent);

  // Wähle das Template basierend auf dem Frontmatter oder dem Standard
  const templateName = frontmatter.layout || 'default';

  // Lade das korrekte Template dynamisch
  if (!templates[templateName]) {
    console.error(chalk.red.bold(`Template '${templateName}' not found!`));
    return;
  }
  
  const { default: TemplateComponent } = await templates[templateName]();

  // Beispiel-Daten (später aus dem System geladen)
  const pageData = {
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      date: frontmatter.date,
      tags: frontmatter.tags,
      html: '<h2>Test-Inhalt</h2><p>Dieser Inhalt kommt aus der Markdown-Datei.</p>' // Beispiel-HTML
  };

  // Rendere die React-Komponente zu HTML
  const reactElement = React.createElement(TemplateComponent, {
      page: pageData,
      site: {}, // Platzhalter für Seitendaten
      collections: {} // Platzhalter für Collections
  });
  
  const htmlContent = ReactDOMServer.renderToString(reactElement);

  // Erstelle die endgültige HTML-Seite
  const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.title}</title>
</head>
<body>
    <div id="root">${htmlContent}</div>
</body>
</html>
  `;

  // Schreibe die Datei in den dist-Ordner
  const outputPath = path.resolve(distPath, 'index.html');
  fs.writeFileSync(outputPath, finalHtml);

  console.log(chalk.green.bold("Website build complete!"));
}

export async function watch() {
    console.log(chalk.blue.bold("Watching files for changes..."));
}

export async function clean() {
    console.log(chalk.blue.bold("Cleaning build files..."));
}

export async function analyze() {
    console.log(chalk.blue.bold("Analyzing build..."));
}