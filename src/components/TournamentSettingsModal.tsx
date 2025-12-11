import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Settings } from 'lucide-react';
import type { TournamentSettings } from '../App';
import type { Translations } from '../translations';

interface TournamentSettingsModalProps {
  settings: TournamentSettings;
  onConfirm: (settings: TournamentSettings) => void;
  onClose: () => void;
  translations: Translations;
}

export function TournamentSettingsModal({
  settings,
  onConfirm,
  onClose,
  translations,
}: TournamentSettingsModalProps) {
  const [rounds, setRounds] = useState<1 | 2 | 3>(settings.rounds);
  const [pointsWin, setPointsWin] = useState(settings.pointsWin);
  const [pointsDraw, setPointsDraw] = useState(settings.pointsDraw);
  const [pointsLoss, setPointsLoss] = useState(settings.pointsLoss);

  const handleSubmit = () => {
    onConfirm({
      rounds,
      pointsWin,
      pointsDraw,
      pointsLoss,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Settings size={24} />
            </div>
            <h2 className="text-2xl">{translations.tournamentSettings}</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Confrontations */}
          <div>
            <label className="block text-sm text-white/80 mb-3">
              {translations.confrontations}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRounds(1)}
                className={`flex-1 py-3 rounded-xl transition-all text-sm ${
                  rounds === 1
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                {translations.singleRound}
              </button>
              <button
                type="button"
                onClick={() => setRounds(2)}
                className={`flex-1 py-3 rounded-xl transition-all text-sm ${
                  rounds === 2
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                {translations.doubleRound}
              </button>
              <button
                type="button"
                onClick={() => setRounds(3)}
                className={`flex-1 py-3 rounded-xl transition-all text-sm ${
                  rounds === 3
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20'
                }`}
              >
                {translations.tripleRound}
              </button>
            </div>
          </div>

          {/* Points System */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h3 className="text-sm text-white/80 mb-4">{translations.pointsSystem}</h3>
            
            <div className="space-y-3">
              {/* Points for Win */}
              <div>
                <label className="block text-xs text-white/70 mb-1">
                  🏆 {translations.pointsForWin}
                </label>
                <input
                  type="number"
                  min="0"
                  value={pointsWin}
                  onChange={(e) => setPointsWin(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all text-white"
                />
              </div>

              {/* Points for Draw */}
              <div>
                <label className="block text-xs text-white/70 mb-1">
                  🤝 {translations.pointsForDraw}
                </label>
                <input
                  type="number"
                  min="0"
                  value={pointsDraw}
                  onChange={(e) => setPointsDraw(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all text-white"
                />
              </div>

              {/* Points for Loss */}
              <div>
                <label className="block text-xs text-white/70 mb-1">
                  ❌ {translations.pointsForLoss}
                </label>
                <input
                  type="number"
                  min="0"
                  value={pointsLoss}
                  onChange={(e) => setPointsLoss(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
          >
            {translations.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:shadow-xl hover:scale-105 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Settings size={20} />
            <span>{translations.save}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
