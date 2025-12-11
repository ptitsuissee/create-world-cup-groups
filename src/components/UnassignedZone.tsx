import React from 'react';
import { useDrop } from 'react-dnd';
import { CountryCard } from './CountryCard';
import type { Country } from '../App';
import type { Translations } from '../translations';

interface UnassignedZoneProps {
  countries: Country[];
  onDrop: (countryId: string) => void;
  onDelete: (countryId: string) => void;
  translations: Translations;
}

export function UnassignedZone({ countries, onDrop, onDelete, translations }: UnassignedZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'country',
    drop: (item: { id: string }) => {
      console.log('Dropping item:', item.id);
      onDrop(item.id);
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <section className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 md:sticky md:top-6">
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-xl md:text-2xl shadow-lg">
          🌍
        </div>
        <div>
          <h2 className="text-lg md:text-xl">{translations.availableCountries}</h2>
          <p className="text-xs text-white/60">{countries.length} {translations.waiting}</p>
        </div>
      </div>

      <div
        ref={drop}
        className={`rounded-2xl border-2 border-dashed p-3 md:p-4 min-h-[150px] md:min-h-[200px] flex flex-col gap-2 transition-all ${
          isOver
            ? 'border-pink-400 bg-pink-400/20 shadow-lg shadow-pink-400/20'
            : 'border-white/30 bg-white/5'
        }`}
      >
        {countries.length === 0 ? (
          <div className="text-center text-white/40 py-8 md:py-12">
            <div className="text-3xl md:text-4xl mb-2">📭</div>
            <p className="text-sm">{translations.allAssigned}</p>
          </div>
        ) : (
          countries.map((country) => (
            <CountryCard key={country.id} country={country} onDelete={onDelete} translations={translations} />
          ))
        )}
      </div>
    </section>
  );
}