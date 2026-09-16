import { useEffect, useState } from 'react'
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { eventsService } from '../services/data.service'
import { sendDebugLog } from '../services/debug'
import { colors, radius, spacing } from '../theme/colors'
import { formatCurrency, formatViewers } from '../utils/format'

const categoryLabel: Record<string, string> = {
  sport: 'Deporte',
  racing: 'Automovilismo',
  show: 'Espectáculo',
}

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
        {item.category && (
          <View style={styles.badgeCategory}>
            <Text style={styles.badgeText}>{categoryLabel[item.category] ?? item.category}</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.cardFooter}>
            <Text style={item.price > 0 ? styles.cardPrice : styles.cardFree}>
              {item.price > 0 ? formatCurrency(item.price) : 'Gratis'}
            </Text>
            <Text style={styles.cardCams}>🎥 {item.venue.cameras.length} cámaras</Text>
          </View>
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
            <Text style={styles.title}>Viví el partido desde tu propia visión</Text>
            <Text style={styles.subtitle}>Multi-cámara, 4K y chat en vivo</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{liveEvents.length}</Text>
                <Text style={styles.statLabel}>en vivo</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatViewers(viewerCount)}</Text>
                <Text style={styles.statLabel}>espectadores</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{events.length}</Text>
                <Text style={styles.statLabel}>eventos</Text>
              </View>
            </View>
            {liveEvents[0] && (
              <TouchableOpacity
                style={styles.cta}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Watch', { id: liveEvents[0].id })}
              >
                <Text style={styles.ctaText}>Ver en vivo ahora</Text>
              </TouchableOpacity>
            )}
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primaryLight,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  ctaText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '800',
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
  badgeCategory: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(15,21,32,0.85)',
    borderWidth: 1,
    borderColor: colors.border,
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
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardPrice: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
  },
  cardFree: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
  cardCams: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})