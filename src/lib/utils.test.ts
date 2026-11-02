import { describe, it, expect } from 'vitest';
import { cn, getPriorityLabel, getPriorityColor } from '@/lib/utils';
import { Priority } from '@/types';

describe('cn', () => {
  it('merges class names and dedupes conflicting tailwind utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy values', () => {
    const maybe = '' as string | false;
    expect(cn('a', maybe, undefined, 'c')).toBe('a c');
  });
});

describe('getPriorityLabel', () => {
  it('maps each priority to a human-readable label', () => {
    expect(getPriorityLabel(Priority.LOW)).toBe('Low');
    expect(getPriorityLabel(Priority.MEDIUM)).toBe('Medium');
    expect(getPriorityLabel(Priority.HIGH)).toBe('High');
    expect(getPriorityLabel(Priority.URGENT)).toBe('Urgent');
  });
});

describe('getPriorityColor', () => {
  it('returns a distinct background class per priority', () => {
    expect(getPriorityColor(Priority.LOW)).toBe('bg-green-500');
    expect(getPriorityColor(Priority.URGENT)).toBe('bg-red-500');
  });
});
