import { useState, useEffect } from 'react';
import { Search, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchValue: string;
  onToggleSidebar: () => void;
}

export function Header({ onSearch, searchValue, onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearch(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearch]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="flex h-full items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            TodoApp
          </h1>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search todos..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={cn(
                'w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm transition-colors',
                'placeholder:text-gray-400',
                'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
                'dark:focus:border-blue-400 dark:focus:ring-blue-400/20'
              )}
            />
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}
