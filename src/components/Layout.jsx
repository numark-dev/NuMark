import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutGrid, FileText, Paintbrush, Eye, Settings, HelpCircle, Layout as LayoutIcon } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutGrid, page: "Dashboard" },
  { name: "Pages", icon: FileText, page: "Dashboard" }, // Will point to a dedicated Pages list later
  { name: "Theme Editor", icon: Paintbrush, page: "ThemeEditor" },
  { name: "Live Preview", icon: Eye, page: "SitePreview" },
  { name: "Component Test", icon: Settings, page: "ComponentTest" },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gray-950/50 border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NuMark" className="h-8 w-8" />
            <h1 className="text-xl font-bold tracking-wider"><span className="text-blue-400">Nu</span><span className="text-lime-400">Mark</span></h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const url = createPageUrl(item.page);
            const isActive = location.pathname === url;
            return (
              <Link
                key={item.name}
                to={url}
                target={item.name === "Live Preview" ? "_blank" : "_self"}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "hover:bg-gray-800/60"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800 space-y-2">
           <Link to="/layout-config" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800/60">
              <LayoutIcon className="w-5 h-5" />
              <span>Layout Config</span>
            </Link>
           <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800/60">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800/60">
              <HelpCircle className="w-5 h-5" />
              <span>Help & Docs</span>
            </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}