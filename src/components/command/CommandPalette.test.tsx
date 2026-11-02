import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { CommandPaletteProvider } from '@/context/CommandPaletteProvider';
import '@/i18n/config';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter>
          <CommandPaletteProvider>
            <div>app</div>
          </CommandPaletteProvider>
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('CommandPalette', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('opens when Cmd/Ctrl+K is pressed', async () => {
    renderWithProviders();

    expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
    });
  });

  it('runs a navigation command when selected', async () => {
    renderWithProviders();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const input = await screen.findByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'Board' } });

    const option = await screen.findByText('Go to Board');
    fireEvent.click(option);

    expect(navigateMock).toHaveBeenCalledWith('/board');
  });
});
