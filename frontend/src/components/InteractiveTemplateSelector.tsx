import { Check, LayoutTemplate } from 'lucide-react';
import { TEMPLATE_OPTIONS, type TemplateOption } from '../data/studio';

interface InteractiveTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  isDark: boolean;
}

function TemplateMiniPreview({ template }: { template: TemplateOption }) {
  if (template.id === 'blank') {
    return <div className="h-full rounded-[20px] bg-white" />;
  }

  if (template.id === 'graph') {
    return (
      <div className="grid h-full grid-cols-8 grid-rows-6 overflow-hidden rounded-[20px] bg-white">
        {Array.from({ length: 48 }).map((_, index) => (
          <div key={index} className="border border-slate-200/80" />
        ))}
      </div>
    );
  }

  if (template.id === 'dotted') {
    return (
      <div className="grid h-full grid-cols-10 place-items-center rounded-[20px] bg-white px-2 py-3">
        {Array.from({ length: 70 }).map((_, index) => (
          <span key={index} className="h-1 w-1 rounded-full bg-slate-300" />
        ))}
      </div>
    );
  }

  const lines = template.id === 'notebook' ? 7 : 8;

  return (
    <div className="relative h-full overflow-hidden rounded-[20px] bg-white p-4">
      {(template.id === 'double-ruled' || template.id === 'notebook') && (
        <div className={`absolute bottom-4 top-4 ${template.id === 'notebook' ? 'left-10' : 'left-8'} w-px bg-red-300`} />
      )}
      {template.id === 'notebook' && (
        <div className="absolute inset-y-0 left-3 flex flex-col justify-evenly">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
          ))}
        </div>
      )}
      <div className={`${template.id === 'double-ruled' ? 'ml-7' : template.id === 'notebook' ? 'ml-11' : ''} pt-3`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`mb-3 border-b ${template.id === 'notebook' ? 'border-sky-300/80' : 'border-indigo-200/80'}`}
          />
        ))}
      </div>
    </div>
  );
}

export function InteractiveTemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  isDark,
}: InteractiveTemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">2. Paper layout</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Pick the page style</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              The template decides the writing rhythm. Choose the sheet that best fits the assignment type instead of
              forcing one layout for everything.
            </p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <LayoutTemplate className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATE_OPTIONS.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onTemplateSelect(template.id)}
              className={`rounded-[26px] border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-[var(--accent)] bg-panel-soft shadow-[0_18px_44px_rgba(233,103,37,0.14)]'
                  : 'border-app bg-panel hover:-translate-y-0.5 hover:border-[var(--accent)]/40'
              }`}
            >
              <div className="relative h-40">
                <TemplateMiniPreview template={template} />
                {isSelected && (
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-contrast">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{template.name}</p>
                  <span className="rounded-full border border-app px-3 py-1 text-xs font-medium text-muted">
                    {isSelected ? 'Selected' : 'Available'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{template.description}</p>
                <p className="mt-3 text-sm font-medium text-accent">{template.bestFor}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
