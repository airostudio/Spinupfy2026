'use client';

import {
  Copy,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Settings,
  Paintbrush,
  Type,
  Image,
  Link2,
  Code,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface ElementToolbarProps {
  elementType?: 'section' | 'image' | 'text' | 'button' | 'heading';
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isVisible?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisibility?: () => void;
  onOpenSettings?: () => void;
  onOpenStyle?: () => void;
}

/**
 * Floating toolbar for element manipulation
 * Inspired by Elementor's contextual editing toolbar
 */
export function ElementToolbar({
  elementType = 'section',
  canMoveUp = true,
  canMoveDown = true,
  isVisible = true,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onOpenSettings,
  onOpenStyle,
}: ElementToolbarProps) {
  const getElementIcon = () => {
    switch (elementType) {
      case 'image':
        return <Image className="w-3.5 h-3.5" />;
      case 'text':
        return <Type className="w-3.5 h-3.5" />;
      case 'button':
        return <Link2 className="w-3.5 h-3.5" />;
      case 'heading':
        return <Type className="w-3.5 h-3.5" />;
      default:
        return <Settings className="w-3.5 h-3.5" />;
    }
  };

  const getElementLabel = () => {
    return elementType.charAt(0).toUpperCase() + elementType.slice(1);
  };

  return (
    <div className="absolute -top-10 left-0 z-20 flex items-center gap-1">
      {/* Element type indicator */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg text-xs font-medium text-gray-300">
        {getElementIcon()}
        <span>{getElementLabel()}</span>
      </div>

      {/* Toolbar buttons */}
      <div className="flex items-center gap-0.5 bg-gray-900 border border-gray-700 rounded-lg p-0.5">
        {/* Move Up */}
        {onMoveUp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <MoveUp className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Move Down */}
        {onMoveDown && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <MoveDown className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-4 bg-gray-700 mx-0.5"></div>

        {/* Style Settings */}
        {onOpenStyle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStyle();
            }}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Style settings"
          >
            <Paintbrush className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Advanced Settings */}
        {onOpenSettings && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Advanced settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-4 bg-gray-700 mx-0.5"></div>

        {/* Duplicate */}
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Toggle Visibility */}
        {onToggleVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
            title={isVisible ? 'Hide' : 'Show'}
          >
            {isVisible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Delete */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
