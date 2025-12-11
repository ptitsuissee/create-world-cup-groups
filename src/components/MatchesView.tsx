import React, { useState, useMemo } from 'react';
import { ArrowLeft, Trophy, Calendar, Plus, Zap, Settings, Save } from 'lucide-react';
import { Logo } from './Logo';
import { AdSpace } from './AdSpace';
import { GroupStandings } from './GroupStandings';
import { MatchCard } from './MatchCard';
import { CreateMatchModal } from './CreateMatchModal';
import { TournamentSettingsModal } from './TournamentSettingsModal';
import { InfoMessagesPanel } from './InfoMessagesPanel';
import { Toast } from './Toast';
import { Footer } from './Footer';
import { ContactModal } from './ContactModal';
import { BugReportModal } from './BugReportModal';
import { UserMenu } from './UserMenu';
import type { Group, Match, TournamentSettings, InfoMessage } from '../App';
import { translations, languageNames, type Language } from '../translations';
import { Globe } from 'lucide-react';
import type { AdItem } from './AdManagerModal';

interface MatchesViewProps {
  groups: Group[];
  matches: Match[];
  onMatchesChange: (matches: Match[]) => void;
  onBackToSetup: () => void;
  onRenameTeam: (teamId: string, newName: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  tournamentSettings: TournamentSettings;
  onTournamentSettingsChange: (settings: TournamentSettings) => void;
  infoMessages: InfoMessage[];
  onInfoMessagesChange: (messages: InfoMessage[]) => void;
  onViewKnockout: () => void;
  onSaveProject?: () => void;
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenAdManager?: () => void;
  onOpenMessages?: () => void;
  ads?: AdItem[];
}

export function MatchesView({
  groups,
  matches,
  onMatchesChange,
  onBackToSetup,
  onRenameTeam,
  language,
  onLanguageChange,
  tournamentSettings,
  onTournamentSettingsChange,
  infoMessages,
  onInfoMessagesChange,
  onViewKnockout,
  onSaveProject,
  userName,
  userEmail,
  isAdmin,
  onLogout,
  onOpenSettings,
  onOpenAdManager,
  onOpenMessages,
  ads,
}: MatchesViewProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    groups.length > 0 ? groups[0].id : null
  );
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);
  const [showTournamentSettingsModal, setShowTournamentSettingsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);

  const t = translations[language];

  // Generate all matches for a group (round-robin tournament)
  const generateMatchesForGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.countries.length < 2) return;

    const teams = group.countries;
    const newMatches: Match[] = [];

    // Generate all combinations (round robin)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        newMatches.push({
          id: `match-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          groupId,
          team1Id: teams[i].id,
          team2Id: teams[j].id,
          score1: null,
          score2: null,
          played: false,
        });
      }
    }

    // Remove existing matches for this group and add new ones
    const otherMatches = matches.filter(m => m.groupId !== groupId);
    onMatchesChange([...otherMatches, ...newMatches]);
    setToast({ message: t.matchesGenerated, type: 'success' });
  };

  const generateAllMatches = () => {
    const allNewMatches: Match[] = [];

    groups.forEach(group => {
      if (group.countries.length >= 2) {
        const teams = group.countries;

        // Generate all combinations (round robin)
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            allNewMatches.push({
              id: `match-${Date.now()}-${Math.random().toString(16).slice(2)}-${i}-${j}`,
              groupId: group.id,
              team1Id: teams[i].id,
              team2Id: teams[j].id,
              score1: null,
              score2: null,
              played: false,
            });
          }
        }
      }
    });

    onMatchesChange(allNewMatches);
    setToast({ message: t.matchesGenerated, type: 'success' });
  };

  const handleUpdateMatch = (matchId: string, score1: number, score2: number, link?: string, linkName?: string, linkLogo?: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, score1, score2, played: true, link, linkName, linkLogo };
      }
      return m;
    });
    onMatchesChange(updatedMatches);
  };

  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = matches.filter(m => m.id !== matchId);
    onMatchesChange(updatedMatches);
    setToast({ message: t.matchDeleted, type: 'success' });
  };

  const handleChangeTeams = (matchId: string, team1Id: string, team2Id: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return { ...m, team1Id, team2Id, score1: null, score2: null, played: false };
      }
      return m;
    });
    onMatchesChange(updatedMatches);
    setToast({ message: t.matchUpdated, type: 'success' });
  };

  const handleCreateMatch = (team1Id: string, team2Id: string) => {
    if (!selectedGroupId) return;

    const newMatch: Match = {
      id: `match-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      groupId: selectedGroupId,
      team1Id,
      team2Id,
      score1: null,
      score2: null,
      played: false,
    };

    onMatchesChange([...matches, newMatch]);
    setShowCreateMatchModal(false);
    setToast({ message: t.matchCreated, type: 'success' });
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const groupMatches = selectedGroupId ? matches.filter(m => m.groupId === selectedGroupId) : [];
  const hasMatches = groupMatches.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-gray-50 p-6 relative">
      {/* Ad Spaces */}
      <AdSpace position="left" />
      <AdSpace position="right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative text-center space-y-4 py-8">
          {/* Language Selector */}
          <div className="absolute top-0 right-0">
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-lg rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
              >
                <Globe size={18} />
                <span className="text-sm">{languageNames[language]}</span>
              </button>

              {showLanguageMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white/15 backdrop-blur-xl rounded-xl border border-white/25 shadow-2xl overflow-hidden z-50 min-w-[180px]">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        onLanguageChange(lang);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-white/20 transition-all text-sm ${
                        language === lang ? 'bg-white/25' : ''
                      }`}
                    >
                      {languageNames[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Back button */}
          <div className="absolute top-0 left-0">
            <div className="flex gap-2">
              <button
                onClick={onBackToSetup}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-lg rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={18} />
                <span className="text-sm">{t.backToSetup}</span>
              </button>
              <button
                onClick={() => setShowTournamentSettingsModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-lg rounded-xl border border-white/25 hover:bg-white/25 transition-all shadow-lg hover:shadow-xl"
              >
                <Settings size={18} />
                <span className="text-sm">{t.tournamentSettings}</span>
              </button>
            </div>
          </div>

          {/* Logo and Title */}
          <div className="inline-flex items-center gap-4">
            <Logo size={64} className="drop-shadow-2xl" />
            <div>
              <h1 className="text-5xl bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                {t.matchesAndStandings}
              </h1>
              <div className="h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-40 mt-2"></div>
            </div>
          </div>
        </div>

        {/* Knockout Phase Button */}
        <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-orange-400/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <div>
                <h3 className="text-xl">Phase éliminatoire</h3>
                <p className="text-sm text-white/70">Créez un tableau de tournoi à élimination directe</p>
              </div>
            </div>
            <button
              onClick={onViewKnockout}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              🏆
              <span>Voir le tableau</span>
            </button>
          </div>
        </div>

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

        {/* Info Messages Panel */}
        <InfoMessagesPanel
          messages={infoMessages}
          onMessagesChange={onInfoMessagesChange}
          translations={t}
        />

        {/* Group Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          <div className="flex flex-wrap gap-2 mb-6">
            {groups.filter(g => g.countries.length >= 2).map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`px-6 py-3 rounded-xl transition-all shadow-lg ${
                  selectedGroupId === group.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-105'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>

          {selectedGroup && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Standings */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Trophy size={20} />
                  </div>
                  <h2 className="text-2xl">{t.standings}</h2>
                </div>
                <GroupStandings
                  group={selectedGroup}
                  matches={groupMatches}
                  translations={t}
                />
              </div>

              {/* Matches */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Calendar size={20} />
                    </div>
                    <h2 className="text-2xl">{t.matches}</h2>
                  </div>
                  <div className="flex gap-2">
                    {hasMatches && (
                      <button
                        onClick={() => setShowCreateMatchModal(true)}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                      >
                        <Plus size={16} />
                        <span>{t.createMatchManually}</span>
                      </button>
                    )}
                    {!hasMatches && (
                      <>
                        <button
                          onClick={() => setShowCreateMatchModal(true)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                        >
                          <Plus size={16} />
                          <span>{t.createMatchManually}</span>
                        </button>
                        <button
                          onClick={() => generateMatchesForGroup(selectedGroup.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                        >
                          <Zap size={16} />
                          <span>{t.generateMatches}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {groupMatches.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                      <div className="text-4xl mb-2">📅</div>
                      <p className="text-sm">{t.generateMatchesDesc}</p>
                    </div>
                  ) : (
                    groupMatches.map((match, index) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        matchNumber={index + 1}
                        group={selectedGroup}
                        onUpdateMatch={handleUpdateMatch}
                        onDeleteMatch={handleDeleteMatch}
                        onChangeTeams={handleChangeTeams}
                        translations={t}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Create Match Modal */}
        {showCreateMatchModal && selectedGroup && (
          <CreateMatchModal
            group={selectedGroup}
            onConfirm={handleCreateMatch}
            onClose={() => setShowCreateMatchModal(false)}
            translations={t}
          />
        )}

        {/* Tournament Settings Modal */}
        {showTournamentSettingsModal && (
          <TournamentSettingsModal
            settings={tournamentSettings}
            onConfirm={onTournamentSettingsChange}
            onClose={() => setShowTournamentSettingsModal(false)}
            translations={t}
          />
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <ContactModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            language={language}
            onShowToast={(message) => setToast({ message, type: 'success' })}
          />
        )}

        {/* Bug Report Modal */}
        {showBugReportModal && (
          <BugReportModal
            isOpen={showBugReportModal}
            onClose={() => setShowBugReportModal(false)}
            language={language}
            onShowToast={(message) => setToast({ message, type: 'success' })}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        language={language}
        onOpenContact={() => setShowContactModal(true)}
        onOpenBugReport={() => setShowBugReportModal(true)}
      />

      {/* User Menu */}
      {userName && (
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
      )}
    </div>
  );
}