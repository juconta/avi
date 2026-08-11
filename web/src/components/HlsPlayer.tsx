import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

interface Props {
  src: string
  poster?: string
  autoPlay?: boolean
}

export default function HlsPlayer({ src, poster, autoPlay = true }: Props) {
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
    }

    if (autoPlay) {
      video.play().catch(() => {
        /* autoplay bloqueado por el navegador */
      })
    }

    return () => hls?.destroy()
  }, [src])

  return (
    <video
      ref={videoRef}
      controls
      autoPlay={autoPlay}
      poster={poster}
      playsInline
      style={{ width: '100%', borderRadius: 8, backgroundColor: '#000' }}
    />
  )
}
