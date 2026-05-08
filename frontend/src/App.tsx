import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BroLogo } from './components/BroLogo';
import { GenerationInterface } from './components/GenerationInterface';
import { InteractiveFileUpload } from './components/InteractiveFileUpload';
import { InteractiveFontSelector } from './components/InteractiveFontSelector';
import { InteractiveTemplateSelector } from './components/InteractiveTemplateSelector';
import { InteractiveUserForm } from './components/InteractiveUserForm';
import { LandingPage } from './components/LandingPage';
import { StudioEditor } from './components/StudioEditor';
import { ThemeToggle } from './components/ThemeToggle';
import { FONT_OPTIONS, TEMPLATE_OPTIONS } from './data/studio';

type AppPage = 'landing' | 'setup' | 'studio';
type SetupStep = 'source' | 'style' | 'identity' | 'generate';

interface GeneratedSession {
  sessionId: string;
  pageCount: number;
  previewImages: string[];
  downloadUrl: string;
  fontUsed?: string;
  warnings?: string[];
}

function App() {
  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState<AppPage>('landing');
  const [setupStep, setSetupStep] = useState<SetupStep>('source');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('ruled');
  const [selectedFont, setSelectedFont] = useState('patrick');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [subject, setSubject] = useState('General');
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');
  const [writingStyle, setWritingStyle] = useState('casual');
  const [generatedSession, setGeneratedSession] = useState<GeneratedSession | null>(null);

  const selectedTemplateMeta = useMemo(
    () => TEMPLATE_OPTIONS.find((option) => option.id === selectedTemplate),
    [selectedTemplate],
  );
  const selectedFontMeta = useMemo(
    () => FONT_OPTIONS.find((option) => option.id === selectedFont),
    [selectedFont],
  );

  const isIdentityReady = Boolean(name.trim() && rollNumber.trim());
  const isFormValid = Boolean(selectedFile && isIdentityReady);

  const stepItems: Array<{ id: SetupStep; label: string; hint: string; ready: boolean }> = [
    { id: 'source', label: 'Source', hint: 'Upload assignment', ready: Boolean(selectedFile) },
    { id: 'style', label: 'Style', hint: 'Paper and handwriting', ready: Boolean(selectedTemplate && selectedFont) },
    { id: 'identity', label: 'Identity', hint: 'Name, roll, subject', ready: isIdentityReady },
    { id: 'generate', label: 'Generate', hint: 'Answers and render', ready: Boolean(generatedSession) },
  ];

  const currentStepIndex = stepItems.findIndex((item) => item.id === setupStep);

  const handleStepAdvance = () => {
    const next = stepItems[currentStepIndex + 1];
    if (next) setSetupStep(next.id);
  };

  const openSetup = () => {
    setPage('setup');
    setSetupStep('source');
  };

  if (page === 'landing') {
    return (
      <div className={isDark ? 'theme-dark' : 'theme-light'}>
        <LandingPage
          isDark={isDark}
          onThemeToggle={() => setIsDark((value) => !value)}
          onEnterStudio={openSetup}
        />
      </div>
    );
  }

  if (page === 'studio' && generatedSession) {
    return (
      <div className={isDark ? 'theme-dark' : 'theme-light'}>
        <header className="sticky top-0 z-20 border-b border-app bg-app/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPage('setup')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-app bg-panel"
                aria-label="Back to setup workspace"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <BroLogo />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPage('setup')}
                className="rounded-2xl border border-app bg-panel px-4 py-3 text-sm font-semibold"
              >
                Back to setup
              </button>
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark((value) => !value)} />
            </div>
          </div>
        </header>

        <StudioEditor
          previewImages={generatedSession.previewImages}
          pageCount={generatedSession.pageCount}
          downloadUrl={generatedSession.downloadUrl}
          name={name}
          subject={subject}
        />
      </div>
    );
  }

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <div className="min-h-screen bg-app text-app">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,212,0,0.24),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,212,0,0.16),transparent_34%)]" />
        </div>

        <header className="sticky top-0 z-20 border-b border-app bg-app/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPage('landing')}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-app bg-panel"
                aria-label="Back to landing page"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <BroLogo />
            </div>

            <div className="flex items-center gap-4">
              {generatedSession && (
                <button
                  type="button"
                  onClick={() => setPage('studio')}
                  className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast"
                >
                  Open Studio
                </button>
              )}
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark((value) => !value)} />
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="surface-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Setup workspace</p>
                <h1 className="mt-3 font-display text-4xl leading-tight">Finish the setup first. Open the studio after the pages are generated.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                  This page is now compact and stage-based so you do not have to scroll through the entire app. Enter
                  details and requirements first, then generate the output, then move into the separate editor studio.
                </p>
              </div>
              {generatedSession && (
                <div className="rounded-[24px] border border-app bg-panel-soft px-5 py-4">
                  <p className="text-sm font-semibold">Generated preview ready</p>
                  <p className="mt-1 text-xs text-muted">
                    {generatedSession.pageCount} page{generatedSession.pageCount !== 1 ? 's' : ''} rendered
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {stepItems.map((item, index) => {
                const active = setupStep === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSetupStep(item.id)}
                    className={`rounded-[24px] border p-4 text-left transition-all ${
                      active ? 'border-[var(--accent)] bg-panel-soft' : 'border-app bg-panel hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Step {index + 1}</span>
                      {item.ready && <CheckCircle2 className="h-4 w-4 text-accent" />}
                    </div>
                    <p className="mt-3 text-lg font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-muted">{item.hint}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-6 surface-panel p-6 sm:p-8">
            {setupStep === 'source' && (
              <div className="space-y-6">
                <InteractiveFileUpload
                  onFileSelect={(file) => {
                    setSelectedFile(file);
                    setGeneratedSession(null);
                  }}
                  selectedFile={selectedFile}
                  onClear={() => {
                    setSelectedFile(null);
                    setGeneratedSession(null);
                  }}
                  isDark={isDark}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleStepAdvance}
                    disabled={!selectedFile}
                    className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue to style
                  </button>
                </div>
              </div>
            )}

            {setupStep === 'style' && (
              <div className="space-y-8">
                <InteractiveTemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                  isDark={isDark}
                />
                <InteractiveFontSelector
                  selectedFont={selectedFont}
                  onFontSelect={setSelectedFont}
                  isDark={isDark}
                />
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setSetupStep('source')}
                    className="rounded-2xl border border-app bg-panel px-5 py-3 text-sm font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepAdvance}
                    className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast"
                  >
                    Continue to identity
                  </button>
                </div>
              </div>
            )}

            {setupStep === 'identity' && (
              <div className="space-y-6">
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
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setSetupStep('style')}
                    className="rounded-2xl border border-app bg-panel px-5 py-3 text-sm font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepAdvance}
                    disabled={!isIdentityReady}
                    className="rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue to generate
                  </button>
                </div>
              </div>
            )}

            {setupStep === 'generate' && (
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
                onGenerated={(payload) => {
                  setGeneratedSession(payload);
                  setPage('studio');
                }}
              />
            )}
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="surface-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Paper</p>
              <p className="mt-3 text-lg font-semibold">{selectedTemplateMeta?.name}</p>
              <p className="mt-2 text-sm text-muted">{selectedTemplateMeta?.bestFor}</p>
            </div>
            <div className="surface-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Handwriting</p>
              <p className="mt-3 text-lg font-semibold">{selectedFontMeta?.name}</p>
              <p className="mt-2 text-sm text-muted">{selectedFontMeta?.personality}</p>
            </div>
            <div className="surface-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Studio</p>
              <p className="mt-3 text-lg font-semibold">
                {generatedSession ? 'Generated pages ready for editing' : 'Studio opens after generation'}
              </p>
              <p className="mt-2 text-sm text-muted">
                After render, the generated pages become the actual studio preview with advanced textbox controls.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
