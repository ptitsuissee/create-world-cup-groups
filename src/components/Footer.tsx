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
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-3 z-40">
      {/* Contact Button */}
      <button
        onClick={onOpenContact}
        className="group flex items-center justify-center gap-2 w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.5)] transition-all duration-300 border-2 border-white/20 active:scale-90"
        title={t.contactUs}
      >
        <Mail className="w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden md:inline-block font-bold text-sm tracking-wide">
          {t.contactUs}
        </span>
      </button>

      {/* Bug Report Button */}
      <button
        onClick={onOpenBugReport}
        className="group flex items-center justify-center gap-2 w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgb(239,68,68,0.5)] transition-all duration-300 border-2 border-white/20 active:scale-90"
        title={t.reportBug}
      >
        <Bug className="w-5 h-5 md:w-6 md:h-6" />
        <span className="hidden md:inline-block font-bold text-sm tracking-wide">
          {t.reportBug}
        </span>
      </button>
    </div>
  );
}