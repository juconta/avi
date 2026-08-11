import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import type { Payment } from '../../../shared/src/types/payment'
import StateHandler from '../components/StateHandler'
import { paymentsService } from '../services/data.service'
import { colors, spacing } from '../theme/colors'
import { formatCurrency, formatDateTime } from '../utils/format'

export default function CheckoutScreen() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setPayments(await paymentsService.findAll())
    } catch {
      setError('No se pudieron cargar tus compras.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success
      case 'pending':
        return colors.warning
      case 'refunded':
        return colors.muted
      default:
        return colors.danger
    }
  }

  return (
    <StateHandler loading={loading} error={error}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Mis compras</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Aún no tienes compras.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.event}>Evento: {item.eventId}</Text>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
            <View style={styles.row}>
              <Text style={[styles.status, { color: statusColor(item.status) }]}>{item.status}</Text>
              <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
            </View>
          </View>
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  event: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  date: {
    color: colors.muted,
    fontSize: 13,
  },
  empty: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
