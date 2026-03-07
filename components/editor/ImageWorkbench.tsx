'use client';

import { useState } from 'react';
import {
  Upload,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Link2,
  Loader2,
  Edit3,
  Move,
  ZoomIn,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

interface ImageWorkbenchProps {
  imageUrl?: string;
  altText?: string;
  onImageChange: (url: string, altText?: string) => void;
  onRemove?: () => void;
  businessName?: string;
  businessType?: string;
  sectionType?: string;
  contextDescription?: string;
  websiteId?: string;
}

/**
 * Dedicated image editing workbench inspired by Elementor
 * Shows when an image is selected, with prominent upload and AI generation options
 */
export function ImageWorkbench({
  imageUrl,
  altText,
  onImageChange,
  onRemove,
  businessName,
  businessType,
  sectionType = 'general',
  contextDescription,
  websiteId,
}: ImageWorkbenchProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePosition, setImagePosition] = useState<'center' | 'top' | 'bottom'>('center');
  const [imageFit, setImageFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvancedAI, setShowAdvancedAI] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, and GIF files are allowed');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);
    const loadingToast = toast.loading('Uploading image...');
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (websiteId) fd.append('websiteId', websiteId);
      const response = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onImageChange(data.url, file.name);
      toast.success('Image uploaded!', { id: loadingToast });
    } catch {
      toast.error('Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!businessName) {
      toast.error('Business name is required for AI generation');
      return;
    }

    setIsGeneratingImage(true);
    const loadingToast = toast.loading('Generating image with AI...');

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessType: businessType || 'business',
          sectionType,
          description: customPrompt || contextDescription || '',
          style: 'photorealistic',
        }),
      });

      const data = await response.json();
      if (data.success) {
        onImageChange(data.data.url, data.data.altText);
        toast.success('Image generated successfully!', { id: loadingToast });
        setCustomPrompt('');
        setShowAdvancedAI(false);
      } else {
        toast.error(data.error || 'Failed to generate image', { id: loadingToast });
      }
    } catch (error) {
      toast.error('An error occurred', { id: loadingToast });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrlInput.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      new URL(imageUrlInput);
      onImageChange(imageUrlInput);
      setImageUrlInput('');
      toast.success('Image URL added!');
    } catch {
      toast.error('Invalid URL format');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <ImageIcon className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Image Settings</h3>
            <p className="text-xs text-gray-400">Upload, generate, or link an image</p>
          </div>
        </div>
      </div>

      {/* Current Image Preview */}
      {imageUrl && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
            Current Image
          </label>
          <div className="relative group">
            <img
              src={imageUrl}
              alt={altText || 'Current image'}
              className="w-full h-48 object-cover rounded-lg border border-gray-800"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={() => {
                  if (onRemove) onRemove();
                  toast.success('Image removed');
                }}
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </Button>
            </div>
          </div>
          {altText && (
            <p className="text-xs text-gray-500 italic">Alt text: {altText}</p>
          )}
        </div>
      )}

      {/* Upload Section */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          Upload Image
        </label>
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploadingImage}
          />
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isUploadingImage
                ? 'border-gray-700 bg-gray-900/50'
                : 'border-gray-700 hover:border-primary-500/50 hover:bg-gray-800/30'
              }
            `}
          >
            {isUploadingImage ? (
              <Loader2 className="w-12 h-12 mx-auto mb-3 text-gray-500 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            )}
            <p className="text-sm font-medium text-gray-300 mb-1">
              {isUploadingImage ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WebP, or GIF (max. 10MB)
            </p>
          </div>
        </label>
      </div>

      {/* AI Generation Section */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          AI Generate Image
        </label>
        <div className="space-y-3">
          {showAdvancedAI ? (
            <>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAIGenerate}
                  disabled={isGeneratingImage || !businessName}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAdvancedAI(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => setShowAdvancedAI(true)}
              variant="secondary"
              className="w-full gap-2"
              disabled={!businessName}
            >
              <Sparkles className="w-4 h-4" />
              {businessName ? 'Generate Image with AI' : 'Business name required'}
            </Button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800"></div>

      {/* URL Link Section */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          Or Link to Image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit();
              }
            }}
          />
          <Button
            onClick={handleUrlSubmit}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Link2 className="w-3 h-3" />
            Add
          </Button>
        </div>
      </div>

      {/* Image Settings */}
      {imageUrl && (
        <>
          <div className="border-t border-gray-800"></div>

          <div className="space-y-4">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
              Image Display
            </label>

            {/* Position */}
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Position</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'top', icon: AlignLeft, label: 'Top' },
                  { value: 'center', icon: AlignCenter, label: 'Center' },
                  { value: 'bottom', icon: AlignRight, label: 'Bottom' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setImagePosition(option.value as any)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
                      ${imagePosition === option.value
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                      }
                    `}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fit */}
            <div className="space-y-2">
              <span className="text-xs text-gray-500">Fit</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'cover', icon: Maximize, label: 'Cover' },
                  { value: 'contain', icon: Minimize, label: 'Contain' },
                  { value: 'fill', icon: Move, label: 'Fill' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setImageFit(option.value as any)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all
                      ${imageFit === option.value
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                      }
                    `}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Alt Text (for accessibility)</label>
              <input
                type="text"
                value={altText || ''}
                onChange={(e) => onImageChange(imageUrl, e.target.value)}
                placeholder="Describe the image..."
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
