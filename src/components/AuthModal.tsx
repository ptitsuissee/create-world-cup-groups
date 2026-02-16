import React, { useState } from 'react';
import { X, Mail, Lock, User, Crown } from 'lucide-react';
import type { Translations } from '../translations';
import { ADMIN_CONFIG, isAdminAccount } from '../config/admin';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSwitchMode: () => void;
  translations: Translations;
}

export function AuthModal({ mode, onClose, onSwitchMode, translations: t }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError(t.fillAllFields || 'Veuillez remplir tous les champs');
      return;
    }

    if (mode === 'signup') {
      // Vérifier si c'est le compte admin
      if (isAdminAccount(email)) {
        setError('Ce compte est réservé. Veuillez vous connecter.');
        return;
      }
      
      if (!name) {
        setError(t.fillAllFields || 'Veuillez remplir tous les champs');
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordsDontMatch || 'Les mots de passe ne correspondent pas');
        return;
      }
      if (password.length < 6) {
        setError(t.passwordTooShort || 'Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? 'auth/login' : 'auth/signup';
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            name: mode === 'signup' ? name : undefined,
            _honeypot: '', // Honeypot protection
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      // Store auth data
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_email', result.user.email);
      localStorage.setItem('user_name', result.user.name);
      localStorage.setItem('user_avatar', result.user.avatar);
      localStorage.setItem('is_admin', result.user.isAdmin ? 'true' : 'false');

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-4 mx-auto shadow-lg">
            {mode === 'login' ? '🔐' : '✨'}
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            {mode === 'login' ? (t.login || 'Connexion') : (t.signup || 'Créer un compte')}
          </h2>
          <p className="text-sm text-white/70 text-center">
            {mode === 'login' 
              ? (t.loginSubtitle || 'Connectez-vous pour accéder à vos projets')
              : (t.signupSubtitle || 'Créez un compte pour sauvegarder vos tournois')
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.name || 'Nom'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder={t.enterName || 'Votre nom'}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.email || 'Email'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={t.enterEmail || 'votre@email.com'}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.password || 'Mot de passe'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder={t.enterPassword || '••••••••'}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.confirmPassword || 'Confirmer le mot de passe'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder={t.enterPassword || '••••••••'}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.loading || 'Chargement...'}
              </span>
            ) : (
              mode === 'login' ? (t.login || 'Se connecter') : (t.signup || 'Créer un compte')
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            {mode === 'login' 
              ? (t.noAccount || "Pas encore de compte ?")
              : (t.hasAccount || "Déjà un compte ?")
            }
            {' '}
            <button
              onClick={onSwitchMode}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {mode === 'login' 
                ? (t.signup || 'Créer un compte')
                : (t.login || 'Se connecter')
              }
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}