import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('renders an accessible dialog whose body scrolls within the viewport', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Edit" footer={<button>Update</button>}>
        <p>content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog', { name: 'Edit' });
    expect(dialog.className).toContain('max-h-[90vh]');
    expect(screen.getByText('content').parentElement?.className).toContain('overflow-y-auto');
    expect(screen.getByText('Update')).toBeTruthy();
  });

  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Edit">
        x
      </Modal>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
