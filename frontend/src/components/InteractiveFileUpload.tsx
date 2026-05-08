import { useCallback, useMemo, useRef, useState } from 'react';
import { AlertCircle, FileImage, FileText, FolderOpen, Upload, X } from 'lucide-react';

interface InteractiveFileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  isDark: boolean;
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function InteractiveFileUpload({
  onFileSelect,
  selectedFile,
  onClear,
  isDark,
}: InteractiveFileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const fileKind = useMemo(() => {
    if (!selectedFile) return null;
    return selectedFile.type === 'application/pdf' ? 'PDF document' : 'Image file';
  }, [selectedFile]);

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please choose a PDF, JPG, or PNG file.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'The selected file is larger than 10 MB.';
    }

    return '';
  };

  const handleSelection = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError('');
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">1. Upload source</p>
          <h2 className="mt-2 font-display text-3xl">Choose the assignment file</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            The broken invisible overlay is gone here. Drag a file in, or use the button to open the native file
            picker directly.
          </p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          PDF, JPG, PNG
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleSelection(file);
          event.currentTarget.value = '';
        }}
        className="hidden"
      />

      <div
        className={`rounded-[28px] border border-dashed p-6 transition-all duration-300 sm:p-8 ${
          dragActive ? 'border-[var(--accent)] bg-panel-soft shadow-[0_18px_50px_rgba(233,103,37,0.12)]' : 'border-app bg-panel-soft'
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const file = event.dataTransfer.files?.[0];
          if (file) handleSelection(file);
        }}
      >
        {!selectedFile ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-accent-contrast">
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Drop your assignment here</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  We support scanned PDFs and images. Cleaner scans usually lead to better OCR and more natural answers.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-contrast transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <FolderOpen className="h-4 w-4" />
                  Select file
                </button>
                <div className="rounded-2xl border border-app px-4 py-3 text-sm text-muted">
                  Max size 10 MB
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-app bg-app/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Upload tips</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>Use portrait pages with strong contrast.</p>
                <p>Avoid cropped corners and heavy shadows.</p>
                <p>Math-heavy pages usually look best with graph paper or dotted templates.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex items-start gap-4 rounded-[24px] border border-app bg-panel p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
                {selectedFile.type === 'application/pdf' ? <FileText className="h-7 w-7" /> : <FileImage className="h-7 w-7" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{selectedFile.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {fileKind} • {formatFileSize(selectedFile.size)}
                </p>
                <p className="mt-3 text-sm text-muted">Ready for OCR and question extraction.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  onClear();
                }}
                className="rounded-xl border border-app p-2 text-muted transition-colors duration-200 hover:text-red-500"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={openFileDialog}
              className="rounded-[24px] border border-app bg-panel px-5 py-4 text-left transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold">Replace file</p>
              <p className="mt-2 text-sm text-muted">Open the chooser again without refreshing the page.</p>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
