import { useEffect, useState } from 'react'
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { eventsService } from '../services/data.service'
import { sendDebugLog } from '../services/debug'
import { colors, radius, spacing } from '../theme/colors'
import { formatViewers } from '../utils/format'

export default function HomeScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      sendDebugLog('LOAD_EVENTS inicio')
      const data = await eventsService.findAll()
      sendDebugLog(`LOAD_EVENTS ok count=${data.length} isArray=${Array.isArray(data)}`)
      setEvents(data)
      setError(null)
    } catch (e: any) {
      sendDebugLog(`LOAD_EVENTS error=${e?.message} code=${e?.code} resp=${e?.response?.status}`)
      setError('No se pudieron cargar los eventos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const liveEvents = events.filter((e) => e.status === 'live')
  const viewerCount = liveEvents.length > 0 ? liveEvents.reduce((sum, e) => sum + (e.viewers ?? 0), 0) : 0

  const renderCategory = ({ item }: { item: Event }) => {
    const isLive = item.status === 'live'
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('EventDetail', { id: item.id })}
      >
        <Image source={{ uri: item.coverImage }} style={styles.cardImage} resizeMode="cover" />
        {isLive && (
          <View style={styles.badgeLive}>
            <Text style={styles.badgeText}>EN VIVO</Text>
          </View>
        )}
        {item.viewers != null && item.viewers > 0 && (
          <View style={styles.badgeViewers}>
            <Text style={styles.badgeViewersText}>👁 {formatViewers(item.viewers)}</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <StateHandler loading={loading} error={error}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderCategory}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Elige tu deporte</Text>
            <Text style={styles.subtitle}>{events.length} eventos en vivo • Transmisión 4K HD</Text>
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
  row: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    maxWidth: '48%',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.input,
  },
  badgeLive: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeViewers: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeViewersText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
