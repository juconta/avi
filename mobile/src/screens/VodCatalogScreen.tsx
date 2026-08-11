import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import type { VodAsset } from '../../../shared/src/types/vod'
import StateHandler from '../components/StateHandler'
import { vodService } from '../services/data.service'
import { colors, radius, spacing } from '../theme/colors'
import { formatCurrency, formatDuration } from '../utils/format'
import { Image, Pressable } from 'react-native'

export default function VodCatalogScreen({ navigation }: any) {
  const [vods, setVods] = useState<VodAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await vodService.findAll()
      setVods(data)
      setError(null)
    } catch {
      setError('No se pudo cargar el catálogo.')
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
        data={vods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('VodDetail', { id: item.id })}>
            <Image source={{ uri: item.thumbUrl }} style={styles.image} resizeMode="cover" />
            <View style={styles.body}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.muted}>{formatDuration(item.durationSeconds)}</Text>
              <Text style={styles.price}>{item.price === 0 ? 'Gratis' : formatCurrency(item.price)}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Catálogo VOD</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No hay contenido disponible.</Text>}
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
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  image: {
    width: 120,
    aspectRatio: 16 / 9,
    backgroundColor: colors.input,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
