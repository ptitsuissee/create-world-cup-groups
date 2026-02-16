import React from 'react';
import { Eye, TrendingUp, Star, ArrowRight, Crown } from 'lucide-react';
import type { Translations } from '../translations';

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  views: number;
  isFeatured: boolean;
  creatorName: string;
  creatorEmail: string;
  thumbnail?: string;
  groupsCount: number;
  teamsCount: number;
}

interface FeaturedProjectsProps {
  projects: ProjectMetadata[];
  isAdmin: boolean;
  isLoading?: boolean;
  onToggleFeatured?: (projectId: string) => void;
  onViewAllProjects: () => void;
  onLoadProject: (projectId: string) => void;
  translations: Translations;
}

export function FeaturedProjects({
  projects,
  isAdmin,
  isLoading = false,
  onToggleFeatured,
  onViewAllProjects,
  onLoadProject,
  translations: t,
}: FeaturedProjectsProps) {
  // Ensure we have a valid array
  const safeProjects = Array.isArray(projects) ? projects : [];
  
  // Sort and filter projects to show a mix
  const featuredProjects = safeProjects.filter(p => p && p.isFeatured);
  const otherProjects = safeProjects.filter(p => p && !p.isFeatured)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));

  // Combine them: featured first, then others, up to 10
  const displayProjects = [...featuredProjects, ...otherProjects].slice(0, 10);

  // Debug visibility
  console.log("FeaturedProjects render:", {
    totalProjects: safeProjects.length,
    displayCount: displayProjects.length,
    isLoading
  });

  return (
    <section id="events-section" className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/20 relative z-30 overflow-visible min-h-[200px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-3xl shadow-xl animate-pulse">
            🔥
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent uppercase italic tracking-tight">
              {t.events || 'Événements Live'}
            </h2>
            <p className="text-xs sm:text-sm text-pink-200/70 font-bold uppercase tracking-widest">
              {displayProjects.length > 0 
                ? `${displayProjects.length} ${t.projectsFound || 'Tournois actifs'}`
                : t.noProjectsYet || 'Prêt pour le prochain tournoi ?'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {safeProjects.length > 0 && (
            <button
              onClick={onViewAllProjects}
              className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 shadow-lg active:scale-95"
            >
              <span className="text-xs sm:text-sm font-black uppercase tracking-tighter">{t.viewAllProjects || 'Explorer tout'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/5 rounded-3xl p-5 border border-white/10 animate-pulse h-48">
              <div className="w-full h-24 bg-white/10 rounded-2xl mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayProjects.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-400/20 to-rose-500/20 flex items-center justify-center text-6xl">
            🏆
          </div>
          <h3 className="text-2xl font-black mb-2 uppercase">{t.noEventsYet || 'Aucun tournoi public'}</h3>
          <p className="text-white/60 max-w-md mx-auto px-4">
            {t.createFirstProjectDesc || 'Soyez le premier à lancer un tournoi ! Créez votre projet et il apparaîtra ici instantanément.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {displayProjects.map((project, index) => (
              <div
                key={project.id}
                className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 hover:border-pink-500/50 transition-all duration-500 hover:scale-[1.03] cursor-pointer shadow-xl overflow-hidden"
                onClick={() => onLoadProject(project.id)}
              >
                {/* Visual Flair */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-transparent opacity-50"></div>
                
                {/* Badge Featured ou Rang */}
                {project.isFeatured ? (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-400 text-black text-[9px] font-black rounded-lg shadow-lg z-20 uppercase tracking-tighter">
                    ⭐ Featured
                  </div>
                ) : index < 3 ? (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-blue-500 text-white text-[9px] font-black rounded-lg shadow-lg z-20 uppercase tracking-tighter">
                    🔥 Trending
                  </div>
                ) : null}

                {/* Admin Feature Toggle */}
                {isAdmin && onToggleFeatured && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFeatured(project.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-xl transition-all z-30 ${
                      project.isFeatured
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                )}

                {/* Thumbnail ou Placeholder */}
                <div className="w-full h-28 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 mb-4 flex items-center justify-center text-5xl overflow-hidden border border-white/10 relative group-hover:rotate-1 transition-transform">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-30"></div>
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <span className="drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                      {project.groupsCount > 4 ? '⚽' : '🏆'}
                    </span>
                  )}
                </div>

                {/* Project Info */}
                <div className="space-y-3">
                  <h3 className="font-black text-lg truncate leading-tight group-hover:text-pink-300 transition-colors uppercase italic">
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue-400">🧩</span>
                      <span>{project.groupsCount} {t.groups || 'Groupes'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-pink-400">⚽</span>
                      <span>{project.teamsCount} {t.teams || 'Teams'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-black text-white/80">
                      <Eye className="w-3.5 h-3.5 text-green-400" />
                      <span>{project.views.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-white/40 font-medium truncate max-w-[80px]">
                      {t.by || 'par'} {project.creatorName}
                    </div>
                  </div>
                </div>

                {/* Interaction Hover Hint */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>

          {/* Bottom Info Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>{safeProjects.length} {t.totalProjects || 'Projets Communauté'}</span>
              </div>
              {featuredProjects.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{featuredProjects.length} {t.featured || 'Sélections Admin'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 animate-bounce-horizontal">
              <ArrowRight className="w-4 h-4 text-pink-500" />
              <span>{t.clickToLoad || 'Sélectionner pour charger'}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
