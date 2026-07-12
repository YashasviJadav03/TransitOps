import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, description, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg w-full max-w-lg border border-slate-200 dark:border-neutral-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-neutral-100">{title}</h2>
            {description && <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">{description}</p>}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
