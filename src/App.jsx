import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './entities/Dashboard'
import PageEditor from './entities/PageEditor'
import ThemeEditor from './entities/ThemeEditor'
import SitePreview from './entities/SitePreview'
import ComponentTest from './entities/ComponentTest'
import Settings from './entities/Settings'
import LayoutConfig from './entities/LayoutConfig'
import { ToastProvider } from './components/ui/toast'
import { createPageUrl } from './utils'

function App() {
  return (
    <ToastProvider>
      <Routes>
      <Route path="/" element={<Navigate to={createPageUrl("Dashboard")} replace />} />
      <Route path="/dashboard" element={
        <Layout currentPageName="Dashboard">
          <Dashboard />
        </Layout>
      } />
      <Route path="/page-editor" element={
        <Layout currentPageName="PageEditor">
          <PageEditor />
        </Layout>
      } />
      <Route path="/theme-editor" element={
        <Layout currentPageName="ThemeEditor">
          <ThemeEditor />
        </Layout>
      } />
      <Route path="/site-preview" element={<SitePreview />} />
      <Route path="/component-test" element={
        <Layout currentPageName="ComponentTest">
          <ComponentTest />
        </Layout>
      } />
      <Route path="/settings" element={
        <Layout currentPageName="Settings">
          <Settings />
        </Layout>
      } />
      <Route path="/layout-config" element={
        <Layout currentPageName="LayoutConfig">
          <LayoutConfig />
        </Layout>
      } />
      <Route path="*" element={<Navigate to={createPageUrl("Dashboard")} replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
