// src/components/SiteLayout.jsx

import React from 'react';

/**
 * Main site layout component for the generated static pages.
 * @param {object} props
 * @param {React.ReactNode} props.children - The page content to be rendered inside the layout.
 */
export default function SiteLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Header / Navigation */}
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="text-2xl font-bold text-gray-800 dark:text-white">
                        NuMark
                    </a>
                    <div className="space-x-4">
                        <a href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">About</a>
                        <a href="/posts" className="hover:text-blue-600 dark:hover:text-blue-400">Blog</a>
                        <a href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</a>
                    </div>
                </nav>
            </header>

            {/* Main content area */}
            <main className="flex-grow container mx-auto px-6 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-200 dark:bg-gray-800 py-6 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} NuMark. All Rights Reserved.</p>
            </footer>
        </div>
    );
}