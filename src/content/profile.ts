export interface SkillPosition {
  name: string
  role: 'forward' | 'midfielder' | 'defender' | 'keeper'
  note: string
  x: number
  y: number
}

export const profile = {
  name: 'Lin_eclipse',
  handle: 'AlexBybye',
  title: 'SCUT Computer Science undergraduate',
  location: 'Guangzhou',
  qqId: '244417287',
  avatar: '/images/avatar.webp',
  bio: 'I build software, study multimodal learning, and keep a record of football, music, and the places I visit.',
  github: 'https://github.com/AlexBybye',
  university: 'https://baike.baidu.com/item/%E5%8D%8E%E5%8D%97%E7%90%86%E5%B7%A5%E5%A4%A7%E5%AD%A6/134597'
} as const

export const skills: SkillPosition[] = [
  { name: 'Python', role: 'forward', note: 'Machine learning and research tooling', x: 24, y: 16 },
  { name: 'C++', role: 'forward', note: 'Algorithms and systems work', x: 50, y: 11 },
  { name: 'TypeScript', role: 'forward', note: 'Typed front-end applications', x: 76, y: 16 },
  { name: 'Vue', role: 'midfielder', note: 'Interface architecture and interaction', x: 28, y: 42 },
  { name: 'PyTorch', role: 'midfielder', note: 'Model training and experiments', x: 50, y: 36 },
  { name: 'Pinia', role: 'midfielder', note: 'Predictable client-side state', x: 72, y: 42 },
  { name: 'Linux', role: 'defender', note: 'Development and deployment environment', x: 18, y: 68 },
  { name: 'Git', role: 'defender', note: 'Versioned collaboration', x: 39, y: 72 },
  { name: 'Docker', role: 'defender', note: 'Reproducible services', x: 61, y: 72 },
  { name: 'Go', role: 'defender', note: 'Compact services and tooling', x: 82, y: 68 },
  { name: 'Ubuntu', role: 'keeper', note: 'Daily workstation and server base', x: 50, y: 89 }
]

export const interests = [
  { title: 'FC Bayern Munich', detail: 'Mia san mia', kind: 'football' },
  { title: 'Photography', detail: 'Cities, trips, and ordinary light', kind: 'camera' },
  { title: 'Running and tennis', detail: 'Training away from the screen', kind: 'sport' },
  { title: 'Post-punk and house', detail: 'A personal library that keeps growing', kind: 'music' }
] as const
