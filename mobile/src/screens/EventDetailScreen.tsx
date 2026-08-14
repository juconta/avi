import { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { useAuth } from '../context/AuthContext'
import { eventsService, paymentsService } from '../services/data.service'
import { colors, radius, spacing } from '../theme/colors'
import { formatCurrency, formatDateTime } from '../utils/format'

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
  const [hasPaid, setHasPaid] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await eventsService.findById(id)
      setEvent(data)
      if (user) {
        try {
          setHasPaid(await paymentsService.hasPaid(id))
        } catch {
          setHasPaid(false)
        }
      }
    } catch {
      setError('No se encontró el evento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const buy = async () => {
    if (!event) return
    setPurchasing(true)
    try {
      await paymentsService.create(event.id, event.price)
      setHasPaid(true)
    } catch {
      setError('No se pudo procesar el pago.')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const canWatch = hasPaid || event.price === 0 || user?.role === 'admin'

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.coverImage }} style={styles.hero} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.muted}>{formatDateTime(event.scheduledAt)} · {event.durationMinutes} min</Text>
        <Text style={styles.price}>{formatCurrency(event.price)}</Text>

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

        {canWatch ? (
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('Watch', { id: event.id })}
          >
            <Text style={styles.buttonText}>
              {event.status === 'live' ? 'Ver en vivo' : event.status === 'ended' ? 'Ver repetición' : 'Ver'}
            </Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.button, purchasing && styles.buttonDisabled]} onPress={buy} disabled={purchasing}>
            <Text style={styles.buttonText}>
              {purchasing ? 'Procesando…' : `Comprar por ${formatCurrency(event.price)}`}
            </Text>
          </Pressable>
        )}

        {!user && <Text style={styles.loginHint}>Inicia sesión para comprar o ver.</Text>}
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
  price: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.md,
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
  buttonDisabled: {
    opacity: 0.6,
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
