'use client';

import { Page } from '@/lib/store/editor.store';
import { FileText, Home, Plus } from 'lucide-react';

interface PageSelectorProps {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddPage?: () => void;
}

export function PageSelector({
  pages,
  selectedPageId,
  onSelectPage,
  onAddPage,
}: PageSelectorProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Pages
        </h3>
        {onAddPage && (
          <button
            className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            onClick={onAddPage}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

      <div className="space-y-2">
        {pages.map((page) => {
          const isSelected = page.id === selectedPageId;
          const isHomepage = page.isHomepage || page.path === '/';

          return (
            <button
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                isSelected
                  ? 'bg-primary-500/10 border border-primary-500/30 text-primary-400'
                  : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isHomepage ? (
                  <Home className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span className="font-medium truncate">{page.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 truncate">{page.path}</span>
                <span className="text-gray-600 ml-2 flex-shrink-0">
                  {page.sections.length} {page.sections.length === 1 ? 'section' : 'sections'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No pages yet</p>
          <p className="text-xs mt-1">Generate pages to get started</p>
        </div>
      )}
    </div>
  );
}
