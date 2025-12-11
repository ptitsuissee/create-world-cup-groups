import React from 'react';
import { Mail, Bug } from 'lucide-react';
import { translations, type Language } from '../translations';

interface FooterProps {
  language: Language;
  onOpenContact: () => void;
  onOpenBugReport: () => void;
}

export function Footer({ language, onOpenContact, onOpenBugReport }: FooterProps) {
  const t = translations[language];

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
      {/* Contact Button */}
      <button
        onClick={onOpenContact}
        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20"
        title={t.contactUs}
      >
        <Mail className="w-5 h-5" />
        <span className="hidden group-hover:inline-block text-sm whitespace-nowrap">
          {t.contactUs}
        </span>
      </button>

      {/* Bug Report Button */}
      <button
        onClick={onOpenBugReport}
        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20"
        title={t.reportBug}
      >
        <Bug className="w-5 h-5" />
        <span className="hidden group-hover:inline-block text-sm whitespace-nowrap">
          {t.reportBug}
        </span>
      </button>
    </div>
  );
}
