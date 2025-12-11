import React, { useState } from 'react';
import { X, Copy, Check, Share2, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import type { Translations } from '../translations';

interface ShareProjectModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  translations: Translations;
}

export function ShareProjectModal({ projectId, projectName, onClose, translations }: ShareProjectModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate shareable link with read-only mode
  const shareUrl = `${window.location.origin}${window.location.pathname}?project=${projectId}&mode=view`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl">{translations.shareProject || 'Partager le projet'}</h2>
              <p className="text-sm text-white/70">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex items-start gap-3">
            <Eye size={20} className="text-blue-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="mb-1">
                {translations.shareInfo || 'Partagez ce lien avec d\'autres personnes pour leur permettre de voir votre projet en mode lecture seule.'}
              </p>
              <p className="text-white/70">
                {translations.shareInfoDetails || 'Les visiteurs pourront consulter votre projet mais ne pourront pas le modifier.'}
              </p>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm mb-2 text-white/80">
            {translations.shareableLink || 'Lien de partage'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  <span>{translations.copied || 'Copié'}</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                  <span>{translations.copy || 'Copier'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features Info */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30">
          <h3 className="text-sm mb-3 flex items-center gap-2">
            <span>✓</span>
            <span>{translations.viewersCanSee || 'Les visiteurs peuvent :'}</span>
          </h3>
          <ul className="text-sm text-white/80 space-y-1.5 ml-6">
            <li>• {translations.viewGroups || 'Voir les groupes et les équipes'}</li>
            <li>• {translations.viewMatches || 'Consulter les matchs et les résultats'}</li>
            <li>• {translations.viewStandings || 'Voir les classements'}</li>
            <li>• {translations.viewKnockout || 'Consulter le tableau à élimination directe'}</li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            {translations.close || 'Fermer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
