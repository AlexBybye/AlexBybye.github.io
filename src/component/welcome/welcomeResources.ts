const resourceUrl = (fileName: string) => `${import.meta.env.BASE_URL}resources/${encodeURIComponent(fileName)}`

export const welcomeResources = {
  gifs: {
    // 专属 GIF：分配到各自的界面
    musiala: {
      src: resourceUrl('Musiala.gif'),
      alt: 'Jamal Musiala dribbling animation',
    },
    kimmich: {
      src: resourceUrl('Kimmich.gif'),
      alt: 'Joshua Kimmich in action animation',
    },
    olise: {
      src: resourceUrl('Olise.gif'),
      alt: 'Michael Olise celebration animation',
    },
    // 自由组合 GIF：随意分配到任意界面
    kane: {
      src: resourceUrl('Kane.gif'),
      alt: 'Harry Kane Bayern Munich animation',
    },
    muller: {
      src: resourceUrl('Muller.gif'),
      alt: 'Thomas Müller Bayern Munich animation',
    },
    kompany: {
      src: resourceUrl('Kompany.gif'),
      alt: 'Vincent Kompany Bayern Munich animation',
    },
    neuer: {
      src: resourceUrl('Neuer.gif'),
      alt: 'Manuel Neuer Bayern Munich animation',
    },
  },
  photos: {
    teamUcl: {
      src: resourceUrl('bayern_team_UCL.jpg'),
      alt: 'Bayern Munich team lineup in Champions League',
    },
    musiala: {
      src: resourceUrl('Musiala.jpg'),
      alt: 'Jamal Musiala dribbling past a defender in Champions League',
    },
    kimmich: {
      src: resourceUrl('Kimmich.jpg'),
      alt: 'Joshua Kimmich commanding a set piece',
    },
    diaz: {
      src: resourceUrl('Diaz.jpg'),
      alt: 'Luis Diaz driving forward with the ball',
    },
    olise: {
      src: resourceUrl('Olise.jpg'),
      alt: 'Michael Olise celebrating a goal',
    },
  },
}

// ----------------------------------------------------------------------------
// 类型定义：描述 resources/welcomeShowcase.json 的结构，以及解析后的运行时数据
// ----------------------------------------------------------------------------
export interface MediaAsset {
  src: string
  alt: string
}

type GifKey = keyof typeof welcomeResources.gifs
type PhotoKey = keyof typeof welcomeResources.photos

export interface ShowcaseTiming {
  /** 每个页面停留时长（毫秒） */
  panelDurationMs: number
  /** 整个 Animation2 强制跳转的总时长（毫秒） */
  totalDurationMs: number
}

/** 复用样式模板：批量增删页面时只需引用 red / black 两种风格 */
export interface ShowcaseStyle {
  tone: string
  direction: 'to-right' | 'to-left'
  accent: string
}

/** JSON 中单个页面的原始定义（仅存 key，运行时再解析成资源） */
interface RawShowcasePanel {
  id: string
  style: string
  kicker: string
  title: string
  body: string
  stat: string
  heroPhoto: PhotoKey
  photos: PhotoKey[]
  gifs: GifKey[]
}

/** JSON 顶层结构 */
export interface RawShowcaseConfig {
  timing: ShowcaseTiming
  styles: Record<string, ShowcaseStyle>
  panels: RawShowcasePanel[]
}

/** 解析后的页面：样式已展开、资源 key 已替换为 { src, alt } */
export interface ShowcasePanel {
  id: string
  tone: string
  direction: 'to-right' | 'to-left'
  accent: string
  kicker: string
  title: string
  body: string
  stat: string
  heroImage: MediaAsset
  photos: MediaAsset[]
  gifs: MediaAsset[]
}

export interface ShowcaseConfig {
  timing: ShowcaseTiming
  panels: ShowcasePanel[]
  resources: MediaAsset[]
}

/** JSON 配置文件地址（放在 public/resources 下，可独立增删内容） */
export const welcomeShowcaseConfigUrl = `${import.meta.env.BASE_URL}resources/welcomeShowcase.json`

/**
 * 将 JSON 原始配置解析成运行时可直接渲染的数据：
 * - 按 style key 展开 red / black 样式模板
 * - 将 photo / gif 的 key 替换为实际的 { src, alt }
 * - 汇总去重后的资源列表供底部 resource-rail 使用
 */
export function resolveShowcaseConfig(raw: RawShowcaseConfig): ShowcaseConfig {
  const panels: ShowcasePanel[] = raw.panels.map((panel) => {
    const style = raw.styles[panel.style]
    if (!style) {
      throw new Error(`Unknown showcase style "${panel.style}" for panel "${panel.id}"`)
    }

    return {
      id: panel.id,
      tone: style.tone,
      direction: style.direction,
      accent: style.accent,
      kicker: panel.kicker,
      title: panel.title,
      body: panel.body,
      stat: panel.stat,
      heroImage: welcomeResources.photos[panel.heroPhoto],
      photos: panel.photos.map((key) => welcomeResources.photos[key]),
      gifs: panel.gifs.map((key) => welcomeResources.gifs[key]),
    }
  })

  const seen = new Set<string>()
  const resources: MediaAsset[] = []
  for (const panel of panels) {
    for (const asset of [...panel.gifs, ...panel.photos]) {
      if (!seen.has(asset.src)) {
        seen.add(asset.src)
        resources.push(asset)
      }
    }
  }

  return { timing: raw.timing, panels, resources }
}

/** 加载并解析 JSON 配置（运行时 fetch，便于内容与代码解耦） */
export async function loadShowcaseConfig(): Promise<ShowcaseConfig> {
  const response = await fetch(welcomeShowcaseConfigUrl)
  if (!response.ok) {
    throw new Error(`Failed to load welcome showcase config: ${response.status}`)
  }
  const raw = (await response.json()) as RawShowcaseConfig
  return resolveShowcaseConfig(raw)
}
