import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { AdItem } from './AdManagerModal';

interface AdSpaceProps {
  position: 'left' | 'right';
  ads: AdItem[];
}

export function AdSpace({ position, ads }: AdSpaceProps) {
  // Filter ads for this position - handle undefined ads
  const positionAds = (ads || []).filter(ad => ad.position === position && ad.isActive);
  
  // Get ads by slot number
  const slot1 = positionAds.find(ad => ad.slotNumber === 1);
  const slot2 = positionAds.find(ad => ad.slotNumber === 2);
  const slot3 = positionAds.find(ad => ad.slotNumber === 3);

  return (
    <div
      className={`hidden 2xl:block fixed top-24 ${
        position === 'left' ? 'left-4' : 'right-4'
      } w-[160px] space-y-4 z-40 animate-in fade-in slide-in-from-${position === 'left' ? 'left' : 'right'}-10 duration-700`}
    >
      {/* Ad Tag */}
      <div className={`flex items-center gap-2 mb-2 ${position === 'left' ? 'justify-start' : 'justify-end'}`}>
        <div className="px-2 py-0.5 bg-yellow-400 text-black text-[9px] font-black rounded shadow-lg uppercase tracking-tighter">
          Annonce
        </div>
      </div>

      {/* Ad Slot 1 - Square */}
      <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-2.5 border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-105 hover:border-blue-400/50 transition-all duration-300">
        {slot1 ? (
          <a
            href={slot1.linkUrl || '#'}
            target={slot1.linkUrl ? '_blank' : undefined}
            rel={slot1.linkUrl ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-blue-400/30 transition-all">
              <img
                src={slot1.imageUrl}
                alt={slot1.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="text-[10px] text-white/80 mt-2 text-center truncate font-bold uppercase tracking-tight">
              {slot1.title}
            </p>
          </a>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex flex-col items-center justify-center text-center p-2 border border-white/10 group">
            <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">📢</div>
            <p className="text-[10px] text-white/50 font-bold uppercase">Sponsor Space</p>
          </div>
        )}
      </div>

      {/* Ad Slot 2 - Vertical Rectangle */}
      <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-2.5 border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-105 hover:border-purple-400/50 transition-all duration-300">
        {slot2 ? (
          <a
            href={slot2.linkUrl || '#'}
            target={slot2.linkUrl ? '_blank' : undefined}
            rel={slot2.linkUrl ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-purple-400/30 transition-all">
              <img
                src={slot2.imageUrl}
                alt={slot2.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="text-[10px] text-white/80 mt-2 text-center truncate font-bold uppercase tracking-tight">
              {slot2.title}
            </p>
          </a>
        ) : (
          <div className="aspect-[2/3] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex flex-col items-center justify-center text-center p-2 border border-white/10 group">
            <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🎯</div>
            <p className="text-[10px] text-white/50 font-bold uppercase">Sponsor Space</p>
          </div>
        )}
      </div>

      {/* Ad Slot 3 - Square */}
      <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-2.5 border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:scale-105 hover:border-pink-400/50 transition-all duration-300">
        {slot3 ? (
          <a
            href={slot3.linkUrl || '#'}
            target={slot3.linkUrl ? '_blank' : undefined}
            rel={slot3.linkUrl ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-pink-400/30 transition-all">
              <img
                src={slot3.imageUrl}
                alt={slot3.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="text-[10px] text-white/80 mt-2 text-center truncate font-bold uppercase tracking-tight">
              {slot3.title}
            </p>
          </a>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex flex-col items-center justify-center text-center p-2 border border-white/10 group">
            <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">💎</div>
            <p className="text-[10px] text-white/50 font-bold uppercase">Sponsor Space</p>
          </div>
        )}
      </div>
    </div>
  );
}