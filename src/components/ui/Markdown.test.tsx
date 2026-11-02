import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown } from '@/components/ui/Markdown';

describe('Markdown', () => {
  it('renders markdown syntax as formatted HTML', () => {
    const { container } = render(
      <Markdown content={'# Heading\n\nSome **bold** and a [link](https://example.com).'} />
    );

    expect(container.querySelector('h1')?.textContent).toBe('Heading');
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com');
  });

  it('hardens rendered links with target and rel for safe new-tab opening', () => {
    const { container } = render(
      <Markdown content={'[external](https://example.com)'} />
    );

    const link = container.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders a bulleted list', () => {
    const { container } = render(<Markdown content={'- one\n- two'} />);
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('sanitizes dangerous HTML, stripping script tags', () => {
    const { container } = render(
      <Markdown content={'<script>alert(1)</script>Safe text'} />
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('Safe text');
  });
});
