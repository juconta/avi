import { useEffect, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { ResizeMode, Video } from 'expo-av'
import type { Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import { useAuth } from '../context/AuthContext'
import { eventsService, streamingService } from '../services/data.service'
import { ChatMessage, connectSocket, disconnectSocket, sendChat } from '../services/socket'
import { colors, radius, spacing } from '../theme/colors'

export default function WatchScreen({ route }: any) {
  const { id } = route.params
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [viewers, setViewers] = useState(0)
  const [input, setInput] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [eventData, history] = await Promise.all([
        eventsService.findById(id),
        streamingService.history(id),
      ])
      setEvent(eventData)
      setMessages(history)

      void streamingService.join(id)

      connectSocket(id, {
        onMessage: (msg) => setMessages((prev) => [...prev, msg]),
        onViewers: ({ count }) => setViewers(count),
      })
    } catch {
      setError('No se pudo cargar el streaming.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    return () => disconnectSocket()
  }, [id])

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const liveUrl = event.liveUrl ?? 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

  const submit = () => {
    if (!input.trim()) return
    sendChat(input)
    setInput('')
  }

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: liveUrl }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />

      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.viewers}>{viewers} viendo</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.chat}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.messageText}>
              <Text style={styles.messageUser}>{item.userName}: </Text>
              {item.text}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyChat}>Aún no hay mensajes.</Text>}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={user ? 'Escribe un mensaje…' : 'Inicia sesión para chatear'}
            placeholderTextColor={colors.muted}
            editable={!!user}
            maxLength={300}
          />
          <Pressable style={styles.sendButton} onPress={submit} disabled={!user}>
            <Text style={styles.sendText}>Enviar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.sm,
  },
  viewers: {
    color: colors.muted,
    fontSize: 13,
  },
  chat: {
    flex: 1,
    padding: spacing.md,
  },
  message: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
  },
  messageUser: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyChat: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  sendText: {
    color: colors.white,
    fontWeight: '700',
  },
})
