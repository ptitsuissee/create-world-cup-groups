import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AdItem } from './AdManagerModal';

interface BannerAdProps {
  ads: AdItem[];
  position: 'top' | 'bottom' | 'middle';
}

export function BannerAd({ ads, position }: BannerAdProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Filter ads for banner positions (we'll use a special slot number for banners)
  // Slot 4 = top banner, Slot 5 = middle banner, Slot 6 = bottom banner
  const slotMap = { top: 4, middle: 5, bottom: 6 };
  const bannerAd = (ads || []).find(
    ad => ad.slotNumber === slotMap[position] && ad.isActive
  );

  if (!bannerAd || isDismissed) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto my-4 px-4">
      <div className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg overflow-hidden group hover:shadow-xl transition-all">
        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/30 hover:bg-black/50 rounded-lg transition-all"
          title="Fermer"
        >
          <X size={14} className="text-white/80" />
        </button>

        {/* Banner content */}
        {bannerAd.linkUrl ? (
          <a
            href={bannerAd.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-center justify-center p-4 min-h-[120px]">
              <img
                src={bannerAd.imageUrl}
                alt={bannerAd.title}
                className="max-h-[100px] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="absolute bottom-2 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <p className="text-xs text-white/90 font-medium">{bannerAd.title}</p>
            </div>
          </a>
        ) : (
          <div className="flex items-center justify-center p-4 min-h-[120px]">
            <img
              src={bannerAd.imageUrl}
              alt={bannerAd.title}
              className="max-h-[100px] max-w-full object-contain rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
