import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, RefreshCw } from 'lucide-react';
import type { Group, Country } from '../App';
import type { Translations } from '../translations';

interface EditMatchModalProps {
  group: Group;
  currentTeam1Id: string;
  currentTeam2Id: string;
  onConfirm: (team1Id: string, team2Id: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function EditMatchModal({
  group,
  currentTeam1Id,
  currentTeam2Id,
  onConfirm,
  onClose,
  translations,
}: EditMatchModalProps) {
  const [team1Id, setTeam1Id] = useState(currentTeam1Id);
  const [team2Id, setTeam2Id] = useState(currentTeam2Id);

  const handleSubmit = () => {
    if (team1Id === team2Id) {
      return; // Don't allow same team
    }
    onConfirm(team1Id, team2Id);
  };

  const isUrl = (flag: string) => {
    return flag.startsWith('http://') || flag.startsWith('https://') || flag.startsWith('data:');
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <RefreshCw size={24} />
            </div>
            <h2 className="text-2xl">{translations.changeTeams}</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Team 1 Selection */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              {translations.selectTeam1}
            </label>
            <select
              value={team1Id}
              onChange={(e) => setTeam1Id(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-white"
            >
              {group.countries.map((team) => (
                <option key={team.id} value={team.id} className="bg-gray-800">
                  {team.name}
                </option>
              ))}
            </select>
            {/* Preview */}
            {team1Id && (() => {
              const team = group.countries.find(t => t.id === team1Id);
              if (!team) return null;
              return (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                  {isUrl(team.flag) ? (
                    <img src={team.flag} alt={team.name} className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <span className="text-xl">{team.flag}</span>
                  )}
                  <span>{team.name}</span>
                </div>
              );
            })()}
          </div>

          {/* Team 2 Selection */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              {translations.selectTeam2}
            </label>
            <select
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-white"
            >
              {group.countries.map((team) => (
                <option key={team.id} value={team.id} className="bg-gray-800">
                  {team.name}
                </option>
              ))}
            </select>
            {/* Preview */}
            {team2Id && (() => {
              const team = group.countries.find(t => t.id === team2Id);
              if (!team) return null;
              return (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                  {isUrl(team.flag) ? (
                    <img src={team.flag} alt={team.name} className="w-6 h-6 object-cover rounded" />
                  ) : (
                    <span className="text-xl">{team.flag}</span>
                  )}
                  <span>{team.name}</span>
                </div>
              );
            })()}
          </div>

          {/* Warning if same team */}
          {team1Id === team2Id && (
            <div className="px-4 py-2 bg-red-500/20 border border-red-400/50 rounded-lg text-sm">
              ⚠️ {translations.selectTeam1} {translations.selectTeam2}
            </div>
          )}
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
            disabled={team1Id === team2Id}
            className={`flex-1 px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              team1Id !== team2Id
                ? 'bg-gradient-to-r from-blue-400 to-purple-500 hover:shadow-xl hover:scale-105'
                : 'bg-gray-500/50 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={20} />
            <span>{translations.update}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
