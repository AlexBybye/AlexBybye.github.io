export type TacticalRole = 'forward' | 'midfielder' | 'defender' | 'keeper' | 'substitute'

export interface TacticalStats {
  pac: number
  pas: number
  dri: number
  mock: true
}

export interface TacticalSkill {
  id: string
  name: string
  preferredRole: Exclude<TacticalRole, 'substitute'>
  note: string
  stats: TacticalStats
  coachNote: string
}

export interface TacticalSlot {
  id: string
  squad: 'starting' | 'bench'
  role: TacticalRole
  label: string
  x?: number
  y?: number
}

export interface TacticalAssignment {
  slotId: string
  skillId: string
}

export const tacticalSkills: TacticalSkill[] = [
  {
    id: 'python',
    name: 'Python',
    preferredRole: 'forward',
    note: 'Machine learning experiments and research scripts',
    stats: { pac: 94, pas: 91, dri: 90, mock: true },
    coachNote: '观察空当很快，拿到数据就敢直塞模型。',
  },
  {
    id: 'cpp',
    name: 'C++',
    preferredRole: 'forward',
    note: 'Algorithms and systems programming',
    stats: { pac: 86, pas: 84, dri: 93, mock: true },
    coachNote: '启动需要热身，一旦提速就很难被追回。',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    preferredRole: 'forward',
    note: 'Typed front-end development',
    stats: { pac: 92, pas: 94, dri: 91, mock: true },
    coachNote: '总能在传球前发现那个不该出现的类型。',
  },
  {
    id: 'vue',
    name: 'Vue',
    preferredRole: 'midfielder',
    note: 'Vue interfaces and component architecture',
    stats: { pac: 93, pas: 92, dri: 94, mock: true },
    coachNote: '节奏轻快，擅长把复杂界面梳理成连续配合。',
  },
  {
    id: 'pytorch',
    name: 'PyTorch',
    preferredRole: 'midfielder',
    note: 'Model training and experimentation',
    stats: { pac: 87, pas: 90, dri: 95, mock: true },
    coachNote: '训练场里最能熬的一位，实验越乱越冷静。',
  },
  {
    id: 'pinia',
    name: 'Pinia',
    preferredRole: 'midfielder',
    note: 'Client-side state management',
    stats: { pac: 89, pas: 95, dri: 88, mock: true },
    coachNote: '控球稳，队友的状态交到它脚下很少丢。',
  },
  {
    id: 'linux',
    name: 'Linux',
    preferredRole: 'defender',
    note: 'Development and deployment environments',
    stats: { pac: 84, pas: 90, dri: 92, mock: true },
    coachNote: '后场指挥官，遇到环境问题先看日志再出球。',
  },
  {
    id: 'git',
    name: 'Git',
    preferredRole: 'defender',
    note: 'Source control and team workflows',
    stats: { pac: 90, pas: 96, dri: 89, mock: true },
    coachNote: '回追能力出色，关键时刻总能找到上一版阵型。',
  },
  {
    id: 'docker',
    name: 'Docker',
    preferredRole: 'defender',
    note: 'Reproducible development environments',
    stats: { pac: 85, pas: 93, dri: 87, mock: true },
    coachNote: '把客场草皮一起装箱，换环境也能照常比赛。',
  },
  {
    id: 'go',
    name: 'Go',
    preferredRole: 'defender',
    note: 'Backend services and command-line tools',
    stats: { pac: 95, pas: 88, dri: 86, mock: true },
    coachNote: '路线直接，少做花活，但反击速度非常可靠。',
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    preferredRole: 'keeper',
    note: 'Development workstation and server OS',
    stats: { pac: 80, pas: 91, dri: 90, mock: true },
    coachNote: '守门范围覆盖日常开发与服务器，出勤率很稳。',
  },
  {
    id: 'react',
    name: 'React',
    preferredRole: 'midfielder',
    note: 'React component development',
    stats: { pac: 91, pas: 90, dri: 93, mock: true },
    coachNote: '替补席上的战术变量，上场就会重新排列组件跑位。',
  },
  {
    id: 'node',
    name: 'Node.js',
    preferredRole: 'forward',
    note: 'JavaScript services and build tools',
    stats: { pac: 93, pas: 89, dri: 88, mock: true },
    coachNote: '前后场都能接应，夜场比赛尤其活跃。',
  },
  {
    id: 'sql',
    name: 'SQL',
    preferredRole: 'defender',
    note: 'Data querying and schema design',
    stats: { pac: 82, pas: 94, dri: 91, mock: true },
    coachNote: '不抢镜，专门把散落的数据重新组织成有效进攻。',
  },
]

