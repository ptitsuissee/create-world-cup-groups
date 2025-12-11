import React from 'react';
import { motion } from 'motion/react';
import { X, Target } from 'lucide-react';
import type { Group } from '../App';
import type { Translations } from '../translations';

interface GroupSelectionModalProps {
  groups: Group[];
  onSelectGroup: (groupId: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function GroupSelectionModal({ groups, onSelectGroup, onClose, translations }: GroupSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-pink-600/90 to-red-600/90 backdrop-blur-xl rounded-3xl p-6 max-w-2xl w-full border border-white/20 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl">{translations.selectGroupToDraw}</h2>
              <p className="text-sm text-white/70">
                {translations.selectGroupDestination}
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

        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg text-white/70">{translations.noGroupsCreated}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className="w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-yellow-400 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-yellow-400/20 hover:scale-102 text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl">{group.name}</h3>
                  <div className="px-4 py-2 bg-white/20 rounded-xl text-sm">
                    {group.countries.length} {group.countries.length === 1 ? translations.team : translations.teams}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {group.countries.map((country) => {
                    const isUrl = country.flag.startsWith('http://') || 
                                  country.flag.startsWith('https://') || 
                                  country.flag.startsWith('data:');
                    
                    return (
                      <div
                        key={country.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20"
                      >
                        {isUrl ? (
                          <img src={country.flag} alt={country.name} className="w-5 h-5 object-cover rounded" />
                        ) : (
                          <span className="text-lg">{country.flag}</span>
                        )}
                        <span className="text-sm">{country.name}</span>
                      </div>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}