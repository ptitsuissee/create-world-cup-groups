import React, { useMemo } from 'react';
import type { Group, Match, Country } from '../App';
import type { Translations } from '../translations';

interface GroupStandingsProps {
  group: Group;
  matches: Match[];
  translations: Translations;
}

interface TeamStats {
  team: Country;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export function GroupStandings({ group, matches, translations }: GroupStandingsProps) {
  const standings = useMemo(() => {
    // Initialize stats for each team
    const stats: { [teamId: string]: TeamStats } = {};
    
    group.countries.forEach(team => {
      stats[team.id] = {
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    // Calculate stats from matches
    matches.forEach(match => {
      if (!match.played || match.score1 === null || match.score2 === null) return;

      const team1Stats = stats[match.team1Id];
      const team2Stats = stats[match.team2Id];

      if (!team1Stats || !team2Stats) return;

      // Update played matches
      team1Stats.played++;
      team2Stats.played++;

      // Update goals
      team1Stats.goalsFor += match.score1;
      team1Stats.goalsAgainst += match.score2;
      team2Stats.goalsFor += match.score2;
      team2Stats.goalsAgainst += match.score1;

      // Update results
      if (match.score1 > match.score2) {
        // Team 1 wins
        team1Stats.wins++;
        team1Stats.points += 3;
        team2Stats.losses++;
      } else if (match.score1 < match.score2) {
        // Team 2 wins
        team2Stats.wins++;
        team2Stats.points += 3;
        team1Stats.losses++;
      } else {
        // Draw
        team1Stats.draws++;
        team2Stats.draws++;
        team1Stats.points++;
        team2Stats.points++;
      }

      // Update goal difference
      team1Stats.goalDifference = team1Stats.goalsFor - team1Stats.goalsAgainst;
      team2Stats.goalDifference = team2Stats.goalsFor - team2Stats.goalsAgainst;
    });

    // Sort standings
    return Object.values(stats).sort((a, b) => {
      // Sort by points first
      if (a.points !== b.points) return b.points - a.points;
      // Then by goal difference
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      // Then by goals scored
      if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
      // Finally by name
      return a.team.name.localeCompare(b.team.name);
    });
  }, [group, matches]);

  const isUrl = (flag: string) => {
    return flag.startsWith('http://') || flag.startsWith('https://') || flag.startsWith('data:');
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left py-3 px-2 text-white/60">#</th>
            <th className="text-left py-3 px-2 text-white/60">{translations.team}</th>
            <th className="text-center py-3 px-1 text-white/60 hidden sm:table-cell">{translations.played}</th>
            <th className="text-center py-3 px-1 text-white/60 hidden md:table-cell">{translations.wins}</th>
            <th className="text-center py-3 px-1 text-white/60 hidden md:table-cell">{translations.draws}</th>
            <th className="text-center py-3 px-1 text-white/60 hidden md:table-cell">{translations.losses}</th>
            <th className="text-center py-3 px-1 text-white/60 hidden lg:table-cell">GF</th>
            <th className="text-center py-3 px-1 text-white/60 hidden lg:table-cell">GA</th>
            <th className="text-center py-3 px-1 text-white/60">GD</th>
            <th className="text-center py-3 px-2">{translations.points}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((stat, index) => (
            <tr
              key={stat.team.id}
              className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                index < 2 ? 'bg-green-500/10' : ''
              }`}
            >
              <td className="py-3 px-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-600 text-white' :
                  'bg-white/10'
                }`}>
                  {index + 1}
                </span>
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  {isUrl(stat.team.flag) ? (
                    <img
                      src={stat.team.flag}
                      alt={stat.team.name}
                      className="w-6 h-6 object-cover rounded"
                    />
                  ) : (
                    <span className="text-lg">{stat.team.flag}</span>
                  )}
                  <span className="truncate max-w-[100px] sm:max-w-none">{stat.team.name}</span>
                </div>
              </td>
              <td className="text-center py-3 px-1 hidden sm:table-cell">{stat.played}</td>
              <td className="text-center py-3 px-1 hidden md:table-cell text-green-400">{stat.wins}</td>
              <td className="text-center py-3 px-1 hidden md:table-cell text-yellow-400">{stat.draws}</td>
              <td className="text-center py-3 px-1 hidden md:table-cell text-red-400">{stat.losses}</td>
              <td className="text-center py-3 px-1 hidden lg:table-cell">{stat.goalsFor}</td>
              <td className="text-center py-3 px-1 hidden lg:table-cell">{stat.goalsAgainst}</td>
              <td className={`text-center py-3 px-1 ${
                stat.goalDifference > 0 ? 'text-green-400' :
                stat.goalDifference < 0 ? 'text-red-400' :
                ''
              }`}>
                {stat.goalDifference > 0 ? '+' : ''}{stat.goalDifference}
              </td>
              <td className="text-center py-3 px-2">
                <span className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                  {stat.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
