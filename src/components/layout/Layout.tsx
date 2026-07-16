import { useState, useCallback, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useSearchParams } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get('search') || '';

  const handleSearch = useCallback(
    (query: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (query) {
          next.set('search', query);
        } else {
          next.delete('search');
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header
        onSearch={handleSearch}
        searchValue={searchValue}
        onToggleSidebar={toggleSidebar}
      />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="pt-16 md:pl-64">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
