'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react'

interface FooterColumn {
  title: string
  links: Array<{
    label: string
    href: string
  }>
}

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'github'
  href: string
}

interface FooterSectionProps {
  content: {
    logo?: string
    brandName?: string
    tagline?: string
    columns?: FooterColumn[]
    socialLinks?: SocialLink[]
    contactInfo?: {
      email?: string
      phone?: string
      address?: string
    }
    copyright?: string
  }
  editable?: boolean
  onEdit?: () => void
}

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
}

export function FooterSection({ content, editable, onEdit }: FooterSectionProps) {
  const {
    logo,
    brandName = 'Your Brand',
    tagline = 'Building the future',
    columns = [],
    socialLinks = [],
    contactInfo = {},
    copyright = `© ${new Date().getFullYear()} All rights reserved.`,
  } = content

  return (
    <footer
      className={`relative bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 ${
        editable ? 'cursor-pointer hover:ring-2 hover:ring-primary-500/50' : ''
      }`}
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 mb-12">
          {/* Brand Section - Left Side */}
          <motion.div
            className="lg:w-64 flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {logo && (
                <img src={logo} alt={brandName} className="h-10 w-auto" />
              )}
              <span className="text-2xl font-bold text-white">{brandName}</span>
            </div>
            {tagline && (
              <p className="text-gray-400 mb-6">{tagline}</p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = socialIcons[social.platform]
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                      onClick={(e) => editable && e.preventDefault()}
                    >
                      <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </a>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* 3-Column Menu Section - Right Side */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Link Columns (limit to first 3) */}
            {columns.slice(0, 3).map((column, columnIndex) => (
              <motion.div
                key={columnIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
              >
                <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                        onClick={(e) => editable && e.preventDefault()}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* Contact Info in third column if no third menu column */}
            {columns.length < 3 && (contactInfo.email || contactInfo.phone || contactInfo.address) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-white font-semibold mb-4">Contact</h3>
                <div className="space-y-3">
                  {contactInfo.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary-400 mt-0.5" />
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-gray-400 hover:text-primary-400 transition-colors break-all"
                        onClick={(e) => editable && e.preventDefault()}
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  )}
                  {contactInfo.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary-400 mt-0.5" />
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-gray-400 hover:text-primary-400 transition-colors"
                        onClick={(e) => editable && e.preventDefault()}
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {contactInfo.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                      <p className="text-gray-400">{contactInfo.address}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-center text-gray-500 text-sm">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
