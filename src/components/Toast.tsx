import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'warning', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    error: 'from-red-500 to-pink-500',
  }[type];

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] animate-[slideDown_0.3s_ease-out]">
      <div className={`bg-gradient-to-r ${bgColor} backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20 flex items-center gap-3 min-w-[300px] max-w-[500px]`}>
        <Icon size={24} className="text-white flex-shrink-0" />
        <p className="text-white flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
