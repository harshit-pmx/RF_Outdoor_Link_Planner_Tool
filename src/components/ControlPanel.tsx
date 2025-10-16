import { Plus, Edit3, Link as LinkIcon, Trash2 } from 'lucide-react';

interface ControlPanelProps {
  mode: 'add' | 'edit' | 'link' | 'delete' | null;
  onModeChange: (mode: 'add' | 'edit' | 'link' | 'delete' | null) => void;
}

export function ControlPanel({ mode, onModeChange }: ControlPanelProps) {
  const buttons = [
    { id: 'add' as const, icon: Plus, label: 'Add Tower' },
    { id: 'edit' as const, icon: Edit3, label: 'Edit Frequency' },
    { id: 'link' as const, icon: LinkIcon, label: 'Draw Link' },
    { id: 'delete' as const, icon: Trash2, label: 'Delete' },
  ];

  return (
    <div className="fixed top-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl p-4">
      <h2 className="text-cyan-300 font-bold text-lg mb-3 tracking-wide">Controls</h2>
      <div className="flex flex-col gap-2">
        {buttons.map((button) => {
          const Icon = button.icon;
          const isActive = mode === button.id;
          return (
            <button
              key={button.id}
              onClick={() => onModeChange(isActive ? null : button.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/50'
                  : 'bg-slate-800/50 text-cyan-300 hover:bg-slate-700/70 border border-cyan-500/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{button.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
