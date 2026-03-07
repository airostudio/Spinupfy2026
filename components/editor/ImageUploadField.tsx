'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Link2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import toast from 'react-hot-toast'

interface ImageUploadFieldProps {
  label: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
}

export function ImageUploadField({ label, value, onChange, onRemove }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, GIF, and SVG files are allowed')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    const loadingToast = toast.loading('Uploading image...')

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      toast.success('Image uploaded successfully!', { id: loadingToast })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image', { id: loadingToast })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    onChange(urlInput.trim())
    setUrlInput('')
    setShowUrlInput(false)
    toast.success('Image URL updated!')
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
    toast.success('Image removed')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {/* Current Image Preview */}
      {value && (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="danger"
              size="sm"
              leftIcon={<X className="w-4 h-4" />}
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-2 gap-2">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${label}`}
          />
          <label
            htmlFor={`file-upload-${label}`}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-700
              bg-gray-800 text-gray-300 cursor-pointer transition-all
              hover:bg-gray-700 hover:border-primary-500 hover:text-white
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload</span>
              </>
            )}
          </label>
        </div>

        {/* URL Input Toggle */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Link2 className="w-4 h-4" />}
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          {showUrlInput ? 'Cancel' : 'From URL'}
        </Button>
      </div>

      {/* URL Input Field */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit()
              }
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleUrlSubmit}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}
