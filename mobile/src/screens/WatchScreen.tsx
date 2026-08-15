import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import type { CameraPosition, Event } from '../../../shared/src/types/event'
import StateHandler from '../components/StateHandler'
import VenueMap, { cameraBadgeColor } from '../components/VenueMap'
import { useAuth } from '../context/AuthContext'
import { eventsService, streamingService } from '../services/data.service'
import { ChatMessage, connectSocket, disconnectSocket, sendChat } from '../services/socket'
import { colors, radius, spacing } from '../theme/colors'

const MAX_CAMERAS = 4

function CameraPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false
  })

  useEffect(() => {
    player.play()
    return () => player.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, player])

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="contain"
      nativeControls
    />
  )
}

export default function WatchScreen({ route }: any) {
  const { id } = route.params
  const { user } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [viewers, setViewers] = useState(0)
  const [input, setInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectorOpen, setSelectorOpen] = useState(false)

  const cameras = useMemo<CameraPosition[]>(() => event?.venue.cameras ?? [], [event])

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

      if (selectedIds.length === 0 && eventData.venue.cameras.length > 0) {
        setSelectedIds([eventData.venue.cameras[0].id])
      }

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
    return () => {
      disconnectSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const toggleCamera = (camera: CameraPosition) => {
    setSelectedIds((prev) => {
      if (prev.includes(camera.id)) return prev.filter((id) => id !== camera.id)
      if (prev.length >= MAX_CAMERAS) return prev
      return [...prev, camera.id]
    })
  }

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const selectedCameras = cameras.filter((c) => selectedIds.includes(c.id)).slice(0, MAX_CAMERAS)

  const submit = () => {
    if (!input.trim()) return
    sendChat(input)
    setInput('')
  }

  const isWide = selectedCameras.length > 1

  return (
    <View style={styles.container}>
      <View style={styles.videoArea}>
        <View style={styles.videoGrid}>
          {Array.from({ length: selectedCameras.length }).map((_, index) => (
            <View key={selectedCameras[index].id} style={isWide ? styles.tile : styles.tileSingle}>
              <CameraPlayer uri={selectedCameras[index].liveUrl} />
              <View style={styles.cameraTag}>
                <Text style={styles.cameraTagText}>{selectedCameras[index].label}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.camerasButton} onPress={() => setSelectorOpen(true)}>
          <Text style={styles.camerasButtonText}>
            Cámaras ({selectedCameras.length}/{MAX_CAMERAS})
          </Text>
        </Pressable>
      </View>

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

      <Modal visible={selectorOpen} animationType="slide" transparent onRequestClose={() => setSelectorOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elige tus cámaras</Text>
              <Pressable onPress={() => setSelectorOpen(false)}>
                <Text style={styles.modalClose}>Listo</Text>
              </Pressable>
            </View>

            <Text style={styles.venueName}>{event.venue.name} · {event.sport ?? ''}</Text>

            <VenueMap venue={event.venue} selectedIds={selectedIds} onToggle={toggleCamera} maxSelectable={MAX_CAMERAS} />

            <View style={styles.legend}>
              {selectedCameras.map((camera) => (
                <View key={camera.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cameraBadgeColor(camera.type) }]} />
                  <Text style={styles.legendText}>{camera.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  videoArea: {
    backgroundColor: colors.black,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  videoGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    width: '50%',
    aspectRatio: 16 / 9,
    padding: 1,
    backgroundColor: colors.black,
  },
  tileSingle: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.black,
  },
  cameraTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cameraTagText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  camerasButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  camerasButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalClose: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  venueName: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  legend: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.text,
    fontSize: 13,
  },
})