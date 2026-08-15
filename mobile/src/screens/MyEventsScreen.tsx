import { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { eventsService } from '../services/data.service'
import { colors, radius, spacing } from '../theme/colors'
import { formatDateTime } from '../utils/format'

export default function MyEventsScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setEvents(await eventsService.findAll())
    } catch {
      setError('No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <StateHandler loading={loading} error={error}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Mis eventos</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No hay eventos disponibles.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('EventDetail', { id: item.id })}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.muted}>{formatDateTime(item.scheduledAt)}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
      />
    </StateHandler>
  )
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    color: colors.primary,
    fontSize: 22,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})