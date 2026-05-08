import { ArrowRight, ScanText, Sparkles, Pencil, Download, FileUp, Brain, PenLine } from 'lucide-react';
import { BroLogo } from './BroLogo';
import { ThemeToggle } from './ThemeToggle';

interface LandingPageProps {
  onEnterStudio: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

const STEPS = [
  { n: '01', icon: FileUp,   title: 'Upload',   desc: 'PDF or image — scanned or digital' },
  { n: '02', icon: ScanText, title: 'Extract',  desc: 'OCR pulls every question automatically' },
  { n: '03', icon: Brain,    title: 'Generate', desc: 'GPT writes human-like answers' },
  { n: '04', icon: PenLine,  title: 'Render',   desc: 'Pages rendered in your chosen handwriting' },
];

const FEATURES = [
  {
    icon: ScanText,
    title: 'Smart OCR pipeline',
    body: 'Digital PDFs use pypdf for instant text extraction. Scanned files go through PyMuPDF → Tesseract. Tables are pulled out separately via pdfplumber.',
  },
  {
    icon: Sparkles,
    title: 'AI-generated answers',
    body: 'Pick subject, difficulty (Beginner → Advanced) and writing style (Casual, Formal, Academic, Creative). GPT writes each answer to match.',
  },
  {
    icon: Pencil,
    title: 'Realistic handwriting',
    body: 'Six Google handwriting fonts. Six paper templates — ruled, notebook, graph, dotted and more. Letter-level jitter makes every page look genuine.',
  },
];

export function LandingPage({ onEnterStudio, isDark, onThemeToggle }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-app text-app">

      {/* ── ambient blobs ──────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#ffd400]/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#ffd400]/15 blur-3xl" />
      </div>

      {/* ── header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-app bg-app/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BroLogo />
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            <button
              type="button"
              onClick={onEnterStudio}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-80"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── hero ──────────────────────────────────────────────────── */}
        <section className="py-20 text-center">

          {/* pill badge */}
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-app bg-panel px-4 py-2 text-sm font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            OCR · GPT answers · Handwriting render · PDF export
          </div>

          {/* headline */}
          <h1 className="font-display mx-auto max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Turn any assignment into{' '}
            <span className="text-accent">handwritten pages</span>
            {' '}in seconds
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Upload a PDF or image, let AI extract the questions and write human-like answers,
            then download a realistic handwritten PDF — ready to submit.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onEnterStudio}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-7 py-4 text-base font-semibold text-accent-contrast shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onEnterStudio}
              className="inline-flex items-center gap-2 rounded-2xl border border-app bg-panel px-7 py-4 text-base font-semibold text-muted transition-opacity hover:opacity-70"
            >
              <Download className="h-4 w-4" />
              See example output
            </button>
          </div>

          {/* trust strip */}
          <p className="mt-6 text-sm text-muted opacity-70">
            No sign-up required · Poppler-free · Works on scanned &amp; digital PDFs
          </p>
        </section>

        {/* ── how it works ─────────────────────────────────────────── */}
        <section className="pb-16">
          <h2 className="mb-10 text-center font-display text-2xl font-bold">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div
                key={n}
                className="relative rounded-2xl border border-app bg-panel-soft p-6"
              >
                {/* step number */}
                <span className="font-display absolute right-5 top-4 text-4xl font-bold text-accent opacity-25 select-none">
                  {n}
                </span>
                {/* icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-contrast">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── features ─────────────────────────────────────────────── */}
        <section className="pb-16">
          <h2 className="mb-10 text-center font-display text-2xl font-bold">What makes it different</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-app bg-panel p-7 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-contrast shadow-md">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── bottom CTA ───────────────────────────────────────────── */}
        <section className="mb-16 overflow-hidden rounded-3xl border border-app bg-accent px-8 py-12 text-center shadow-lg">
          <h2 className="font-display text-3xl font-bold text-accent-contrast sm:text-4xl">
            Ready to never hand-write again?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-accent-contrast/70">
            Upload your assignment now — the whole process takes under two minutes.
          </p>
          <button
            type="button"
            onClick={onEnterStudio}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-accent-contrast px-8 py-4 text-base font-bold text-accent transition-opacity hover:opacity-85"
          >
            Open workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

      </main>

      {/* ── footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-app py-6 text-center text-sm text-muted opacity-60">
        AssignmentAI · Built with FastAPI + React + OpenAI
      </footer>
    </div>
  );
}
