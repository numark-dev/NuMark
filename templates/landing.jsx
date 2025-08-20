import React from 'react'

/**
 * Landing page template with hero section
 */
export default function LandingTemplate({ page, site, collections }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {page.excerpt}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/docs/getting-started/"
              className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Get Started
            </a>
            <a
              href="/examples/"
              className="btn btn-secondary border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg"
            >
              View Examples
            </a>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose SideGen?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built with modern technologies for developers who want power and simplicity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Modern Stack',
                description: 'Built with React, TailwindCSS, and Vite for the best developer experience',
                icon: '⚡'
              },
              {
                title: 'Markdown Powered',
                description: 'Write content in Markdown with frontmatter support for metadata',
                icon: '📝'
              },
              {
                title: 'Theme System',
                description: 'Easily customize your site with flexible themes and components',
                icon: '🎨'
              },
              {
                title: 'Fast Builds',
                description: 'Optimized build process with asset optimization and code splitting',
                icon: '🚀'
              },
              {
                title: 'SEO Ready',
                description: 'Built-in SEO features with meta tags and structured data',
                icon: '🔍'
              },
              {
                title: 'Developer Friendly',
                description: 'Hot reloading, TypeScript support, and modern tooling',
                icon: '👨‍💻'
              }
            ].map(feature => (
              <div key={feature.title} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-content">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="content py-20">
        <div className="container mx-auto px-6">
          <div className="prose prose-lg max-w-4xl mx-auto">
            <div dangerouslySetInnerHTML={{ __html: page.html }} />
          </div>
        </div>
      </section>
      
      {/* Recent Posts */}
      {collections.posts && collections.posts.length > 0 && (
        <section className="recent-posts py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Latest Posts
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with our latest articles and tutorials
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.posts.slice(0, 6).map(post => (
                <article key={post.id} className="card">
                  <h3 className="card-title">
                    <a 
                      href={`/posts/${post.slug}/`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {post.title}
                    </a>
                  </h3>
                  
                  <p className="card-content mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString()}
                    </time>
                    
                    {post.readingTime && (
                      <span>{post.readingTime.text}</span>
                    )}
                  </div>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <a
                href="/posts/"
                className="btn btn-primary"
              >
                View All Posts
              </a>
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="cta py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Create your first SideGen site in minutes
          </p>
          <a
            href="/docs/getting-started/"
            className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
          >
            Start Building Now
          </a>
        </div>
      </section>
    </div>
  )
}
