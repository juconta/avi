import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native'
import type { CameraPosition, Event } from '../../../shared/src/types/event'
import HlsWebPlayer, { HlsWebPlayerHandle } from '../components/HlsWebPlayer'
import StateHandler from '../components/StateHandler'
import { useAuth } from '../context/AuthContext'
import { eventsService, streamingService } from '../services/data.service'
import { ChatMessage, connectSocket, disconnectSocket, sendChat } from '../services/socket'
import { colors, radius, spacing } from '../theme/colors'

const MAX_CAMERAS = 4
const DEFAULT_HLS = 'https://avi-zaus.onrender.com/hls/football_a/index.m3u8'

function CameraCard({
  camera,
  isSelected,
  isMain,
  onToggle,
  onPrimary,
  coverImage,
}: {
  camera: CameraPosition
  isSelected: boolean
  isMain: boolean
  onToggle: () => void
  onPrimary: () => void
  coverImage?: string
}) {
  return (
    <TouchableOpacity
      style={[styles.cameraCard, isSelected && styles.cameraCardSelected]}
      activeOpacity={0.8}
      onPress={onToggle}
    >
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={styles.cameraImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cameraImage} />
      )}
      <View style={styles.badgeLive}>
        <Text style={styles.badgeText}>EN VIVO</Text>
      </View>
      <View style={styles.badge4k}>
        <Text style={styles.badge4kText}>4K</Text>
      </View>
      <View style={styles.cameraCardBody}>
        <Text style={styles.cameraCardTitle} numberOfLines={1}>
          {camera.label}
        </Text>
        <Text style={styles.cameraCardDesc} numberOfLines={1}>
          {camera.description}
        </Text>
      </View>
      {isSelected && (
        <Pressable
          style={[styles.ctaButton, isMain && styles.ctaButtonActive]}
          onPress={onPrimary}
          disabled={isMain}
        >
          <Text style={[styles.ctaText, isMain && styles.ctaButtonActiveText]}>
            {isMain ? 'Principal' : 'Ver en pantalla principal'}
          </Text>
        </Pressable>
      )}
    </TouchableOpacity>
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
  const [mainMuted, setMainMuted] = useState(false)
  const mainPlayerRef = useRef<HlsWebPlayerHandle>(null)
  const chatScrollRef = useRef<ScrollView>(null)

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

  const toggleMute = () => {
    setMainMuted((prev) => {
      const next = !prev
      mainPlayerRef.current?.setMuted(next)
      return next
    })
  }

  const setAsPrimary = (camera: CameraPosition) => {
    Vibration.vibrate(10)
    setSelectedIds((prev) => {
      if (!prev.includes(camera.id)) return prev
      return [camera.id, ...prev.filter((id) => id !== camera.id)]
    })
  }

  if (loading || error || !event) {
    return <StateHandler loading={loading} error={error} onRetry={load} />
  }

  const selectedCameras = cameras.filter((c) => selectedIds.includes(c.id)).slice(0, MAX_CAMERAS)
  const mainCamera = selectedCameras[0]
  const mainUrl = mainCamera?.liveUrl || event.liveUrl || DEFAULT_HLS

  const submit = () => {
    if (!input.trim()) return
    sendChat(input)
    setInput('')
  }

  const matchInfo = event.title
  const liveInfo = [event.sport, viewers > 0 ? `${viewers.toLocaleString()} espectadores` : '']
    .filter(Boolean)
    .join(' • ')

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea}>
        <View style={styles.headerSection}>
          <Text style={styles.eventTitle}>{matchInfo}</Text>
          {event.status === 'live' && (
            <View style={styles.liveRow}>
              <View style={styles.badgeLiveLarge}>
                <Text style={styles.badgeText}>EN VIVO</Text>
              </View>
              <Text style={styles.liveInfo}>{liveInfo}</Text>
            </View>
          )}
        </View>

        <View style={styles.instructionSection}>
          <Text style={styles.instruction}>
            Elegí hasta {MAX_CAMERAS} cámaras para armar tu vista virtual
          </Text>
          {selectedCameras.length > 0 && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedCameras.length}/{MAX_CAMERAS} activas
              </Text>
            </View>
          )}
        </View>

        {mainCamera && (
          <View style={styles.playerSection}>
            <View style={styles.playerMain}>
              <HlsWebPlayer ref={mainPlayerRef} uri={mainUrl} muted={mainMuted} poster={event.coverImage} />
              <View style={styles.playerTag}>
                <Text style={styles.playerTagText}>{mainCamera.label}</Text>
              </View>
              <Pressable style={styles.muteButton} onPress={toggleMute}>
                <Text style={styles.muteButtonText}>
                  {mainMuted ? 'Activar sonido' : 'Silenciar'}
                </Text>
              </Pressable>
            </View>
            {selectedCameras.length > 1 && (
              <View style={styles.pipRow}>
                {selectedCameras.slice(1).map((camera) => (
                  <View key={camera.id} style={styles.pipTile}>
                    <HlsWebPlayer uri={camera.liveUrl} />
                    <View style={styles.playerTag}>
                      <Text style={styles.playerTagText}>{camera.label}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.cameraGrid}>
          {cameras.map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              isSelected={selectedIds.includes(camera.id)}
              isMain={mainCamera?.id === camera.id}
              onToggle={() => toggleCamera(camera)}
              onPrimary={() => setAsPrimary(camera)}
              coverImage={event.coverImage}
            />
          ))}
        </View>

        <View style={styles.audioSection}>
          <Text style={styles.audioLabel}>Audio disponible: Relato • Estadio • Sin comentarios</Text>
        </View>

        <View style={styles.chatSection}>
          <Text style={styles.chatTitle}>Chat en vivo</Text>
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <Text style={styles.emptyChat}>Aún no hay mensajes.</Text>
            ) : (
              messages.map((msg) => (
                <View key={msg.id} style={styles.message}>
                  <Text style={styles.messageText}>
                    <Text style={styles.messageUser}>{msg.userName}: </Text>
                    {msg.text}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>

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
  scrollArea: {
    flex: 1,
  },
  headerSection: {
    padding: spacing.md,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badgeLiveLarge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  liveInfo: {
    color: colors.muted,
    fontSize: 13,
  },
  instructionSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  instruction: {
    color: colors.muted,
    fontSize: 14,
  },
  selectedCount: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  selectedCountText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  cameraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cameraCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cameraCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cameraImage: {
    width: '100%',
    aspectRatio: 16 / 10,
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
  badge4k: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badge4kText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: '800',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cameraCardBody: {
    padding: spacing.sm,
  },
  cameraCardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  cameraCardDesc: {
    color: colors.muted,
    fontSize: 12,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700',
  },
  ctaButtonActive: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaButtonActiveText: {
    color: colors.muted,
  },
  audioSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  audioLabel: {
    color: colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  playerSection: {
    backgroundColor: colors.black,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  playerMain: {
    height: 210,
    width: '100%',
    backgroundColor: colors.black,
  },
  pipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.black,
  },
  pipTile: {
    width: '49%',
    height: 110,
    backgroundColor: colors.black,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  playerTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  playerTagText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  muteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  muteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  chatSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chatTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chatScroll: {
    maxHeight: 220,
  },
  chatContent: {
    paddingBottom: spacing.sm,
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
    backgroundColor: colors.card,
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
    color: colors.black,
    fontWeight: '700',
  },
})