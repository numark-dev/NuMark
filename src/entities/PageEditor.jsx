import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/entities/Page";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, FileText, Code } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function PageEditor() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageData, setPageData] = useState({
    title: "",
    slug: "",
    content: "",
    template: "generic",
    status: "draft"
  });

  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get('id');

  useEffect(() => {
    if (editingId) {
      loadPage();
    }
  }, [editingId]);

  const loadPage = async () => {
    setIsLoading(true);
    try {
      const pages = await Page.list();
      const page = pages.find(p => p.id === editingId);
      if (page) {
        setPageData(page);
      }
    } catch (error) {
      console.error("Failed to load page:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setPageData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && !editingId ? {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      } : {})
    }));
  };

  const savePage = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await Page.update(editingId, pageData);
      } else {
        await Page.create(pageData);
      }
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Failed to save page:", error);
    }
    setIsSaving(false);
  };

  const previewPage = () => {
    window.open(`${createPageUrl("SitePreview")}?slug=${pageData.slug}&preview=true`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading page...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {editingId ? "Edit Page" : "Create New Page"}
              </h1>
              {pageData.title && (
                <p className="text-gray-400">{pageData.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={pageData.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
              {pageData.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={previewPage}
              disabled={!pageData.slug}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={savePage}
              disabled={isSaving || !pageData.title || !pageData.content}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-950/50 border-gray-800 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Page Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Page Title</Label>
                  <Input
                    id="title"
                    value={pageData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter page title"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-gray-300">URL Slug</Label>
                  <Input
                    id="slug"
                    value={pageData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="page-url"
                    className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">yoursite.com/{pageData.slug}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Template</Label>
                  <Select value={pageData.template} onValueChange={(value) => handleInputChange('template', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="generic">Generic Page</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="post">Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Status</Label>
                  <Select value={pageData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-950/50 border-gray-800 h-full flex flex-col">
              <Tabs defaultValue="editor" className="flex flex-col h-full">
                <CardHeader className="flex-shrink-0">
                  <TabsList className="bg-gray-900 border-gray-700 w-fit">
                    <TabsTrigger value="editor" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                      <Code className="w-4 h-4 mr-2" />
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <TabsContent value="editor" className="flex-1 p-6 pt-0">
                  <div className="h-full flex flex-col">
                    <Label className="text-gray-300 mb-2">Content (Markdown)</Label>
                    <Textarea
                      value={pageData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="# Your Content Here&#10;&#10;Write your content using Markdown syntax..."
                      className="flex-1 bg-gray-900 border-gray-700 text-white font-mono text-sm resize-none min-h-[400px]"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="flex-1 p-6 pt-0">
                  <div className="h-full bg-white rounded-lg p-6 overflow-y-auto">
                    <div className="prose prose-lg prose-slate max-w-none text-gray-900">
                      <ReactMarkdown
                        components={{
                          h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-4">{children}</h1>,
                          h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                          h3: ({children}) => <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
                          p: ({children}) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="text-gray-700 mb-4 pl-6 list-disc">{children}</ul>,
                          ol: ({children}) => <ol className="text-gray-700 mb-4 pl-6 list-decimal">{children}</ol>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">{children}</blockquote>,
                          code: ({children}) => <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                          pre: ({children}) => <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                          a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline">{children}</a>,
                          strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({children}) => <em className="italic text-gray-700">{children}</em>
                        }}
                      >
                        {pageData.content || "# Preview\n\nYour content will appear here..."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}