import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Tooltip } from "@/components/ui/tooltip";
import { useNotification } from "@/components/ui/toast";
import { Settings, ChevronDown, Copy, Code } from "lucide-react";

export default function ComponentTest() {
  const [sliderValue, setSliderValue] = useState([50]);
  const [selectValue, setSelectValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [activeTab, setActiveTab] = useState("tab1");
  const notification = useNotification();

  const handleButtonClick = (buttonType) => {
    notification.info(`${buttonType} button clicked!`, 'Button Interaction');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      notification.copied();
    }).catch(() => {
      notification.error('Failed to copy to clipboard');
    });
  };

  const ComponentShowcase = ({ title, children, code, description }) => (
    <Card className="bg-gray-950/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{title}</CardTitle>
          <div className="flex gap-2">
            <Tooltip content="Copy code example">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(code)}
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
        {description && (
          <p className="text-sm text-gray-400 mt-2">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Usage in Markdown:</span>
          </div>
          <pre className="text-xs text-gray-300 overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">UI Components Test ✨</h1>
        <p className="text-gray-400">Testing all UI components to ensure they work correctly. Hot reload test!</p>
      </div>

      {/* Buttons */}
      <ComponentShowcase
        title="Buttons"
        description="Interactive buttons with different variants and sizes. Use the button syntax in Markdown for functional buttons."
        code={`[Primary Button](button:link:https://example.com)
[Contact Us](button:email:contact@example.com)
[Download File](button:download:/assets/file.pdf)
[Show Alert](button:alert:Hello World!)
[Scroll to Section](button:scroll:section-id)`}
      >
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Tooltip content="Primary button - Use for main actions">
              <Button variant="default" onClick={() => handleButtonClick('Default')}>Primary Button</Button>
            </Tooltip>
            <Tooltip content="Secondary button - Use for secondary actions">
              <Button variant="secondary" onClick={() => handleButtonClick('Secondary')}>Secondary Button</Button>
            </Tooltip>
            <Tooltip content="Outline button - Use for subtle actions">
              <Button variant="outline" onClick={() => handleButtonClick('Outline')}>Outline Button</Button>
            </Tooltip>
            <Tooltip content="Ghost button - Use for minimal actions">
              <Button variant="ghost" onClick={() => handleButtonClick('Ghost')}>Ghost Button</Button>
            </Tooltip>
            <Tooltip content="Destructive button - Use for dangerous actions">
              <Button variant="destructive" onClick={() => handleButtonClick('Destructive')}>Destructive Button</Button>
            </Tooltip>
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <Tooltip content="Small button size">
              <Button size="sm">Small</Button>
            </Tooltip>
            <Tooltip content="Default button size">
              <Button size="default">Default</Button>
            </Tooltip>
            <Tooltip content="Large button size">
              <Button size="lg">Large</Button>
            </Tooltip>
            <Tooltip content="Icon button - Square button for icons">
              <Button size="icon"><Settings className="h-4 w-4" /></Button>
            </Tooltip>
          </div>
        </div>
      </ComponentShowcase>

      {/* Form Elements */}
      <Card className="bg-gray-950/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Form Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Input Field (Value: "{inputValue}")</Label>
            <Input
              placeholder="Enter some text..."
              className="bg-gray-900 border-gray-700 text-white"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Textarea (Length: {textareaValue.length})</Label>
            <Textarea
              placeholder="Enter multiple lines..."
              className="bg-gray-900 border-gray-700 text-white"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300">Select</Label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300">Slider (Value: {sliderValue[0]})</Label>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges and Status */}
      <Card className="bg-gray-950/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Badges & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300">Loading Skeletons</Label>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-gray-700" />
              <Skeleton className="h-4 w-3/4 bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="bg-gray-950/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="bg-gray-900">
              <TabsTrigger value="tab1" className="text-gray-400 data-[state=active]:text-white">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2" className="text-gray-400 data-[state=active]:text-white">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3" className="text-gray-400 data-[state=active]:text-white">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <p className="text-gray-300">Content for Tab 1</p>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <p className="text-gray-300">Content for Tab 2</p>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <p className="text-gray-300">Content for Tab 3</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dropdown Menu */}
      <Card className="bg-gray-950/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Dropdown Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                Open Menu <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-200">
              <DropdownMenuItem className="hover:bg-gray-700">Menu Item 1</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">Menu Item 2</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700">Menu Item 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gray-950/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-800">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b-gray-800/50">
                <TableCell className="text-white">Item 1</TableCell>
                <TableCell><Badge variant="default">Active</Badge></TableCell>
                <TableCell className="text-gray-400">2025-08-20</TableCell>
              </TableRow>
              <TableRow className="border-b-gray-800/50">
                <TableCell className="text-white">Item 2</TableCell>
                <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                <TableCell className="text-gray-400">2025-08-19</TableCell>
              </TableRow>
              <TableRow className="border-b-gray-800/50">
                <TableCell className="text-white">Item 3</TableCell>
                <TableCell><Badge variant="destructive">Error</Badge></TableCell>
                <TableCell className="text-gray-400">2025-08-18</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
