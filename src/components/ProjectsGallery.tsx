import React, { useState } from 'react';
import { X, Eye, Search, Star, Crown, Calendar, Users, Grid3x3 } from 'lucide-react';
import type { ProjectMetadata } from './FeaturedProjects';
import type { Translations } from '../translations';

interface ProjectsGalleryProps {
  projects: ProjectMetadata[];
  isAdmin: boolean;
  onToggleFeatured?: (projectId: string) => void;
  onLoadProject: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onClose: () => void;
  translations: Translations;
}

export function ProjectsGallery({
  projects,
  isAdmin,
  onToggleFeatured,
  onLoadProject,
  onDeleteProject,
  onClose,
  translations: t,
}: ProjectsGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'date' | 'name'>('views');
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFeatured = !filterFeatured || p.isFeatured;
      return matchesSearch && matchesFeatured;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'date':
          return b.updatedAt - a.updatedAt;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t.allProjects || 'Tous les projets'}</h2>
                <p className="text-sm text-white/70">
                  {filteredProjects.length} {t.projectsFound || 'projets trouvés'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchProjects || 'Rechercher un projet...'}
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="views">{t.sortByViews || 'Plus vus'}</option>
              <option value="date">{t.sortByDate || 'Plus récents'}</option>
              <option value="name">{t.sortByName || 'Par nom'}</option>
            </select>

            {/* Filter Featured */}
            <button
              onClick={() => setFilterFeatured(!filterFeatured)}
              className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                filterFeatured
                  ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <Star className={`w-4 h-4 ${filterFeatured ? 'fill-yellow-400' : ''}`} />
              <span className="hidden sm:inline">{t.featured || 'En vedette'}</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-white/50">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg">{t.noProjectsFound || 'Aucun projet trouvé'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] cursor-pointer"
                  onClick={() => {
                    onLoadProject(project.id);
                    onClose();
                  }}
                >
                  {/* Featured Badge */}
                  {project.isFeatured && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 z-10">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      {onToggleFeatured && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFeatured(project.id);
                          }}
                          className={`p-1.5 rounded-lg transition-all ${
                            project.isFeatured
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-white/10 text-white/50 hover:bg-white/20'
                          }`}
                          title={project.isFeatured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteProject && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(t.confirmDeleteProject || 'Supprimer ce projet ?')) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          title="Supprimer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-3 flex items-center justify-center text-5xl overflow-hidden">
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
                    <h3 className="font-medium truncate mb-2 group-hover:text-blue-300 transition-colors">
                      {project.name}
                    </h3>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                        <Grid3x3 className="w-4 h-4 text-blue-400 mb-1" />
                        <span className="text-xs font-medium">{project.groupsCount}</span>
                        <span className="text-xs text-white/50">{t.groups || 'Groupes'}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                        <Users className="w-4 h-4 text-green-400 mb-1" />
                        <span className="text-xs font-medium">{project.teamsCount}</span>
                        <span className="text-xs text-white/50">{t.teams || 'Équipes'}</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-white/5 rounded-lg">
                        <Eye className="w-4 h-4 text-purple-400 mb-1" />
                        <span className="text-xs font-medium">{project.views}</span>
                        <span className="text-xs text-white/50">{t.views || 'Vues'}</span>
                      </div>
                    </div>

                    {/* Creator and Date */}
                    <div className="text-xs text-white/60 space-y-1">
                      <div className="flex items-center gap-1">
                        <span>👤</span>
                        <span className="truncate">{project.creatorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
