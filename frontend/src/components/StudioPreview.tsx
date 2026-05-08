import { Eye, Minus, Plus, RotateCcw, Sparkles } from 'lucide-react';
import { FONT_OPTIONS, TEMPLATE_OPTIONS } from '../data/studio';

interface StudioPreviewProps {
  selectedTemplate: string;
  selectedFont: string;
  name: string;
  rollNumber: string;
  subject: string;
  previewQuestion: string;
  previewAnswer: string;
  zoom: number;
  onTemplateSelect: (templateId: string) => void;
  onFontSelect: (fontId: string) => void;
  onNameChange: (value: string) => void;
  onRollNumberChange: (value: string) => void;
  onPreviewQuestionChange: (value: string) => void;
  onPreviewAnswerChange: (value: string) => void;
  onZoomChange: (value: number) => void;
  onResetPreview: () => void;
}

function buildTemplateSurface(template: string) {
  if (template === 'graph') {
    return 'bg-[linear-gradient(to_right,rgba(17,17,17,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.08)_1px,transparent_1px)] [background-size:34px_34px]';
  }

  if (template === 'dotted') {
    return 'bg-[radial-gradient(circle,rgba(17,17,17,0.16)_1.2px,transparent_1.3px)] [background-size:28px_28px]';
  }

  if (template === 'blank') {
    return 'bg-[#fffef2]';
  }

  if (template === 'notebook') {
    return 'bg-[linear-gradient(to_bottom,transparent_0,transparent_34px,rgba(68,112,255,0.16)_34px,rgba(68,112,255,0.16)_36px)] [background-size:100%_36px]';
  }

  return 'bg-[linear-gradient(to_bottom,transparent_0,transparent_38px,rgba(68,112,255,0.14)_38px,rgba(68,112,255,0.14)_40px)] [background-size:100%_40px]';
}

export function StudioPreview({
  selectedTemplate,
  selectedFont,
  name,
  rollNumber,
  subject,
  previewQuestion,
  previewAnswer,
  zoom,
  onTemplateSelect,
  onFontSelect,
  onNameChange,
  onRollNumberChange,
  onPreviewQuestionChange,
  onPreviewAnswerChange,
  onZoomChange,
  onResetPreview,
}: StudioPreviewProps) {
  const font = FONT_OPTIONS.find((item) => item.id === selectedFont) ?? FONT_OPTIONS[0];

  return (
    <div className="sticky top-24 space-y-5">
      <section className="surface-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-app px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Preview Studio</p>
            <p className="mt-1 text-sm text-muted">Edit directly from the preview side.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.8, zoom - 0.1))}
              className="rounded-xl border border-app bg-panel px-3 py-2"
              aria-label="Zoom out preview"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-14 text-center text-sm font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(1.35, zoom + 0.1))}
              className="rounded-xl border border-app bg-panel px-3 py-2"
              aria-label="Zoom in preview"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-[#111111] p-4">
          <div className="mx-auto max-w-[760px] overflow-auto rounded-[30px] border border-black/15 bg-[#fdfbea] p-5 shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
            <div
              className="origin-top transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <div className={`relative mx-auto aspect-[210/297] w-full max-w-[620px] overflow-hidden rounded-[22px] border border-black/10 bg-[#fffef2] p-10 ${buildTemplateSurface(selectedTemplate)}`}>
                {(selectedTemplate === 'double-ruled' || selectedTemplate === 'notebook') && (
                  <div className="absolute bottom-8 left-16 top-8 w-px bg-red-300" />
                )}

                <div className="relative z-10 flex justify-end">
                  <div className={`text-right text-[#161616] ${font.sampleClassName}`}>
                    <input
                      value={name}
                      onChange={(event) => onNameChange(event.target.value)}
                      className="block w-[220px] border-none bg-transparent text-right text-[20px] leading-tight outline-none"
                      placeholder="Name"
                    />
                    <input
                      value={rollNumber}
                      onChange={(event) => onRollNumberChange(event.target.value)}
                      className="mt-2 block w-[220px] border-none bg-transparent text-right text-[18px] leading-tight outline-none"
                      placeholder="Roll number"
                    />
                  </div>
                </div>

                <div className="mt-10 border-t border-black/10 pt-8 text-[#161616]">
                  <textarea
                    value={previewQuestion}
                    onChange={(event) => onPreviewQuestionChange(event.target.value)}
                    className={`w-full resize-none border-none bg-transparent text-[20px] font-semibold leading-[1.35] outline-none ${font.sampleClassName}`}
                    rows={3}
                  />
                  <textarea
                    value={previewAnswer}
                    onChange={(event) => onPreviewAnswerChange(event.target.value)}
                    className={`mt-5 w-full resize-none border-none bg-transparent pl-6 text-[18px] leading-[1.7] outline-none ${font.sampleClassName}`}
                    rows={12}
                  />
                </div>

                <div className="absolute bottom-7 left-10 right-10 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">
                  <span>{subject || 'General Subject'}</span>
                  <span>BroDoMyWork Studio Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-app bg-panel-soft p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Interactive controls</p>
              <p className="text-xs text-muted">Preview changes update live.</p>
            </div>
            <button
              type="button"
              onClick={onResetPreview}
              className="inline-flex items-center gap-2 rounded-xl border border-app bg-panel px-3 py-2 text-sm font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Template quick switch</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_OPTIONS.slice(0, 4).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onTemplateSelect(template.id)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                    selectedTemplate === template.id ? 'bg-accent text-accent-contrast' : 'border border-app bg-panel'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Font quick switch</p>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onFontSelect(item.id)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                    selectedFont === item.id ? 'bg-accent text-accent-contrast' : 'border border-app bg-panel'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Studio notes</p>
            <p className="text-xs text-muted">This side stays larger and visible while you edit.</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>You can edit the preview header and body text directly in the page frame.</p>
          <p>Use the quick chips to compare handwriting and paper styles without leaving the preview.</p>
          <p className="inline-flex items-center gap-2 text-accent"><Sparkles className="h-4 w-4" /> Built for a studio-style workflow.</p>
        </div>
      </section>
    </div>
  );
}
