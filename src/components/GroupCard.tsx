import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Pencil, Check, Trash2 } from 'lucide-react';
import { CountryCard } from './CountryCard';
import type { Group } from '../App';
import type { Translations } from '../translations';

interface GroupCardProps {
  group: Group;
  onDrop: (countryId: string) => void;
  onDelete: (countryId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onRename: (groupId: string, newName: string) => void;
  translations: Translations;
}

export function GroupCard({ group, onDrop, onDelete, onDeleteGroup, onRename, translations }: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'country',
    drop: (item: { id: string }) => {
      console.log('Dropping item into group:', item.id, group.id);
      onDrop(item.id);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop, group.id]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(group.name);
  };

  const handleSaveEdit = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      onRename(group.id, trimmed);
    } else {
      setEditName(group.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditName(group.name);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(translations.confirmDeleteGroup)) {
      onDeleteGroup(group.id);
    }
  };

  const countText = group.countries.length === 1 ? translations.team : translations.teams;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] flex flex-col gap-2 md:gap-3">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              autoFocus
              className="flex-1 bg-white/20 border border-yellow-400 rounded-lg px-2 md:px-3 py-1.5 text-sm outline-none text-white placeholder:text-white/50"
            />
            <button
              onClick={handleSaveEdit}
              className="text-green-400 hover:text-green-300 bg-white/10 rounded-lg p-1.5 hover:bg-white/20 transition-all flex-shrink-0"
              title={translations.validate}
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer flex-1 min-w-0" onClick={handleStartEdit}>
            <div className="text-base md:text-lg truncate">{group.name}</div>
            <Pencil size={14} className="opacity-0 group-hover:opacity-100 text-yellow-300 transition-opacity flex-shrink-0" />
          </div>
        )}
        <div className="text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex-shrink-0 whitespace-nowrap">
          {group.countries.length} {countText}
        </div>
        <button
          onClick={handleDeleteClick}
          className="text-red-400 hover:text-red-300 bg-white/10 rounded-lg p-1.5 hover:bg-white/20 transition-all flex-shrink-0"
          title={translations.deleteGroup}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Drop Zone */}
      <div
        ref={drop}
        className={`rounded-xl border-2 border-dashed p-2 md:p-3 min-h-[60px] md:min-h-[80px] flex flex-col gap-2 transition-all ${
          isOver
            ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/20'
            : 'border-white/30 bg-white/5'
        }`}
      >
        {group.countries.length === 0 ? (
          <div className="text-center text-white/40 text-xs md:text-sm py-3 md:py-4">
            {translations.dropHere}
          </div>
        ) : (
          group.countries.map((country) => (
            <CountryCard key={country.id} country={country} onDelete={onDelete} translations={translations} />
          ))
        )}
      </div>
    </div>
  );
}