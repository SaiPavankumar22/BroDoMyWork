import { BookOpen, Hash, UserRound } from 'lucide-react';
import { DIFFICULTY_OPTIONS, FONT_OPTIONS, WRITING_STYLE_OPTIONS } from '../data/studio';

interface InteractiveUserFormProps {
  name: string;
  rollNumber: string;
  subject: string;
  difficultyLevel: string;
  writingStyle: string;
  onNameChange: (name: string) => void;
  onRollNumberChange: (rollNumber: string) => void;
  onSubjectChange: (subject: string) => void;
  onDifficultyChange: (level: string) => void;
  onWritingStyleChange: (style: string) => void;
  selectedFont: string;
  isDark: boolean;
}

const inputClassName =
  'w-full rounded-2xl border border-app bg-panel px-4 py-3 text-sm outline-none transition-colors duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(233,103,37,0.15)]';

export function InteractiveUserForm({
  name,
  rollNumber,
  subject,
  difficultyLevel,
  writingStyle,
  onNameChange,
  onRollNumberChange,
  onSubjectChange,
  onDifficultyChange,
  onWritingStyleChange,
  selectedFont,
  isDark,
}: InteractiveUserFormProps) {
  const fontPreview = FONT_OPTIONS.find((font) => font.id === selectedFont);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">4. Assignment profile</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Add the details that shape the output</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Name and roll number are required. Subject, depth, and tone help the answers sound more deliberate and
              less generic.
            </p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <UserRound className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <UserRound className="h-4 w-4 text-accent" />
                Full name
              </span>
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Enter your full name"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Hash className="h-4 w-4 text-accent" />
                Roll number
              </span>
              <input
                value={rollNumber}
                onChange={(event) => onRollNumberChange(event.target.value)}
                placeholder="Enter your roll number"
                className={inputClassName}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-accent" />
              Subject
            </span>
            <input
              value={subject}
              onChange={(event) => onSubjectChange(event.target.value)}
              placeholder="Physics, English, Economics..."
              className={inputClassName}
            />
          </label>

          <div>
            <p className="mb-3 text-sm font-medium">Answer depth</p>
            <div className="grid gap-3 md:grid-cols-3">
              {DIFFICULTY_OPTIONS.map((option) => {
                const selected = difficultyLevel === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onDifficultyChange(option.value)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                      selected ? 'border-[var(--accent)] bg-panel-soft' : 'border-app bg-panel hover:border-[var(--accent)]/35'
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-2 text-sm text-muted">{option.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium">Writing tone</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {WRITING_STYLE_OPTIONS.map((option) => {
                const selected = writingStyle === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onWritingStyleChange(option.value)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                      selected ? 'border-[var(--accent)] bg-panel-soft' : 'border-app bg-panel hover:border-[var(--accent)]/35'
                    }`}
                  >
                    <p className="font-semibold">{option.label}</p>
                    <p className="mt-2 text-sm text-muted">{option.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-app bg-panel-soft p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Header preview</p>
          <div className="mt-4 rounded-[20px] border border-app bg-white p-5 text-slate-700">
            <div className={`text-right ${fontPreview?.sampleClassName ?? 'font-handwriting-caveat'}`}>
              <p className="text-3xl leading-tight">Name: {name || 'Your name'}</p>
              <p className="mt-2 text-3xl leading-tight">Roll No: {rollNumber || 'Your roll number'}</p>
              <p className="mt-4 text-2xl leading-tight text-slate-500">{subject || 'General subject'}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>The first page header now reflects your active handwriting selection.</p>
            <p>Using a subject helps the answer generation feel more grounded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
