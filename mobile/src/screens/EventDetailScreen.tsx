import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { useAuth } from '../context/AuthContext'
import { eventsService } from '../services/data.service'
import { colors, radius, spacing } from '../theme/colors'
import { formatDateTime } from '../utils/format'

const categoryLabel: Record<string, string> = {
  sport: 'Deporte',
  racing: 'Automovilismo',
  show: 'Espectáculo',
}

export default function EventDetailScreen({ route, navigation }: any) {
  const { id } = route.params
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await eventsService.findById(id)
      setEvent(data)
    } catch {
      setError('No se encontró el evento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.coverImage }} style={styles.hero} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.muted}>{formatDateTime(event.scheduledAt)} · {event.durationMinutes} min</Text>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{categoryLabel[event.category] ?? event.category}</Text>
          </View>
          {event.sport && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{event.sport}</Text>
            </View>
          )}
          {event.venue.cameras.length > 0 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{event.venue.cameras.length} cámaras</Text>
            </View>
          )}
        </View>

        <Text style={styles.description}>{event.description}</Text>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Watch', { id: event.id })}>
          <Text style={styles.buttonText}>
            {event.status === 'live' ? 'Ver en vivo' : event.status === 'ended' ? 'Ver repetición' : 'Ver'}
          </Text>
        </Pressable>

        {!user && <Text style={styles.loginHint}>Inicia sesión para chatear en vivo.</Text>}
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
    height: 220,
    backgroundColor: colors.input,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  muted: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: colors.muted,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loginHint: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
})
