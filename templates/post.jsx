import React from 'react'

/**
 * Template for blog posts
 */
export default function PostTemplate({ page, site, collections }) {
  return (
    <article className="prose prose-lg max-w-none">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {page.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {page.date && (
            <time dateTime={page.date}>
              {new Date(page.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          )}
          
          {page.frontmatter?.author && (
            <span>
              by {page.frontmatter.author}
            </span>
          )}
          
          {page.readingTime && (
            <span>
              {page.readingTime.text}
            </span>
          )}
        </div>
        
        {page.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 font-medium">
            {page.excerpt}
          </p>
        )}
      </header>
      
      {page.toc && page.toc.length > 0 && (
        <nav className="toc bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Table of Contents
          </h2>
          <ul className="space-y-2">
            {page.toc.map(heading => (
              <li 
                key={heading.slug}
                className={`ml-${(heading.level - 1) * 4}`}
              >
                <a 
                  href={heading.anchor}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        {page.tags && page.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {page.tags.map(tag => (
                <a
                  key={tag}
                  href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}/`}
                  className="tag hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {page.categories && page.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {page.categories.map(category => (
                <a
                  key={category}
                  href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}/`}
                  className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Related posts */}
        {collections.posts && collections.posts.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Related Posts
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {collections.posts
                .filter(post => post.id !== page.id)
                .slice(0, 4)
                .map(post => (
                  <a
                    key={post.id}
                    href={`/posts/${post.slug}/`}
                    className="card hover:shadow-lg transition-shadow"
                  >
                    <h4 className="card-title text-base">
                      {post.title}
                    </h4>
                    <p className="card-content text-sm">
                      {post.excerpt}
                    </p>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.date).toLocaleDateString()}
                    </time>
                  </a>
                ))}
            </div>
          </div>
        )}
      </footer>
    </article>
  )
}
