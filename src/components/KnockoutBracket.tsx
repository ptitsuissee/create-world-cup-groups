import React from 'react';
import { KnockoutMatchCard } from './KnockoutMatchCard';
import type { Group, KnockoutMatch } from '../App';
import type { Translations } from '../translations';

interface KnockoutBracketProps {
  matches: KnockoutMatch[];
  groups: Group[];
  onUpdateMatch: (matchId: string, updates: Partial<KnockoutMatch>) => void;
  translations: Translations;
}

export function KnockoutBracket({
  matches,
  groups,
  onUpdateMatch,
  translations: t,
}: KnockoutBracketProps) {
  const roundOrder: Array<KnockoutMatch['round']> = ['round64', 'round32', 'round16', 'quarter', 'semi', 'final'];
  const roundsPresent = roundOrder.filter(round => 
    matches.some(m => m.round === round)
  );

  const getRoundMatches = (round: KnockoutMatch['round']) => {
    return matches
      .filter(m => m.round === round)
      .sort((a, b) => a.matchNumber - b.matchNumber);
  };

  const getRoundName = (round: KnockoutMatch['round']) => {
    const roundNameMap: Record<KnockoutMatch['round'], keyof Translations> = {
      round64: 'round64',
      round32: 'round32',
      round16: 'round16',
      quarter: 'quarterFinals',
      semi: 'semiFinals',
      final: 'final',
    };
    return t[roundNameMap[round]] || round;
  };

  // Split matches into top and bottom halves for mirror layout
  const getRoundMatchesSplit = (round: KnockoutMatch['round']) => {
    const allMatches = getRoundMatches(round);
    const halfPoint = Math.ceil(allMatches.length / 2);
    return {
      top: allMatches.slice(0, halfPoint),
      bottom: allMatches.slice(halfPoint),
    };
  };

  // Get rounds excluding final (final will be in center)
  const roundsBeforeFinal = roundsPresent.filter(r => r !== 'final');
  const hasFinal = roundsPresent.includes('final');

  // Calculate spacing based on round
  const getMatchSpacing = (roundIndex: number) => {
    return Math.pow(2, roundIndex) * 50; // Exponential spacing like real brackets
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl shadow-lg">
          🏆
        </div>
        <h2 className="text-3xl">{t.knockoutPhase}</h2>
      </div>

      {/* Championship Bracket Layout - Similar to UEFA Champions League */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max items-center justify-center p-8">
          {/* LEFT BRACKET - Top half */}
          <div className="flex gap-6">
            {roundsBeforeFinal.map((round, roundIndex) => {
              const { top } = getRoundMatchesSplit(round);
              const spacing = getMatchSpacing(roundIndex);
              
              return (
                <div key={`left-${round}`} className="flex flex-col items-center">
                  {/* Round Title */}
                  <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-lg rounded-xl px-6 py-3 border-2 border-blue-400/40 shadow-xl mb-6">
                    <h3 className="text-lg font-bold text-center whitespace-nowrap">{getRoundName(round)}</h3>
                  </div>

                  {/* Matches with connections */}
                  <div className="relative flex flex-col justify-around" style={{ gap: `${spacing}px`, minHeight: `${top.length * spacing}px` }}>
                    {top.map((match, matchIndex) => (
                      <div key={match.id} className="relative">
                        {/* Match Card */}
                        <div className="w-[280px]">
                          <KnockoutMatchCard
                            match={match}
                            groups={groups}
                            onUpdateMatch={onUpdateMatch}
                            translations={t}
                            isFirstRound={roundIndex === 0}
                          />
                        </div>

                        {/* Connection line to next round */}
                        {roundIndex < roundsBeforeFinal.length - 1 && matchIndex % 2 === 0 && (
                          <svg 
                            className="absolute left-full top-1/2 pointer-events-none" 
                            width="48" 
                            height={spacing + 100}
                            style={{ transform: 'translateY(-50%)' }}
                          >
                            {/* Horizontal line from this match */}
                            <line 
                              x1="0" 
                              y1={spacing / 2} 
                              x2="24" 
                              y2={spacing / 2} 
                              stroke="rgba(96, 165, 250, 0.6)" 
                              strokeWidth="3"
                            />
                            
                            {/* Vertical line connecting two matches */}
                            {matchIndex + 1 < top.length && (
                              <>
                                <line 
                                  x1="24" 
                                  y1={spacing / 2} 
                                  x2="24" 
                                  y2={spacing + spacing / 2 + 50} 
                                  stroke="rgba(96, 165, 250, 0.6)" 
                                  strokeWidth="3"
                                />
                                
                                {/* Horizontal line from next match */}
                                <line 
                                  x1="0" 
                                  y1={spacing + spacing / 2 + 50} 
                                  x2="24" 
                                  y2={spacing + spacing / 2 + 50} 
                                  stroke="rgba(96, 165, 250, 0.6)" 
                                  strokeWidth="3"
                                />
                              </>
                            )}
                            
                            {/* Arrow line to next round */}
                            <line 
                              x1="24" 
                              y1={spacing / 2 + 25} 
                              x2="48" 
                              y2={spacing / 2 + 25} 
                              stroke="rgba(96, 165, 250, 0.8)" 
                              strokeWidth="4"
                              strokeDasharray="4 2"
                            />
                            
                            {/* Arrow head */}
                            <polygon 
                              points={`40,${spacing / 2 + 20} 48,${spacing / 2 + 25} 40,${spacing / 2 + 30}`} 
                              fill="rgba(96, 165, 250, 0.8)"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CENTER - FINAL & WINNER */}
          {hasFinal && (
            <div className="flex flex-col items-center gap-6 px-8">
              {/* Final Title */}
              <div className="bg-gradient-to-r from-yellow-500/40 to-orange-500/40 backdrop-blur-lg rounded-2xl px-8 py-4 border-4 border-yellow-400/60 shadow-2xl">
                <h3 className="text-2xl font-bold text-center">🏆 {getRoundName('final')}</h3>
              </div>

              {/* Final Match */}
              {(() => {
                const finalMatch = matches.find(m => m.round === 'final');
                return finalMatch ? (
                  <div className="w-[320px]">
                    <KnockoutMatchCard
                      match={finalMatch}
                      groups={groups}
                      onUpdateMatch={onUpdateMatch}
                      translations={t}
                      isFirstRound={false}
                    />
                  </div>
                ) : null;
              })()}

              {/* Trophy & Winner */}
              <div className="mt-4">
                <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-lg rounded-xl px-6 py-3 border-2 border-yellow-400/50 mb-4">
                  <h3 className="text-lg font-bold text-center">👑 {t.winner || 'Vainqueur'}</h3>
                </div>
                
                <div className="flex items-center justify-center min-h-[140px]">
                  {(() => {
                    const finalMatch = matches.find(m => m.round === 'final');
                    if (finalMatch?.played && finalMatch.score1 !== null && finalMatch.score2 !== null) {
                      const winner = finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : finalMatch.team2;
                      return (
                        <div className="relative">
                          {/* Animated trophy glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-2xl blur-xl animate-pulse"></div>
                          
                          {/* Winner card */}
                          <div className="relative bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-8 border-4 border-yellow-400/70 shadow-2xl w-[280px]">
                            <div className="text-6xl mb-4 text-center animate-bounce">🏆</div>
                            <div className="text-2xl font-bold text-center mb-2">{winner}</div>
                            <div className="text-center text-yellow-300/80 text-sm">⭐ Champion ⭐</div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="text-center text-white/40 bg-white/5 rounded-xl p-8 border-2 border-white/10 w-[280px]">
                        <div className="text-5xl mb-3">👑</div>
                        <p className="text-sm">{t.awaitingWinner || 'En attente du vainqueur'}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* RIGHT BRACKET - Bottom half (mirrored) */}
          <div className="flex gap-6">
            {[...roundsBeforeFinal].reverse().map((round, reverseIndex) => {
              const roundIndex = roundsBeforeFinal.length - 1 - reverseIndex;
              const { bottom } = getRoundMatchesSplit(round);
              const spacing = getMatchSpacing(roundIndex);
              
              return (
                <div key={`right-${round}`} className="flex flex-col items-center">
                  {/* Round Title */}
                  <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-lg rounded-xl px-6 py-3 border-2 border-blue-400/40 shadow-xl mb-6">
                    <h3 className="text-lg font-bold text-center whitespace-nowrap">{getRoundName(round)}</h3>
                  </div>

                  {/* Matches with connections */}
                  <div className="relative flex flex-col justify-around" style={{ gap: `${spacing}px`, minHeight: `${bottom.length * spacing}px` }}>
                    {bottom.map((match, matchIndex) => (
                      <div key={match.id} className="relative">
                        {/* Connection line from previous round */}
                        {reverseIndex > 0 && matchIndex % 2 === 0 && (
                          <svg 
                            className="absolute right-full top-1/2 pointer-events-none" 
                            width="48" 
                            height={spacing + 100}
                            style={{ transform: 'translateY(-50%)' }}
                          >
                            {/* Arrow line from previous round */}
                            <line 
                              x1="0" 
                              y1={spacing / 2 + 25} 
                              x2="24" 
                              y2={spacing / 2 + 25} 
                              stroke="rgba(96, 165, 250, 0.8)" 
                              strokeWidth="4"
                              strokeDasharray="4 2"
                            />
                            
                            {/* Arrow head */}
                            <polygon 
                              points={`8,${spacing / 2 + 20} 0,${spacing / 2 + 25} 8,${spacing / 2 + 30}`} 
                              fill="rgba(96, 165, 250, 0.8)"
                            />
                            
                            {/* Horizontal line to this match */}
                            <line 
                              x1="24" 
                              y1={spacing / 2} 
                              x2="48" 
                              y2={spacing / 2} 
                              stroke="rgba(96, 165, 250, 0.6)" 
                              strokeWidth="3"
                            />
                            
                            {/* Vertical line connecting two matches */}
                            {matchIndex + 1 < bottom.length && (
                              <>
                                <line 
                                  x1="24" 
                                  y1={spacing / 2} 
                                  x2="24" 
                                  y2={spacing + spacing / 2 + 50} 
                                  stroke="rgba(96, 165, 250, 0.6)" 
                                  strokeWidth="3"
                                />
                                
                                {/* Horizontal line to next match */}
                                <line 
                                  x1="24" 
                                  y1={spacing + spacing / 2 + 50} 
                                  x2="48" 
                                  y2={spacing + spacing / 2 + 50} 
                                  stroke="rgba(96, 165, 250, 0.6)" 
                                  strokeWidth="3"
                                />
                              </>
                            )}
                          </svg>
                        )}

                        {/* Match Card */}
                        <div className="w-[280px]">
                          <KnockoutMatchCard
                            match={match}
                            groups={groups}
                            onUpdateMatch={onUpdateMatch}
                            translations={t}
                            isFirstRound={roundIndex === 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}