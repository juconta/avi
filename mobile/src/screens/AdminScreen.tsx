import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import StateHandler from '../components/StateHandler'
import api from '../services/api'
import { colors, radius, spacing } from '../theme/colors'

interface Summary {
  totalUsers: number
  totalEvents: number
  liveEvents: number
  totalPayments: number
  totalRevenue: number
  totalVodAssets: number
  totalViewers: number
}

export default function AdminScreen() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const { data } = await api.get<Summary>('/reports/summary')
      setSummary(data)
      setError(null)
    } catch {
      setError('No se pudieron cargar los reportes.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const stats = [
    { label: 'Ingresos', value: `$${(summary?.totalRevenue ?? 0).toFixed(2)}` },
    { label: 'Pagos', value: String(summary?.totalPayments ?? 0) },
    { label: 'Eventos', value: String(summary?.totalEvents ?? 0) },
    { label: 'En vivo', value: String(summary?.liveEvents ?? 0) },
    { label: 'VOD', value: String(summary?.totalVodAssets ?? 0) },
    { label: 'Espectadores', value: String(summary?.totalViewers ?? 0) },
  ]

  return (
    <StateHandler loading={loading} error={error}>
      <FlatList
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Panel de administración</Text>}
        data={stats}
        keyExtractor={(item) => item.label}
        numColumns={2}
        columnWrapperStyle={styles.statsRow}
        renderItem={({ item }) => (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load() }} tintColor={colors.primary} />
        }
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
  statsRow: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
})
