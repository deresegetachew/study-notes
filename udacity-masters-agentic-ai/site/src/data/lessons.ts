export interface LessonEntry {
  href:  string;
  num:   string;
  title: string;
}

// Ordered list drives LessonLayout's auto prev/next nav — keep in sequence.
export const LESSONS: LessonEntry[] = [
  { href: '/lessons/0001-output-optimization-levers', num: '1.1', title: 'Output Optimization Levers' },
  { href: '/lessons/0002-persona-role',                num: '1.2', title: 'Persona / Role' },
  { href: '/lessons/0003-prompt-components',           num: '1.3', title: 'Prompt Components' },
  { href: '/lessons/0004-chain-of-thought-and-react-prompting', num: '2.1', title: 'Chain-of-Thought & ReAct Prompting' },
  { href: '/lessons/0005-behind-the-scenes-layers-vs-passes',   num: '2.2', title: 'Behind the Scenes: Layers vs. Passes' },
];
