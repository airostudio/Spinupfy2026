import { FormTemplate, FormRenderer } from '@/components/forms'

interface FormSectionProps {
  template?: FormTemplate
  content?: {
    title?: string
    subtitle?: string
    templateId?: string
  }
  settings?: {
    theme?: string
    variant?: string
  }
}

export function FormSection({ template, content, settings }: FormSectionProps) {
  // If template is provided directly, use it
  // Otherwise, we would need to load it from content.templateId
  // For now, we'll just show a placeholder if no template

  if (!template) {
    return (
      <section
        className="py-20"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div
              className="p-12 rounded-2xl border-2 text-center"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border)'
              }}
            >
              <h3
                className="text-2xl font-bold mb-2"
                style={{
                  color: 'var(--color-text-heading)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {content?.title || 'Form Section'}
              </h3>
              <p style={{ color: 'var(--color-text-body)' }}>
                {content?.subtitle || 'Select a form template to display here'}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="py-20"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {(content?.title || content?.subtitle) && (
            <div className="text-center mb-12">
              {content.title && (
                <h2
                  className="text-4xl md:text-5xl font-bold mb-4"
                  style={{
                    color: 'var(--color-text-heading)',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  {content.title}
                </h2>
              )}
              {content.subtitle && (
                <p
                  className="text-xl"
                  style={{ color: 'var(--color-text-body)' }}
                >
                  {content.subtitle}
                </p>
              )}
            </div>
          )}

          <FormRenderer template={template} />
        </div>
      </div>
    </section>
  )
}
