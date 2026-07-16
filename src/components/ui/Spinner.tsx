import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn('animate-spin text-blue-600 dark:text-blue-400', sizeStyles[size], className)}
      />
    </div>
  );
}
