import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Force every rendered anchor to open in a new tab with `rel="noopener
 * noreferrer"`. User-authored links must not be able to control the opener
 * window (tab-nabbing) or leak the referrer. Registered once at module load.
 */
let linkHookRegistered = false;
function registerLinkHardeningHook(): void {
  if (linkHookRegistered) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  linkHookRegistered = true;
}

/**
 * Render a markdown string to sanitized HTML.
 *
 * Todo descriptions and comment bodies are authored as GitHub-flavoured
 * markdown. We parse with `marked` (synchronous, no async extensions) and then
 * sanitize the resulting HTML with DOMPurify so user-authored content can never
 * inject scripts or event handlers. Links are forced to open in a new tab with
 * `rel="noopener noreferrer"` via a DOMPurify afterSanitizeAttributes hook.
 */
export function renderMarkdown(source: string): string {
  registerLinkHardeningHook();
  const raw = marked.parse(source ?? '', { async: false, gfm: true, breaks: true });
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'del', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li',
      'a', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}
