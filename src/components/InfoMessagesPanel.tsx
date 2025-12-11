import React, { useState, useRef } from 'react';
import { Info, Plus, Edit2, Trash2, ExternalLink, X } from 'lucide-react';
import type { InfoMessage } from '../App';
import type { Translations } from '../translations';

interface InfoMessagesPanelProps {
  messages: InfoMessage[];
  onMessagesChange: (messages: InfoMessage[]) => void;
  translations: Translations;
}

export function InfoMessagesPanel({
  messages,
  onMessagesChange,
  translations,
}: InfoMessagesPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<InfoMessage | null>(null);
  
  const handleAddMessage = (message: InfoMessage) => {
    onMessagesChange([...messages, message]);
    setShowAddModal(false);
  };

  const handleEditMessage = (message: InfoMessage) => {
    onMessagesChange(messages.map(m => m.id === message.id ? message : m));
    setEditingMessage(null);
  };

  const handleDeleteMessage = (id: string) => {
    onMessagesChange(messages.filter(m => m.id !== id));
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
            <Info size={20} />
          </div>
          <h2 className="text-2xl">{translations.infoMessages}</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-lg hover:scale-105 active:scale-95 rounded-lg transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          <span>{translations.addInfoMessage}</span>
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <Info size={48} className="mx-auto mb-2 opacity-30" />
          <p>{translations.addInfoMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onEdit={() => setEditingMessage(message)}
              onDelete={() => handleDeleteMessage(message.id)}
              translations={translations}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingMessage) && (
        <MessageModal
          message={editingMessage}
          onConfirm={editingMessage ? handleEditMessage : handleAddMessage}
          onClose={() => {
            setShowAddModal(false);
            setEditingMessage(null);
          }}
          translations={translations}
        />
      )}
    </div>
  );
}

function MessageCard({
  message,
  onEdit,
  onDelete,
  translations,
}: {
  message: InfoMessage;
  onEdit: () => void;
  onDelete: () => void;
  translations: Translations;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start gap-3">
        {/* Logo */}
        {message.logo && (
          <div className="flex-shrink-0">
            <img
              src={message.logo}
              alt={message.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg mb-1">{message.title}</h3>
          <p className="text-sm text-white/70 mb-2">{message.content}</p>
          
          {message.link && message.linkName && (
            <a
              href={message.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 transition-colors"
            >
              <ExternalLink size={14} />
              <span>{message.linkName}</span>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageModal({
  message,
  onConfirm,
  onClose,
  translations,
}: {
  message: InfoMessage | null;
  onConfirm: (message: InfoMessage) => void;
  onClose: () => void;
  translations: Translations;
}) {
  const [title, setTitle] = useState(message?.title || '');
  const [content, setContent] = useState(message?.content || '');
  const [link, setLink] = useState(message?.link || '');
  const [linkName, setLinkName] = useState(message?.linkName || '');
  const [logo, setLogo] = useState(message?.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    onConfirm({
      id: message?.id || `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: title.trim(),
      content: content.trim(),
      link: link.trim() || undefined,
      linkName: linkName.trim() || undefined,
      logo: logo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-cyan-600/90 to-blue-600/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl">
            {message ? translations.editMessage : translations.addMessage}
          </h3>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-white/80 mb-2">
              {translations.messageTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={translations.messageTitlePlaceholder}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-white placeholder:text-white/40"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-white/80 mb-2">
              {translations.messageContent}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={translations.messageContentPlaceholder}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all text-white placeholder:text-white/40 resize-none"
            />
          </div>

          {/* Optional Link */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="block text-sm text-white/70 mb-3">
              🔗 {translations.optionalLink}
            </label>
            
            <div className="space-y-2">
              <input
                type="text"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder={translations.linkNamePlaceholder}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/40 text-sm"
              />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={translations.linkUrlPlaceholder}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/40 text-sm"
              />
            </div>
          </div>

          {/* Optional Logo */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="block text-sm text-white/70 mb-3">
              🖼️ {translations.optionalLogo}
            </label>
            
            <div className="flex gap-3 items-center">
              {logo && (
                <img
                  src={logo}
                  alt="Logo"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-sm"
              >
                {translations.uploadLogo}
              </button>
              {logo && (
                <button
                  type="button"
                  onClick={() => setLogo('')}
                  className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all text-sm"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20"
          >
            {translations.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className={`flex-1 px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              title.trim() && content.trim()
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:shadow-xl hover:scale-105'
                : 'bg-gray-500/50 cursor-not-allowed'
            }`}
          >
            <Plus size={20} />
            <span>{message ? translations.save : translations.addMessage}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
