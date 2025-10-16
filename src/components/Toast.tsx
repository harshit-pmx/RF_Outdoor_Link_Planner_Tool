import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-[10000] flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md border animate-slide-in ${
      type === 'error'
        ? 'bg-red-950/90 border-red-500/50 text-red-100'
        : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100'
    }`}>
      {type === 'error' ? (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
