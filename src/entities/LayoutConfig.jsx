import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@/components/ui/toast";
import { Save, RefreshCw, Layout, Grid, Sidebar, Monitor, Navigation, Eye } from "lucide-react";

export default function LayoutConfig() {
  const [layoutConfig, setLayoutConfig] = useState({
    header: {
      enabled: true,
      height: 64,
      position: 'fixed', // fixed, static, sticky
      showLogo: true,
      showNavigation: true,
      backgroundColor: '#1f2937',
      textColor: '#ffffff'
    },
    sidebar: {
      enabled: true,
      width: 256,
      position: 'left', // left, right
      collapsible: true,
      backgroundColor: '#111827',
      textColor: '#d1d5db'
    },
    footer: {
      enabled: true,
      height: 80,
      position: 'static', // fixed, static
      showCopyright: true,
      backgroundColor: '#1f2937',
      textColor: '#9ca3af'
    },
    content: {
      maxWidth: 1200,
      padding: 24,
      backgroundColor: '#0f172a',
      textColor: '#f8fafc'
    },
    grid: {
      columns: 12,
      gap: 16,
      breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      }
    },
    responsive: {
      hideSidebarOnMobile: true,
      collapseHeaderOnScroll: false,
      mobileBreakpoint: 768
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const notification = useNotification();

  useEffect(() => {
    loadLayoutConfig();
  }, []);

  const loadLayoutConfig = async () => {
    try {
      const stored = localStorage.getItem('numark_layout_config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        setLayoutConfig(prev => ({ ...prev, ...parsedConfig }));
      }
    } catch (error) {
      console.error('Error loading layout config:', error);
      notification.error('Failed to load layout configuration');
    }
  };

  const saveLayoutConfig = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('numark_layout_config', JSON.stringify(layoutConfig));
      setLastSaved(new Date().toLocaleTimeString());
      notification.saved();
    } catch (error) {
      console.error('Error saving layout config:', error);
      notification.saveError();
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all layout settings to defaults?')) {
      localStorage.removeItem('numark_layout_config');
      window.location.reload();
    }
  };

  const updateConfig = (section, key, value) => {
    setLayoutConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const previewLayout = () => {
    notification.info('Layout preview will open in a new tab', 'Preview');
    // In a real implementation, this would open a preview with the current layout
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Layout Configuration</h1>
          <p className="text-gray-400">Configure page layouts, component positioning, and structural elements</p>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <Badge variant="secondary" className="text-xs">
              Last saved: {lastSaved}
            </Badge>
          )}
          <Button onClick={previewLayout} variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveLayoutConfig} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Layout'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="bg-gray-900 mb-8">
          <TabsTrigger value="header" className="text-gray-400 data-[state=active]:text-white">
            <Monitor className="h-4 w-4 mr-2" />
            Header
          </TabsTrigger>
          <TabsTrigger value="sidebar" className="text-gray-400 data-[state=active]:text-white">
            <Sidebar className="h-4 w-4 mr-2" />
            Sidebar
          </TabsTrigger>
          <TabsTrigger value="content" className="text-gray-400 data-[state=active]:text-white">
            <Layout className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="footer" className="text-gray-400 data-[state=active]:text-white">
            <Navigation className="h-4 w-4 mr-2" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="grid" className="text-gray-400 data-[state=active]:text-white">
            <Grid className="h-4 w-4 mr-2" />
            Grid System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="header">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Header Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layoutConfig.header.enabled}
                    onChange={(e) => updateConfig('header', 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300">Enable Header</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layoutConfig.header.showLogo}
                    onChange={(e) => updateConfig('header', 'showLogo', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300">Show Logo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layoutConfig.header.showNavigation}
                    onChange={(e) => updateConfig('header', 'showNavigation', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300">Show Navigation</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Header Height (px)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[layoutConfig.header.height]}
                      onValueChange={(value) => updateConfig('header', 'height', value[0])}
                      max={120}
                      min={40}
                      step={4}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400 text-center">{layoutConfig.header.height}px</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Position</Label>
                  <Select value={layoutConfig.header.position} onValueChange={(value) => updateConfig('header', 'position', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="sticky">Sticky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Background Color</Label>
                  <Input
                    type="color"
                    value={layoutConfig.header.backgroundColor}
                    onChange={(e) => updateConfig('header', 'backgroundColor', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Text Color</Label>
                  <Input
                    type="color"
                    value={layoutConfig.header.textColor}
                    onChange={(e) => updateConfig('header', 'textColor', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sidebar">
          <Card className="bg-gray-950/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Sidebar Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layoutConfig.sidebar.enabled}
                    onChange={(e) => updateConfig('sidebar', 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300">Enable Sidebar</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={layoutConfig.sidebar.collapsible}
                    onChange={(e) => updateConfig('sidebar', 'collapsible', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-300">Collapsible</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Sidebar Width (px)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[layoutConfig.sidebar.width]}
                      onValueChange={(value) => updateConfig('sidebar', 'width', value[0])}
                      max={400}
                      min={200}
                      step={8}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400 text-center">{layoutConfig.sidebar.width}px</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Position</Label>
                  <Select value={layoutConfig.sidebar.position} onValueChange={(value) => updateConfig('sidebar', 'position', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Background Color</Label>
                  <Input
                    type="color"
                    value={layoutConfig.sidebar.backgroundColor}
                    onChange={(e) => updateConfig('sidebar', 'backgroundColor', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Text Color</Label>
                  <Input
                    type="color"
                    value={layoutConfig.sidebar.textColor}
                    onChange={(e) => updateConfig('sidebar', 'textColor', e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs would continue here... */}
        
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={resetToDefaults} variant="destructive" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
