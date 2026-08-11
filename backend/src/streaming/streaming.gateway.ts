import { Logger } from '@nestjs/common'
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { StreamingService } from './streaming.service'

interface ClientRoom {
  eventId: string
  userName: string
}

@WebSocketGateway({ cors: { origin: '*' } })
export class StreamingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(StreamingGateway.name)
  private readonly clientRooms = new Map<string, ClientRoom>()

  @WebSocketServer()
  server: Server

  constructor(private readonly streamingService: StreamingService) {}

  handleConnection(client: Socket) {
    const eventId = client.handshake.query.eventId as string | undefined
    if (eventId) {
      void client.join(`event:${eventId}`)
      this.clientRooms.set(client.id, { eventId, userName: 'Anónimo' })
      this.logger.log(`Cliente ${client.id} conectado al evento ${eventId}`)
      this.broadcastViewerCount(eventId)
    }
  }

  handleDisconnect(client: Socket) {
    const room = this.clientRooms.get(client.id)
    if (room) {
      this.logger.log(`Cliente ${client.id} desconectado del evento ${room.eventId}`)
      this.broadcastViewerCount(room.eventId)
    }
    this.clientRooms.delete(client.id)
  }

  handleChat(client: Socket, payload: { text: string }) {
    const room = this.clientRooms.get(client.id)
    if (!room || !payload.text?.trim()) return

    const trimmed = payload.text.trim().slice(0, 300)
    void this.streamingService
      .sendChat({ eventId: room.eventId, userId: 'guest', userName: room.userName, text: trimmed })
      .then((msg) => this.server.to(`event:${room.eventId}`).emit('chat:message', msg))
  }

  private async broadcastViewerCount(eventId: string) {
    const count = await this.streamingService.viewerCount(eventId)
    this.server.to(`event:${eventId}`).emit('viewers:count', { eventId, count })
  }
}
