'use client'

import { useState } from 'react'
import { Wand2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface GeneratePagesButtonProps {
  websiteId: string
  onPagesGenerated?: () => void
}

export default function GeneratePagesButton({
  websiteId,
  onPagesGenerated,
}: GeneratePagesButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGeneratePages = async () => {
    setLoading(true)
    const loadingToast = toast.loading('Scanning website for internal links...')

    try {
      const response = await fetch('/api/generate-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId }),
      })

      const data = await response.json()

      if (data.success) {
        const { newPagesCreated, totalLinksFound, existingPages } = data.stats || {}

        if (newPagesCreated === 0) {
          toast.success('All linked pages already exist!', { id: loadingToast })
        } else {
          toast.success(
            `Successfully generated ${newPagesCreated} new page${newPagesCreated > 1 ? 's' : ''}!`,
            { id: loadingToast }
          )

          // Show details
          if (data.generatedPages && data.generatedPages.length > 0) {
            const pageNames = data.generatedPages
              .slice(0, 3)
              .map((p: any) => p.title)
              .join(', ')
            const more = data.generatedPages.length > 3 ? ` and ${data.generatedPages.length - 3} more` : ''
            toast.success(`Created: ${pageNames}${more}`)
          }

          // Refresh the editor
          if (onPagesGenerated) {
            onPagesGenerated()
          } else {
            // Reload the page to show new pages
            window.location.reload()
          }
        }
      } else {
        toast.error(data.error || 'Failed to generate pages', { id: loadingToast })
      }
    } catch (error) {
      toast.error('An error occurred while generating pages', { id: loadingToast })
      console.error('Error generating pages:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGeneratePages}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Scan website and generate pages for all internal links"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4" />
          Generate Linked Pages
        </>
      )}
    </button>
  )
}
