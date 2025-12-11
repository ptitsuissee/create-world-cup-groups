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
  onToggleFeatured?: (projectId: string) => void;
  onViewAllProjects: () => void;
  onLoadProject: (projectId: string) => void;
  translations: Translations;
}

export function FeaturedProjects({
  projects,
  isAdmin,
  onToggleFeatured,
  onViewAllProjects,
  onLoadProject,
  translations: t,
}: FeaturedProjectsProps) {
  // Filtrer les projets en vedette OU les 5 plus visités
  const featuredProjects = projects.filter(p => p.isFeatured);
  const topViewedProjects = [...projects]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  
  const displayProjects = featuredProjects.length > 0 
    ? featuredProjects.slice(0, 5)
    : topViewedProjects;

  return (
    <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
            ✨
          </div>
          <div>
            <h2 className="text-2xl">{t.events || 'Événements'}</h2>
            <p className="text-sm text-white/70">
              {displayProjects.length === 0
                ? (t.noProjectsYet || 'Aucun projet pour le moment')
                : featuredProjects.length > 0 
                  ? (t.featuredProjects || 'Projets mis en valeur')
                  : (t.mostViewedProjects || 'Projets les plus visités')
              }
            </p>
          </div>
        </div>
        {projects.length > 0 && (
          <button
            onClick={onViewAllProjects}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
          >
            <span className="text-sm">{t.viewAllProjects || 'Voir tous les projets'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {displayProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400/20 to-rose-500/20 flex items-center justify-center text-5xl">
            🎉
          </div>
          <h3 className="text-xl mb-2">{t.noEventsYet || 'Pas encore d\'événements'}</h3>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            {t.createFirstProjectDesc || 'Créez votre premier projet et il apparaîtra ici pour que d\'autres utilisateurs puissent le découvrir !'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {displayProjects.map((project, index) => (
              <div
                key={project.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] cursor-pointer"
                onClick={() => onLoadProject(project.id)}
              >
                {/* Badge Featured ou Rang */}
                {project.isFeatured ? (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                ) : (
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                )}

                {/* Admin Feature Toggle */}
                {isAdmin && onToggleFeatured && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFeatured(project.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                      project.isFeatured
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }`}
                    title={project.isFeatured ? 'Retirer de la mise en valeur' : 'Mettre en valeur'}
                  >
                    <Crown className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Thumbnail ou Placeholder */}
                <div className="w-full h-24 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-3 flex items-center justify-center text-4xl overflow-hidden">
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>🏆</span>
                  )}
                </div>

                {/* Project Info */}
                <div>
                  <h3 className="font-medium truncate mb-1 group-hover:text-blue-300 transition-colors">
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                    <div className="flex items-center gap-1">
                      <span>🧩</span>
                      <span>{project.groupsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⚽</span>
                      <span>{project.teamsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-white/70">
                      <Eye className="w-3 h-3" />
                      <span>{project.views.toLocaleString()}</span>
                    </div>
                    <div className="text-white/50">
                      {t.by || 'par'} {project.creatorName}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>{projects.length} {t.totalProjects || 'projets au total'}</span>
              </div>
              {featuredProjects.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{featuredProjects.length} {t.featured || 'en vedette'}</span>
                </div>
              )}
            </div>
            <div className="text-xs">
              {t.clickToLoad || 'Cliquez pour charger un projet'}
            </div>
          </div>
        </>
      )}
    </section>
  );
}