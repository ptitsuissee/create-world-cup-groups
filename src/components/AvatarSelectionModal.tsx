import React, { useState } from 'react';
import { X, Upload, Check } from 'lucide-react';
import type { Translations } from '../translations';

interface AvatarSelectionModalProps {
  currentAvatar: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
  translations: Translations;
}

// Collection of fun cartoon-style avatars
const PRESET_AVATARS = [
  '😀', '😎', '🤓', '🥳', '🤩', '😇', '🥰', '😊',
  '🤗', '🤔', '😏', '🤠', '🥷', '👻', '🤖', '👽',
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🦊', '🐵',
  '🦄', '🐲', '🦖', '🦕', '🐙', '🦑', '🐳', '🦈',
  '⚽', '🏀', '🎮', '🎸', '🎨', '🚀', '⚡', '🔥',
  '⭐', '🌟', '💎', '👑', '🎯', '🏆', '🎪', '🎭'
];

export function AvatarSelectionModal({ 
  currentAvatar, 
  onSelect, 
  onClose, 
  translations: t 
}: AvatarSelectionModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [customAvatar, setCustomAvatar] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t.imageTooLarge || 'Image trop volumineuse (max 5MB)');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t.invalidImageFormat || 'Format d\'image invalide');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCustomAvatar(result);
      setSelectedAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl">
              {t.selectAvatar || 'Choisir un avatar'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {t.selectAvatarDesc || 'Personnalisez votre profil avec un avatar'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Custom Avatar */}
          <div className="space-y-3">
            <h3 className="text-lg flex items-center gap-2">
              <Upload size={20} />
              {t.uploadCustomAvatar || 'Importer une image'}
            </h3>
            <div className="flex gap-4 items-center">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 rounded-xl p-6 text-center transition-all">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-white/60" />
                  <p className="text-sm text-white/80">
                    {t.clickToUpload || 'Cliquez pour importer'}
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    PNG, JPG, GIF (max 5MB)
                  </p>
                </div>
              </label>
              {customAvatar && (
                <div 
                  onClick={() => setSelectedAvatar(customAvatar)}
                  className={`w-24 h-24 rounded-xl overflow-hidden cursor-pointer transition-all border-4 ${
                    selectedAvatar === customAvatar 
                      ? 'border-green-400 scale-105 shadow-lg shadow-green-400/50' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <img 
                    src={customAvatar} 
                    alt="Custom avatar" 
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === customAvatar && (
                    <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preset Avatars */}
          <div className="space-y-3">
            <h3 className="text-lg flex items-center gap-2">
              🎨 {t.presetAvatars || 'Avatars prédéfinis'}
            </h3>
            <div className="grid grid-cols-8 gap-3">
              {PRESET_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all hover:scale-110 ${
                    selectedAvatar === avatar
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-400/50 scale-105'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {avatar}
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 rounded-xl border-4 border-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {t.confirm || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
