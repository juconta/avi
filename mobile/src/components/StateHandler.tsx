import { ReactNode } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'

interface Props {
  loading?: boolean
  error?: string | null
  children?: ReactNode
  onRetry?: () => void
}

export default function StateHandler({ loading, error, children }: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Cargando…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  muted: {
    color: colors.muted,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
})
