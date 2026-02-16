import React, { useState, useEffect } from 'react';
import { X, Mail, Bug, Trash2, AlertCircle, CheckCircle, Calendar, User } from 'lucide-react';
import type { Translations } from '../translations';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ContactMessage {
  id: string;
  email: string;
  subject: string;
  message: string;
  timestamp: number;
  ip: string;
}

interface BugReport {
  id: string;
  description: string;
  email: string;
  timestamp: number;
  ip: string;
  userAgent: string;
}

interface AdminMessagesPanelProps {
  onClose: () => void;
  translations: Translations;
  authToken: string;
}

export function AdminMessagesPanel({ onClose, translations: t, authToken }: AdminMessagesPanelProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'bugs'>('contacts');
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/admin/messages`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const result = await response.json();
      setContacts(result.contacts || []);
      setBugs(result.bugs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (type: 'contact' | 'bug', id: string) => {
    if (!confirm(t.confirmDelete || 'Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-92e03882/admin/message/${type}/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setSuccess(t.deleted || 'Message supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
      
      // Reload messages
      loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] border border-white/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl">
              📨 {t.adminMessages || 'Messages & Rapports de bugs'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {t.adminMessagesDesc || 'Consultez tous les messages de contact et rapports de bugs'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'contacts'
                ? 'bg-white/20 shadow-lg'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Mail size={20} />
            <span>{t.contactMessages || 'Messages de contact'}</span>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
              {contacts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bugs')}
            className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bugs'
                ? 'bg-white/20 shadow-lg'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Bug size={20} />
            <span>{t.bugReports || 'Rapports de bugs'}</span>
            <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
              {bugs.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center gap-2 text-red-200">
              <AlertCircle size={20} />
              {error}
            </div>
          ) : (
            <>
              {success && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center gap-2 text-green-200">
                  <CheckCircle size={20} />
                  {success}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                      <Mail size={48} className="mx-auto mb-4 opacity-50" />
                      <p>{t.noContactMessages || 'Aucun message de contact pour le moment'}</p>
                    </div>
                  ) : (
                    contacts.map((contact, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User size={16} className="text-blue-300" />
                              <span className="text-blue-300">{contact.email}</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{contact.subject}</h3>
                            <div className="flex items-center gap-3 text-xs text-white/50">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(contact.timestamp)}
                              </span>
                              <span>IP: {contact.ip}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteMessage('contact', contact.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                            title={t.delete || 'Supprimer'}
                          >
                            <Trash2 size={18} className="text-red-300" />
                          </button>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 text-sm whitespace-pre-wrap">
                          {contact.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'bugs' && (
                <div className="space-y-4">
                  {bugs.length === 0 ? (
                    <div className="text-center py-12 text-white/50">
                      <Bug size={48} className="mx-auto mb-4 opacity-50" />
                      <p>{t.noBugReports || 'Aucun rapport de bug pour le moment'}</p>
                    </div>
                  ) : (
                    bugs.map((bug, index) => (
                      <div
                        key={index}
                        className="bg-white/10 rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {bug.email && (
                              <div className="flex items-center gap-2 mb-2">
                                <User size={16} className="text-orange-300" />
                                <span className="text-orange-300">{bug.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-white/50 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(bug.timestamp)}
                              </span>
                              <span>IP: {bug.ip}</span>
                            </div>
                            <div className="text-xs text-white/40 mb-2">
                              User-Agent: {bug.userAgent}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteMessage('bug', bug.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                            title={t.delete || 'Supprimer'}
                          >
                            <Trash2 size={18} className="text-red-300" />
                          </button>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 text-sm whitespace-pre-wrap">
                          {bug.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            {t.close || 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
}