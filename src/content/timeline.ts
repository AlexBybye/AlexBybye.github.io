export interface Milestone {
  year: string
  title: string
  description: string
}

export const milestones: Milestone[] = [
  {
    year: '2023',
    title: 'Third prize in NECCS',
    description: 'Awarded third prize in the National English Competition for College Students.'
  },
  {
    year: '2024',
    title: 'Chair of the SCUT-Huawei student community',
    description: 'Led technical events and student activities for the Intelligent Base community.'
  },
  {
    year: '2024',
    title: 'Third prizes in APMCM and ETIC',
    description: 'Awarded third prize in APMCM and the ETIC English public speaking contest.'
  },
  {
    year: '2025',
    title: 'Second prize in MCM/ICM',
    description: 'Worked with a team on an interdisciplinary mathematical modeling project.'
  },
  {
    year: '2025',
    title: 'LLM paper and multimodal patent',
    description: 'Second author of an LLM paper under review and contributor to a pending patent on multimodal learning.'
  }
]

export const worldieSupport = {
  baseCount: 188,
  storageKey: 'about-worldie-support-count-v2',
  buttonLabel: '助攻作者一脚世界波',
  persistedNote: '计数保存在当前浏览器。',
  sessionNote: '当前无法保存计数，刷新后会重置。'
} as const
