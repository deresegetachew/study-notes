export interface LessonEntry {
  href:  string;
  num:   string;
  title: string;
}

// Ordered list drives LessonLayout's auto prev/next nav — keep in sequence.
export const LESSONS: LessonEntry[] = [
  { href: '/lessons/0001-behind-the-scenes-layers-vs-passes',   num: '1', title: 'Behind the Scenes: Layers vs. Passes' },
  { href: '/lessons/0002-weights-embeddings-attention-the-room', num: '2', title: 'Vectors, Embeddings & Attention' },
  { href: '/lessons/0003-how-the-model-actually-works',         num: '3', title: 'How the Model Actually Works' },
  { href: '/lessons/0004-branching-paths-beam-search',          num: '4', title: 'Branching Paths: Beam Search' },
  { href: '/lessons/0005-why-step-by-step-works',               num: '5', title: 'Why "Think Step by Step" Works' },
];
