import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Group } from '../App';
import type { Translations } from '../translations';

interface TeamSourceModalProps {
  groups: Group[];
  onSelect: (teamName: string, source: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function TeamSourceModal({
  groups,
  onSelect,
  onClose,
  translations: t,
}: TeamSourceModalProps) {
  const [sourceType, setSourceType] = useState<'group' | 'manual'>('group');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [manualTeamName, setManualTeamName] = useState('');

  const groupsWithTeams = groups.filter(g => g.countries.length > 0);

  const handleConfirm = () => {
    if (sourceType === 'group') {
      const group = groups.find(g => g.id === selectedGroup);
      if (!group) return;

      // Sort teams by their current standings (simplified - you can enhance this)
      const sortedTeams = [...group.countries];
      
      if (selectedPosition <= sortedTeams.length) {
        const team = sortedTeams[selectedPosition - 1];
        const positionLabels = [t.position1st, t.position2nd, t.position3rd, t.position4th];
        const positionLabel = positionLabels[selectedPosition - 1] || `${selectedPosition}${t.position1st.replace('1', '')}`;
        onSelect(team.name, `${positionLabel} ${group.name}`);
      }
    } else {
      if (manualTeamName.trim()) {
        onSelect(manualTeamName.trim(), t.manualEntry);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20 text-gray-800">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">{t.teamSelection}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200/50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Source Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setSourceType('group')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                sourceType === 'group'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t.selectFromGroup}
            </button>
            <button
              onClick={() => setSourceType('manual')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                sourceType === 'manual'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {t.manualSelection}
            </button>
          </div>

          {/* Group Selection */}
          {sourceType === 'group' && (
            <>
              <div>
                <label className="block text-sm mb-2 opacity-80">{t.group}</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-xl text-gray-800"
                >
                  <option value="">{t.selectSource}</option>
                  {groupsWithTeams.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.countries.length} {t.teams})
                    </option>
                  ))}
                </select>
              </div>

              {selectedGroup && (
                <div>
                  <label className="block text-sm mb-2 opacity-80">{t.selectPosition}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((pos) => {
                      const group = groups.find(g => g.id === selectedGroup);
                      const isAvailable = group && pos <= group.countries.length;
                      
                      return (
                        <button
                          key={pos}
                          onClick={() => setSelectedPosition(pos)}
                          disabled={!isAvailable}
                          className={`px-4 py-3 rounded-xl font-medium transition-all ${
                            selectedPosition === pos
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                              : isAvailable
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {pos === 1 && t.position1st}
                          {pos === 2 && t.position2nd}
                          {pos === 3 && t.position3rd}
                          {pos === 4 && t.position4th}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Manual Entry */}
          {sourceType === 'manual' && (
            <div>
              <label className="block text-sm mb-2 opacity-80">{t.enterTeamName}</label>
              <input
                type="text"
                value={manualTeamName}
                onChange={(e) => setManualTeamName(e.target.value)}
                placeholder={t.teamNamePlaceholder}
                className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-xl text-gray-800"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                (sourceType === 'group' && !selectedGroup) ||
                (sourceType === 'manual' && !manualTeamName.trim())
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {t.validate}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
