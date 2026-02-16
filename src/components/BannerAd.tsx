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
    <div className="w-full max-w-7xl mx-auto my-4 sm:my-6 px-2 sm:px-6">
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden group hover:border-yellow-400/50 transition-all duration-500">
        {/* Animated border pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Ad Tag */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-black text-[10px] font-black rounded-b-lg shadow-lg z-20 uppercase tracking-tighter">
          Publicité
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2 right-2 z-30 p-2 bg-black/40 hover:bg-red-500/80 rounded-xl transition-all border border-white/10"
          title="Fermer"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Banner content */}
        {bannerAd.linkUrl ? (
          <a
            href={bannerAd.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative z-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4 min-h-[100px] sm:min-h-[140px]">
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg sm:text-2xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors uppercase italic">{bannerAd.title}</h4>
                <p className="text-xs sm:text-sm text-white/60 font-medium">Découvrez notre partenaire officiel</p>
              </div>
              <div className="flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                <img
                  src={bannerAd.imageUrl}
                  alt={bannerAd.title}
                  className="max-h-[80px] sm:max-h-[120px] w-auto object-contain rounded-xl shadow-2xl border-2 border-white/10"
                />
              </div>
            </div>
          </a>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4 min-h-[100px] sm:min-h-[140px]">
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-lg sm:text-2xl font-black text-white mb-1 uppercase italic">{bannerAd.title}</h4>
              <p className="text-xs sm:text-sm text-white/60">Annonce sponsorisée</p>
            </div>
            <img
              src={bannerAd.imageUrl}
              alt={bannerAd.title}
              className="max-h-[80px] sm:max-h-[120px] w-auto object-contain rounded-xl shadow-2xl border-2 border-white/10"
            />
          </div>
        )}
      </div>
    </div>
  );
}