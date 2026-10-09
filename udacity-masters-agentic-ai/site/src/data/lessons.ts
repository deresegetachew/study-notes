export interface LessonEntry {
  href:   string;
  num:    string;
  title:  string;
  course: number; // id from COURSES — groups the contents page
}

export interface Course {
  id:    number;
  title: string;
}

// Courses in the Master's program, in order. Add future courses here.
export const COURSES: Course[] = [
  { id: 1, title: 'Agentic AI' },
];

// Ordered list drives LessonLayout's auto prev/next nav — keep in sequence.
export const LESSONS: LessonEntry[] = [
  { href: '/lessons/0001-output-optimization-levers',          num: '1.1', title: 'Output Optimization Levers',         course: 1 },
  { href: '/lessons/0002-persona-role',                         num: '1.2', title: 'Persona / Role',                     course: 1 },
  { href: '/lessons/0003-prompt-components',                    num: '1.3', title: 'Prompt Components',                  course: 1 },
  { href: '/lessons/0004-chain-of-thought-and-react-prompting', num: '2.1', title: 'Chain-of-Thought & ReAct Prompting', course: 1 },
  { href: '/lessons/0005-prompt-instruction-refinement',        num: '3.1', title: 'Prompt Instruction Refinement',      course: 1 },
  { href: '/lessons/0006-ai-agents-building-blocks',            num: '4.1', title: 'AI Agents: The Building Blocks',     course: 1 },
  { href: '/lessons/0007-prompt-chaining',                      num: '4.2', title: 'Prompt Chaining',                    course: 1 },
  { href: '/lessons/0008-pydantic-structured-data',             num: '4.3', title: 'Pydantic: Structured Data for Agents', course: 1 },
  { href: '/lessons/0009-exercise-claim-triage',                num: '4.4', title: 'Exercise: Automated Claim Triage',   course: 1 },
];

// Deep dives live in the separate llms-from-scratch module; listed on the
// contents page only. hrefs are relative to that module's site root.
export const DEEP_DIVES_MODULE = 'llms-from-scratch';
export const DEEP_DIVES: Omit<LessonEntry, 'course'>[] = [
  { href: '/lessons/0001-behind-the-scenes-layers-vs-passes',   num: '1', title: 'Behind the Scenes: Layers vs. Passes' },
  { href: '/lessons/0002-weights-embeddings-attention-the-room', num: '2', title: 'Vectors, Embeddings & Attention' },
  { href: '/lessons/0003-how-the-model-actually-works',         num: '3', title: 'How the Model Actually Works' },
  { href: '/lessons/0004-branching-paths-beam-search',          num: '4', title: 'Branching Paths: Beam Search' },
  { href: '/lessons/0005-why-step-by-step-works',               num: '5', title: 'Why "Think Step by Step" Works' },
];
