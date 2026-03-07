'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Settings } from 'lucide-react'
import { Section } from '@/lib/store/editor.store'

interface FooterEditorProps {
  section: Section | null
  onUpdate: (updates: Partial<Section>) => void
}

export function FooterEditor({ section, onUpdate }: FooterEditorProps) {
  const [formData, setFormData] = useState<any>({
    brandName: '',
    tagline: '',
    columns: [],
    socialLinks: [],
    contactInfo: {},
    copyright: '',
  })

  useEffect(() => {
    if (section) {
      setFormData(section.content || {
        brandName: '',
        tagline: '',
        columns: [],
        socialLinks: [],
        contactInfo: {},
        copyright: '',
      })
    }
  }, [section])

  if (!section) {
    return null
  }

  const handleChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    onUpdate({ content: newFormData })
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    const newFormData = {
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      },
    }
    setFormData(newFormData)
    onUpdate({ content: newFormData })
  }

  const addColumn = () => {
    const newColumns = [
      ...(formData.columns || []),
      { title: 'New Column', links: [{ label: 'Link', href: '#' }] },
    ]
    handleChange('columns', newColumns)
  }

  const updateColumn = (index: number, updates: any) => {
    const newColumns = [...(formData.columns || [])]
    newColumns[index] = { ...newColumns[index], ...updates }
    handleChange('columns', newColumns)
  }

  const removeColumn = (index: number) => {
    const newColumns = formData.columns.filter((_: any, i: number) => i !== index)
    handleChange('columns', newColumns)
  }

  const addLink = (columnIndex: number) => {
    const newColumns = [...(formData.columns || [])]
    newColumns[columnIndex].links.push({ label: 'New Link', href: '#' })
    handleChange('columns', newColumns)
  }

  const updateLink = (columnIndex: number, linkIndex: number, updates: any) => {
    const newColumns = [...(formData.columns || [])]
    newColumns[columnIndex].links[linkIndex] = {
      ...newColumns[columnIndex].links[linkIndex],
      ...updates,
    }
    handleChange('columns', newColumns)
  }

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...(formData.columns || [])]
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter(
      (_: any, i: number) => i !== linkIndex
    )
    handleChange('columns', newColumns)
  }

  const addSocialLink = () => {
    const newSocialLinks = [
      ...(formData.socialLinks || []),
      { platform: 'twitter', href: '#' },
    ]
    handleChange('socialLinks', newSocialLinks)
  }

  const updateSocialLink = (index: number, updates: any) => {
    const newSocialLinks = [...(formData.socialLinks || [])]
    newSocialLinks[index] = { ...newSocialLinks[index], ...updates }
    handleChange('socialLinks', newSocialLinks)
  }

  const removeSocialLink = (index: number) => {
    const newSocialLinks = formData.socialLinks.filter((_: any, i: number) => i !== index)
    handleChange('socialLinks', newSocialLinks)
  }

  return (
    <div className="space-y-6">
      {/* Brand Info */}
      <div>
        <h4 className="text-sm font-medium mb-3">Brand Information</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Brand Name</label>
            <input
              type="text"
              value={formData.brandName || ''}
              onChange={(e) => handleChange('brandName', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              placeholder="Your Brand"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              placeholder="Building the future"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h4 className="text-sm font-medium mb-3">Contact Information</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={formData.contactInfo?.email || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              placeholder="contact@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.contactInfo?.phone || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Address</label>
            <textarea
              value={formData.contactInfo?.address || ''}
              onChange={(e) => handleNestedChange('contactInfo', 'address', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm h-16 resize-none"
              placeholder="123 Main St, City, Country"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Social Links</h4>
          <button
            onClick={addSocialLink}
            className="px-2 py-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(formData.socialLinks || []).map((social: any, index: number) => (
            <div key={index} className="flex gap-2">
              <select
                value={social.platform}
                onChange={(e) => updateSocialLink(index, { platform: e.target.value })}
                className="px-2 py-1.5 bg-gray-900 rounded border border-gray-800 text-xs flex-1"
              >
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
              </select>
              <input
                type="url"
                value={social.href}
                onChange={(e) => updateSocialLink(index, { href: e.target.value })}
                className="flex-1 px-2 py-1.5 bg-gray-900 rounded border border-gray-800 text-xs"
                placeholder="https://"
              />
              <button
                onClick={() => removeSocialLink(index)}
                className="px-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Link Columns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Link Columns</h4>
          <button
            onClick={addColumn}
            className="px-2 py-1 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded text-xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Column
          </button>
        </div>
        <div className="space-y-4">
          {(formData.columns || []).map((column: any, columnIndex: number) => (
            <div key={columnIndex} className="p-3 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={column.title}
                  onChange={(e) => updateColumn(columnIndex, { title: e.target.value })}
                  className="flex-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-sm font-medium"
                  placeholder="Column Title"
                />
                <button
                  onClick={() => removeColumn(columnIndex)}
                  className="ml-2 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {column.links.map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex gap-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) =>
                        updateLink(columnIndex, linkIndex, { label: e.target.value })
                      }
                      className="flex-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) =>
                        updateLink(columnIndex, linkIndex, { href: e.target.value })
                      }
                      className="flex-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 text-xs"
                      placeholder="URL"
                    />
                    <button
                      onClick={() => removeLink(columnIndex, linkIndex)}
                      className="px-1.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addLink(columnIndex)}
                  className="w-full px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400 flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Copyright Text</label>
        <input
          type="text"
          value={formData.copyright || ''}
          onChange={(e) => handleChange('copyright', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:border-primary-500 focus:outline-none text-sm"
          placeholder={`© ${new Date().getFullYear()} All rights reserved.`}
        />
      </div>
    </div>
  )
}
