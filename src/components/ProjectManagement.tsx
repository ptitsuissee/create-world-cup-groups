import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, Plus } from 'lucide-react';
import type { Group, Country, Match } from '../App';
import type { Translations } from '../translations';

interface ProjectManagementProps {
  groups: Group[];
  unassignedCountries: Country[];
  matches: Match[];
  onLoadProject: (data: { groups: Group[]; unassignedCountries: Country[]; matches: Match[] }) => void;
  onNewProject: () => void;
  translations: Translations;
}

export function ProjectManagement({
  groups,
  unassignedCountries,
  matches,
  onLoadProject,
  onNewProject,
  translations,
}: ProjectManagementProps) {
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const projectData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        groups,
        unassignedCountries,
        matches,
      },
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matchdraw-pro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const projectData = JSON.parse(content);

        if (projectData.data && projectData.data.groups) {
          onLoadProject({
            groups: projectData.data.groups || [],
            unassignedCountries: projectData.data.unassignedCountries || [],
            matches: projectData.data.matches || [],
          });
        } else {
          alert(translations.invalidProjectFile);
        }
      } catch (error) {
        alert(translations.invalidProjectFile);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewProject = () => {
    onNewProject();
    setShowNewProjectConfirm(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* Export Project */}
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
        >
          <Download size={16} />
          <span>{translations.exportProject}</span>
        </button>

        {/* Import Project */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
        >
          <Upload size={16} />
          <span>{translations.importProject}</span>
        </button>

        {/* New Project */}
        <button
          onClick={() => setShowNewProjectConfirm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          <span>{translations.newProject}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* New Project Confirmation Modal */}
      {showNewProjectConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-600/90 to-pink-600/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                <FileText size={24} />
              </div>
              <h3 className="text-2xl">{translations.confirmNewProject}</h3>
            </div>
            <p className="text-white/80 mb-6">{translations.confirmNewProjectDesc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewProjectConfirm(false)}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
              >
                {translations.cancel}
              </button>
              <button
                onClick={handleNewProject}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl hover:scale-105 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>{translations.newProject}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
