import { useCallback, useEffect, useRef, useState } from 'react'
import { media } from '../data/weddingData'

const VOLUME = 0.6

function safePlay(audio) {
  if (!audio) return
  const p = audio.play()
  if (p && typeof p.catch === 'function') p.catch(() => {})
}

/**
 * Nút bật/tắt nhạc nền — html-box `#w-vw5iaqhx`.
 * Vị trí/hiệu ứng do `global.css` định nghĩa (`#w-vw5iaqhx` fixed góc trái
 * dưới khung 420px, `#music-toggle` tròn 56px), không set inline.
 */
export default function MusicToggle() {
  const audioRef = useRef(null)
  const hasStartedRef = useRef(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    audio.volume = VOLUME

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    // Nhạc tải từ CDN nên có thể chậm/lỗi — im lặng bỏ qua, không spam console.
    const onError = () => {}

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)

    // KHÔNG autoplay (bị trình duyệt chặn) — chỉ phát ở lần chạm đầu tiên,
    // đúng cách script gốc xử lý. `once: true` + ref để chỉ chạy một lần.
    const startOnce = () => {
      if (hasStartedRef.current) return
      hasStartedRef.current = true
      safePlay(audio)
    }
    const opts = { once: true, passive: true }
    document.addEventListener('pointerdown', startOnce, opts)
    document.addEventListener('touchstart', startOnce, opts)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      document.removeEventListener('pointerdown', startOnce, opts)
      document.removeEventListener('touchstart', startOnce, opts)
    }
  }, [])

  const toggle = useCallback((event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation()
    }
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      hasStartedRef.current = true
      safePlay(audio)
    } else {
      audio.pause()
    }
  }, [])

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault()
        toggle(e)
      }
    },
    [toggle],
  )

  return (
    <div id="w-vw5iaqhx" className="com-html-box p-absolute">
      <audio
        id="background-music"
        src={media.backgroundMusic}
        preload="none"
        loop
        ref={audioRef}
      />
      <div
        id="music-toggle"
        className={playing ? 'vibrating' : ''}
        onClick={toggle}
        onKeyDown={onKeyDown}
        title="Bật / Tắt nhạc"
        role="button"
        aria-label="Bật hoặc tắt nhạc nền"
        aria-pressed={playing}
        tabIndex={0}
      >
        <img
          id="play-icon"
          src={media.musicOffIcon}
          alt="Play"
          width="44"
          height="44"
          decoding="async"
          loading="lazy"
          style={{ display: playing ? 'none' : 'block' }}
        />
        <img
          id="pause-icon"
          src={media.musicOnIcon}
          alt="Pause"
          width="44"
          height="44"
          decoding="async"
          loading="lazy"
          style={{ display: playing ? 'block' : 'none' }}
        />
      </div>
    </div>
  )
}
