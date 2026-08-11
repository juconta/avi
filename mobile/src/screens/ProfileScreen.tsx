import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { colors, radius, spacing } from '../theme/colors'

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth()

  const onLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => void logout() },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user?.name ?? '?')[0]?.toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.muted}>{user?.email}</Text>

      {user?.role === 'admin' && (
        <Pressable style={styles.adminButton} onPress={() => navigation.navigate('Admin')}>
          <Text style={styles.adminText}>Panel de administración</Text>
        </Pressable>
      )}

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  muted: {
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  adminButton: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  adminText: {
    color: colors.black,
    fontWeight: '700',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
  },
})
