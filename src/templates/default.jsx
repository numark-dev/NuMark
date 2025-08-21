import React from 'react'

/**
 * Default template for pages
 */
export default function DefaultTemplate({ page, site, collections }) {
  return (
    <article className="prose prose-lg max-w-none">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {page.title}
        </h1>
        
        {page.date && (
          <time 
            dateTime={page.date} 
            className="text-gray-600 dark:text-gray-400 text-sm"
          >
            {new Date(page.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        )}
        
        {page.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
            {page.excerpt}
          </p>
        )}
      </header>
      
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
      
      {page.tags && page.tags.length > 0 && (
        <footer className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              Tags:
            </span>
            {page.tags.map(tag => (
              <span 
                key={tag}
                className="tag"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  )
}
