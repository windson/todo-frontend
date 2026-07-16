import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Priority } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return 'bg-green-500';
    case Priority.MEDIUM:
      return 'bg-amber-500';
    case Priority.HIGH:
      return 'bg-orange-500';
    case Priority.URGENT:
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getPriorityTextColor(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return 'text-green-600 dark:text-green-400';
    case Priority.MEDIUM:
      return 'text-amber-600 dark:text-amber-400';
    case Priority.HIGH:
      return 'text-orange-600 dark:text-orange-400';
    case Priority.URGENT:
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function getPriorityBgColor(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return 'bg-green-100 dark:bg-green-900/30';
    case Priority.MEDIUM:
      return 'bg-amber-100 dark:bg-amber-900/30';
    case Priority.HIGH:
      return 'bg-orange-100 dark:bg-orange-900/30';
    case Priority.URGENT:
      return 'bg-red-100 dark:bg-red-900/30';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30';
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return 'Low';
    case Priority.MEDIUM:
      return 'Medium';
    case Priority.HIGH:
      return 'High';
    case Priority.URGENT:
      return 'Urgent';
    default:
      return 'Unknown';
  }
}
