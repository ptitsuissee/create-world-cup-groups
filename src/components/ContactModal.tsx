import React, { useState } from 'react';
import { X, Send, Mail } from 'lucide-react';
import { translations, type Language } from '../translations';
import { SecurityCaptcha } from './SecurityCaptcha';
import { 
  sanitizeInput, 
  validateEmail, 
  validateInput, 
  checkRateLimit,
  secureApiRequest,
  createHoneypotField 
} from '../utils/security';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onShowToast: (message: string) => void;
}

export function ContactModal({ isOpen, onClose, language, onShowToast }: ContactModalProps) {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [honeypotField] = useState(createHoneypotField());
  const [honeypotValue, setHoneypotValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !subject || !message) {
      onShowToast(t.fillAllFields);
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      onShowToast('Email invalide');
      return;
    }

    // Validate inputs
    if (!validateInput(subject, 200)) {
      onShowToast('Sujet invalide');
      return;
    }

    if (!validateInput(message, 5000)) {
      onShowToast('Message invalide');
      return;
    }

    // Check captcha
    if (!captchaVerified) {
      onShowToast('Veuillez compléter la vérification de sécurité');
      return;
    }

    // Check rate limit
    const rateLimitCheck = checkRateLimit('contact');
    if (!rateLimitCheck.allowed) {
      onShowToast(`Trop de requêtes. Réessayez dans ${Math.ceil((rateLimitCheck.retryAfter || 0) / 60)} minutes.`);
      return;
    }

    setSending(true);
    
    try {
      const response = await secureApiRequest('/api/send-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(email),
          subject: sanitizeInput(subject),
          message: sanitizeInput(message),
          [honeypotField]: honeypotValue, // Honeypot
          _honeypot: honeypotValue, // Double honeypot
        }),
      });

      if (response.ok) {
        onShowToast(t.contactSent);
        setEmail('');
        setSubject('');
        setMessage('');
        setCaptchaVerified(false);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending contact:', error);
      onShowToast(t.contactError);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-white/20 overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-white">{t.contactUs}</h2>
              <p className="text-white/80 text-sm">{t.contactUsDesc}</p>
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
              {t.email} <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.enterYourEmail}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all"
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              {t.subject} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.subjectPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all"
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              {t.message} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 transition-all resize-none"
              disabled={sending}
            />
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

          {/* Security Captcha */}
          <SecurityCaptcha onVerify={setCaptchaVerified} difficulty="easy" />

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
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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