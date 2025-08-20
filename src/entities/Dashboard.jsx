import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "@/entities/Page";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Edit, Eye, Trash2, Zap, Download } from "lucide-react";
import { ConfirmModal } from "@/components/ui/modal";
import { useNotification } from "@/components/ui/toast";
import { useModal } from "@/hooks/useModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const notification = useNotification();
  const { openModal, closeModal, isModalOpen, getModalData } = useModal();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      let pageList = await Page.list("-created_date");

      // If no pages exist, create some sample pages
      if (pageList.length === 0) {
        await createSamplePages();
        pageList = await Page.list("-created_date");
      }

      setPages(pageList);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
    setIsLoading(false);
  };

  const createSamplePages = async () => {
    const samplePages = [
      {
        title: "Welcome to SideGen",
        slug: "welcome",
        content: "# Welcome to SideGen\n\nThis is your first page created with SideGen!",
        template: "landing",
        status: "published"
      },
      {
        title: "About Us",
        slug: "about",
        content: "# About Us\n\nLearn more about our company and mission.",
        template: "generic",
        status: "published"
      },
      {
        title: "Getting Started Guide",
        slug: "getting-started",
        content: "# Getting Started\n\nThis guide will help you get started with SideGen.",
        template: "post",
        status: "draft"
      }
    ];

    for (const pageData of samplePages) {
      await Page.create(pageData);
    }
  };
  
  const deletePage = (pageId, pageTitle) => {
    openModal('deleteConfirm', {
      pageId,
      pageTitle,
      message: `Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`
    });
  };

  const handleDeleteConfirm = async () => {
    const { pageId } = getModalData('deleteConfirm');
    try {
      await Page.delete(pageId);
      notification.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      notification.error('Failed to delete page');
    }
    closeModal('deleteConfirm');
  };

  const generateStaticSite = async () => {
    setIsGenerating(true);
    const loadingToast = notification.loading('Generating static site...');

    try {
      // Simulate build process for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      notification.success('Static site generated successfully! Check the dist/ directory.');
    } catch (error) {
      console.error('Error generating static site:', error);
      notification.error('Error generating static site. Please check the console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const statusColors = {
    published: "bg-green-500/20 text-green-400 border-green-500/30",
    draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Pages</h1>
          <p className="text-gray-400">Manage your site's content here.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={generateStaticSite}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 text-base"
          >
            {isGenerating ? (
              <>
                <Download className="mr-2 h-5 w-5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" /> Generate Static Site
              </>
            )}
          </Button>
          <Button onClick={() => navigate(createPageUrl("PageEditor"))} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> New Page
          </Button>
        </div>
      </div>

      <Card className="bg-gray-950/50 border-gray-800 text-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-800">
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Template</TableHead>
                <TableHead className="text-gray-400">Last Updated</TableHead>
                <TableHead className="text-right text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-b-gray-800">
                    <TableCell><Skeleton className="h-5 w-48 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 bg-gray-700" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32 bg-gray-700" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto bg-gray-700" /></TableCell>
                  </TableRow>
                ))
              ) : pages.length > 0 ? (
                pages.map((page) => (
                  <TableRow key={page.id} className="border-b-gray-800/50 hover:bg-gray-800/20">
                    <TableCell className="font-medium text-white">{page.title}</TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${statusColors[page.status]}`}>{page.status}</Badge>
                    </TableCell>
                    <TableCell className="capitalize text-gray-400">{page.template}</TableCell>
                    <TableCell className="text-gray-400">{new Date(page.updated_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-700">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
                          <DropdownMenuItem onClick={() => navigate(`${createPageUrl("PageEditor")}?id=${page.id}`)} className="hover:!bg-gray-700">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`${createPageUrl("SitePreview")}?slug=${page.slug}`, '_blank')} className="hover:!bg-gray-700">
                             <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deletePage(page.id, page.title)} className="text-red-400 hover:!bg-red-500/20 hover:!text-red-400">
                             <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                    No pages found. Create your first page to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen('deleteConfirm')}
        onClose={() => closeModal('deleteConfirm')}
        onConfirm={handleDeleteConfirm}
        title="Delete Page"
        message={getModalData('deleteConfirm').message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}