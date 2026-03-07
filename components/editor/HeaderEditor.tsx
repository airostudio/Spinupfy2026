'use client'

import { useState } from 'react'
import { Plus, Trash2, Menu } from 'lucide-react'

interface MenuItem {
  label: string
  href: string
}

interface HeaderEditorProps {
  content: {
    logo?: string
    brandName?: string
    menuItems?: MenuItem[]
    ctaText?: string
    ctaHref?: string
  }
  onChange: (content: any) => void
}

export function HeaderEditor({ content, onChange }: HeaderEditorProps) {
  const {
    brandName = '',
    menuItems = [],
    ctaText = '',
    ctaHref = '',
  } = content

  const handleBrandNameChange = (value: string) => {
    onChange({ ...content, brandName: value })
  }

  const handleMenuItemChange = (index: number, field: 'label' | 'href', value: string) => {
    const newMenuItems = [...menuItems]
    newMenuItems[index] = { ...newMenuItems[index], [field]: value }
    onChange({ ...content, menuItems: newMenuItems })
  }

  const handleAddMenuItem = () => {
    const newMenuItems = [
      ...menuItems,
      { label: 'New Link', href: '#' },
    ]
    onChange({ ...content, menuItems: newMenuItems })
  }

  const handleRemoveMenuItem = (index: number) => {
    const newMenuItems = menuItems.filter((_, i) => i !== index)
    onChange({ ...content, menuItems: newMenuItems })
  }

  const handleCTAChange = (field: 'ctaText' | 'ctaHref', value: string) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Brand Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Brand Name
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => handleBrandNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
          placeholder="Your Brand"
        />
      </div>

      {/* Menu Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Menu className="w-4 h-4" />
            Menu Items
          </label>
          <button
            onClick={handleAddMenuItem}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No menu items yet. Click &quot;Add&quot; to create one.
            </p>
          ) : (
            menuItems.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-900 rounded-lg border border-gray-800 space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Item {index + 1}</span>
                  <button
                    onClick={() => handleRemoveMenuItem(index)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleMenuItemChange(index, 'label', e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-950 rounded border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => handleMenuItemChange(index, 'href', e.target.value)}
                  className="w-full px-2 py-1.5 bg-gray-950 rounded border border-gray-800 focus:border-primary-500 focus:outline-none text-sm font-mono"
                  placeholder="#section or /page"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA Button */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Call-to-Action Button
        </label>
        <div className="space-y-2">
          <input
            type="text"
            value={ctaText}
            onChange={(e) => handleCTAChange('ctaText', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none"
            placeholder="Get Started"
          />
          <input
            type="text"
            value={ctaHref}
            onChange={(e) => handleCTAChange('ctaHref', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none font-mono text-sm"
            placeholder="#contact or /signup"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Leave CTA text empty to hide the button
        </p>
      </div>
    </div>
  )
}
