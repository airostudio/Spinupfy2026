'use client';

/**
 * Complete Phase
 * Celebration and next steps after website generation
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  PartyPopper,
  ExternalLink,
  Edit,
  Share2,
  Rocket,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBuildGuidance } from '@/lib/store/build-guidance.store';

export function CompletePhase() {
  const router = useRouter();
  const { generatedWebsiteId, businessVariables, resetSession } = useBuildGuidance();

  const handleEditWebsite = () => {
    if (generatedWebsiteId) {
      router.push(`/editor/${generatedWebsiteId}`);
    }
  };

  const handlePreviewWebsite = () => {
    if (generatedWebsiteId) {
      window.open(`/preview/${generatedWebsiteId}`, '_blank');
    }
  };

  const handleCreateAnother = () => {
    resetSession();
    router.push('/create');
  };

  return (
    <div className="space-y-6">
      {/* Celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-block"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Your Website is Ready!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400"
        >
          {businessVariables.businessName} is now live
        </motion.p>
      </motion.div>

      {/* Success checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"
      >
        <h4 className="text-sm font-medium text-green-400 mb-3">What we created:</h4>
        <ul className="space-y-2">
          {[
            'Professional homepage with hero section',
            'About, Services, and Contact pages',
            'Customized design matching your brand',
            'SEO-optimized content',
            'Mobile-responsive layout',
          ].map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <button
          onClick={handleEditWebsite}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Open in Editor
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePreviewWebsite}
            className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-700"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={handleCreateAnother}
            className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-700"
          >
            <Rocket className="w-4 h-4" />
            Create Another
          </button>
        </div>
      </motion.div>

      {/* Next steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
      >
        <h4 className="text-sm font-medium text-white mb-3">Next Steps:</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </span>
            Review and customize your content in the editor
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </span>
            Add your own images and branding
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary-500/20 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </span>
            Connect your custom domain and publish
          </li>
        </ul>
      </motion.div>

      {/* Share */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <button className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors">
          <Share2 className="w-4 h-4" />
          Share your creation
        </button>
      </motion.div>
    </div>
  );
}

export default CompletePhase;
