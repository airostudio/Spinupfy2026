/**
 * Breadcrumbs Component with Schema.org Markup
 * Provides navigation trail and SEO-rich breadcrumb list
 */

'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { StructuredData } from './StructuredData'
import { generateBreadcrumbSchema } from '@/lib/structured-data'

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Don't render if no items or only one item (current page)
  if (!items || items.length <= 1) {
    return null
  }

  // Generate breadcrumb schema for SEO
  const breadcrumbSchema = generateBreadcrumbSchema(items)

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={breadcrumbSchema} />

      {/* Visual Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-2 text-sm ${className}`}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li key={item.url} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    className="w-4 h-4 mx-2 text-gray-400"
                    aria-hidden="true"
                  />
                )}

                {isLast ? (
                  <span
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {index === 0 ? (
                      <span className="flex items-center gap-1">
                        <Home className="w-4 h-4" aria-hidden="true" />
                        <span>{item.name}</span>
                      </span>
                    ) : (
                      item.name
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
