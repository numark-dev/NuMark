import React, { useState, useEffect } from "react";
import { Theme } from "@/entities/Theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Paintbrush, Palette, Type, Layout, Save, RotateCcw } from "lucide-react";

const colorPresets = {
  "Dark Blue": { primary: "#3b82f6", background: "#111827", text: "#d1d5db", heading: "#ffffff", accent: "#10b981" },
  "Purple": { primary: "#8b5cf6", background: "#1e1b4b", text: "#c4b5fd", heading: "#ffffff", accent: "#f59e0b" },
  "Green": { primary: "#10b981", background: "#064e3b", text: "#d1fae5", heading: "#ffffff", accent: "#3b82f6" },
  "Red": { primary: "#ef4444", background: "#7f1d1d", text: "#fecaca", heading: "#ffffff", accent: "#f97316" },
};

const fontOptions = [
  "Inter, sans-serif",
  "Roboto, sans-serif", 
  "Open Sans, sans-serif",
  "Lato, sans-serif",
  "Poppins, sans-serif",
  "Montserrat, sans-serif",
  "Source Sans Pro, sans-serif"
];

export default function ThemeEditor() {
  const [activeTheme, setActiveTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tempSettings, setTempSettings] = useState(null);

  useEffect(() => {
    loadActiveTheme();
  }, []);

  const loadActiveTheme = async () => {
    setIsLoading(true);
    try {
      const themes = await Theme.list();
      const active = themes.find(t => t.isActive) || themes[0];
      if (active) {
        setActiveTheme(active);
        setTempSettings(JSON.parse(JSON.stringify(active.settings)));
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
    setIsLoading(false);
  };

  const updateSetting = (path, value) => {
    setTempSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const applyColorPreset = (presetName) => {
    const preset = colorPresets[presetName];
    setTempSettings(prev => ({
      ...prev,
      colors: { ...preset }
    }));
  };

  const saveTheme = async () => {
    if (!activeTheme || !tempSettings) return;
    
    setIsSaving(true);
    try {
      await Theme.update(activeTheme.id, {
        ...activeTheme,
        settings: tempSettings
      });
      setActiveTheme(prev => ({ ...prev, settings: tempSettings }));
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
    setIsSaving(false);
  };

  const resetChanges = () => {
    if (activeTheme) {
      setTempSettings(JSON.parse(JSON.stringify(activeTheme.settings)));
    }
  };

  if (isLoading || !activeTheme || !tempSettings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-400">Loading theme editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Editor Panel */}
      <div className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-950/50">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white mb-2">Theme Editor</h1>
          <p className="text-gray-400 text-sm">Customize your site's appearance</p>
        </div>

        <Tabs defaultValue="colors" className="flex flex-col h-full">
          <div className="px-6 pt-4">
            <TabsList className="bg-gray-900 border-gray-700 w-full">
              <TabsTrigger value="colors" className="flex-1 text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex-1 text-xs">
                <Type className="w-3 h-3 mr-1" />
                Type
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex-1 text-xs">
                <Layout className="w-3 h-3 mr-1" />
                Layout
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="colors" className="space-y-6 mt-0">
              {/* Color Presets */}
              <div className="space-y-3">
                <Label className="text-gray-300">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(colorPresets).map((presetName) => (
                    <Button
                      key={presetName}
                      variant="outline"
                      size="sm"
                      onClick={() => applyColorPreset(presetName)}
                      className="h-8 text-xs border-gray-700 hover:bg-gray-800"
                    >
                      {presetName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Individual Colors */}
              <div className="space-y-4">
                {Object.entries(tempSettings.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-gray-300 capitalize">{key}</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateSetting(`colors.${key}`, e.target.value)}
                        className="w-10 h-8 rounded border border-gray-700 bg-gray-900"
                      />
                      <Input
                        value={value}
                        onChange={(e) => updateSetting(`colors.${key}`, e.target.value)}
                        className="bg-gray-900 border-gray-700 text-white font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Body Font</Label>
                  <Select value={tempSettings.typography.fontFamily} onValueChange={(value) => updateSetting('typography.fontFamily', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {fontOptions.map((font) => (
                        <SelectItem key={font} value={font}>{font.split(',')[0]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Heading Font</Label>
                  <Select value={tempSettings.typography.headingFontFamily} onValueChange={(value) => updateSetting('typography.headingFontFamily', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {fontOptions.map((font) => (
                        <SelectItem key={font} value={font}>{font.split(',')[0]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Base Font Size</Label>
                  <Select value={tempSettings.typography.baseSize} onValueChange={(value) => updateSetting('typography.baseSize', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="14px">14px (Small)</SelectItem>
                      <SelectItem value="16px">16px (Normal)</SelectItem>
                      <SelectItem value="18px">18px (Large)</SelectItem>
                      <SelectItem value="20px">20px (Extra Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Container Width</Label>
                  <Select value={tempSettings.layout.containerWidth} onValueChange={(value) => updateSetting('layout.containerWidth', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1024px">1024px (Compact)</SelectItem>
                      <SelectItem value="1280px">1280px (Standard)</SelectItem>
                      <SelectItem value="1536px">1536px (Wide)</SelectItem>
                      <SelectItem value="100%">100% (Full Width)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Spacing Scale</Label>
                  <div className="px-2">
                    <Slider
                      value={[parseInt(tempSettings.layout.spacingUnit)]}
                      onValueChange={([value]) => updateSetting('layout.spacingUnit', value.toString())}
                      max={8}
                      min={2}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Tight</span>
                      <span>{tempSettings.layout.spacingUnit}</span>
                      <span>Loose</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="flex-shrink-0 p-6 border-t border-gray-800 space-y-3">
            <Button
              onClick={saveTheme}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Theme"}
            </Button>
            <Button
              onClick={resetChanges}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Changes
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 p-8 bg-gray-900">
        <div
          className="bg-white rounded-lg shadow-2xl h-full overflow-hidden"
          style={{
            fontFamily: tempSettings.typography.fontFamily,
            fontSize: tempSettings.typography.baseSize,
            maxWidth: tempSettings.layout.containerWidth === '100%' ? '100%' : tempSettings.layout.containerWidth,
            margin: tempSettings.layout.containerWidth === '100%' ? '0' : '0 auto'
          }}
        >
          <div 
            className="p-8"
            style={{
              backgroundColor: tempSettings.colors.background,
              color: tempSettings.colors.text,
              minHeight: '100%'
            }}
          >
            <header className="border-b pb-6 mb-8" style={{ borderColor: tempSettings.colors.text + '20' }}>
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  fontFamily: tempSettings.typography.headingFontFamily,
                  color: tempSettings.colors.heading
                }}
              >
                Your Site Title
              </h1>
              <p style={{ color: tempSettings.colors.text }}>
                A beautiful website built with SiteGEN
              </p>
            </header>

            <main className={`space-y-${tempSettings.layout.spacingUnit}`}>
              <section>
                <h2
                  className="text-2xl font-semibold mb-4"
                  style={{
                    fontFamily: tempSettings.typography.headingFontFamily,
                    color: tempSettings.colors.heading
                  }}
                >
                  Welcome to Your Site
                </h2>
                <p className="mb-4" style={{ color: tempSettings.colors.text }}>
                  This is how your content will look with the current theme settings. 
                  You can customize colors, typography, and layout to match your vision.
                </p>
                <button
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: tempSettings.colors.primary,
                    color: 'white'
                  }}
                >
                  Call to Action
                </button>
              </section>

              <section>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{
                    fontFamily: tempSettings.typography.headingFontFamily,
                    color: tempSettings.colors.heading
                  }}
                >
                  Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Feature One', 'Feature Two', 'Feature Three'].map((feature, index) => (
                    <div key={feature} className="p-4 rounded-lg" style={{ backgroundColor: tempSettings.colors.text + '05' }}>
                      <div
                        className="w-8 h-8 rounded-full mb-2"
                        style={{ backgroundColor: tempSettings.colors.accent }}
                      />
                      <h4
                        className="font-medium mb-2"
                        style={{ color: tempSettings.colors.heading }}
                      >
                        {feature}
                      </h4>
                      <p className="text-sm" style={{ color: tempSettings.colors.text }}>
                        Description of this amazing feature.
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}