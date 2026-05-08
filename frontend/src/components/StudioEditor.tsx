import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  Download,
  Grip,
  Layers3,
  Move,
  Plus,
  Trash2,
  Type,
} from 'lucide-react';

interface TextBox {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  text: string;
  fontSize: number;
}

interface StudioEditorProps {
  previewImages: string[];
  pageCount: number;
  downloadUrl: string;
  name: string;
  subject: string;
}

export function StudioEditor({
  previewImages,
  pageCount,
  downloadUrl,
  name,
  subject,
}: StudioEditorProps) {
  const [selectedPage, setSelectedPage] = useState(0);
  const [boxes, setBoxes] = useState<TextBox[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const dragState = useRef<{ id: string; startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const boxesForPage = useMemo(
    () => boxes.filter((box) => box.pageIndex === selectedPage),
    [boxes, selectedPage],
  );

  const selectedBox = boxes.find((box) => box.id === selectedBoxId) ?? null;

  const addTextBox = () => {
    const id = `textbox-${Date.now()}`;
    const nextBox: TextBox = {
      id,
      pageIndex: selectedPage,
      x: 12,
      y: 18,
      width: 32,
      text: 'New note',
      fontSize: 18,
    };
    setBoxes((current) => [...current, nextBox]);
    setSelectedBoxId(id);
  };

  const updateSelectedBox = (patch: Partial<TextBox>) => {
    if (!selectedBoxId) return;
    setBoxes((current) => current.map((box) => (box.id === selectedBoxId ? { ...box, ...patch } : box)));
  };

  const removeSelectedBox = () => {
    if (!selectedBoxId) return;
    setBoxes((current) => current.filter((box) => box.id !== selectedBoxId));
    setSelectedBoxId(null);
  };

  const startDragging = (event: ReactPointerEvent<HTMLDivElement>, box: TextBox) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      id: box.id,
      startX: event.clientX,
      startY: event.clientY,
      baseX: box.x,
      baseY: box.y,
    };
    setSelectedBoxId(box.id);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;

    const container = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - dragState.current.startX) / container.width) * 100;
    const deltaY = ((event.clientY - dragState.current.startY) / container.height) * 100;

    setBoxes((current) =>
      current.map((box) =>
        box.id === dragState.current?.id
          ? {
              ...box,
              x: Math.max(0, Math.min(90, dragState.current.baseX + deltaX)),
              y: Math.max(0, Math.min(92, dragState.current.baseY + deltaY)),
            }
          : box,
      ),
    );
  };

  const stopDragging = () => {
    dragState.current = null;
  };

  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 xl:grid-cols-[320px_minmax(0,1fr)_340px] lg:px-8">
        <section className="surface-panel h-fit p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Generated pages</p>
          <h2 className="mt-3 font-display text-3xl">Studio pages</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Generated page previews are now the main studio canvas. Pick a page and add overlay text boxes anywhere you
            want.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-app bg-panel-soft px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{name || 'Unnamed assignment'}</p>
              <p className="text-xs text-muted">{subject || 'General subject'}</p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-contrast">
              {pageCount} page{pageCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {previewImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedPage(index)}
                className={`w-full overflow-hidden rounded-[22px] border text-left transition-all ${
                  selectedPage === index ? 'border-[var(--accent)] shadow-[0_12px_30px_rgba(255,212,0,0.16)]' : 'border-app'
                }`}
              >
                <div className="border-b border-app px-4 py-3 text-sm font-semibold">Page {index + 1}</div>
                <img src={image} alt={`Generated page ${index + 1}`} className="aspect-[4/5] w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </section>

        <section className="surface-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-app px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Editor studio</p>
              <h2 className="mt-1 font-display text-3xl">Arrange text directly on the page</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addTextBox}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-contrast"
              >
                <Plus className="h-4 w-4" />
                Add text box
              </button>
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 rounded-2xl border border-app bg-panel px-4 py-3 text-sm font-semibold"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </div>
          </div>

          <div className="bg-[#111111] p-5">
            <div className="mx-auto max-w-[920px] rounded-[28px] border border-black/15 bg-[#0b0b0b] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
              <div
                className="relative mx-auto aspect-[4/5] max-w-[680px] overflow-hidden rounded-[22px] bg-white"
                onPointerMove={handlePointerMove}
                onPointerUp={stopDragging}
                onPointerLeave={stopDragging}
              >
                {previewImages[selectedPage] && (
                  <img
                    src={previewImages[selectedPage]}
                    alt={`Studio page ${selectedPage + 1}`}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                )}

                {boxesForPage.map((box) => (
                  <div
                    key={box.id}
                    className={`absolute rounded-xl border px-3 py-2 shadow-lg ${
                      box.id === selectedBoxId ? 'border-[#ffd400] bg-[#fff4a3]/90' : 'border-black/10 bg-white/90'
                    }`}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                    }}
                    onPointerDown={(event) => startDragging(event, box)}
                    onClick={() => setSelectedBoxId(box.id)}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/55">
                      <span>Text box</span>
                      <Grip className="h-3 w-3" />
                    </div>
                    <textarea
                      value={box.text}
                      onChange={(event) => {
                        const text = event.target.value;
                        setBoxes((current) =>
                          current.map((item) => (item.id === box.id ? { ...item, text } : item)),
                        );
                      }}
                      className="w-full resize-none border-none bg-transparent leading-[1.4] text-black outline-none"
                      style={{ fontSize: `${box.fontSize}px` }}
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-panel h-fit p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Advanced tools</p>
          <h3 className="mt-3 font-display text-3xl">Textbox controls</h3>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-app bg-panel-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Selected page</p>
                  <p className="text-xs text-muted">Page {selectedPage + 1}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-app bg-panel-soft p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-contrast">
                  <Type className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Text box count</p>
                  <p className="text-xs text-muted">{boxesForPage.length} on this page</p>
                </div>
              </div>
            </div>

            {selectedBox ? (
              <div className="space-y-4 rounded-[24px] border border-app bg-panel p-4">
                <div>
                  <p className="text-sm font-semibold">Edit selected box</p>
                  <p className="mt-1 text-xs text-muted">Drag the box on the canvas or tune it here.</p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Width</span>
                  <input
                    type="range"
                    min="16"
                    max="70"
                    value={selectedBox.width}
                    onChange={(event) => updateSelectedBox({ width: Number(event.target.value) })}
                    className="w-full"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Font size</span>
                  <input
                    type="range"
                    min="12"
                    max="34"
                    value={selectedBox.fontSize}
                    onChange={(event) => updateSelectedBox({ fontSize: Number(event.target.value) })}
                    className="w-full"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateSelectedBox({ x: Math.max(0, selectedBox.x - 2) })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app bg-panel-soft px-4 py-3 text-sm font-semibold"
                  >
                    <Move className="h-4 w-4" />
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedBox({ x: Math.min(90, selectedBox.x + 2) })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app bg-panel-soft px-4 py-3 text-sm font-semibold"
                  >
                    <Move className="h-4 w-4" />
                    Right
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedBox({ y: Math.max(0, selectedBox.y - 2) })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app bg-panel-soft px-4 py-3 text-sm font-semibold"
                  >
                    <Move className="h-4 w-4" />
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedBox({ y: Math.min(92, selectedBox.y + 2) })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-app bg-panel-soft px-4 py-3 text-sm font-semibold"
                  >
                    <Move className="h-4 w-4" />
                    Down
                  </button>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedBox}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove text box
                </button>
              </div>
            ) : (
              <div className="rounded-[24px] border border-app bg-panel p-4 text-sm text-muted">
                Add a text box, click it, then drag or resize it from here.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
