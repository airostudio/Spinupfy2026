'use client'

import { useState } from 'react'
import { FormTemplate, FormField } from './FormTemplateSelector'
import { Send, Upload, Check } from 'lucide-react'

interface FormRendererProps {
  template: FormTemplate
  onSubmit?: (data: Record<string, any>) => void
  className?: string
}

export function FormRenderer({ template, onSubmit, className = '' }: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({})
    }, 3000)
  }

  const renderField = (field: FormField) => {
    const baseInputClasses = "w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2"
    const baseInputStyles = {
      backgroundColor: 'var(--color-bg-card)',
      borderColor: 'var(--color-border)',
      color: 'var(--color-text-body)'
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.id}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClasses}
            style={baseInputStyles}
          />
        )

      case 'date':
      case 'time':
        return (
          <input
            type={field.type}
            id={field.id}
            required={field.required}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClasses}
            style={baseInputStyles}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            rows={4}
            className={baseInputClasses}
            style={baseInputStyles}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            required={field.required}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseInputClasses}
            style={baseInputStyles}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-white/5"
                style={{
                  borderColor: formData[field.id] === option ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: formData[field.id] === option ? 'var(--color-primary-light)' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ color: 'var(--color-text-body)' }}>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label
                key={option}
                className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-white/5"
                style={{
                  borderColor: (formData[field.id] || []).includes(option) ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: (formData[field.id] || []).includes(option) ? 'var(--color-primary-light)' : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const current = formData[field.id] || []
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option)
                    handleChange(field.id, updated)
                  }}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span style={{ color: 'var(--color-text-body)' }}>{option}</span>
              </label>
            ))}
          </div>
        )

      case 'file':
        return (
          <div
            className="p-6 rounded-lg border-2 border-dashed text-center cursor-pointer hover:bg-white/5 transition-all"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-card)'
            }}
          >
            <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
            <input
              type="file"
              id={field.id}
              required={field.required}
              onChange={(e) => handleChange(field.id, e.target.files?.[0])}
              className="hidden"
            />
            <label htmlFor={field.id} className="cursor-pointer">
              <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>
                {formData[field.id]?.name || 'Click to upload or drag and drop'}
              </span>
            </label>
          </div>
        )

      default:
        return null
    }
  }

  if (submitted) {
    return (
      <div
        className={`p-12 rounded-2xl border-2 text-center ${className}`}
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-primary)'
        }}
      >
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Check className="w-10 h-10 text-white" />
        </div>
        <h3
          className="text-2xl font-bold mb-2"
          style={{
            color: 'var(--color-text-heading)',
            fontFamily: 'var(--font-heading)'
          }}
        >
          Thank You!
        </h3>
        <p style={{ color: 'var(--color-text-body)' }}>
          Your {template.name.toLowerCase()} has been submitted successfully.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-8 rounded-2xl border-2 ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Form Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-bold mb-2"
          style={{
            color: 'var(--color-text-heading)',
            fontFamily: 'var(--font-heading)'
          }}
        >
          {template.name}
        </h2>
        <p style={{ color: 'var(--color-text-body)' }}>
          {template.description}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {template.fields.map(field => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-heading)' }}
            >
              {field.label}
              {field.required && <span style={{ color: 'var(--color-accent)' }}> *</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-8 w-full py-4 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all hover:shadow-lg transform hover:scale-[1.02]"
        style={{
          backgroundColor: 'var(--color-primary)',
          fontFamily: 'var(--font-heading)'
        }}
      >
        <Send className="w-5 h-5" />
        Submit {template.name}
      </button>

      {/* Required Fields Note */}
      <p
        className="mt-4 text-sm text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span style={{ color: 'var(--color-accent)' }}>*</span> Required fields
      </p>
    </form>
  )
}
