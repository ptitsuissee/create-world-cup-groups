import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AdItem {
  id: string;
  position: 'left' | 'right';
  slotNumber: 1 | 2 | 3 | 4 | 5 | 6; // 1-3: lateral ads, 4-6: banners (top, middle, bottom)
  imageUrl: string;
  linkUrl: string;
  title: string;
  isActive: boolean;
  createdAt: number;
}

interface AdManagerModalProps {
  ads: AdItem[];
  onSave: (ads: AdItem[]) => void;
  onClose: () => void;
  translations: any;
}

export function AdManagerModal({ ads, onSave, onClose, translations }: AdManagerModalProps) {
  const [localAds, setLocalAds] = useState<AdItem[]>(ads);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    position: 'left' as 'left' | 'right',
    slotNumber: 1 as 1 | 2 | 3 | 4 | 5 | 6,
    imageUrl: '',
    linkUrl: '',
    title: '',
  });

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingAd(null);
    setFormData({
      position: 'left',
      slotNumber: 1,
      imageUrl: '',
      linkUrl: '',
      title: '',
    });
  };

  const handleEdit = (ad: AdItem) => {
    setEditingAd(ad);
    setIsCreating(false);
    setFormData({
      position: ad.position,
      slotNumber: ad.slotNumber,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      title: ad.title,
    });
  };

  const handleSaveAd = () => {
    if (!formData.imageUrl || !formData.title) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingAd) {
      // Update existing ad
      setLocalAds(prev => prev.map(ad =>
        ad.id === editingAd.id
          ? { ...ad, ...formData }
          : ad
      ));
    } else {
      // Create new ad
      const newAd: AdItem = {
        id: `ad-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...formData,
        isActive: true,
        createdAt: Date.now(),
      };
      setLocalAds(prev => [...prev, newAd]);
    }

    setIsCreating(false);
    setEditingAd(null);
    setFormData({
      position: 'left',
      slotNumber: 1,
      imageUrl: '',
      linkUrl: '',
      title: '',
    });
  };

  const handleDeleteAd = (adId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      setLocalAds(prev => prev.filter(ad => ad.id !== adId));
    }
  };

  const handleToggleActive = (adId: string) => {
    setLocalAds(prev => prev.map(ad =>
      ad.id === adId ? { ...ad, isActive: !ad.isActive } : ad
    ));
  };

  const handleSaveAll = () => {
    onSave(localAds);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-6xl w-full p-8 my-8 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
              📢
            </div>
            <h2 className="text-3xl">Gestionnaire de Publicités</h2>
          </div>
          <p className="text-white/70 text-sm">
            Gérez les espaces publicitaires de l'application (Admin uniquement)
          </p>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Ad List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl">Publicités actives ({localAds.length})</h3>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                Nouvelle pub
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {localAds.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 text-center text-white/50">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Aucune publicité pour le moment</p>
                  <p className="text-sm mt-1">Cliquez sur "Nouvelle pub" pour commencer</p>
                </div>
              ) : (
                localAds.map(ad => (
                  <div
                    key={ad.id}
                    className={`bg-white/10 rounded-xl p-4 border ${
                      ad.isActive ? 'border-green-400/30' : 'border-white/10'
                    } hover:bg-white/15 transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Preview */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {ad.imageUrl ? (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📢
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{ad.title}</h4>
                        <div className="text-xs text-white/60 space-y-1 mt-1">
                          <div>📍 Position: {ad.position === 'left' ? 'Gauche' : 'Droite'} - Slot {ad.slotNumber}</div>
                          {ad.linkUrl && (
                            <div className="truncate">🔗 {ad.linkUrl}</div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleToggleActive(ad.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            ad.isActive
                              ? 'bg-green-500/20 hover:bg-green-500/30'
                              : 'bg-gray-500/20 hover:bg-gray-500/30'
                          }`}
                          title={ad.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {ad.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Ad Form */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl mb-4">
              {editingAd ? '✏️ Modifier la publicité' : isCreating ? '➕ Nouvelle publicité' : '👈 Sélectionnez une pub'}
            </h3>

            {(isCreating || editingAd) ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">
                    Titre de la publicité *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Promo Nike 2024"
                    className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    required
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, position: 'left' }))}
                      className={`py-3 rounded-xl transition-all ${
                        formData.position === 'left'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      ⬅️ Gauche
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, position: 'right' }))}
                      className={`py-3 rounded-xl transition-all ${
                        formData.position === 'right'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      Droite ➡️
                    </button>
                  </div>
                </div>

                {/* Slot Number */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">
                    Emplacement (Slot)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, slotNumber: num as 1 | 2 | 3 | 4 | 5 | 6 }))}
                        className={`py-3 rounded-xl transition-all ${
                          formData.slotNumber === num
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        Slot {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">
                    Image de la publicité *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="URL de l'image ou télécharger ci-dessous"
                      className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    />
                    <label className="relative cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                        📁 <span className="text-sm">Télécharger une image</span>
                      </div>
                    </label>
                    {formData.imageUrl && (
                      <div className="rounded-xl overflow-hidden bg-white/5 p-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-sm text-white/80 mb-2">
                    Lien de destination (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveAd}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    ✓ Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingAd(null);
                    }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-white/50">
                <div className="text-4xl mb-3">👆</div>
                <p>Sélectionnez une publicité à modifier</p>
                <p className="text-sm mt-1">ou créez-en une nouvelle</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSaveAll}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            💾 Sauvegarder toutes les modifications
          </button>
        </div>
      </motion.div>
    </div>
  );
}