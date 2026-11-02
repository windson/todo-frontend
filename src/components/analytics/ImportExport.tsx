import { useRef, useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useExportData, useImportData } from '@/hooks/useData';
import type { ExportFormat, ImportSummary } from '@/types';

/**
 * Export (download JSON/CSV) and import (upload a file or paste text) controls.
 * Import posts the raw content to the backend which validates it and returns a
 * summary; records are always created for the current user.
 */
export function ImportExport() {
  const exportData = useExportData();
  const importData = useImportData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [format, setFormat] = useState<ExportFormat>('json');
  const [pasteContent, setPasteContent] = useState('');
  const [lastSummary, setLastSummary] = useState<ImportSummary | null>(null);

  const runImport = (content: string, importFormat: ExportFormat) => {
    if (!content.trim()) return;
    importData.mutate(
      { content, format: importFormat },
      { onSuccess: (summary) => setLastSummary(summary) }
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const inferred: ExportFormat = file.name.toLowerCase().endsWith('.csv')
      ? 'csv'
      : 'json';
    const reader = new FileReader();
    reader.onload = () => {
      runImport(String(reader.result ?? ''), inferred);
    };
    reader.readAsText(file);
    // Reset so selecting the same file again re-triggers onChange.
    e.target.value = '';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Backup &amp; restore
      </h3>

      <div className="space-y-6">
        {/* Export */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Download a copy of your todos, categories, and tags.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={exportData.isPending && exportData.variables === 'json'}
              onClick={() => exportData.mutate('json')}
            >
              <FileJson className="h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={exportData.isPending && exportData.variables === 'csv'}
              onClick={() => exportData.mutate('csv')}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Import */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Restore from a JSON or CSV file, or paste the content below.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,application/json,text/csv"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload file
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <input
                  type="radio"
                  name="import-format"
                  value="json"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                />
                JSON
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <input
                  type="radio"
                  name="import-format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                />
                CSV
              </label>
            </div>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              rows={4}
              placeholder={
                format === 'json'
                  ? '{ "todos": [ { "title": "Example" } ] }'
                  : 'title,priority\nExample,HIGH'
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            <Button
              variant="primary"
              size="sm"
              loading={importData.isPending}
              disabled={!pasteContent.trim()}
              onClick={() => runImport(pasteContent, format)}
            >
              <Download className="h-4 w-4" />
              Import pasted {format.toUpperCase()}
            </Button>
          </div>
        </div>

        {lastSummary && (
          <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-900/50">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Last import
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Created {lastSummary.created.todos} todo(s),{' '}
              {lastSummary.created.categories} category(ies),{' '}
              {lastSummary.created.tags} tag(s). Reused{' '}
              {lastSummary.reused.categories} category(ies) and{' '}
              {lastSummary.reused.tags} tag(s).
            </p>
            {lastSummary.errors.length > 0 && (
              <ul className="mt-2 list-disc pl-4 text-red-600 dark:text-red-400">
                {lastSummary.errors.slice(0, 5).map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
