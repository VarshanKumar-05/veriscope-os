import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Activity, ShieldAlert, BarChart, FileText, Settings, Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  category?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: Command[] = [
    { id: 'analyze', label: 'Analyze Company', icon: Search, category: 'Intelligence', action: () => { onClose(); document.getElementById('global-search')?.focus(); } },
    { id: 'compare', label: 'Compare Companies', icon: BarChart, category: 'Intelligence', action: () => { onClose(); /* placeholder for compare */ } },
    { id: 'latest', label: 'Open Latest Research', icon: FileText, category: 'Navigation', action: () => { onClose(); navigate('/'); } },
    { id: 'high-risk', label: 'Show High Risk Companies', icon: ShieldAlert, category: 'Intelligence', action: () => { onClose(); } },
    { id: 'recent', label: 'Show Recent Research', icon: Compass, category: 'Navigation', action: () => { onClose(); navigate('/'); } },
    { id: 'positive', label: 'Show Positive Sentiment', icon: Activity, category: 'Intelligence', action: () => { onClose(); } },
    { id: 'theme', label: 'Switch Theme (Toggle)', icon: theme === 'electric' ? Zap : theme === 'dark' ? Sun : Moon, category: 'System', action: () => { toggleTheme(); onClose(); } },
  ];

  const filtered = query
    ? commands.filter(cmd => cmd.label.toLowerCase().includes(query.toLowerCase()) || cmd.id.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="bg-white dark:bg-slate-900 border border-border-custom w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center px-4 py-3 border-b border-border-custom text-text-secondary bg-surface/50">
          <Search size={20} className="mr-3 opacity-60" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search OS intelligence commands... (e.g., 'Analyze NVIDIA')"
            className="flex-1 bg-transparent border-none outline-hidden text-base text-text-primary placeholder:text-text-secondary"
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-secondary font-medium">
              No intelligence commands found.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={cmd.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={(e) => {
                      e.stopPropagation();
                      cmd.action();
                    }}
                    className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[var(--selection)] text-text-primary' 
                        : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} className={`mr-3 ${isSelected ? 'text-[var(--primary-custom)]' : ''}`} />
                    <span className="flex-1 text-sm font-semibold">{cmd.label}</span>
                    {cmd.category && (
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 ml-3">
                        {cmd.category}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
