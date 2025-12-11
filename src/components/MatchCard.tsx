import React, { useState, useRef } from 'react';
import { Edit2, Save, Trash2, RefreshCw, Link, ExternalLink, X } from 'lucide-react';
import { EditMatchModal } from './EditMatchModal';
import type { Group, Match } from '../App';
import type { Translations } from '../translations';

interface MatchCardProps {
  match: Match;
  matchNumber: number;
  group: Group;
  onUpdateMatch: (matchId: string, score1: number, score2: number, link?: string, linkName?: string, linkLogo?: string) => void;
  onDeleteMatch: (matchId: string) => void;
  onChangeTeams: (matchId: string, team1Id: string, team2Id: string) => void;
  translations: Translations;
}

export function MatchCard({ 
  match, 
  matchNumber, 
  group, 
  onUpdateMatch, 
  onDeleteMatch,
  onChangeTeams,
  translations 
}: MatchCardProps) {
  const [isEditing, setIsEditing] = useState(!match.played);
  const [score1, setScore1] = useState(match.score1 !== null ? match.score1.toString() : '');
  const [score2, setScore2] = useState(match.score2 !== null ? match.score2.toString() : '');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const team1 = group.countries.find(c => c.id === match.team1Id);
  const team2 = group.countries.find(c => c.id === match.team2Id);

  if (!team1 || !team2) return null;

  const isUrl1 = team1.flag.startsWith('http://') || team1.flag.startsWith('https://') || team1.flag.startsWith('data:');
  const isUrl2 = team2.flag.startsWith('http://') || team2.flag.startsWith('https://') || team2.flag.startsWith('data:');

  const handleSave = () => {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      return;
    }

    onUpdateMatch(match.id, s1, s2, match.link, match.linkName, match.linkLogo);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    onDeleteMatch(match.id);
    setShowDeleteConfirm(false);
  };

  const handleChangeTeams = (team1Id: string, team2Id: string) => {
    onChangeTeams(match.id, team1Id, team2Id);
    setShowEditModal(false);
  };

  const handleSaveLink = (link: string, linkName: string, linkLogo: string) => {
    const s1 = match.score1 !== null ? match.score1 : 0;
    const s2 = match.score2 !== null ? match.score2 : 0;
    onUpdateMatch(match.id, s1, s2, link || undefined, linkName || undefined, linkLogo || undefined);
    setShowLinkModal(false);
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all">
        {/* Match number */}
        <div className="text-xs text-white/50 mb-2 md:mb-3">
          {translations.matchNumber} {matchNumber}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-4 items-center">
          {/* Team 1 */}
          <div className="flex items-center gap-1.5 md:gap-2 justify-end min-w-0">
            <span className="truncate text-right text-sm md:text-base">{team1.name}</span>
            {isUrl1 ? (
              <img
                src={team1.flag}
                alt={team1.name}
                className="w-6 h-6 md:w-8 md:h-8 object-cover rounded flex-shrink-0"
              />
            ) : (
              <span className="text-xl md:text-2xl flex-shrink-0">{team1.flag}</span>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {isEditing ? (
              <>
                <input
                  type="number"
                  min="0"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  className="w-12 md:w-14 px-1.5 md:px-2 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-sm md:text-base"
                  placeholder="0"
                />
                <span className="text-white/60 text-sm md:text-base">-</span>
                <input
                  type="number"
                  min="0"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  className="w-12 md:w-14 px-1.5 md:px-2 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-sm md:text-base"
                  placeholder="0"
                />
              </>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-2">
                {match.played && match.score1 !== null && match.score2 !== null ? (
                  <>
                    <span className="text-xl md:text-2xl px-2 md:px-3 py-0.5 md:py-1 bg-white/10 rounded-lg min-w-[2.5rem] md:min-w-[3rem] text-center">
                      {match.score1}
                    </span>
                    <span className="text-white/60 text-sm md:text-base">-</span>
                    <span className="text-xl md:text-2xl px-2 md:px-3 py-0.5 md:py-1 bg-white/10 rounded-lg min-w-[2.5rem] md:min-w-[3rem] text-center">
                      {match.score2}
                    </span>
                  </>
                ) : (
                  <span className="text-white/40 text-xs md:text-sm">{translations.notPlayed}</span>
                )}
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
            {isUrl2 ? (
              <img
                src={team2.flag}
                alt={team2.name}
                className="w-6 h-6 md:w-8 md:h-8 object-cover rounded flex-shrink-0"
              />
            ) : (
              <span className="text-xl md:text-2xl flex-shrink-0">{team2.flag}</span>
            )}
            <span className="truncate text-sm md:text-base">{team2.name}</span>
          </div>
        </div>

        {/* Match Link Display */}
        {match.link && match.linkName && (
          <div className="mt-2 md:mt-3 flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-400/20">
            {match.linkLogo && (
              <img src={match.linkLogo} alt={match.linkName} className="w-5 h-5 md:w-6 md:h-6 rounded object-cover flex-shrink-0" />
            )}
            <a
              href={match.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-blue-300 hover:text-blue-200 transition-colors text-xs md:text-sm flex items-center gap-1 min-w-0"
            >
              <ExternalLink size={12} className="md:hidden flex-shrink-0" />
              <ExternalLink size={14} className="hidden md:block flex-shrink-0" />
              <span className="truncate">{match.linkName}</span>
            </a>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-2 md:mt-3 flex gap-1.5 md:gap-2 justify-end flex-wrap">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={!score1 || !score2}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 text-xs md:text-sm ${
                score1 && score2
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-500/50 cursor-not-allowed'
              }`}
            >
              <Save size={14} className="md:hidden" />
              <Save size={16} className="hidden md:block" />
              <span className="hidden sm:inline">{translations.save}</span>
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 text-xs md:text-sm border border-white/20"
            >
              <Edit2 size={14} className="md:hidden" />
              <Edit2 size={16} className="hidden md:block" />
              <span className="hidden sm:inline">{translations.edit}</span>
            </button>
          )}
          
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 text-xs md:text-sm border border-cyan-400/30"
          >
            <Link size={14} className="md:hidden" />
            <Link size={16} className="hidden md:block" />
            <span className="hidden sm:inline">{match.link ? translations.edit : translations.addLink}</span>
          </button>
          
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 text-xs md:text-sm border border-blue-400/30"
          >
            <RefreshCw size={14} className="md:hidden" />
            <RefreshCw size={16} className="hidden md:block" />
            <span className="hidden lg:inline">{translations.changeTeams}</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all flex items-center gap-1.5 md:gap-2 text-xs md:text-sm border border-red-400/30"
          >
            <Trash2 size={14} className="md:hidden" />
            <Trash2 size={16} className="hidden md:block" />
            <span className="hidden sm:inline">{translations.deleteMatch}</span>
          </button>
        </div>
      </div>

      {/* Edit Teams Modal */}
      {showEditModal && (
        <EditMatchModal
          group={group}
          currentTeam1Id={match.team1Id}
          currentTeam2Id={match.team2Id}
          onConfirm={handleChangeTeams}
          onClose={() => setShowEditModal(false)}
          translations={translations}
        />
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <LinkModal
          currentLink={match.link || ''}
          currentLinkName={match.linkName || ''}
          currentLinkLogo={match.linkLogo || ''}
          onConfirm={handleSaveLink}
          onClose={() => setShowLinkModal(false)}
          translations={translations}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-600/90 to-pink-600/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
            <h3 className="text-2xl mb-4">{translations.deleteMatch}</h3>
            <p className="text-white/80 mb-6">{translations.confirmDeleteMatch}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
              >
                {translations.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-xl hover:scale-105 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                <span>{translations.deleteMatch}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LinkModal({
  currentLink,
  currentLinkName,
  currentLinkLogo,
  onConfirm,
  onClose,
  translations,
}: {
  currentLink: string;
  currentLinkName: string;
  currentLinkLogo: string;
  onConfirm: (link: string, linkName: string, linkLogo: string) => void;
  onClose: () => void;
  translations: Translations;
}) {
  const [link, setLink] = useState(currentLink);
  const [linkName, setLinkName] = useState(currentLinkName);
  const [linkLogo, setLinkLogo] = useState(currentLinkLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLinkLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onConfirm(link, linkName, linkLogo);
  };

  const handleRemove = () => {
    onConfirm('', '', '');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-cyan-600/90 to-blue-600/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl">{translations.matchLink}</h3>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-2">
              {translations.linkName}
            </label>
            <input
              type="text"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder={translations.linkNamePlaceholder}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              {translations.matchLink}
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={translations.linkUrlPlaceholder}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-2">
              {translations.uploadLogo}
            </label>
            <div className="flex gap-3 items-center">
              {linkLogo && (
                <img
                  src={linkLogo}
                  alt="Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-sm"
              >
                {translations.uploadLogo}
              </button>
              {linkLogo && (
                <button
                  type="button"
                  onClick={() => setLinkLogo('')}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-sm"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {currentLink && (
            <button
              onClick={handleRemove}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-all border border-red-400/30 flex items-center gap-2"
            >
              <Trash2 size={20} />
              <span>{translations.removeLink}</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
          >
            {translations.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-xl hover:scale-105 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Link size={20} />
            <span>{translations.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
}