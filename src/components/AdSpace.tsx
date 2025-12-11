import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { AdItem } from './AdManagerModal';

interface AdSpaceProps {
  position: 'left' | 'right';
  ads: AdItem[];
}

export function AdSpace({ position, ads }: AdSpaceProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Filter ads for this position - handle undefined ads
  const positionAds = (ads || []).filter(ad => ad.position === position && ad.isActive);
  
  // Get ads by slot number
  const slot1 = positionAds.find(ad => ad.slotNumber === 1);
  const slot2 = positionAds.find(ad => ad.slotNumber === 2);
  const slot3 = positionAds.find(ad => ad.slotNumber === 3);

  // Don't render if hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`hidden 2xl:flex fixed top-1/2 -translate-y-1/2 ${
          position === 'left' ? 'left-2' : 'right-2'
        } w-10 h-24 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl items-center justify-center z-40 transition-all hover:scale-105`}
        title="Afficher les publicités"
      >
        <Eye size={20} className="text-white/60" />
      </button>
    );
  }

  return (
    <div
      className={`hidden 2xl:block fixed top-20 ${
        position === 'left' ? 'left-2' : 'right-2'
      } w-[160px] space-y-3 z-40`}
    >
      {/* Hide button */}
      <button
        onClick={() => setIsVisible(false)}
        className="w-full p-2 bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-lg border border-white/10 shadow-lg transition-all flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white/90"
        title="Masquer les publicités"
      >
        <EyeOff size={14} />
        Masquer
      </button>

      {/* Ad Slot 1 - Square */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20 shadow-lg hover:shadow-xl transition-all">
        {slot1 ? (
          <a
            href={slot1.linkUrl || '#'}
            target={slot1.linkUrl ? '_blank' : undefined}
            rel={slot1.linkUrl ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-white/5 group-hover:scale-105 transition-transform">
              <img
                src={slot1.imageUrl}
                alt={slot1.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[10px] text-white/70 mt-1.5 text-center truncate font-medium">
              {slot1.title}
            </p>
          </a>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex flex-col items-center justify-center text-center p-2">
            <div className="text-3xl mb-1">📢</div>
            <p className="text-[10px] text-white/60">Pub 160x160</p>
          </div>
        )}
      </div>

      {/* Ad Slot 2 - Vertical Rectangle */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20 shadow-lg hover:shadow-xl transition-all">
        {slot2 ? (
          <a
            href={slot2.linkUrl || '#'}
            target={slot2.linkUrl ? '_blank' : undefined}
            rel={slot2.linkUrl ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-white/5 group-hover:scale-105 transition-transform">
              <img
                src={slot2.imageUrl}
                alt={slot2.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[10px] text-white/70 mt-1.5 text-center truncate font-medium">
              {slot2.title}
            </p>
          </a>
        ) : (
          <div className="aspect-[2/3] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex flex-col items-center justify-center text-center p-2">
            <div className="text-3xl mb-1">🎯</div>
            <p className="text-[10px] text-white/60">Pub 160x240</p>
          </div>
        )}
      </div>

      {/* Ad Slot 3 - Square */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-2 border border-white/20 shadow-lg hover:shadow-xl transition-all">
        {slot3 ? (
          <a
            href={slot3.linkUrl || '#'}
            target={slot3.linkUrl ? '_blank' : undefined}
            rel={slot3.linkUrl ? 'noopener noreferrer' : undefined}
            className="block group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-white/5 group-hover:scale-105 transition-transform">
              <img
                src={slot3.imageUrl}
                alt={slot3.title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[10px] text-white/70 mt-1.5 text-center truncate font-medium">
              {slot3.title}
            </p>
          </a>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex flex-col items-center justify-center text-center p-2">
            <div className="text-3xl mb-1">💎</div>
            <p className="text-[10px] text-white/60">Pub 160x160</p>
          </div>
        )}
      </div>
    </div>
  );
}