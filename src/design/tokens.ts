export const designTokens = {
  color: {
    accent: '#e30613',
    accentStrong: '#ff3340',
    surface: '#09090b',
    raised: '#18181b',
    soft: '#27272a',
    text: '#f4f4f5',
    muted: '#a1a1aa',
    line: '#3f3f46'
  },
  breakpoint: { sm: 640, md: 768, lg: 1024, xl: 1280 },
  motion: { fast: 160, base: 280, slow: 600 },
  radius: { card: 16, control: 12 },
  zIndex: { content: 1, sticky: 20, player: 30, modal: 40 }
} as const
