import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { colors, radius, spacing } from '../theme/colors'

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Ingresa correo y contraseña.')
      return
    }
    setSubmitting(true)
    try {
      await login(email.trim(), password)
    } catch {
      Alert.alert('Error', 'Credenciales inválidas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Bienvenido a AVI</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <FormField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" />
      <FormField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

      <Pressable style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Entrando…' : 'Entrar'}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Regístrate</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
})
