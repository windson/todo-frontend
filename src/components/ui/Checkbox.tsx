import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function Checkbox({ checked, onChange, disabled, className, 'aria-label': ariaLabel }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'h-5 w-5 rounded border-2 flex items-center justify-center transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
        checked
          ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </button>
  );
}
