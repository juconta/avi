import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface Props {
  src: string
  poster?: string
  autoPlay?: boolean
  muted?: boolean
}

export default function HlsPlayer({ src, poster, autoPlay = true, muted = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const isHls = /\.m3u8($|\?)/.test(src)
    let hls: Hls | null = null

    if (isHls && Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
    } else {
      video.src = src
      video.loop = true
    }

    const restart = () => {
      if (hls) {
        video.currentTime = 0
        hls.startLoad()
      } else {
        video.currentTime = 0
      }
      video.play().catch(() => {
        /* autoplay bloqueado por el navegador */
      })
    }
    video.addEventListener('ended', restart)

    if (autoPlay) {
      video.play().catch(() => {
        /* autoplay bloqueado por el navegador */
      })
    }

    return () => {
      video.removeEventListener('ended', restart)
      hls?.destroy()
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      controls
      autoPlay={autoPlay}
      muted={muted}
      poster={poster}
      playsInline
      style={{ width: '100%', borderRadius: 8, backgroundColor: '#000' }}
    />
  )
}
