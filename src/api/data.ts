import { apiClient } from './client';
import type { Analytics, ExportFormat, ImportSummary } from '@/types';

/** Fetch the current user's productivity analytics (owned todos only). */
export async function getAnalytics(days?: number): Promise<Analytics> {
  const params: Record<string, string> = {};
  if (days !== undefined) params.days = String(days);
  const response = await apiClient.get<Analytics>('/analytics', { params });
  return response.data;
}

/**
 * Download the user's export as a Blob. The export endpoint returns a raw file
 * (not the success envelope), so we request a blob response type; the client's
 * envelope interceptor leaves blobs untouched.
 */
export async function exportData(format: ExportFormat): Promise<Blob> {
  const response = await apiClient.get(`/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data as Blob;
}

/**
 * Import a bundle for the current user. `content` is a JSON bundle string or
 * CSV text; `format` selects how the backend parses it. Records are always
 * created for the authenticated user. Returns the import summary.
 */
export async function importData(
  content: string,
  format: ExportFormat
): Promise<ImportSummary> {
  const response = await apiClient.post<ImportSummary>('/import', {
    format,
    content,
  });
  return response.data;
}

/**
 * Trigger a browser download of a Blob with the given filename, using an
 * object URL that is revoked after the click.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
