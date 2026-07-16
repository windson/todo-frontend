import type { Tag } from '@/types';

interface TagBadgeProps {
  tag: Tag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
    >
      {tag.name}
    </span>
  );
}
