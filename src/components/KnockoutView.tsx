import React, { useState } from 'react';
import { ArrowLeft, Trophy, Settings, Plus, Save } from 'lucide-react';
import { Logo } from './Logo';
import { AdSpace } from './AdSpace';
import { InfoMessagesPanel } from './InfoMessagesPanel';
import { KnockoutBracket } from './KnockoutBracket';
import { KnockoutSettingsModal } from './KnockoutSettingsModal';
import { Toast } from './Toast';
import { Footer } from './Footer';
import { UserMenu } from './UserMenu';
import type { Group, KnockoutMatch, InfoMessage } from '../App';
import type { Translations, Language } from '../translations';
import type { AdItem } from './AdManagerModal';

interface KnockoutViewProps {
  groups: Group[];
  knockoutMatches: KnockoutMatch[];
  onKnockoutMatchesChange: (matches: KnockoutMatch[]) => void;
  onBackToGroups: () => void;
  infoMessages: InfoMessage[];
  onInfoMessagesChange: (messages: InfoMessage[]) => void;
  translations: Translations;
  onSaveProject?: () => void;
  language: Language;
  onOpenContact: () => void;
  onOpenBugReport: () => void;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenAdManager?: () => void;
  onOpenMessages?: () => void;
  ads?: AdItem[];
}