export const tacticalSlots: TacticalSlot[] = [
  { id: 'forward-left', squad: 'starting', role: 'forward', label: '左前锋', x: 24, y: 16 },
  { id: 'forward-center', squad: 'starting', role: 'forward', label: '中锋', x: 50, y: 11 },
  { id: 'forward-right', squad: 'starting', role: 'forward', label: '右前锋', x: 76, y: 16 },
  { id: 'midfield-left', squad: 'starting', role: 'midfielder', label: '左中场', x: 28, y: 42 },
  { id: 'midfield-center', squad: 'starting', role: 'midfielder', label: '中场', x: 50, y: 36 },
  { id: 'midfield-right', squad: 'starting', role: 'midfielder', label: '右中场', x: 72, y: 42 },
  { id: 'defender-left', squad: 'starting', role: 'defender', label: '左后卫', x: 18, y: 68 },
  {
    id: 'defender-center-left',
    squad: 'starting',
    role: 'defender',
    label: '左中卫',
    x: 39,
    y: 72,
  },
  {
    id: 'defender-center-right',
    squad: 'starting',
    role: 'defender',
    label: '右中卫',
    x: 61,
    y: 72,
  },
  { id: 'defender-right', squad: 'starting', role: 'defender', label: '右后卫', x: 82, y: 68 },
  { id: 'keeper', squad: 'starting', role: 'keeper', label: '门将', x: 50, y: 89 },
  { id: 'bench-one', squad: 'bench', role: 'substitute', label: '替补 1' },
  { id: 'bench-two', squad: 'bench', role: 'substitute', label: '替补 2' },
  { id: 'bench-three', squad: 'bench', role: 'substitute', label: '替补 3' },
]

export const initialTacticalAssignments: TacticalAssignment[] = [
  { slotId: 'forward-left', skillId: 'python' },
  { slotId: 'forward-center', skillId: 'cpp' },
  { slotId: 'forward-right', skillId: 'typescript' },
  { slotId: 'midfield-left', skillId: 'vue' },
  { slotId: 'midfield-center', skillId: 'pytorch' },
  { slotId: 'midfield-right', skillId: 'pinia' },
  { slotId: 'defender-left', skillId: 'linux' },
  { slotId: 'defender-center-left', skillId: 'git' },
  { slotId: 'defender-center-right', skillId: 'docker' },
  { slotId: 'defender-right', skillId: 'go' },
  { slotId: 'keeper', skillId: 'ubuntu' },
  { slotId: 'bench-one', skillId: 'react' },
  { slotId: 'bench-two', skillId: 'node' },
  { slotId: 'bench-three', skillId: 'sql' },
]

export const tacticalSwapCopy = {
  ready: '先选择一张技术卡，再选择它要交换的位置。拖拽同样有效。',
  vueReact: '战术变更！Vue 与 React 互换位置，前端化学反应正在升温。',
  benchPromotion: (incoming: string, outgoing: string) =>
    `${incoming} 替补登场，换下 ${outgoing}。战术变更！触发化学反应！`,
  standard: (first: string, second: string) => `${first} 与 ${second} 完成换位，阵型已重新计算。`,
  reset: '首发与替补已恢复为教练的初始安排。',
} as const
