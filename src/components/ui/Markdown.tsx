import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { renderMarkdown } from '@/lib/markdown';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Render user-authored markdown as sanitized HTML. The markup produced by
 * `renderMarkdown` is already sanitized with DOMPurify, so injecting it via
 * dangerouslySetInnerHTML is safe here.
 */
export function Markdown({ content, className }: MarkdownProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={cn(
        'prose-sm max-w-none break-words text-gray-700 dark:text-gray-300',
        '[&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400',
        '[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs dark:[&_code]:bg-gray-700',
        '[&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:text-xs dark:[&_pre]:bg-gray-900',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic dark:[&_blockquote]:border-gray-600',
        '[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
