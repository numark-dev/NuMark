import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/utils";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: "bg-green-600 border-green-500",
    error: "bg-red-600 border-red-500",
    warning: "bg-yellow-600 border-yellow-500",
    info: "bg-blue-600 border-blue-500"
  };

  const Icon = icons[toast.type] || Info;

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        "animate-in slide-in-from-right-full duration-300",
        colors[toast.type] || colors.info
      )}
    >
      <Icon className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-white text-sm">
            {toast.title}
          </div>
        )}
        <div className="text-white text-sm opacity-90">
          {toast.message}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(toast.id)}
        className="h-6 w-6 text-white hover:bg-white/20 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      ...toast
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, options = {}) => addToast({ ...options, message, type: "success" }),
    error: (message, options = {}) => addToast({ ...options, message, type: "error" }),
    warning: (message, options = {}) => addToast({ ...options, message, type: "warning" }),
    info: (message, options = {}) => addToast({ ...options, message, type: "info" }),
    custom: (options) => addToast(options)
  }, [addToast]);

  const value = {
    toast,
    addToast,
    removeToast,
    toasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Convenience hook for common toast patterns
export const useNotification = () => {
  const { toast } = useToast();

  return {
    success: (message, title) => toast.success(message, { title }),
    error: (message, title) => toast.error(message, { title }),
    warning: (message, title) => toast.warning(message, { title }),
    info: (message, title) => toast.info(message, { title }),
    
    // Common patterns
    saved: () => toast.success("Changes saved successfully"),
    deleted: () => toast.success("Item deleted successfully"),
    copied: () => toast.success("Copied to clipboard"),
    
    saveError: () => toast.error("Failed to save changes"),
    deleteError: () => toast.error("Failed to delete item"),
    loadError: () => toast.error("Failed to load data"),
    
    loading: (message = "Loading...") => toast.info(message, { duration: 0 }),
    
    // Returns toast ID for manual removal
    custom: (options) => toast.custom(options)
  };
};
