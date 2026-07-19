const SIU_AUDIO_SRC = '/resources/Siu.mp3'

export interface SiuAudioPlayer {
  /**
   * Unlock the media element while a user gesture is still active.
   * Use this when the audible playback will happen after an animation delay.
   */
  prime: () => Promise<boolean>
  /** Restart the SIU clip, including when it is already playing. */
  play: () => Promise<boolean>
  /** Pause and rewind the component-owned media element. */
  stop: () => void
}

interface SiuAudioOptions {
  volume?: number
}

const rewind = (audio: HTMLAudioElement) => {
  try {
    audio.currentTime = 0
  } catch {
    // Some WebKit versions reject seeking before media metadata is available.
  }
}

const attemptPlay = async (audio: HTMLAudioElement) => {
  try {
    await audio.play()
    return true
  } catch {
    // Autoplay policies and interrupted media loads reject play(); callers do
    // not need to handle those expected browser-level failures themselves.
    return false
  }
}

export const createSiuAudioPlayer = (options: SiuAudioOptions = {}): SiuAudioPlayer => {
  const volume = Math.min(1, Math.max(0, options.volume ?? 1))
  let audio: HTMLAudioElement | null = null
  let primePromise: Promise<boolean> | null = null

  const getAudio = () => {
    if (typeof Audio === 'undefined') return null

    if (!audio) {
      audio = new Audio(SIU_AUDIO_SRC)
      audio.preload = 'auto'
      audio.setAttribute('playsinline', '')
      audio.volume = volume
    }

    return audio
  }

  const prime = () => {
    const media = getAudio()
    if (!media) return Promise.resolve(false)
    if (primePromise) return primePromise

    media.muted = true
    rewind(media)

    primePromise = attemptPlay(media).then((started) => {
      media.pause()
      rewind(media)
      media.muted = false
      media.volume = volume
      return started
    })

    return primePromise
  }

  const play = async () => {
    const media = getAudio()
    if (!media) return false

    if (primePromise) await primePromise

    media.muted = false
    media.volume = volume
    rewind(media)
    return attemptPlay(media)
  }

  const stop = () => {
    if (!audio) return
    audio.pause()
    rewind(audio)
    audio.muted = false
  }

  return { prime, play, stop }
}
