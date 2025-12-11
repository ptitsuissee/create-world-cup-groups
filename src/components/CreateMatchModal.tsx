import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus } from 'lucide-react';
import type { Group } from '../App';
import type { Translations } from '../translations';

interface CreateMatchModalProps {
  group: Group;
  onConfirm: (team1Id: string, team2Id: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function CreateMatchModal({
  group,
  onConfirm,
  onClose,
  translations,
}: CreateMatchModalProps) {
  const [team1Id, setTeam1Id] = useState(group.countries[0]?.id || '');
  const [team2Id, setTeam2Id] = useState(group.countries[1]?.id || '');

  const handleSubmit = () => {
    if (!team1Id || !team2Id || team1Id === team2Id) {
      return; // Don't allow same team or empty selection
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
        className="bg-gradient-to-br from-green-600/90 to-emerald-600/90 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Plus size={24} />
            </div>
            <h2 className="text-2xl">{translations.createNewMatch}</h2>
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all text-white"
            >
              <option value="" className="bg-gray-800">{translations.selectTeam1}</option>
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

          {/* VS Separator */}
          <div className="flex items-center justify-center">
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-xl">{translations.vs}</span>
            </div>
          </div>

          {/* Team 2 Selection */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              {translations.selectTeam2}
            </label>
            <select
              value={team2Id}
              onChange={(e) => setTeam2Id(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/30 transition-all text-white"
            >
              <option value="" className="bg-gray-800">{translations.selectTeam2}</option>
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

          {/* Warning if same team or no selection */}
          {(team1Id === team2Id || !team1Id || !team2Id) && (
            <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-lg text-sm">
              ⚠️ {translations.selectBothTeams}
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
            disabled={!team1Id || !team2Id || team1Id === team2Id}
            className={`flex-1 px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
              team1Id && team2Id && team1Id !== team2Id
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:shadow-xl hover:scale-105'
                : 'bg-gray-500/50 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            <span>{translations.createMatch}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
