export type TemplateId = 'ruled' | 'double-ruled' | 'blank' | 'notebook' | 'graph' | 'dotted';
export type FontId = 'caveat' | 'dancing' | 'patrick' | 'indie' | 'kalam' | 'shadows';

export interface TemplateOption {
  id: TemplateId;
  name: string;
  description: string;
  bestFor: string;
}

export interface FontOption {
  id: FontId;
  name: string;
  family: string;
  sampleClassName: string;
  personality: string;
  note: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'ruled',
    name: 'Exam Ruled',
    description: 'Clean horizontal ruling with a natural writing lane.',
    bestFor: 'Best for most theory assignments.',
  },
  {
    id: 'double-ruled',
    name: 'Margin Ruled',
    description: 'Classic school sheet with a left margin guide.',
    bestFor: 'Best for formal submissions and notebooks.',
  },
  {
    id: 'blank',
    name: 'Blank Sheet',
    description: 'Plain white page for diagrams or free-form writing.',
    bestFor: 'Best for custom layouts and sketch-heavy answers.',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    description: 'Spiral-style page with tighter college ruling.',
    bestFor: 'Best for everyday classwork feel.',
  },
  {
    id: 'graph',
    name: 'Graph Paper',
    description: 'Square grid spacing for calculations and plots.',
    bestFor: 'Best for math, stats, and engineering work.',
  },
  {
    id: 'dotted',
    name: 'Dotted Grid',
    description: 'Soft dot grid with minimal visual distraction.',
    bestFor: 'Best for polished notes with open spacing.',
  },
];

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'caveat',
    name: 'Caveat',
    family: '"Caveat", "Comic Sans MS", cursive',
    sampleClassName: 'font-handwriting-caveat',
    personality: 'Loose, quick, student-like handwriting.',
    note: 'Great default when you want natural energy.',
  },
  {
    id: 'dancing',
    name: 'Dancing Script',
    family: '"Dancing Script", "Comic Sans MS", cursive',
    sampleClassName: 'font-handwriting-dancing',
    personality: 'Curvier strokes with a more elegant baseline.',
    note: 'Works well for neat presentation-heavy assignments.',
  },
  {
    id: 'patrick',
    name: 'Patrick Hand',
    family: '"Patrick Hand", "Comic Sans MS", cursive',
    sampleClassName: 'font-handwriting-patrick',
    personality: 'Friendly round forms and strong readability.',
    note: 'Best when you want clean, simple handwriting.',
  },
  {
    id: 'indie',
    name: 'Indie Flower',
    family: '"Indie Flower", "Comic Sans MS", cursive',
    sampleClassName: 'font-handwriting-indie',
    personality: 'Light and airy with soft spacing.',
    note: 'Good for casual homework styling.',
  },
  {
    id: 'kalam',
    name: 'Kalam',
    family: '"Kalam", "Comic Sans MS", cursive',
    sampleClassName: 'font-handwriting-kalam',
    personality: 'Sharp, compact handwriting with firmer rhythm.',
    note: 'Best for denser answers without losing readability.',
  },
  {
    id: 'shadows',
    name: 'Shadows Into Light',
    family: '"Shadows Into Light", "Comic Sans MS", cursive',
    sampleClassName: 'font-handwriting-shadows',
    personality: 'Tall strokes with lots of personality.',
    note: 'Best when you want a more expressive handwritten look.',
  },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Simple', desc: 'Short, easy-to-follow answers.' },
  { value: 'intermediate', label: 'Balanced', desc: 'Good depth without sounding robotic.' },
  { value: 'advanced', label: 'Detailed', desc: 'Longer, more academic explanations.' },
] as const;

export const WRITING_STYLE_OPTIONS = [
  { value: 'casual', label: 'Natural', desc: 'Reads like a genuine student answer.' },
  { value: 'formal', label: 'Formal', desc: 'Cleaner structure and restrained tone.' },
  { value: 'academic', label: 'Scholarly', desc: 'More analysis, terminology, and structure.' },
  { value: 'creative', label: 'Expressive', desc: 'More examples and personality in the answer.' },
] as const;
