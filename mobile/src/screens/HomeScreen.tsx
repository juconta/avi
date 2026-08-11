import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import EventCard from '../components/EventCard'
import StateHandler from '../components/StateHandler'
import { eventsService } from '../services/data.service'
import { colors, spacing } from '../theme/colors'

export default function HomeScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await eventsService.findAll()
      setEvents(data)
      setError(null)
    } catch {
      setError('No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
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
        renderItem={({ item }) => (
          <EventCard event={item} onPress={(event) => navigation.navigate('EventDetail', { id: event.id })} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Eventos</Text>
            <Text style={styles.subtitle}>Elige tu asiento virtual</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No hay eventos disponibles.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load() }} tintColor={colors.primary} />}
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
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    marginTop: 2,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
