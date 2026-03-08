'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Twitter, Linkedin, Github, Youtube, Facebook, Instagram } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900/95 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/icon.png"
                alt="Spinupfy — AI Website Builder"
                width={180}
                height={50}
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Build a stunning, professional website in under 60 seconds. AI writes the copy, designs the layout, and publishes it instantly.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/spinupfy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="https://facebook.com/spinupfy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="https://instagram.com/spinupfy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="https://linkedin.com/company/spinupfy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="https://youtube.com/@spinupfy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a
                href="https://github.com/spinupfy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/create" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Create Website
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Press Kit
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  GDPR
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} Spinupfy. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/sitemap" className="text-gray-500 hover:text-gray-300 transition-colors">
                Sitemap
              </Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-gray-300 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
