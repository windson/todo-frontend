import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnalytics, exportData, importData, downloadBlob } from '@/api/data';
import type { ExportFormat } from '@/types';
import toast from 'react-hot-toast';

/** Query the current user's analytics for the given trend window (days). */
export function useAnalytics(days?: number) {
  return useQuery({
    queryKey: ['analytics', days ?? null],
    queryFn: () => getAnalytics(days),
  });
}

/** Download the user's data as a JSON or CSV file. */
export function useExportData() {
  return useMutation({
    mutationFn: (format: ExportFormat) => exportData(format),
    onSuccess: (blob, format) => {
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `todos-export-${stamp}.${format}`);
      toast.success(`Exported your data as ${format.toUpperCase()}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Export failed');
    },
  });
}

/** Import a JSON/CSV payload into the current user's account. */
export function useImportData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, format }: { content: string; format: ExportFormat }) =>
      importData(content, format),
    onSuccess: (summary) => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
      const { created } = summary;
      toast.success(
        `Imported ${created.todos} todo(s), ${created.categories} category(ies), ${created.tags} tag(s)`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Import failed');
    },
  });
}
