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
];
