import { useMemo, useState } from 'react';
import { Brain, FileText, LayoutTemplate, Sparkles, UserRound } from 'lucide-react';
import { InteractiveFileUpload } from './components/InteractiveFileUpload';
import { InteractiveTemplateSelector } from './components/InteractiveTemplateSelector';
import { InteractiveFontSelector } from './components/InteractiveFontSelector';
import { InteractiveUserForm } from './components/InteractiveUserForm';
import { GenerationInterface } from './components/GenerationInterface';
import { ThemeToggle } from './components/ThemeToggle';
import { FONT_OPTIONS, TEMPLATE_OPTIONS } from './data/studio';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('ruled');
  const [selectedFont, setSelectedFont] = useState('caveat');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [subject, setSubject] = useState('General');
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');
  const [writingStyle, setWritingStyle] = useState('casual');

  const selectedTemplateMeta = useMemo(
    () => TEMPLATE_OPTIONS.find((option) => option.id === selectedTemplate),
    [selectedTemplate],
  );
  const selectedFontMeta = useMemo(
    () => FONT_OPTIONS.find((option) => option.id === selectedFont),
    [selectedFont],
    );

  const completion = [
    selectedFile ? 1 : 0,
    selectedTemplate ? 1 : 0,
    selectedFont ? 1 : 0,
    name.trim() && rollNumber.trim() ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

  const readinessPercent = Math.round((completion / 4) * 100);
  const isFormValid = Boolean(selectedFile && name.trim() && rollNumber.trim());

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <div className="min-h-screen bg-app text-app transition-colors duration-300">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(233,103,37,0.22),transparent_68%)]" />
          <div className="absolute bottom-[-12rem] right-[-8rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(15,76,129,0.18),transparent_68%)]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-app bg-app/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-contrast shadow-[0_14px_40px_rgba(233,103,37,0.25)]">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold tracking-tight">AssignmentAI Studio</p>
                <p className="text-sm text-muted">Refined upload, stronger typography, cleaner generation flow.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden rounded-2xl border border-app bg-panel px-4 py-3 md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Readiness</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-track">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${readinessPercent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-accent">{readinessPercent}%</span>
                </div>
              </div>
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark((value) => !value)} />
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
          <aside className="space-y-6">
            <section className="surface-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Workspace</p>
              <h1 className="mt-3 font-display text-3xl leading-tight">
                Build a polished handwritten assignment without the messy UI.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">
                Upload the source file, tune the paper and handwriting style, then generate a cleaner output that
                better matches real student work.
              </p>
            </section>

            <section className="surface-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Checklist</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Source file selected', done: Boolean(selectedFile), icon: <FileText className="h-4 w-4" /> },
                  { label: 'Paper style chosen', done: Boolean(selectedTemplate), icon: <LayoutTemplate className="h-4 w-4" /> },
                  { label: 'Handwriting style chosen', done: Boolean(selectedFont), icon: <Sparkles className="h-4 w-4" /> },
                  { label: 'Student details ready', done: Boolean(name.trim() && rollNumber.trim()), icon: <UserRound className="h-4 w-4" /> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-app bg-panel-soft px-4 py-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.done ? 'bg-accent text-accent-contrast' : 'bg-track text-muted'}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted">{item.done ? 'Ready' : 'Needs attention'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Current setup</p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-muted">Paper</p>
                  <p className="mt-1 font-medium">{selectedTemplateMeta?.name}</p>
                  <p className="mt-1 text-muted">{selectedTemplateMeta?.bestFor}</p>
                </div>
                <div>
                  <p className="text-muted">Handwriting</p>
                  <p className="mt-1 font-medium">{selectedFontMeta?.name}</p>
                  <p className="mt-1 text-muted">{selectedFontMeta?.personality}</p>
                </div>
                <div>
                  <p className="text-muted">Identity</p>
                  <p className="mt-1 font-medium">{name.trim() || 'Name not entered yet'}</p>
                  <p className="mt-1 text-muted">{rollNumber.trim() ? `Roll no. ${rollNumber}` : 'Roll number not entered yet'}</p>
                </div>
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="surface-panel p-6 sm:p-8">
              <InteractiveFileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                onClear={() => setSelectedFile(null)}
                isDark={isDark}
              />
            </section>

            <section className="surface-panel p-6 sm:p-8">
              <InteractiveTemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                isDark={isDark}
              />
            </section>

            <section className="surface-panel p-6 sm:p-8">
              <InteractiveFontSelector
                selectedFont={selectedFont}
                onFontSelect={setSelectedFont}
                isDark={isDark}
              />
            </section>

            <section className="surface-panel p-6 sm:p-8">
              <InteractiveUserForm
                name={name}
                rollNumber={rollNumber}
                subject={subject}
                difficultyLevel={difficultyLevel}
                writingStyle={writingStyle}
                onNameChange={setName}
                onRollNumberChange={setRollNumber}
                onSubjectChange={setSubject}
                onDifficultyChange={setDifficultyLevel}
                onWritingStyleChange={setWritingStyle}
                selectedFont={selectedFont}
                isDark={isDark}
              />
            </section>

            <section className="surface-panel p-6 sm:p-8">
              <GenerationInterface
                isDark={isDark}
                isFormValid={isFormValid}
                selectedFile={selectedFile}
                selectedTemplate={selectedTemplate}
                selectedFont={selectedFont}
                name={name}
                rollNumber={rollNumber}
                subject={subject}
                difficultyLevel={difficultyLevel}
                writingStyle={writingStyle}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
