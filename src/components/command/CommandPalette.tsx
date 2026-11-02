import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  CalendarDays,
  BarChart3,
  FolderOpen,
  TagsIcon,
  Plus,
  Moon,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/context/ThemeContext';
import { useCreateTodo } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  run: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const createTodo = useCreateTodo();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const navigateGroup = t('commandPalette.groupNavigate');
    const actionsGroup = t('commandPalette.groupActions');
    return [
      {
        id: 'quick-add',
        label: t('commandPalette.quickAddTodo'),
        group: actionsGroup,
        icon: Plus,
        run: () => {
          const title = window.prompt(t('todos.newTodo'));
          if (title && title.trim()) {
            createTodo.mutate({ title: title.trim() });
          }
          navigate('/todos');
        },
      },
      {
        id: 'toggle-theme',
        label: t('commandPalette.toggleTheme'),
        group: actionsGroup,
        icon: Moon,
        run: () => toggleTheme(),
      },
      {
        id: 'focus-search',
        label: t('commandPalette.focusSearch'),
        group: actionsGroup,
        icon: Search,
        run: () => {
          const el = document.querySelector<HTMLInputElement>('input[type="text"]');
          el?.focus();
        },
      },
      {
        id: 'nav-dashboard',
        label: t('commandPalette.goToDashboard'),
        group: navigateGroup,
        icon: LayoutDashboard,
        run: () => navigate('/'),
      },
      {
        id: 'nav-todos',
        label: t('commandPalette.goToTodos'),
        group: navigateGroup,
        icon: ListTodo,
        run: () => navigate('/todos'),
      },
      {
        id: 'nav-board',
        label: t('commandPalette.goToBoard'),
        group: navigateGroup,
        icon: KanbanSquare,
        run: () => navigate('/board'),
      },
      {
        id: 'nav-calendar',
        label: t('commandPalette.goToCalendar'),
        group: navigateGroup,
        icon: CalendarDays,
        run: () => navigate('/calendar'),
      },
      {
        id: 'nav-analytics',
        label: t('commandPalette.goToAnalytics'),
        group: navigateGroup,
        icon: BarChart3,
        run: () => navigate('/analytics'),
      },
      {
        id: 'nav-categories',
        label: t('commandPalette.goToCategories'),
        group: navigateGroup,
        icon: FolderOpen,
        run: () => navigate('/categories'),
      },
      {
        id: 'nav-tags',
        label: t('commandPalette.goToTags'),
        group: navigateGroup,
        icon: TagsIcon,
        run: () => navigate('/tags'),
      },
    ];
  }, [t, navigate, toggleTheme, createTodo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (!isOpen) return;
    // Focus the input after the modal paints.
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const runCommand = (command: Command) => {
    onClose();
    command.run();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filtered[activeIndex];
      if (command) runCommand(command);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('commandPalette.title')}>
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="search"
            aria-label={t('commandPalette.title')}
            placeholder={t('commandPalette.placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm transition-colors',
              'placeholder:text-gray-400',
              'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
              'dark:focus:border-blue-400 dark:focus:ring-blue-400/20'
            )}
          />
        </div>

        <ul className="max-h-72 overflow-y-auto -mx-2" role="listbox">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('commandPalette.noResults')}
            </li>
          )}
          {filtered.map((command, index) => (
            <li key={command.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runCommand(command)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  index === activeIndex
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                )}
              >
                <command.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 truncate">{command.label}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{command.group}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
