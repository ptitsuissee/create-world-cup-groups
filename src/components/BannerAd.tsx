import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AdItem } from './AdManagerModal';

interface BannerAdProps {
  ads: AdItem[];
  position: 'top' | 'bottom' | 'middle';
}

export function BannerAd({ ads, position }: BannerAdProps) {
  // Filter ads for banner positions (we'll use a special slot number for banners)
  // Slot 4 = top banner, Slot 5 = middle banner, Slot 6 = bottom banner
  const slotMap = { top: 4, middle: 5, bottom: 6 };
  const bannerAd = (ads || []).find(
    ad => ad.slotNumber === slotMap[position] && ad.isActive
  );

  if (!bannerAd) {
    // If no ad is set, show a placeholder that is visible as per request
    return (
      <div className="w-full max-w-7xl mx-auto my-6 px-4">
        <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/20 p-8 flex flex-col items-center justify-center text-center group hover:border-blue-400/50 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <span className="text-3xl">📢</span>
          </div>
          <h4 className="text-white/60 font-bold uppercase tracking-widest text-sm">Espace Publicitaire {position.toUpperCase()}</h4>
          <p className="text-white/40 text-xs mt-1 italic">Contactez MatchDraw Pro pour votre publicité ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto my-6 px-4">
      <div className="relative bg-gradient-to-br from-indigo-950/80 to-purple-950/80 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-[0_15px_50px_rgba(0,0,0,0.4)] overflow-hidden group hover:border-yellow-400/50 transition-all duration-500">
        {/* Ad Tag */}
        <div className="absolute top-0 right-6 px-4 py-1.5 bg-yellow-400 text-black text-[10px] font-black rounded-b-xl shadow-lg z-20 uppercase tracking-tighter">
          Sponsor Officiel
        </div>

        {/* Banner content */}
        {bannerAd.linkUrl ? (
          <a
            href={bannerAd.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative z-10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl md:text-4xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors uppercase italic leading-tight tracking-tighter">{bannerAd.title}</h4>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="h-px w-8 bg-blue-400"></div>
                  <p className="text-sm md:text-lg text-blue-300 font-bold uppercase tracking-widest">Partenaire MatchDraw Pro</p>
                </div>
              </div>
              <div className="flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={bannerAd.imageUrl}
                  alt={bannerAd.title}
                  className="max-h-[100px] md:max-h-[160px] w-auto object-contain rounded-2xl shadow-2xl border-2 border-white/20 relative z-10"
                />
              </div>
            </div>
          </a>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl md:text-4xl font-black text-white mb-2 uppercase italic leading-tight tracking-tighter">{bannerAd.title}</h4>
              <p className="text-sm md:text-lg text-white/60 font-bold uppercase tracking-widest">Annonce Partenaire</p>
            </div>
            <div className="flex-shrink-0">
              <img
                src={bannerAd.imageUrl}
                alt={bannerAd.title}
                className="max-h-[100px] md:max-h-[160px] w-auto object-contain rounded-2xl shadow-2xl border-2 border-white/20"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}