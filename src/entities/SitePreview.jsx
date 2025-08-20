import React, { useState, useEffect } from "react";
import { Page } from "@/entities/Page";
import { Theme } from "@/entities/Theme";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

export default function SitePreview() {
  const [page, setPage] = useState(null);
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const preview = urlParams.get('preview');

  useEffect(() => {
    loadPageAndTheme();
    setIsPreview(preview === 'true');
  }, [slug]);

  const loadPageAndTheme = async () => {
    setIsLoading(true);
    try {
      const [pages, themes] = await Promise.all([
        Page.list(),
        Theme.list()
      ]);

      const foundPage = pages.find(p => p.slug === slug) || pages[0];
      const activeTheme = themes.find(t => t.isActive) || themes[0];

      setPage(foundPage);
      setTheme(activeTheme);
    } catch (error) {
      console.error("Failed to load page or theme:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!page || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-600">The requested page could not be found.</p>
        </Card>
      </div>
    );
  }

  const settings = theme.settings;

  const getTemplateLayout = () => {
    switch (page.template) {
      case 'landing':
        return (
          <div
            className="min-h-screen"
            style={{
              backgroundColor: settings.colors.background,
              color: settings.colors.text,
              fontFamily: settings.typography.fontFamily,
              fontSize: settings.typography.baseSize
            }}
          >
            {/* Hero Section */}
            <section className="py-20 text-center">
              <div
                className="mx-auto px-6"
                style={{
                  maxWidth: settings.layout.containerWidth === '100%' ? '100%' : settings.layout.containerWidth
                }}
              >
                <h1
                  className="text-5xl font-bold mb-6"
                  style={{
                    fontFamily: settings.typography.headingFontFamily,
                    color: settings.colors.heading
                  }}
                >
                  {page.title}
                </h1>
                <div
                  className="prose prose-lg mx-auto"
                  style={{ color: settings.colors.text }}
                >
                  <ReactMarkdown>{page.content}</ReactMarkdown>
                </div>
                <div className="mt-8">
                  <button
                    className="px-8 py-3 rounded-lg font-semibold text-lg transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: settings.colors.primary,
                      color: 'white'
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'post':
        return (
          <div
            className="min-h-screen"
            style={{
              backgroundColor: settings.colors.background,
              color: settings.colors.text,
              fontFamily: settings.typography.fontFamily,
              fontSize: settings.typography.baseSize
            }}
          >
            <article
              className="mx-auto px-6 py-12"
              style={{
                maxWidth: settings.layout.containerWidth === '100%' ? '800px' : 'min(800px, ' + settings.layout.containerWidth + ')'
              }}
            >
              <header className="mb-8">
                <h1
                  className="text-4xl font-bold mb-4"
                  style={{
                    fontFamily: settings.typography.headingFontFamily,
                    color: settings.colors.heading
                  }}
                >
                  {page.title}
                </h1>
                <div
                  className="text-sm pb-4 border-b"
                  style={{
                    color: settings.colors.text + 'AA',
                    borderColor: settings.colors.text + '20'
                  }}
                >
                  Published on {new Date(page.created_date).toLocaleDateString()}
                </div>
              </header>
              <div
                className="prose prose-lg max-w-none"
                style={{ color: settings.colors.text }}
              >
                <ReactMarkdown>{page.content}</ReactMarkdown>
              </div>
            </article>
          </div>
        );

      default: // generic
        return (
          <div
            className="min-h-screen"
            style={{
              backgroundColor: settings.colors.background,
              color: settings.colors.text,
              fontFamily: settings.typography.fontFamily,
              fontSize: settings.typography.baseSize
            }}
          >
            <div
              className="mx-auto px-6 py-12"
              style={{
                maxWidth: settings.layout.containerWidth === '100%' ? '100%' : settings.layout.containerWidth
              }}
            >
              <h1
                className="text-4xl font-bold mb-8"
                style={{
                  fontFamily: settings.typography.headingFontFamily,
                  color: settings.colors.heading
                }}
              >
                {page.title}
              </h1>
              <div
                className="prose prose-lg max-w-none"
                style={{ color: settings.colors.text }}
              >
                <ReactMarkdown>{page.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {isPreview && (
        <div
          className="fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm font-medium"
          style={{
            backgroundColor: settings.colors.accent,
            color: 'white'
          }}
        >
          Preview Mode - This is how your page will look when published
        </div>
      )}
      <div style={{ marginTop: isPreview ? '40px' : '0' }}>
        {getTemplateLayout()}
      </div>
    </div>
  );
}