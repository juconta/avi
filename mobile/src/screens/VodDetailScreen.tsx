import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { ResizeMode, Video } from 'expo-av'
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

  if (loading || error || !vod) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const isFree = vod.price === 0

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: vod.thumbUrl }} style={styles.hero} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{vod.title}</Text>
        <Text style={styles.muted}>
          {formatDuration(vod.durationSeconds)} · {isFree ? 'Gratis' : formatCurrency(vod.price)}
        </Text>
        <Text style={styles.description}>{vod.description}</Text>

        {isFree && (
          <Video
            source={{ uri: vod.videoUrl }}
            style={styles.player}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
        )}
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
