import React, { useState } from 'react';
import { X, Send, Bug } from 'lucide-react';
import { translations, type Language } from '../translations';
import { 
  sanitizeInput, 
  validateInput, 
  checkRateLimit,
  createHoneypotField 
} from '../utils/security';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onShowToast: (message: string) => void;
}

export function BugReportModal({ isOpen, onClose, language, onShowToast }: BugReportModalProps) {
  const t = translations[language];
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [honeypotField] = useState(createHoneypotField());
  const [honeypotValue, setHoneypotValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description) {
      onShowToast(t.fillAllFields);
      return;
    }

    // Validate input
    if (!validateInput(description, 5000)) {
      onShowToast('Description invalide');
      return;
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit('bugReport');
    if (!rateLimitCheck.allowed) {
      onShowToast(`Trop de requêtes. Réessayez dans ${Math.ceil((rateLimitCheck.retryAfter || 0) / 60)} minutes.`);
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/bug-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            description: sanitizeInput(description),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            [honeypotField]: honeypotValue, // Honeypot
            _honeypot: honeypotValue, // Double honeypot
          }),
        }
      );

      if (response.ok) {
        onShowToast(t.bugReportSent);
        setDescription('');
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send bug report');
      }
    } catch (error) {
      console.error('Error sending bug report:', error);
      onShowToast(t.bugReportError);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-red-900/95 to-orange-900/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-white/20 overflow-hidden animate-in fade-in duration-300 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Bug className="w-6 h-6 md:w-8 md:h-8 text-white flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-white text-lg md:text-xl truncate">{t.reportBug}</h2>
              <p className="text-white/80 text-xs md:text-sm truncate">{t.reportBugDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 md:p-2 transition-all flex-shrink-0"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-3 md:space-y-4">
          <div>
            <label className="block text-white mb-1.5 md:mb-2 text-sm md:text-base">
              {t.bugDescription} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.bugDescriptionPlaceholder}
              rows={6}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 transition-all resize-none text-sm md:text-base"
              disabled={sending}
            />
            <p className="text-white/60 text-xs md:text-sm mt-2">{t.bugDescriptionHint}</p>
          </div>

          {/* Honeypot field (hidden from users, visible to bots) */}
          <div style={{ position: 'absolute', left: '-9999px' }}>
            <label htmlFor={honeypotField}>Leave this field empty</label>
            <input
              type="text"
              id={honeypotField}
              name={honeypotField}
              value={honeypotValue}
              onChange={(e) => setHoneypotValue(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 transition-all text-sm md:text-base"
              disabled={sending}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              disabled={sending}
            >
              {sending ? (
                <>{t.loading}</>
              ) : (
                <>
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                  {t.send}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}