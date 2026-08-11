import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ChatMessage, StreamSession } from '../storage/entities/stream-session.entity'
import { CHAT_REPO, STREAM_SESSION_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'

@Injectable()
export class StreamingService {
  constructor(
    @Inject(STREAM_SESSION_REPO) private readonly sessionRepo: CrudRepository<StreamSession>,
    @Inject(CHAT_REPO) private readonly chatRepo: CrudRepository<ChatMessage>,
    private readonly jwtService: JwtService,
  ) {}

  async join(eventId: string, userId: string): Promise<StreamSession> {
    const session: StreamSession = {
      id: crypto.randomUUID(),
      userId,
      eventId,
      token: this.jwtService.sign({ eventId, userId, purpose: 'stream' }, { expiresIn: '6h' }),
      status: 'active',
      joinedAt: new Date(),
      viewerCount: 1,
    }
    return this.sessionRepo.create(session)
  }

  async leave(id: string): Promise<StreamSession | undefined> {
    return this.sessionRepo.update(id, { status: 'ended', leftAt: new Date() })
  }

  async sendChat(message: Omit<ChatMessage, 'id' | 'sentAt'>): Promise<ChatMessage> {
    const msg: ChatMessage = { ...message, id: crypto.randomUUID(), sentAt: new Date() }
    return this.chatRepo.create(msg)
  }

  async history(eventId: string): Promise<ChatMessage[]> {
    const messages = await this.chatRepo.findAll()
    return messages
      .filter((m) => m.eventId === eventId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
  }

  async viewerCount(eventId: string): Promise<number> {
    const sessions = await this.sessionRepo.findAll()
    return sessions.filter((s) => s.eventId === eventId && s.status === 'active').length
  }

  verifyStreamToken(token: string): { eventId: string; userId: string } {
    try {
      return this.jwtService.verify(token)
    } catch {
      throw new UnauthorizedException('Token de streaming inválido o expirado')
    }
  }
}
