import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Event } from '../../../shared/src/types/event'
import { colors, radius, spacing } from '../theme/colors'
import { formatDateTime, formatCurrency } from '../utils/format'

const categoryLabel: Record<string, string> = {
  sport: 'Deporte',
  racing: 'Automovilismo',
  show: 'Espectáculo',
}

interface Props {
  event: Event
  onPress: (event: Event) => void
}

export default function EventCard({ event, onPress }: Props) {
  const isLive = event.status === 'live'

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(event)} activeOpacity={0.8}>
      <Image source={{ uri: event.coverImage }} style={styles.image} resizeMode="cover" />
      {isLive && (
        <View style={styles.badgeLive}>
          <Text style={styles.badgeText}>EN VIVO</Text>
        </View>
      )}
      <View style={styles.badgeCategory}>
        <Text style={styles.badgeText}>{categoryLabel[event.category] ?? event.category}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.muted}>{formatDateTime(event.scheduledAt)}</Text>
        <View style={styles.footer}>
          <Text style={styles.free}>{event.price === 0 ? 'Gratis' : formatCurrency(event.price)}</Text>
          <Text style={styles.muted}>{event.durationMinutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
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
  badgeCategory: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(15,17,21,0.8)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  free: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 15,
  },
})
