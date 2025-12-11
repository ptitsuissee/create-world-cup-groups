import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Translations } from '../translations';

interface SaveProjectModalProps {
  currentProjectName?: string;
  onSave: (projectName: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function SaveProjectModal({
  currentProjectName,
  onSave,
  onClose,
  translations: t,
}: SaveProjectModalProps) {
  const [projectName, setProjectName] = useState(currentProjectName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = projectName.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Save className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {currentProjectName ? t.updateProject || 'Mettre à jour le projet' : t.saveProject || 'Sauvegarder le projet'}
                </h2>
                <p className="text-sm text-white/70">
                  {currentProjectName ? t.updateProjectDesc || 'Modifier le nom du projet' : t.saveProjectDesc || 'Donnez un nom à votre projet'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">
              📝 {t.projectName || 'Nom du projet'}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={t.enterProjectName || 'Ex: Coupe du Monde 2026'}
              className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder:text-white/40 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
            >
              {t.cancel || 'Annuler'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{currentProjectName ? t.update || 'Mettre à jour' : t.save || 'Sauvegarder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
