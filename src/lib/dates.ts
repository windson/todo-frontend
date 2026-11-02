import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatRelative(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getDueDateLabel(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return 'Today';
  }
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  return format(date, 'MMM d');
}

export function isOverdue(dateString: string): boolean {
  const date = parseISO(dateString);
  return !isPast(date) && !isToday(date);
}

export function toInputDateFormat(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'yyyy-MM-dd');
}
