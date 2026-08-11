import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { ChatMessage, StreamSession } from '../storage/entities/stream-session.entity'
import { CHAT_REPO, STREAM_SESSION_REPO } from '../storage/repositories/tokens'
import { StreamingService } from './streaming.service'
import { MockRepo } from '../test/mock-repo'

describe('StreamingService', () => {
  let service: StreamingService
  let sessionRepo: MockRepo<StreamSession>
  let chatRepo: MockRepo<ChatMessage>

  const jwtService = {
    sign: jest.fn(() => 'stream_token'),
    verify: jest.fn((t: string) =>
      t === 'valid' ? { eventId: 'evt-1', userId: 'u1' } : { eventId: 'evt-1', userId: 'u1' },
    ),
  }

  beforeEach(async () => {
    sessionRepo = new MockRepo<StreamSession>([])
    chatRepo = new MockRepo<ChatMessage>([])

    const module = await Test.createTestingModule({
      providers: [
        StreamingService,
        { provide: STREAM_SESSION_REPO, useValue: sessionRepo },
        { provide: CHAT_REPO, useValue: chatRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    service = module.get(StreamingService)
  })

  describe('join', () => {
    it('debería crear una sesión activa con token', async () => {
      const session = await service.join('evt-1', 'u1')

      expect(session.status).toBe('active')
      expect(session.token).toBe('stream_token')
      expect(session.eventId).toBe('evt-1')
      expect(session.viewerCount).toBe(1)
    })
  })

  describe('leave', () => {
    it('debería finalizar la sesión', async () => {
      const session = await service.join('evt-1', 'u1')
      const left = await service.leave(session.id)

      expect(left?.status).toBe('ended')
      expect(left?.leftAt).toBeInstanceOf(Date)
    })
  })

  describe('sendChat', () => {
    it('debería guardar un mensaje con timestamp', async () => {
      const msg = await service.sendChat({
        eventId: 'evt-1',
        userId: 'u1',
        userName: 'Juan',
        text: 'Hola',
      })

      expect(msg.text).toBe('Hola')
      expect(msg.sentAt).toBeInstanceOf(Date)
      expect(chatRepo.items).toHaveLength(1)
    })
  })

  describe('history', () => {
    it('debería devolver mensajes ordenados del evento', async () => {
      await service.sendChat({ eventId: 'evt-1', userId: 'u1', userName: 'A', text: '1' })
      await service.sendChat({ eventId: 'evt-1', userId: 'u2', userName: 'B', text: '2' })
      await service.sendChat({ eventId: 'evt-2', userId: 'u3', userName: 'C', text: 'otro' })

      const history = await service.history('evt-1')
      expect(history).toHaveLength(2)
      expect(history[0].text).toBe('1')
    })
  })

  describe('viewerCount', () => {
    it('debería contar sesiones activas por evento', async () => {
      await service.join('evt-1', 'u1')
      const s2 = await service.join('evt-1', 'u2')
      await service.join('evt-2', 'u3')
      await service.leave(s2.id)

      expect(await service.viewerCount('evt-1')).toBe(1)
    })
  })

  describe('verifyStreamToken', () => {
    it('debería verificar un token válido', () => {
      const payload = service.verifyStreamToken('valid')
      expect(payload.eventId).toBe('evt-1')
    })

    it('debería rechazar un token inválido', () => {
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired')
      })
      expect(() => service.verifyStreamToken('invalid')).toThrow()
    })
  })
})
