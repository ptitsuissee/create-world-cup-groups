import React from 'react';
import { motion } from 'motion/react';
import { X, Users, Target } from 'lucide-react';
import type { Translations } from '../translations';

interface DrawModeModalProps {
  onSelectMode: (mode: 'teams-to-groups' | 'team-from-group') => void;
  onClose: () => void;
  translations: Translations;
}

export function DrawModeModal({ onSelectMode, onClose, translations }: DrawModeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl">{translations.chooseDrawMode}</h2>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Mode 1: Teams to Groups */}
          <button
            onClick={() => onSelectMode('teams-to-groups')}
            className="group bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-green-400 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-green-400/20 hover:scale-105 text-left"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <h3 className="text-xl mb-2">{translations.drawTeamsToGroups}</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              {translations.drawTeamsToGroupsDesc}
            </p>
          </button>

          {/* Mode 2: Team from Group */}
          <button
            onClick={() => onSelectMode('team-from-group')}
            className="group bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-pink-400 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-pink-400/20 hover:scale-105 text-left"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Target size={32} />
            </div>
            <h3 className="text-xl mb-2">{translations.drawTeamFromGroup}</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              {translations.drawTeamFromGroupDesc}
            </p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
