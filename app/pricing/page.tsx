'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Zap, Building2, Rocket, Plus, Sparkles, CreditCard, Clock, Users, Globe, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'

interface PricingTier {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  monthlyPrice: number
  annualPrice: number
  websites: number
  websitesLabel: string
  seats: number
  popular?: boolean
  highlighted?: boolean
  features: string[]
  ctaText: string
  ctaLink: string
}

function PricingContent() {
  const searchParams = useSearchParams()
  const highlightPlan = searchParams.get('highlight')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  const tiers: PricingTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for individuals and small projects',
      icon: <Zap className="w-6 h-6" />,
      monthlyPrice: 16.99,
      annualPrice: 14.49,
      websites: 1,
      websitesLabel: '1 website',
      seats: 1,
      features: [
        'AI-Powered Website Builder',
        'GPT-4 & Claude AI Integration',
        'DALL-E 3 Image Generation',
        'Custom Domain Support',
        'SSL Certificate Included',
        'Responsive Design Templates',
        '37+ Business Type Templates',
        'SEO Optimization Tools',
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/create',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing businesses',
      icon: <Building2 className="w-6 h-6" />,
      monthlyPrice: 26.99,
      annualPrice: 22.49,
      websites: 2,
      websitesLabel: '2 websites',
      seats: 2,
      popular: true,
      highlighted: highlightPlan === 'professional',
      features: [
        'Everything in Basic, plus:',
        '2 Team Seats (multi-device login)',
        'Priority Support',
        'Real-time Collaboration',
        'Advanced Analytics Dashboard',
        'E-commerce Features',
        'Blog & CMS Tools',
        'Version History & Rollback',
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/create?plan=professional',
    },
    {
      id: 'agency',
      name: 'Agency',
      description: 'Built for agencies and large teams',
      icon: <Rocket className="w-6 h-6" />,
      monthlyPrice: 47.49,
      annualPrice: 39.49,
      websites: 100,
      websitesLabel: '100 websites',
      seats: 5,
      features: [
        'Everything in Professional, plus:',
        '5 Team Seats',
        'White-label Options',
        'API Access',
        'Custom Code Injection',
        'Dedicated Account Manager',
        'SLA & 99.9% Uptime Guarantee',
        'Bulk Website Management',
      ],
      ctaText: 'Start Free Trial',
      ctaLink: '/create?plan=agency',
    },
  ]

  const addOns = [
    {
      name: 'Additional Seat',
      price: 5.00,
      description: 'Add team members to your account for multi-device login',
      unit: 'per seat/month',
      icon: <Users className="w-6 h-6" />,
    },
    {
      name: 'Extra Website',
      price: 7.99,
      description: 'Add additional websites beyond your plan limit',
      unit: 'per website/month',
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-500 mb-4 max-w-2xl mx-auto">
            Start with a 7-day free trial. No commitment required.
          </p>
        </div>
      </section>

      {/* Free Trial Banner */}
      <section className="pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-spinupfy-50 border border-spinupfy-700/20 p-6 md:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-spinupfy-700/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-spinupfy-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-spinupfy-700" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  7-Day Free Trial
                </h2>
                <p className="text-gray-600 mb-1">
                  Try all features free for 7 days. Add your payment method to start.
                </p>
                <p className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Automatically upgrades to Basic ($16.99/mo) after trial ends. Cancel anytime.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-spinupfy-gradient hover:opacity-90 text-gray-900 rounded-xl font-semibold transition-colors shadow-lg shadow-primary-500/25"
                >
                  <CreditCard className="w-5 h-5" />
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-8 px-6">
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-spinupfy-700 focus:ring-offset-2"
            style={{ backgroundColor: billingCycle === 'annual' ? '#7C35B8' : '#E5E7EB' }}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual
            <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
              2 Months FREE
            </span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border ${
                tier.highlighted
                  ? 'border-spinupfy-700 shadow-xl shadow-spinupfy-700/20 ring-2 ring-spinupfy-700'
                  : tier.popular
                  ? 'border-spinupfy-700 shadow-xl shadow-spinupfy-700/15'
                  : 'border-gray-100'
              } bg-white border border-gray-100 shadow-sm p-8 ${tier.popular && !tier.highlighted ? 'scale-105' : ''} ${tier.highlighted ? 'scale-105' : ''}`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-spinupfy-gradient text-gray-900 text-sm font-semibold rounded-full animate-pulse">
                    Recommended for You
                  </span>
                </div>
              )}
              {tier.popular && !tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-spinupfy-gradient text-gray-900 text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${tier.highlighted ? 'bg-spinupfy-100 text-spinupfy-400' : 'bg-spinupfy-100 text-spinupfy-700'}`}>
                  {tier.icon}
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-sm text-gray-500">{tier.description}</p>
                </div>
              </div>

              <div className="mb-6">
                {billingCycle === 'annual' && (
                  <div className="mb-2">
                    <span className="text-lg text-gray-500 line-through">
                      ${tier.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                      SAVE ${((tier.monthlyPrice - tier.annualPrice) * 12).toFixed(0)}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingCycle === 'monthly' ? tier.monthlyPrice.toFixed(2) : tier.annualPrice.toFixed(2)}
                  </span>
                  <span className="text-gray-500">
                    /month
                  </span>
                </div>
                {billingCycle === 'annual' && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${(tier.annualPrice * 12).toFixed(2)} billed annually
                  </p>
                )}
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-spinupfy-700" />
                      <span className="text-gray-600">Websites</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{tier.websitesLabel}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-spinupfy-700" />
                      <span className="text-gray-600">Team Seats</span>
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {tier.seats} {tier.seats === 1 ? 'seat' : 'seats'}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={tier.ctaLink}
                className={`block w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors mb-6 ${
                  tier.highlighted
                    ? 'bg-spinupfy-gradient hover:opacity-90 text-gray-900'
                    : tier.popular
                    ? 'bg-spinupfy-gradient hover:opacity-90 text-gray-900'
                    : 'bg-white border border-gray-200 hover:border-spinupfy-700/30 hover:bg-spinupfy-50 text-gray-700'
                }`}
              >
                {tier.ctaText}
              </Link>

              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-accent-400' : 'text-spinupfy-700'}`} />
                    <span className={`text-sm ${index === 0 && tier.id !== 'basic' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 px-6 bg-spinupfy-50/60">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Need More?
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Add extra seats or websites to any plan
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addOns.map((addOn, index) => (
              <div key={index} className="p-6 bg-white rounded-xl border border-gray-100 hover:border-spinupfy-700/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-spinupfy-100 text-spinupfy-700 rounded-lg">
                    {addOn.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{addOn.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{addOn.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${addOn.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm">{addOn.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-gray-500 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-900 font-semibold">Basic</th>
                  <th className="text-center py-4 px-4 text-gray-900 font-semibold">Professional</th>
                  <th className="text-center py-4 px-4 text-gray-900 font-semibold">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="py-4 px-4 text-gray-600">Monthly Price</td>
                  <td className="py-4 px-4 text-center text-gray-900">$16.99</td>
                  <td className="py-4 px-4 text-center text-gray-900">$26.99</td>
                  <td className="py-4 px-4 text-center text-gray-900">$47.49</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">Websites</td>
                  <td className="py-4 px-4 text-center text-gray-900">1</td>
                  <td className="py-4 px-4 text-center text-gray-900">2</td>
                  <td className="py-4 px-4 text-center text-gray-900">100</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">Team Seats</td>
                  <td className="py-4 px-4 text-center text-gray-900">1</td>
                  <td className="py-4 px-4 text-center text-gray-900">2</td>
                  <td className="py-4 px-4 text-center text-gray-900">5</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">AI Website Builder</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">Custom Domain</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">SSL Certificate</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">Priority Support</td>
                  <td className="py-4 px-4 text-center text-gray-500">—</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">E-commerce Features</td>
                  <td className="py-4 px-4 text-center text-gray-500">—</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">API Access</td>
                  <td className="py-4 px-4 text-center text-gray-500">—</td>
                  <td className="py-4 px-4 text-center text-gray-500">—</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-600">White-label Options</td>
                  <td className="py-4 px-4 text-center text-gray-500">—</td>
                  <td className="py-4 px-4 text-center text-gray-500">—</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ/CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-spinupfy-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Build Your Website?
          </h2>
          <p className="text-gray-500 mb-8">
            Start your 7-day free trial today. No commitment, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-3 bg-spinupfy-gradient hover:opacity-90 text-gray-900 rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="mailto:support@webese.ai"
              className="px-8 py-3 bg-white border border-gray-200 hover:border-spinupfy-700/30 hover:bg-spinupfy-50 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Contact Sales
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Questions? Email us at <a href="mailto:support@webese.ai" className="text-spinupfy-700 hover:underline">support@webese.ai</a>
          </p>
        </div>
      </section>
    </div>
  )
}

function PricingPageFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-spinupfy-700 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading pricing...</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingPageFallback />}>
      <PricingContent />
    </Suspense>
  )
}