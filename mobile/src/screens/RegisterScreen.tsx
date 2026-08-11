import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { colors, radius, spacing } from '../theme/colors'

export default function RegisterScreen() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Error', 'Completa todos los campos (mínimo 6 caracteres).')
      return
    }
    setSubmitting(true)
    try {
      await register(name.trim(), email.trim(), password)
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Únete a la experiencia AVI</Text>

      <FormField label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
      <FormField label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" />
      <FormField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />

      <Pressable style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Creando…' : 'Crear cuenta'}</Text>
      </Pressable>
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
})
