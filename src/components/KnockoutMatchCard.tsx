import React, { useState } from 'react';
import { Edit2, Save, Link as LinkIcon, Image, Trash2 } from 'lucide-react';
import { TeamSourceModal } from './TeamSourceModal';
import type { Group, KnockoutMatch } from '../App';
import type { Translations } from '../translations';

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
  groups: Group[];
  onUpdateMatch: (matchId: string, updates: Partial<KnockoutMatch>) => void;
  translations: Translations;
  isFirstRound: boolean;
}

export function KnockoutMatchCard({
  match,
  groups,
  onUpdateMatch,
  translations: t,
  isFirstRound,
}: KnockoutMatchCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [score1, setScore1] = useState(match.score1?.toString() || '');
  const [score2, setScore2] = useState(match.score2?.toString() || '');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkName, setLinkName] = useState(match.linkName || '');
  const [link, setLink] = useState(match.link || '');
  const [linkLogo, setLinkLogo] = useState(match.linkLogo || '');
  const [showTeam1Modal, setShowTeam1Modal] = useState(false);
  const [showTeam2Modal, setShowTeam2Modal] = useState(false);

  const handleSaveScore = () => {
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    
    onUpdateMatch(match.id, {
      score1: s1,
      score2: s2,
      played: true,
    });
    
    setIsEditing(false);
  };

  const handleSaveLink = () => {
    onUpdateMatch(match.id, {
      link: link || undefined,
      linkName: linkName || undefined,
      linkLogo: linkLogo || undefined,
    });
    setShowLinkModal(false);
  };

  const handleRemoveLink = () => {
    setLink('');
    setLinkName('');
    setLinkLogo('');
    onUpdateMatch(match.id, {
      link: undefined,
      linkName: undefined,
      linkLogo: undefined,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLinkLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamSelect = (isTeam1: boolean, teamName: string, source: string) => {
    if (isTeam1) {
      onUpdateMatch(match.id, {
        team1: teamName,
        team1Source: source,
      });
      setShowTeam1Modal(false);
    } else {
      onUpdateMatch(match.id, {
        team2: teamName,
        team2Source: source,
      });
      setShowTeam2Modal(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg rounded-xl border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-blue-600/40 to-purple-600/40 px-4 py-2 rounded-t-xl border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white/90">
            Match #{match.matchNumber}
          </span>
          {match.played && (
            <span className="px-2 py-0.5 bg-green-500/30 rounded-full text-xs border border-green-400/50">
              ✓ Terminé
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Link button */}
          <button
            onClick={() => setShowLinkModal(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
            title={t.addLink || 'Ajouter un lien'}
          >
            <LinkIcon size={14} />
          </button>

          {/* Edit score button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
            title={t.editScore || 'Modifier le score'}
          >
            {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
          </button>
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="p-3 space-y-1">
        {/* Team 1 */}
        <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-2.5 transition-all border border-white/10">
          <button
            onClick={() => isFirstRound && setShowTeam1Modal(true)}
            className={`flex-1 text-left font-medium truncate ${
              isFirstRound ? 'hover:text-blue-300 cursor-pointer' : ''
            } ${match.team1 ? 'text-white' : 'text-white/40 text-sm'}`}
          >
            {match.team1 || (
              <span className="italic">
                {match.team1Source || (t.selectTeam || 'Sélectionner équipe')}
              </span>
            )}
          </button>
          
          {isEditing ? (
            <input
              type="number"
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              className="w-14 px-2 py-1.5 bg-white/10 border border-white/30 rounded-lg text-center text-lg font-bold focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none"
              min="0"
            />
          ) : (
            <div className={`w-14 px-2 py-1.5 rounded-lg text-center text-lg font-bold ${
              match.played 
                ? match.score1 !== null && match.score2 !== null && match.score1 > match.score2
                  ? 'bg-green-500/30 border-2 border-green-400/60'
                  : 'bg-white/10 border border-white/20'
                : 'bg-white/5 border border-white/10 text-white/30'
            }`}>
              {match.score1 !== null ? match.score1 : '-'}
            </div>
          )}
        </div>

        {/* VS Divider */}
        <div className="text-center py-0.5">
          <span className="text-xs text-white/50 font-bold">VS</span>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-2.5 transition-all border border-white/10">
          <button
            onClick={() => isFirstRound && setShowTeam2Modal(true)}
            className={`flex-1 text-left font-medium truncate ${
              isFirstRound ? 'hover:text-blue-300 cursor-pointer' : ''
            } ${match.team2 ? 'text-white' : 'text-white/40 text-sm'}`}
          >
            {match.team2 || (
              <span className="italic">
                {match.team2Source || (t.selectTeam || 'Sélectionner équipe')}
              </span>
            )}
          </button>
          
          {isEditing ? (
            <input
              type="number"
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              className="w-14 px-2 py-1.5 bg-white/10 border border-white/30 rounded-lg text-center text-lg font-bold focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none"
              min="0"
            />
          ) : (
            <div className={`w-14 px-2 py-1.5 rounded-lg text-center text-lg font-bold ${
              match.played 
                ? match.score2 !== null && match.score1 !== null && match.score2 > match.score1
                  ? 'bg-green-500/30 border-2 border-green-400/60'
                  : 'bg-white/10 border border-white/20'
                : 'bg-white/5 border border-white/10 text-white/30'
            }`}>
              {match.score2 !== null ? match.score2 : '-'}
            </div>
          )}
        </div>

        {/* Save button when editing */}
        {isEditing && (
          <button
            onClick={handleSaveScore}
            className="w-full mt-2 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {t.save || 'Enregistrer'}
          </button>
        )}

        {/* Link display */}
        {match.link && (
          <a
            href={match.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-2 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all border border-blue-400/30 group"
          >
            {match.linkLogo ? (
              <img src={match.linkLogo} alt="" className="w-5 h-5 object-contain rounded" />
            ) : (
              <LinkIcon size={16} className="text-blue-400" />
            )}
            <span className="text-sm text-blue-200 group-hover:text-blue-100 flex-1 truncate">
              {match.linkName || match.link}
            </span>
          </a>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20 text-gray-800">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold">{t.addLink}</h3>
              
              <div>
                <label className="block text-sm mb-2 opacity-80">{t.linkName}</label>
                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder={t.linkNamePlaceholder}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-xl text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-80">{t.matchLink}</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={t.linkUrlPlaceholder}
                  className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-xl text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 opacity-80">{t.uploadLogo}</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1 px-4 py-2 bg-white/50 border border-gray-300 rounded-xl text-gray-800 text-sm"
                  />
                  {linkLogo && (
                    <img src={linkLogo} alt="Logo" className="w-10 h-10 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveLink}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Source Modals */}
      {showTeam1Modal && (
        <TeamSourceModal
          groups={groups}
          onSelect={(teamName, source) => handleTeamSelect(true, teamName, source)}
          onClose={() => setShowTeam1Modal(false)}
          translations={t}
        />
      )}

      {showTeam2Modal && (
        <TeamSourceModal
          groups={groups}
          onSelect={(teamName, source) => handleTeamSelect(false, teamName, source)}
          onClose={() => setShowTeam2Modal(false)}
          translations={t}
        />
      )}
    </div>
  );
}