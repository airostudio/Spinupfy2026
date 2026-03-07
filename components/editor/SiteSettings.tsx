'use client'

import { useState } from 'react'
import { Settings, Upload, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editor.store'
import toast from 'react-hot-toast'

interface SiteSettingsProps {
  websiteName?: string
}

export function SiteSettings({ websiteName }: SiteSettingsProps) {
  const { website, updateWebsite, setAIGenerating, aiState } = useEditorStore()
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    brandColors: true,
    textColors: false,
    backgroundColors: false,
    uiColors: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP files are allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // In a real implementation, you would upload to a storage service
    // For now, we'll use a local URL
    setIsUploadingLogo(true)
    try {
      const url = URL.createObjectURL(file)
      updateWebsite({ logoUrl: url })
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleGenerateLogo = async () => {
    if (!website?.name) {
      toast.error('Please set a website name first')
      return
    }

    setAIGenerating(true)
    try {
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: website.name,
          style: 'modern',
        }),
      })

      const data = await response.json()
      if (data.success) {
        updateWebsite({ logoUrl: data.data.url })
        toast.success('Logo generated successfully!')
      } else {
        toast.error(data.error || 'Failed to generate logo')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setAIGenerating(false)
    }
  }

  const handleThemeChange = (key: string, value: string) => {
    const currentTheme = website?.theme || {}
    updateWebsite({
      theme: {
        ...currentTheme,
        [key]: value,
      },
    })
  }

  const theme = website?.theme || {}

  // Helper component for color input
  const ColorInput = ({ label, value, defaultValue, colorKey }: {
    label: string
    value: string | undefined
    defaultValue: string
    colorKey: string
  }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || defaultValue}
          onChange={(e) => handleThemeChange(colorKey, e.target.value)}
          className="w-10 h-8 rounded border border-gray-800 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value || defaultValue}
          onChange={(e) => handleThemeChange(colorKey, e.target.value)}
          className="flex-1 px-2 py-1.5 bg-gray-900 rounded border border-gray-800 text-xs font-mono"
          placeholder={defaultValue}
        />
      </div>
    </div>
  )

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-primary-400" />
        <h3 className="font-semibold text-sm">Site Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Logo Section */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Logo</label>
          {website?.logoUrl ? (
            <div className="mb-2">
              <img
                src={website.logoUrl}
                alt="Logo"
                className="h-16 w-auto rounded border border-gray-800"
              />
            </div>
          ) : (
            <div className="mb-2 h-16 bg-gray-900 rounded border border-gray-800 flex items-center justify-center">
              <span className="text-xs text-gray-600">No logo</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isUploadingLogo}
              />
              <div className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
                {isUploadingLogo ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3" />
                )}
                Upload
              </div>
            </label>
            <button
              onClick={handleGenerateLogo}
              disabled={aiState.isGenerating}
              className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {aiState.isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              AI Generate
            </button>
          </div>
        </div>

        {/* Theme Colors - Comprehensive Color System */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-3">Complete Color System</label>

          {/* Brand Colors */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('brandColors')}
              className="w-full flex items-center justify-between p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors mb-2"
            >
              <span className="text-xs font-medium text-gray-300">Brand Colors</span>
              {expandedSections.brandColors ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.brandColors && (
              <div className="space-y-2 pl-2">
                <ColorInput label="Primary Color" value={theme.primary} defaultValue="#2563eb" colorKey="primary" />
                <ColorInput label="Secondary Color" value={theme.secondary} defaultValue="#0ea5e9" colorKey="secondary" />
                <ColorInput label="Accent Color" value={theme.accent} defaultValue="#06b6d4" colorKey="accent" />
              </div>
            )}
          </div>

          {/* Text Colors */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('textColors')}
              className="w-full flex items-center justify-between p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors mb-2"
            >
              <span className="text-xs font-medium text-gray-300">Text Colors</span>
              {expandedSections.textColors ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.textColors && (
              <div className="space-y-2 pl-2">
                <ColorInput label="Heading Color" value={theme.textHeading} defaultValue="#ffffff" colorKey="textHeading" />
                <ColorInput label="Body Text Color" value={theme.textBody} defaultValue="#e5e7eb" colorKey="textBody" />
                <ColorInput label="Muted Text Color" value={theme.textMuted} defaultValue="#9ca3af" colorKey="textMuted" />
                <ColorInput label="Link Color" value={theme.textLink} defaultValue="#60a5fa" colorKey="textLink" />
              </div>
            )}
          </div>

          {/* Background Colors */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('backgroundColors')}
              className="w-full flex items-center justify-between p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors mb-2"
            >
              <span className="text-xs font-medium text-gray-300">Background Colors</span>
              {expandedSections.backgroundColors ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.backgroundColors && (
              <div className="space-y-2 pl-2">
                <ColorInput label="Primary Background" value={theme.bgPrimary} defaultValue="#ffffff" colorKey="bgPrimary" />
                <ColorInput label="Secondary Background" value={theme.bgSecondary} defaultValue="#f9fafb" colorKey="bgSecondary" />
                <ColorInput label="Dark Background" value={theme.bgDark} defaultValue="#111827" colorKey="bgDark" />
                <ColorInput label="Card Background" value={theme.bgCard} defaultValue="#ffffff" colorKey="bgCard" />
              </div>
            )}
          </div>

          {/* UI Colors */}
          <div className="mb-3">
            <button
              onClick={() => toggleSection('uiColors')}
              className="w-full flex items-center justify-between p-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors mb-2"
            >
              <span className="text-xs font-medium text-gray-300">UI Colors</span>
              {expandedSections.uiColors ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.uiColors && (
              <div className="space-y-2 pl-2">
                <ColorInput label="Border Color" value={theme.border} defaultValue="#e5e7eb" colorKey="border" />
                <ColorInput label="Success Color" value={theme.success} defaultValue="#10b981" colorKey="success" />
                <ColorInput label="Warning Color" value={theme.warning} defaultValue="#f59e0b" colorKey="warning" />
                <ColorInput label="Error Color" value={theme.error} defaultValue="#ef4444" colorKey="error" />
                <ColorInput label="Button Text Color" value={theme.buttonText} defaultValue="#ffffff" colorKey="buttonText" />
              </div>
            )}
          </div>
        </div>

        {/* Google Fonts */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-3">Typography (Google Fonts)</label>

          <div className="space-y-3">
            {/* Heading Font */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Heading Font</label>
              <select
                value={theme.fontHeading || 'Inter'}
                onChange={(e) => handleThemeChange('fontHeading', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              >
                <optgroup label="Sans Serif">
                  <option value="Inter">Inter (Default)</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Nunito">Nunito</option>
                </optgroup>
                <optgroup label="Serif">
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Lora">Lora</option>
                  <option value="Crimson Text">Crimson Text</option>
                </optgroup>
                <optgroup label="Display">
                  <option value="Bebas Neue">Bebas Neue</option>
                  <option value="Oswald">Oswald</option>
                  <option value="Archivo Black">Archivo Black</option>
                </optgroup>
              </select>
            </div>

            {/* Body Font */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Body Font</label>
              <select
                value={theme.fontBody || 'Inter'}
                onChange={(e) => handleThemeChange('fontBody', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              >
                <optgroup label="Sans Serif">
                  <option value="Inter">Inter (Default)</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Nunito">Nunito</option>
                </optgroup>
                <optgroup label="Serif">
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Lora">Lora</option>
                  <option value="Crimson Text">Crimson Text</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Website Name */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Website Name</label>
          <input
            type="text"
            value={website?.name || ''}
            onChange={(e) => updateWebsite({ name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
            placeholder="My Awesome Website"
          />
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Brand Name</label>
          <input
            type="text"
            value={website?.brandName || ''}
            onChange={(e) => updateWebsite({ brandName: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
            placeholder="Your Brand"
          />
        </div>
      </div>
    </div>
  )
}
