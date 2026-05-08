import { Check, PenTool } from 'lucide-react';
import { FONT_OPTIONS } from '../data/studio';

interface InteractiveFontSelectorProps {
  selectedFont: string;
  onFontSelect: (fontId: string) => void;
  isDark: boolean;
}

const SAMPLE_TEXT = 'The answer should feel neat, readable, and naturally handwritten.';

export function InteractiveFontSelector({
  selectedFont,
  onFontSelect,
  isDark,
}: InteractiveFontSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">3. Handwriting</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Choose a writing voice</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              These previews now use the same named font family mapping throughout the app, so the UI no longer
              pretends a style exists in one place and ignores it somewhere else.
            </p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <PenTool className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {FONT_OPTIONS.map((font) => {
          const isSelected = selectedFont === font.id;

          return (
            <button
              key={font.id}
              type="button"
              onClick={() => onFontSelect(font.id)}
              className={`rounded-[26px] border p-5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-[var(--accent)] bg-panel-soft shadow-[0_18px_44px_rgba(233,103,37,0.14)]'
                  : 'border-app bg-panel hover:-translate-y-0.5 hover:border-[var(--accent)]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{font.name}</p>
                  <p className="mt-1 text-sm text-muted">{font.personality}</p>
                </div>
                {isSelected && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-contrast">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className={`mt-4 rounded-[22px] border border-app bg-white px-5 py-6 text-slate-700 ${font.sampleClassName}`}>
                <p className="text-3xl leading-tight">{SAMPLE_TEXT}</p>
                <p className="mt-3 text-2xl leading-tight">Name: Tony Stark   Roll No: 108</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted">{font.note}</p>
                <span className="rounded-full border border-app px-3 py-1 text-xs font-medium text-muted">
                  {isSelected ? 'Selected' : 'Preview'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
