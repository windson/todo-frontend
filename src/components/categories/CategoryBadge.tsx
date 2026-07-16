import type { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      {category.name}
    </span>
  );
}
