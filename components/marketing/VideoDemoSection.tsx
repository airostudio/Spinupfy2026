'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X } from 'lucide-react'

export function VideoDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-8 backdrop-blur-sm border border-white/10 bg-white/5"
          >
            <Play className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white/90">
              See It In Action
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            Watch a Website Built in Real-Time
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            See how our AI transforms a simple business description into a fully functional website
          </motion.p>
        </div>

        {/* Video Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          <div
            className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
            onClick={() => setIsPlaying(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-teal-600/20" />

            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <Play className="w-12 h-12 md:w-16 md:h-16 text-white ml-2" />
                </div>
              </motion.div>

              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-sm font-medium text-white">2:30 Demo</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-sm font-medium text-white">Full Walkthrough</span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Feature Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {[
              '🎨 Live Design Generation',
              '✍️ AI Content Writing',
              '📱 Responsive Preview',
              '🚀 One-Click Deploy'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <span className="text-sm text-white/80">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setIsPlaying(false)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
              onClick={() => setIsPlaying(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-6xl mx-6 aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/50 mb-4 mx-auto" />
                  <p className="text-white/70 text-lg">
                    Video demonstration coming soon
                  </p>
                  <p className="text-white/50 text-sm mt-2">
                    Add your demo video to /public/videos/website-demo.mp4
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
