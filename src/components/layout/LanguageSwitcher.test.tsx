import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import i18n from '@/i18n/config';

function Probe() {
  const { t } = useTranslation();
  return <span data-testid="probe">{t('nav.dashboard')}</span>;
}

describe('LanguageSwitcher', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  // Restore the shared i18n instance so other test files see English.
  afterEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('switches the locale and changes a visible string', async () => {
    render(
      <>
        <LanguageSwitcher />
        <Probe />
      </>
    );

    // Default English string.
    expect(screen.getByTestId('probe')).toHaveTextContent('Dashboard');

    // Open the switcher and pick Spanish.
    fireEvent.click(screen.getByLabelText(/language/i));
    fireEvent.click(screen.getByText('Español'));

    expect(screen.getByTestId('probe')).toHaveTextContent('Panel');
    expect(localStorage.getItem('locale')).toBe('es');
  });

  it('keeps <html lang> in sync with the locale', async () => {
    await i18n.changeLanguage('es');
    expect(document.documentElement.lang).toBe('es');
  });
});
