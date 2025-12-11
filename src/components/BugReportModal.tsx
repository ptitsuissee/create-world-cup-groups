import React, { useState } from 'react';
import { X, Send, Bug } from 'lucide-react';
import { translations, type Language } from '../translations';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description) {
      onShowToast(t.fillAllFields);
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch('/api/send-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        onShowToast(t.bugReportSent);
        setDescription('');
        onClose();
      } else {
        throw new Error('Failed to send bug report');
      }
    } catch (error) {
      console.error('Error sending bug report:', error);
      onShowToast(t.bugReportError);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-900/95 to-orange-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-white/20 overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-white">{t.reportBug}</h2>
              <p className="text-white/80 text-sm">{t.reportBugDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white mb-2">
              {t.bugDescription} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.bugDescriptionPlaceholder}
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-orange-400 transition-all resize-none"
              disabled={sending}
            />
            <p className="text-white/60 text-sm mt-2">{t.bugDescriptionHint}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 transition-all"
              disabled={sending}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending}
            >
              {sending ? (
                <>{t.loading}</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
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
