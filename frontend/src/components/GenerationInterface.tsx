import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Download,
  Loader,
  PencilLine,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  cleanupSession,
  generateAnswers,
  getDownloadUrl,
  renderAssignment,
  uploadFile,
  type GeneratedAnswer,
  type UploadResponse,
} from '../services/api';
import { FONT_OPTIONS, TEMPLATE_OPTIONS } from '../data/studio';

interface StepState {
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
}

interface QuestionDraft {
  question: string;
  mode: 'manual' | 'ai';
  answer: string;
}

interface GenerationInterfaceProps {
  isDark: boolean;
  isFormValid: boolean;
  selectedFile: File | null;
  selectedTemplate: string;
  selectedFont: string;
  name: string;
  rollNumber: string;
  subject: string;
  difficultyLevel: string;
  writingStyle: string;
}

const INITIAL_STEPS: StepState[] = [
  { status: 'pending', message: 'Waiting for file upload' },
  { status: 'pending', message: 'Waiting for question analysis' },
  { status: 'pending', message: 'Waiting for answer generation' },
  { status: 'pending', message: 'Waiting for handwriting render' },
];

const STEP_LABELS = ['Upload & OCR', 'Question segmentation', 'Answer generation', 'PDF render'];

export function GenerationInterface({
  isDark,
  isFormValid,
  selectedFile,
  selectedTemplate,
  selectedFont,
  name,
  rollNumber,
  subject,
  difficultyLevel,
  writingStyle,
}: GenerationInterfaceProps) {
  const [steps, setSteps] = useState<StepState[]>(INITIAL_STEPS);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [renderWarnings, setRenderWarnings] = useState<string[]>([]);
  const [fontUsed, setFontUsed] = useState('');
  const [questionDrafts, setQuestionDrafts] = useState<QuestionDraft[]>([]);
  const [sourceFingerprint, setSourceFingerprint] = useState('');

  const selectedTemplateMeta = useMemo(
    () => TEMPLATE_OPTIONS.find((item) => item.id === selectedTemplate),
    [selectedTemplate],
  );
  const selectedFontMeta = useMemo(() => FONT_OPTIONS.find((item) => item.id === selectedFont), [selectedFont]);

  const manualCount = questionDrafts.filter((draft) => draft.mode === 'manual').length;
  const aiCount = questionDrafts.filter((draft) => draft.mode === 'ai').length;
  const manualMissingCount = questionDrafts.filter(
    (draft) => draft.mode === 'manual' && !draft.answer.trim(),
  ).length;
  const canRender = isFormValid && questionDrafts.length > 0 && manualMissingCount === 0;

  useEffect(() => {
    const nextFingerprint = selectedFile
      ? `${selectedFile.name}:${selectedFile.size}:${selectedFile.lastModified}`
      : '';

    if (nextFingerprint !== sourceFingerprint) {
      setQuestionDrafts([]);
      setSessionId('');
      setPageCount(0);
      setPreviewImages([]);
      setRenderWarnings([]);
      setFontUsed('');
      setError('');
      setSteps(INITIAL_STEPS);
      setSourceFingerprint(nextFingerprint);
    }
  }, [selectedFile, sourceFingerprint]);

  const updateStep = (index: number, next: StepState) => {
    setSteps((current) => current.map((step, stepIndex) => (stepIndex === index ? next : step)));
  };

  const setDraftAnswer = (index: number, answer: string) => {
    setQuestionDrafts((current) =>
      current.map((draft, draftIndex) => (draftIndex === index ? { ...draft, answer } : draft)),
    );
  };

  const setDraftMode = (index: number, mode: 'manual' | 'ai') => {
    setQuestionDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index
          ? {
              ...draft,
              mode,
              answer: mode === 'ai' ? '' : draft.answer,
            }
          : draft,
      ),
    );
  };

  const resetRenderState = () => {
    setPageCount(0);
    setPreviewImages([]);
    setRenderWarnings([]);
    setFontUsed('');
    setError('');
    setSteps((current) => [current[0], current[1], INITIAL_STEPS[2], INITIAL_STEPS[3]]);
  };

  const buildDrafts = (uploadResult: UploadResponse) => {
    return uploadResult.questions.map((question) => ({
      question,
      mode: 'ai' as const,
      answer: '',
    }));
  };

  const extractQuestions = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError('');
    setPageCount(0);
    setPreviewImages([]);
    setRenderWarnings([]);
    setFontUsed('');
    setSteps(INITIAL_STEPS);

    try {
      if (sessionId) {
        await cleanupSession(sessionId);
      }

      updateStep(0, { status: 'processing', message: 'Uploading file and extracting text…' });
      const uploadResult = await uploadFile(selectedFile);
      setSessionId(uploadResult.session_id);
      updateStep(0, {
        status: 'completed',
        message: `${uploadResult.question_count} question(s) found in the source file.`,
      });

      updateStep(1, { status: 'processing', message: 'Cleaning OCR output and preparing questions…' });
      await new Promise((resolve) => setTimeout(resolve, 250));
      updateStep(1, {
        status: 'completed',
        message: uploadResult.question_count
          ? 'Questions are ready. Choose manual answers or AI generation for each one.'
          : 'No clear questions were detected. Try a cleaner scan or another file.',
      });

      setQuestionDrafts(buildDrafts(uploadResult));
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Question extraction failed.';
      setError(message);
      setSteps((current) =>
        current.map((step) =>
          step.status === 'processing' ? { status: 'error', message } : step,
        ),
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const runGeneration = async () => {
    if (!sessionId || !canRender) return;

    setIsGenerating(true);
    setError('');
    setPageCount(0);
    setPreviewImages([]);
    setRenderWarnings([]);
    setFontUsed('');

    try {
      const aiQuestions = questionDrafts
        .map((draft, index) => ({ ...draft, index }))
        .filter((draft) => draft.mode === 'ai');

      let generatedAnswersByIndex = new Map<number, GeneratedAnswer>();

      if (aiQuestions.length > 0) {
        updateStep(2, { status: 'processing', message: `Generating ${aiQuestions.length} AI answer(s)…` });
        const answerResult = await generateAnswers(
          sessionId,
          aiQuestions.map((draft) => draft.question),
          subject || 'General',
          difficultyLevel,
          writingStyle,
        );
        generatedAnswersByIndex = new Map(
          aiQuestions.map((draft, answerIndex) => [draft.index, answerResult.answers[answerIndex]]),
        );
        updateStep(2, {
          status: 'completed',
          message: `${answerResult.total_answers} AI answer(s) generated. ${manualCount} answer(s) came from the user.`,
        });
      } else {
        updateStep(2, {
          status: 'completed',
          message: `Skipped AI generation. All ${manualCount} answer(s) came from the user.`,
        });
      }

      const finalAnswers = questionDrafts.map((draft, index) => ({
        question: draft.question,
        answer: draft.mode === 'manual' ? draft.answer.trim() : generatedAnswersByIndex.get(index)?.answer ?? '',
      }));

      updateStep(3, { status: 'processing', message: 'Rendering handwriting and building the PDF…' });
      const renderResult = await renderAssignment(
        sessionId,
        finalAnswers,
        selectedTemplate,
        selectedFont,
        name,
        rollNumber,
      );
      updateStep(3, {
        status: 'completed',
        message: `${renderResult.page_count} page(s) rendered and ready to download.`,
      });
      setPageCount(renderResult.page_count);
      setPreviewImages(renderResult.preview_images ?? []);
      setRenderWarnings(renderResult.warnings ?? []);
      setFontUsed(renderResult.font_used ?? '');
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Generation failed.';
      setError(message);
      setSteps((current) =>
        current.map((step) =>
          step.status === 'processing' ? { status: 'error', message } : step,
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    resetRenderState();
    await runGeneration();
  };

  const handleReextract = async () => {
    resetRenderState();
    await extractQuestions();
  };

  const handleDownload = () => {
    if (!sessionId) return;
    const anchor = document.createElement('a');
    anchor.href = getDownloadUrl(sessionId);
    anchor.download = `${name || 'assignment'}_Assignment.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const isComplete = pageCount > 0 && !isGenerating;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">5. Generate</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Extract questions, then choose manual or AI answers</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              This flow lets you cut LLM cost question by question. Extract first, switch any question to manual, and
              only send the unanswered ones to AI.
            </p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            <Brain className="h-5 w-5 text-accent" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-[26px] border border-app bg-panel-soft p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Step 1: Extract questions</p>
                <p className="mt-1 text-sm text-muted">
                  {isFormValid ? 'Start by pulling the questions out of the uploaded assignment.' : 'Add a file, name, and roll number to continue.'}
                </p>
              </div>
              <button
                type="button"
                onClick={extractQuestions}
                disabled={!isFormValid || isExtracting || isGenerating}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-contrast disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isExtracting ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isExtracting ? 'Extracting…' : 'Extract questions'}
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {STEP_LABELS.map((label, index) => {
                const step = steps[index];
                const tone =
                  step.status === 'completed'
                    ? 'border-emerald-300 bg-emerald-500/10'
                    : step.status === 'processing'
                      ? 'border-[var(--accent)] bg-[rgba(233,103,37,0.08)]'
                      : step.status === 'error'
                        ? 'border-red-300 bg-red-500/10'
                        : 'border-app bg-panel';

                return (
                  <div key={label} className={`rounded-2xl border px-4 py-4 ${tone}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-slate-700">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : step.status === 'processing' ? (
                          <Loader className="h-5 w-5 animate-spin text-accent" />
                        ) : step.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{label}</p>
                        <p className="mt-1 text-sm text-muted">{step.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {questionDrafts.length > 0 && (
            <div className="rounded-[26px] border border-app bg-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">Step 2: Choose how each answer is created</p>
                  <p className="mt-1 text-sm text-muted">
                    Manual answers save tokens. AI answers are only generated for questions still set to AI.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full border border-app px-3 py-1">Questions: {questionDrafts.length}</span>
                  <span className="rounded-full border border-app px-3 py-1">Manual: {manualCount}</span>
                  <span className="rounded-full border border-app px-3 py-1">AI: {aiCount}</span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {questionDrafts.map((draft, index) => (
                  <div key={`${draft.question}-${index}`} className="rounded-[22px] border border-app bg-panel-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Question {index + 1}</p>
                        <p className="mt-2 text-sm leading-6">{draft.question}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDraftMode(index, 'manual')}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                            draft.mode === 'manual'
                              ? 'bg-accent text-accent-contrast'
                              : 'border border-app bg-panel text-app'
                          }`}
                        >
                          <PencilLine className="h-4 w-4" />
                          Manual
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftMode(index, 'ai')}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                            draft.mode === 'ai'
                              ? 'bg-accent text-accent-contrast'
                              : 'border border-app bg-panel text-app'
                          }`}
                        >
                          <Sparkles className="h-4 w-4" />
                          AI
                        </button>
                      </div>
                    </div>

                    {draft.mode === 'manual' && (
                      <div className="mt-4">
                        <textarea
                          value={draft.answer}
                          onChange={(event) => setDraftAnswer(index, event.target.value)}
                          placeholder="Write your own answer here. This question will skip LLM generation."
                          rows={5}
                          className="w-full rounded-2xl border border-app bg-panel px-4 py-3 text-sm leading-6 outline-none transition-colors duration-200 focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(233,103,37,0.15)]"
                        />
                        {!draft.answer.trim() && (
                          <p className="mt-2 text-xs text-red-600">Manual mode needs an answer before rendering.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={runGeneration}
                  disabled={!canRender || isGenerating || isExtracting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-contrast disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isGenerating ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? 'Rendering…' : 'Generate final assignment'}
                </button>
                <button
                  type="button"
                  onClick={handleReextract}
                  disabled={isExtracting || isGenerating}
                  className="inline-flex items-center gap-2 rounded-2xl border border-app bg-panel px-5 py-3 font-semibold"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-extract questions
                </button>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="rounded-[26px] border border-app bg-panel p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 font-semibold text-accent-contrast"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-2 rounded-2xl border border-app bg-panel-soft px-5 py-3 font-semibold"
                >
                  <RefreshCw className="h-4 w-4" />
                  Render again
                </button>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {previewImages.slice(0, 4).map((imageUrl, index) => (
                    <div key={imageUrl} className="overflow-hidden rounded-[22px] border border-app bg-panel-soft">
                      <div className="border-b border-app px-4 py-3 text-sm font-medium">Preview page {index + 1}</div>
                      <img
                        src={imageUrl}
                        alt={`Assignment preview page ${index + 1}`}
                        className="aspect-[4/5] w-full object-cover object-top"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[26px] border border-app bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Render summary</p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-muted">File</p>
                <p className="mt-1 font-medium">{selectedFile?.name || 'No file selected yet'}</p>
              </div>
              <div>
                <p className="text-muted">Template</p>
                <p className="mt-1 font-medium">{selectedTemplateMeta?.name}</p>
              </div>
              <div>
                <p className="text-muted">Font</p>
                <p className="mt-1 font-medium">{selectedFontMeta?.name}</p>
                {fontUsed && <p className="mt-1 text-xs text-muted">Renderer used: {fontUsed}</p>}
              </div>
              <div>
                <p className="text-muted">Answer sourcing</p>
                <p className="mt-1 font-medium">
                  {manualCount} manual • {aiCount} AI
                </p>
              </div>
              <div>
                <p className="text-muted">Subject and tone</p>
                <p className="mt-1 font-medium">
                  {subject || 'General'} • {difficultyLevel} • {writingStyle}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-app bg-panel-soft p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Output notes</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <p>The first page header is now pushed below the separator line so it does not collide with answer text.</p>
              <p>Rendered pages: {pageCount || 'Not generated yet'}</p>
              <p>{sessionId ? `Session ID: ${sessionId}` : 'A session will be created after extraction.'}</p>
              {manualMissingCount > 0 && (
                <p className="text-red-600">
                  {manualMissingCount} manual answer{manualMissingCount !== 1 ? 's are' : ' is'} still empty.
                </p>
              )}
              {renderWarnings.map((warning) => (
                <p key={warning} className="text-amber-600">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
