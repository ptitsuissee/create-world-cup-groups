import React, { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import type { Translations } from '../translations';

interface KnockoutSettingsModalProps {
  onConfirm: (numberOfTeams: number) => void;
  onClose: () => void;
  translations: Translations;
}

export function KnockoutSettingsModal({
  onConfirm,
  onClose,
  translations: t,
}: KnockoutSettingsModalProps) {
  const [numberOfTeams, setNumberOfTeams] = useState<number>(8);

  const teamOptions = [
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 8, label: '8' },
    { value: 16, label: '16' },
    { value: 32, label: '32' },
    { value: 64, label: '64' },
  ];

  const handleConfirm = () => {
    onConfirm(numberOfTeams);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20 text-gray-800">
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Trophy size={20} />
              </div>
              <h2 className="text-2xl">{t.knockoutSettings}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200/50 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm mb-2 opacity-80">
              {t.numberOfTeams}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {teamOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNumberOfTeams(option.value)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    numberOfTeams === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              {t.generateKnockout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
