import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Todos } from '@/pages/Todos';
import { Categories } from '@/pages/Categories';
import { Tags } from '@/pages/Tags';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/todos" element={<Todos />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/tags" element={<Tags />} />
            </Routes>
          </Layout>
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-gray-100',
            duration: 3000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
