'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

interface TeamSectionProps {
  content: {
    title: string;
    subtitle?: string;
    description?: string;
    members: TeamMember[];
  };
  editable?: boolean;
  onEdit?: () => void;
}

export function TeamSection({ content, editable, onEdit }: TeamSectionProps) {
  return (
    <section
      className="relative py-20 bg-gray-50 overflow-hidden"
      onClick={editable ? onEdit : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          {content.subtitle && (
            <span className="inline-block px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
              {content.subtitle}
            </span>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
          </h2>
          {content.description && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {content.description}
            </p>
          )}
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              {/* Member Image */}
              {member.image ? (
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="relative h-80 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <div className="text-6xl font-bold text-white">
                    {member.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                </div>
              )}

              {/* Member Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-semibold mb-4">
                  {member.role}
                </p>
                {member.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {member.bio}
                  </p>
                )}

                {/* Social Links */}
                {(member.linkedin || member.twitter || member.email) && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary-100 flex items-center justify-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="w-5 h-5 text-gray-600 hover:text-primary-600" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary-100 flex items-center justify-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Twitter className="w-5 h-5 text-gray-600 hover:text-primary-600" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-primary-100 flex items-center justify-center transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-5 h-5 text-gray-600 hover:text-primary-600" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
