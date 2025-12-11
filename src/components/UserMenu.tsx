import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, FolderOpen, Crown, BarChart3, Mail } from 'lucide-react';
import type { Translations } from '../translations';

interface UserMenuProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  isAdmin?: boolean;
  onLogout: () => void;
  onOpenSettings?: () => void;
  onOpenProjects?: () => void;
  onOpenAdManager?: () => void;
  onOpenAnalytics?: () => void;
  onOpenMessages?: () => void;
  translations: Translations;
}

export function UserMenu({ 
  userName, 
  userEmail, 
  userAvatar, 
  isAdmin = false, 
  onLogout, 
  onOpenSettings,
  onOpenProjects,
  onOpenAdManager,
  onOpenAnalytics,
  onOpenMessages,
  translations: t 
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if avatar is an emoji (single character/emoji) or image URL
  const isEmojiAvatar = userAvatar && userAvatar.length <= 2;
  const isImageAvatar = userAvatar && userAvatar.startsWith('data:image') || userAvatar && userAvatar.startsWith('http');

  const renderAvatar = (size: 'small' | 'large') => {
    const sizeClasses = size === 'small' ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg';
    const bgClasses = isAdmin ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-600';

    if (isEmojiAvatar) {
      return (
        <div className={`${sizeClasses} rounded-lg ${bgClasses} flex items-center justify-center shadow-lg ${size === 'small' ? 'text-xl' : 'text-3xl'}`}>
          {userAvatar}
        </div>
      );
    } else if (isImageAvatar) {
      return (
        <img
          src={userAvatar}
          alt={userName}
          className={`${sizeClasses} rounded-lg object-cover shadow-lg`}
        />
      );
    } else {
      return (
        <div className={`${sizeClasses} rounded-lg ${bgClasses} flex items-center justify-center font-bold shadow-lg`}>
          {getInitials(userName)}
        </div>
      );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 relative"
      >
        <div className="relative">
          {renderAvatar('small')}
          {isAdmin && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white/20">
              <Crown className="w-2.5 h-2.5 text-yellow-900" />
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium flex items-center gap-1">
            {userName}
            {isAdmin && <Crown className="w-3 h-3 text-yellow-400" />}
          </div>
          <div className="text-xs text-white/70">{userEmail}</div>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden z-50">
          {/* User info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {renderAvatar('large')}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-sm text-white/70 truncate">{userEmail}</div>
              </div>
              {isAdmin && <Crown className="w-5 h-5 text-yellow-400" />}
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenProjects) onOpenProjects();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <FolderOpen className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-sm font-medium">{t.myProjects || 'Mes projets'}</div>
                <div className="text-xs text-white/60">{t.viewAllProjects || 'Voir tous mes projets'}</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <Settings className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-medium">{t.settings || 'Paramètres'}</div>
                <div className="text-xs text-white/60">{t.accountSettings || 'Paramètres du compte'}</div>
              </div>
            </button>

            {/* Admin Ad Manager */}
            {isAdmin && onOpenAdManager && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdManager();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="w-5 h-5 flex items-center justify-center text-yellow-400">📢</div>
                <div>
                  <div className="text-sm font-medium text-yellow-400">Gérer les publicités</div>
                  <div className="text-xs text-white/60">Admin uniquement</div>
                </div>
              </button>
            )}

            {/* Admin Analytics */}
            {isAdmin && onOpenAnalytics && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAnalytics();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <BarChart3 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-green-400">Tableau de bord Analytics</div>
                  <div className="text-xs text-white/60">Statistiques & visites</div>
                </div>
              </button>
            )}

            {/* Admin Messages */}
            {isAdmin && onOpenMessages && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMessages();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <Mail className="w-5 h-5 text-pink-400" />
                <div>
                  <div className="text-sm font-medium text-pink-400">Messages & Bugs</div>
                  <div className="text-xs text-white/60">Contact & rapports de bugs</div>
                </div>
              </button>
            )}

            <div className="h-px bg-white/10 my-2" />

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/20 rounded-lg transition-colors text-left text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <div>
                <div className="text-sm font-medium">{t.logout || 'Déconnexion'}</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}