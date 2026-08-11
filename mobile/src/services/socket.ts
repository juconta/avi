import { io, Socket } from 'socket.io-client'

const socketUrl = 'http://192.168.0.9:4000'

let socket: Socket | null = null

export interface ChatMessage {
  id: string
  eventId: string
  userId: string
  userName: string
  text: string
  sentAt: string
}

export function connectSocket(
  eventId: string,
  handlers: {
    onMessage?: (msg: ChatMessage) => void
    onViewers?: (payload: { eventId: string; count: number }) => void
  },
): Socket {
  socket = io(socketUrl, {
    query: { eventId },
    transports: ['websocket'],
  })

  socket.on('chat:message', (msg: ChatMessage) => handlers.onMessage?.(msg))
  socket.on('viewers:count', (payload: { eventId: string; count: number }) =>
    handlers.onViewers?.(payload),
  )

  return socket
}

export function sendChat(text: string) {
  socket?.emit('chat', { text })
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
