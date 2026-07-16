import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  );
}
