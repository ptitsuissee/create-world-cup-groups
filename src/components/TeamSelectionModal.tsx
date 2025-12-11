import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Shuffle, CheckCircle2 } from 'lucide-react';
import type { Country } from '../App';
import type { Translations } from '../translations';

interface TeamSelectionModalProps {
  teams: Country[];
  onConfirm: (selectedTeamIds: string[]) => void;
  onClose: () => void;
  translations: Translations;
}

export function TeamSelectionModal({ teams, onConfirm, onClose, translations }: TeamSelectionModalProps) {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set(teams.map(t => t.id)));

  const toggleTeam = (teamId: string) => {
    const newSelection = new Set(selectedTeams);
    if (newSelection.has(teamId)) {
      newSelection.delete(teamId);
    } else {
      newSelection.add(teamId);
    }
    setSelectedTeams(newSelection);
  };

  const selectAll = () => {
    setSelectedTeams(new Set(teams.map(t => t.id)));
  };

  const deselectAll = () => {
    setSelectedTeams(new Set());
  };

  const handleConfirm = () => {
    if (selectedTeams.size > 0) {
      onConfirm(Array.from(selectedTeams));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Shuffle size={24} />
            </div>
            <div>
              <h2 className="text-2xl">{translations.selectTeamsToDraw}</h2>
              <p className="text-sm text-white/70">
                {selectedTeams.size} {translations.teamsSelected}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={selectAll}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm border border-white/20"
          >
            {translations.selectAll}
          </button>
          <button
            onClick={deselectAll}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm border border-white/20"
          >
            {translations.deselectAll}
          </button>
        </div>

        {/* Teams list */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-2 pr-2">
          {teams.map((team) => {
            const isSelected = selectedTeams.has(team.id);
            const isUrl = team.flag.startsWith('http://') || 
                          team.flag.startsWith('https://') || 
                          team.flag.startsWith('data:');

            return (
              <button
                key={team.id}
                onClick={() => toggleTeam(team.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all border-2 ${
                  isSelected
                    ? 'bg-white/20 border-green-400 shadow-lg shadow-green-400/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-green-400 border-green-400' : 'border-white/30'
                }`}>
                  {isSelected && <CheckCircle2 size={20} className="text-white" />}
                </div>

                {isUrl ? (
                  <img src={team.flag} alt={team.name} className="w-8 h-8 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <span className="text-2xl flex-shrink-0">{team.flag}</span>
                )}

                <span className="flex-1 text-left">{team.name}</span>

                <span className={`text-xs px-3 py-1 rounded-full ${
                  team.type === 'country' 
                    ? 'bg-blue-500/30 border border-blue-400/50' 
                    : 'bg-purple-500/30 border border-purple-400/50'
                }`}>
                  {team.type === 'country' ? '🌍' : '🏆'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
          >
            {translations.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedTeams.size === 0}
            className={`flex-1 px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              selectedTeams.size > 0
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:shadow-xl hover:scale-105'
                : 'bg-gray-500/50 cursor-not-allowed'
            }`}
          >
            <Shuffle size={20} />
            <span>{translations.startDraw}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
