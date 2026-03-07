/**
 * Default Section Templates
 * Pre-configured section templates for new websites
 */

import { Section } from './store/editor.store'

const generateId = () => Math.random().toString(36).substring(2, 11)

export const createDefaultHero = (): Section => ({
  id: generateId(),
  type: 'HERO',
  order: 0,
  visible: true,
  content: {
    title: 'Welcome to Your Website',
    subtitle: 'Build Something Amazing',
    description: 'Create professional websites with AI-powered tools and intuitive design',
    primaryCTA: {
      text: 'Get Started',
      href: '#contact',
    },
    secondaryCTA: {
      text: 'Learn More',
      href: '#features',
    },
  },
})

export const createDefaultFeatures = (): Section => ({
  id: generateId(),
  type: 'FEATURES',
  order: 1,
  visible: true,
  content: {
    title: 'Our Features',
    subtitle: 'Everything you need to succeed',
    features: [
      {
        icon: 'Zap',
        title: 'Lightning Fast',
        description: 'Optimized for speed and performance',
      },
      {
        icon: 'Shield',
        title: 'Secure & Reliable',
        description: 'Enterprise-grade security built-in',
      },
      {
        icon: 'Users',
        title: 'Team Collaboration',
        description: 'Work together seamlessly',
      },
    ],
  },
})

export const createDefaultCTA = (): Section => ({
  id: generateId(),
  type: 'CTA',
  order: 2,
  visible: true,
  content: {
    title: 'Ready to Get Started?',
    description: 'Join thousands of satisfied customers already using our platform',
    primaryCTA: {
      text: 'Start Free Trial',
      href: '#signup',
    },
    secondaryCTA: {
      text: 'Contact Sales',
      href: '#contact',
    },
  },
})

export const createDefaultContact = (): Section => ({
  id: generateId(),
  type: 'CONTACT',
  order: 3,
  visible: true,
  content: {
    title: 'Get in Touch',
    subtitle: "We'd love to hear from you",
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, Country',
  },
})

export const createDefaultFooter = (): Section => ({
  id: generateId(),
  type: 'FOOTER',
  order: 4,
  visible: true,
  content: {
    brandName: 'Your Brand',
    tagline: 'Building the future, one website at a time',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Security', href: '#security' },
          { label: 'Roadmap', href: '#roadmap' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '#about' },
          { label: 'Blog', href: '#blog' },
          { label: 'Careers', href: '#careers' },
          { label: 'Contact', href: '#contact' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', href: '#docs' },
          { label: 'Help Center', href: '#help' },
          { label: 'Community', href: '#community' },
          { label: 'API', href: '#api' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', href: '#privacy' },
          { label: 'Terms', href: '#terms' },
          { label: 'Cookies', href: '#cookies' },
          { label: 'Licenses', href: '#licenses' },
        ],
      },
    ],
    socialLinks: [
      { platform: 'twitter', href: 'https://twitter.com' },
      { platform: 'facebook', href: 'https://facebook.com' },
      { platform: 'linkedin', href: 'https://linkedin.com' },
      { platform: 'github', href: 'https://github.com' },
    ],
    contactInfo: {
      email: 'contact@example.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street\nCity, State 12345\nCountry',
    },
    copyright: `© ${new Date().getFullYear()} Your Brand. All rights reserved.`,
  },
})

export const createDefaultSections = (): Section[] => [
  createDefaultHero(),
  createDefaultFeatures(),
  createDefaultCTA(),
  createDefaultContact(),
  createDefaultFooter(),
]
