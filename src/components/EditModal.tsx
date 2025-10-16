import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tower } from '../types';

interface EditModalProps {
  tower: Tower;
  onSave: (towerId: string, frequency: number) => void;
  onClose: () => void;
}

export function EditModal({ tower, onSave, onClose }: EditModalProps) {
  const [frequency, setFrequency] = useState(tower.frequency.toString());

  useEffect(() => {
    setFrequency(tower.frequency.toString());
  }, [tower]);

  const handleSave = () => {
    const freq = parseFloat(frequency);
    if (isNaN(freq) || freq <= 0) {
      return;
    }
    onSave(tower.id, freq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-xl shadow-2xl p-6 w-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-300 font-bold text-lg">Edit Tower Frequency</h3>
          <button
            onClick={onClose}
            className="text-cyan-300 hover:text-cyan-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-cyan-200 text-sm mb-2">Tower ID: {tower.id}</label>
          <label className="block text-cyan-200 text-sm mb-2">Frequency (GHz)</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            step="0.1"
            min="0.1"
            className="w-full px-3 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-cyan-500 text-slate-900 py-2 rounded-lg font-medium hover:bg-cyan-400 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 text-cyan-300 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
