'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';

interface StickyMobileCTAProps {
  ctaText: string;
  ctaHref?: string;
  onClick?: () => void;
  showAfterScroll?: number; // px scrolled before showing
  dismissible?: boolean;
}

export function StickyMobileCTA({
  ctaText,
  ctaHref,
  onClick,
  showAfterScroll = 300,
  dismissible = true,
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > showAfterScroll && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= showAfterScroll) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (ctaHref) {
      window.location.href = ctaHref;
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (isDismissed) return null;

  return (
    <div className={`sticky-mobile-cta ${isVisible ? 'visible' : ''}`}>
      <div className="max-w-md mx-auto flex items-center gap-3">
        <Button
          onClick={handleClick}
          size="lg"
          className="flex-1 text-base font-semibold"
        >
          {ctaText}
        </Button>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
