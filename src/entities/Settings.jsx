import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, Download, Upload, Trash2 } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    site: {
      title: 'My NuMark Site',
      description: 'A modern static site built with NuMark',
      author: 'Your Name',
      baseUrl: '',
      language: 'en'
    },
    build: {
      outputDir: 'dist',
      minifyHTML: true,
      minifyCSS: true,
      minifyJS: true,
      optimizeImages: true
    },
    seo: {
      generateSitemap: true,
      generateRSS: true,
      generateMetaTags: true,
      generateOpenGraph: true
    },
    development: {
      port: 3000,
      host: 'localhost',
      livereload: true,
      open: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem('numark_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('numark_settings', JSON.stringify(settings));
      setLastSaved(new Date().toLocaleTimeString());
      
      // Show success message
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.removeItem('numark_settings');
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'numark-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(prev => ({ ...prev, ...importedSettings }));
        } catch (error) {
          alert('Error importing settings: Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure your NuMark site settings and preferences</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <Badge variant="secondary" className="text-xs">
              Last saved: {lastSaved}
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="site" className="w-full">
        <TabsList className="bg-gray-900 mb-8">
          <TabsTrigger value="site" className="text-gray-400 data-[state=active]:text-white">Site</TabsTrigger>
          <TabsTrigger value="build" className="text-gray-400 data-[state=active]:text-white">Build</TabsTrigger>
          <TabsTrigger value="seo" className="text-gray-400 data-[state=active]:text-white">SEO</TabsTrigger>
          <TabsTrigger value="development" className="text-gray-400 data-[state=active]:text-white">Development</TabsTrigger>
          <TabsTrigger value="advanced" className="text-gray-400 data-[state=active]:text-white">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Site Title</Label>
                  <Input
                    value={settings.site.title}
                    onChange={(e) => updateSetting('site', 'title', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Author</Label>
                  <Input
                    value={settings.site.author}
                    onChange={(e) => updateSetting('site', 'author', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  value={settings.site.description}
                  onChange={(e) => updateSetting('site', 'description', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Base URL</Label>
                  <Input
                    value={settings.site.baseUrl}
                    onChange={(e) => updateSetting('site', 'baseUrl', e.target.value)}
                    placeholder="https://mysite.com"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Language</Label>
                  <Select value={settings.site.language} onValueChange={(value) => updateSetting('site', 'language', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="build">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Build Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Output Directory</Label>
                <Input
                  value={settings.build.outputDir}
                  onChange={(e) => updateSetting('build', 'outputDir', e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-gray-300">Optimization Options</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.build.minifyHTML}
                      onChange={(e) => updateSetting('build', 'minifyHTML', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Minify HTML</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.build.minifyCSS}
                      onChange={(e) => updateSetting('build', 'minifyCSS', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Minify CSS</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.build.minifyJS}
                      onChange={(e) => updateSetting('build', 'minifyJS', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Minify JavaScript</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.build.optimizeImages}
                      onChange={(e) => updateSetting('build', 'optimizeImages', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Optimize Images</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">SEO Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-gray-300">SEO Features</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.seo.generateSitemap}
                      onChange={(e) => updateSetting('seo', 'generateSitemap', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Generate Sitemap</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.seo.generateRSS}
                      onChange={(e) => updateSetting('seo', 'generateRSS', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Generate RSS Feed</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.seo.generateMetaTags}
                      onChange={(e) => updateSetting('seo', 'generateMetaTags', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Generate Meta Tags</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.seo.generateOpenGraph}
                      onChange={(e) => updateSetting('seo', 'generateOpenGraph', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Generate Open Graph</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Development Server</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Port</Label>
                  <Input
                    type="number"
                    value={settings.development.port}
                    onChange={(e) => updateSetting('development', 'port', parseInt(e.target.value))}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Host</Label>
                  <Input
                    value={settings.development.host}
                    onChange={(e) => updateSetting('development', 'host', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-gray-300">Development Options</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.development.livereload}
                      onChange={(e) => updateSetting('development', 'livereload', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Live Reload</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.development.open}
                      onChange={(e) => updateSetting('development', 'open', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-gray-300">Auto Open Browser</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={exportSettings} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Settings
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Import Settings
                  </Button>
                </div>
                
                <Button onClick={resetSettings} variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>Note:</strong> Advanced settings require a server restart to take effect.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