export function KnockoutView({
  groups,
  knockoutMatches,
  onKnockoutMatchesChange,
  onBackToGroups,
  infoMessages,
  onInfoMessagesChange,
  translations: t,
  onSaveProject,
  language,
  onOpenContact,
  onOpenBugReport,
  userName,
  userEmail,
  isAdmin,
  onLogout,
  onOpenSettings,
  onOpenAdManager,
  onOpenMessages,
  ads,
}: KnockoutViewProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(knockoutMatches.length === 0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const handleGenerateKnockout = (numberOfTeams: number) => {
    const rounds: Array<KnockoutMatch['round']> = [];
    
    // Determine which rounds to include based on number of teams
    if (numberOfTeams === 64) rounds.push('round64');
    if (numberOfTeams >= 32) rounds.push('round32');
    if (numberOfTeams >= 16) rounds.push('round16');
    if (numberOfTeams >= 8) rounds.push('quarter');
    if (numberOfTeams >= 4) rounds.push('semi');
    if (numberOfTeams >= 2) rounds.push('final');

    const newMatches: KnockoutMatch[] = [];
    let matchIdCounter = 0;

    // Generate matches for each round
    rounds.forEach((round, roundIndex) => {
      const matchesInRound = numberOfTeams / Math.pow(2, roundIndex + 1);
      
      for (let i = 0; i < matchesInRound; i++) {
        newMatches.push({
          id: `knockout-${Date.now()}-${matchIdCounter++}`,
          round,
          matchNumber: i + 1,
          team1: undefined,
          team2: undefined,
          team1Source: undefined,
          team2Source: undefined,
          score1: null,
          score2: null,
          played: false,
        });
      }
    });

    onKnockoutMatchesChange(newMatches);
    setShowSettingsModal(false);
    setToast({ message: t.knockoutGenerated, type: 'success' });
  };

  const handleUpdateMatch = (
    matchId: string,
    updates: Partial<KnockoutMatch>
  ) => {
    const updatedMatches = knockoutMatches.map(m =>
      m.id === matchId ? { ...m, ...updates } : m
    );
    
    // If a match is played, update the next match with the winner
    const match = updatedMatches.find(m => m.id === matchId);
    if (match && match.played && match.score1 !== null && match.score2 !== null) {
      const winnerId = match.score1 > match.score2 ? match.team1 : match.team2;
      const winnerSource = match.score1 > match.score2 ? match.team1Source : match.team2Source;
      
      // Find the next round match
      const roundOrder: Array<KnockoutMatch['round']> = ['round64', 'round32', 'round16', 'quarter', 'semi', 'final'];
      const currentRoundIndex = roundOrder.indexOf(match.round);
      
      // Get round name for display
      const roundNameMap: Record<KnockoutMatch['round'], keyof Translations> = {
        round64: 'round64',
        round32: 'round32',
        round16: 'round16',
        quarter: 'quarterFinals',
        semi: 'semiFinals',
        final: 'final',
      };
      const roundName = t[roundNameMap[match.round]];
      
      if (currentRoundIndex < roundOrder.length - 1) {
        const nextRound = roundOrder[currentRoundIndex + 1];
        const nextMatchIndex = Math.floor((match.matchNumber - 1) / 2);
        const isTeam1 = (match.matchNumber - 1) % 2 === 0;
        
        const nextMatchNumber = nextMatchIndex + 1;
        const nextMatch = updatedMatches.find(
          m => m.round === nextRound && m.matchNumber === nextMatchNumber
        );
        
        if (nextMatch) {
          if (isTeam1) {
            nextMatch.team1 = winnerId;
            nextMatch.team1Source = `${t.winnerOf} ${roundName} ${match.matchNumber}`;
          } else {
            nextMatch.team2 = winnerId;
            nextMatch.team2Source = `${t.winnerOf} ${roundName} ${match.matchNumber}`;
          }
        }
      }
    }
    
    onKnockoutMatchesChange(updatedMatches);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-gray-50 p-6 relative">
      {/* Ad Spaces */}
      <AdSpace position="left" />
      <AdSpace position="right" />

      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="relative text-center space-y-4 py-4 sm:py-8">
          {/* Top Right: User Menu */}
          {userName && (
            <div className="absolute top-0 right-0 z-10">
              <UserMenu
                userName={userName}
                userEmail={userEmail}
                isAdmin={isAdmin}
                onLogout={onLogout}
                onOpenSettings={onOpenSettings}
                onOpenAdManager={onOpenAdManager}
                onOpenMessages={onOpenMessages}
                translations={t}
                ads={ads}
              />
            </div>
          )}
          
          {/* Back button */}
          <div className="absolute top-0 left-0 flex gap-1 sm:gap-2 flex-wrap max-w-[calc(100%-120px)] sm:max-w-none z-10">
            <button
              onClick={onBackToGroups}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/15 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={14} className="sm:hidden" />
              <ArrowLeft size={18} className="hidden sm:block" />
              <span className="text-[10px] sm:text-sm whitespace-nowrap">{t.backToGroups}</span>
            </button>
            {knockoutMatches.length > 0 && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-white/15 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
              >
                <Settings size={14} className="sm:hidden" />
                <Settings size={18} className="hidden sm:block" />
                <span className="text-[10px] sm:text-sm whitespace-nowrap">{t.knockoutSettings}</span>
              </button>
            )}
          </div>

          {/* Logo and Title - with padding to avoid overlap */}
          <div className="inline-flex items-center gap-2 sm:gap-4 pt-12 sm:pt-0 px-2">
            <Logo size={64} className="drop-shadow-2xl hidden md:block flex-shrink-0" />
            <Logo size={40} className="drop-shadow-2xl md:hidden flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl md:text-5xl bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                {t.knockoutPhase}
              </h1>
              <div className="h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-40 mt-1 sm:mt-2"></div>
            </div>
          </div>
        </div>

        {/* Info Messages */}
        <InfoMessagesPanel
          messages={infoMessages}
          onMessagesChange={onInfoMessagesChange}
          translations={t}
        />

        {/* Save Project Button */}
        {onSaveProject && (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-green-400/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Save size={24} />
                </div>
                <div>
                  <h3 className="text-xl">{t.saveProject}</h3>
                  <p className="text-sm text-white/70">{t.saveYourWork || 'Sauvegardez votre progression'}</p>
                </div>
              </div>
              <button
                onClick={onSaveProject}
                className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Save size={20} />
                <span>{t.save}</span>
              </button>
            </div>
          </div>
        )}

        {/* Knockout Bracket */}
        {knockoutMatches.length > 0 ? (
          <KnockoutBracket
            matches={knockoutMatches}
            groups={groups}
            onUpdateMatch={handleUpdateMatch}
            translations={t}
          />
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl mb-2">{t.knockoutSettings}</h2>
            <p className="text-white/70 mb-6">{t.setupMatches}</p>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              <span>{t.generateKnockout}</span>
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <KnockoutSettingsModal
            onConfirm={handleGenerateKnockout}
            onClose={() => {
              if (knockoutMatches.length > 0) {
                setShowSettingsModal(false);
              }
            }}
            translations={t}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        language={language}
        onOpenContact={onOpenContact}
        onOpenBugReport={onOpenBugReport}
      />
    </div>
  );
}