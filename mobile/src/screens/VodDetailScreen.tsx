import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import type { VodAsset } from '../../../shared/src/types/vod'
import StateHandler from '../components/StateHandler'
import { vodService } from '../services/data.service'
import { colors, spacing } from '../theme/colors'
import { formatCurrency, formatDuration } from '../utils/format'

export default function VodDetailScreen({ route }: any) {
  const { id } = route.params
  const [vod, setVod] = useState<VodAsset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setVod(await vodService.findById(id))
    } catch {
      setError('No se encontró el contenido.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const player = useVideoPlayer(null, (p) => {
    p.loop = false
  })

  useEffect(() => {
    if (vod?.videoUrl) {
      player.replace({ uri: vod.videoUrl })
      player.play()
    }
  }, [vod?.videoUrl])

  if (loading || error || !vod) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: vod.thumbUrl }} style={styles.hero} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{vod.title}</Text>
        <Text style={styles.muted}>
          {formatDuration(vod.durationSeconds)} · {vod.price === 0 ? 'Gratis' : formatCurrency(vod.price)}
        </Text>
        <Text style={styles.description}>{vod.description}</Text>

        <VideoView
          player={player}
          style={styles.player}
          nativeControls
          allowsPictureInPicture
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  hero: {
    width: '100%',
    height: 200,
    backgroundColor: colors.input,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  muted: {
    color: colors.muted,
    marginBottom: spacing.md,
  },
  description: {
    color: colors.muted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.black,
    borderRadius: 8,
  },
})