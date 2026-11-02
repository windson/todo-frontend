import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  KanbanSquare,
  FolderOpen,
  TagsIcon,
  CalendarDays,
  Sun,
  CalendarClock,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/todos', label: 'Todos', icon: ListTodo },
  { path: '/board', label: 'Board', icon: KanbanSquare },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/categories', label: 'Categories', icon: FolderOpen },
  { path: '/tags', label: 'Tags', icon: TagsIcon },
];

const smartLists = [
  { to: '/todos?dueFilter=today', label: 'Today', icon: Sun },
  { to: '/todos?dueFilter=upcoming', label: 'Upcoming', icon: CalendarClock },
  { to: '/todos?dueFilter=overdue', label: 'Overdue', icon: AlertCircle },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: categories } = useCategories();
  const { data: tags } = useTags();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-0 w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
          'z-50 transition-transform duration-200 ease-in-out',
          'md:translate-x-0 md:z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto p-4">
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Menu
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )
                }
                end={item.path === '/'}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Smart Lists
            </h3>
            <nav className="space-y-1">
              {smartLists.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {categories && categories.length > 0 && (
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.slice(0, 8).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 rounded-lg"
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="truncate">{category.name}</span>
                    {category._count && (
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                        {category._count.todos}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 px-3">
                {tags.slice(0, 12).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
