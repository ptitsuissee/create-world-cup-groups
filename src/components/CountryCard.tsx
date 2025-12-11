import React from 'react';
import { useDrag } from 'react-dnd';
import { X } from 'lucide-react';
import type { Country } from '../App';
import type { Translations } from '../translations';

interface CountryCardProps {
  country: Country;
  onDelete: (countryId: string) => void;
  translations: Translations;
}

export function CountryCard({ country, onDelete, translations }: CountryCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'country',
    item: { id: country.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [country.id]);

  // Check if flag is a URL (http/https or base64 data URL) or an emoji
  const isUrl = country.flag.startsWith('http://') || 
                country.flag.startsWith('https://') || 
                country.flag.startsWith('data:');

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(country.id);
  };

  return (
    <div
      ref={drag}
      className={`group relative inline-flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm shadow-lg border border-white/30 cursor-grab select-none transition-all hover:shadow-xl hover:scale-[1.02] ${
        isDragging ? 'opacity-40 scale-95 cursor-grabbing' : ''
      }`}
      title={country.name}
    >
      {isUrl ? (
        <img
          src={country.flag}
          alt={country.name}
          className="w-6 h-6 md:w-7 md:h-7 object-cover rounded-md shadow-sm flex-shrink-0"
        />
      ) : (
        <span className="text-xl md:text-2xl leading-none flex-shrink-0">{country.flag}</span>
      )}
      <span className="tracking-wide pr-1 text-sm md:text-base truncate">{country.name}</span>
      <button
        className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all hover:scale-110 active:scale-95"
        onClick={handleDelete}
        title={translations.deleteTeam}
      >
        <X size={12} className="md:hidden" />
        <X size={14} className="hidden md:block" />
      </button>
    </div>
  );
}