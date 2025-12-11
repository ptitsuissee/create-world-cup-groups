import React, { useState } from 'react';
import { X, User, Mail, Lock, Save, Camera } from 'lucide-react';
import type { Translations } from '../translations';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserSettingsModalProps {
  userName: string;
  userEmail: string;
  userAvatar: string;
  onSave: (data: { name: string; email: string; password?: string }) => void;
  onAvatarClick: () => void;
  onClose: () => void;
  translations: Translations;
  isReadOnly?: boolean; // Mode lecture seule pour voir le profil d'un autre utilisateur
}

export function UserSettingsModal({
  userName,
  userEmail,
  userAvatar,
  onSave,
  onAvatarClick,
  onClose,
  translations: t,
  isReadOnly = false,
}: UserSettingsModalProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    // Validate name
    if (name.trim().length < 2) {
      setError(t.nameTooShort || 'Le nom doit contenir au moins 2 caractères');
      setIsChecking(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.invalidEmail || 'Adresse e-mail invalide');
      setIsChecking(false);
      return;
    }

    // Check if username changed and verify uniqueness
    if (name.trim() !== userName) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/auth/check-username`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              username: name.trim(),
              currentEmail: userEmail,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok || !result.available) {
          setError(t.usernameTaken || 'Ce pseudonyme est déjà utilisé. Veuillez en choisir un autre.');
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setError(t.errorCheckingUsername || 'Erreur lors de la vérification du pseudonyme. Veuillez réessayer.');
        setIsChecking(false);
        return;
      }
    }

    // Validate password if changing
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setError(t.passwordTooShort || 'Le mot de passe doit contenir au moins 6 caractères');
        setIsChecking(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError(t.passwordMismatch || 'Les mots de passe ne correspondent pas');
        setIsChecking(false);
        return;
      }

      // Save with new password
      onSave({
        name: name.trim(),
        email: email.trim(),
        password: newPassword,
      });
    } else {
      // Save without password change
      onSave({
        name: name.trim(),
        email: email.trim(),
      });
    }

    setIsChecking(false);
    onClose();
  };

  // Check if avatar is an emoji or image URL
  const isEmoji = userAvatar.length <= 2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl">
              {isReadOnly ? `👤 ${t.createdBy || 'Profil'}` : t.accountSettings || 'Paramètres du compte'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {isReadOnly
                ? (t.readOnlyDesc || 'Vous consultez le profil de') + ' ' + userName
                : (t.manageYourAccount || 'Gérez vos informations personnelles')
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className={`relative ${!isReadOnly ? 'group' : ''}`}>
              {isEmoji ? (
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl shadow-lg ${!isReadOnly ? 'cursor-pointer group-hover:scale-105' : ''} transition-all`}>
                  {userAvatar}
                </div>
              ) : (
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className={`w-24 h-24 rounded-2xl object-cover shadow-lg ${!isReadOnly ? 'cursor-pointer group-hover:scale-105' : ''} transition-all`}
                />
              )}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={onAvatarClick}
                  className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                >
                  <Camera className="w-8 h-8" />
                </button>
              )}
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={onAvatarClick}
                className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
              >
                {t.changeAvatar || 'Changer l\'avatar'}
              </button>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <User size={16} />
              {t.name || 'Nom'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none ${!isReadOnly ? 'focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30' : 'cursor-not-allowed'} transition-all text-white placeholder:text-white/40`}
              placeholder={t.enterYourName || 'Entrez votre nom'}
              required={!isReadOnly}
              readOnly={isReadOnly}
            />
          </div>

          {/* Email Input - Hidden in read-only mode */}
          {!isReadOnly && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <Mail size={16} />
                {t.email || 'E-mail'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-white placeholder:text-white/40"
                placeholder={t.enterYourEmail || 'Entrez votre e-mail'}
                required
              />
            </div>
          )}

          {/* Password Section - Hidden in read-only mode */}
          {!isReadOnly && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="flex items-center gap-2 text-sm text-white/80">
                <Lock size={16} />
                {t.changePassword || 'Changer le mot de passe'} ({t.optional || 'optionnel'})
              </h3>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-white placeholder:text-white/40"
                placeholder={t.newPassword || 'Nouveau mot de passe'}
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-white placeholder:text-white/40"
                placeholder={t.confirmPassword || 'Confirmer le mot de passe'}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${isReadOnly ? 'w-full' : 'flex-1'} px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all`}
            >
              {isReadOnly ? t.cancel : t.cancel}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {t.save}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}