import { Test } from '@nestjs/testing'
import { Server, Socket } from 'socket.io'
import { StreamingService } from './streaming.service'
import { StreamingGateway } from './streaming.gateway'

describe('StreamingGateway', () => {
  let gateway: StreamingGateway

  const streamingService = {
    sendChat: jest.fn(async (msg) => ({ ...msg, id: 'msg-1', sentAt: new Date() })),
    viewerCount: jest.fn(async () => 3),
  }

  const server = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server

  function makeClient(id: string, eventId?: string): Socket {
    return {
      id,
      handshake: { query: eventId ? { eventId } : {} },
      join: jest.fn(),
    } as unknown as Socket
  }

  const flush = () => new Promise((r) => setImmediate(r))

  beforeEach(async () => {
    jest.clearAllMocks()

    const module = await Test.createTestingModule({
      providers: [StreamingGateway, { provide: StreamingService, useValue: streamingService }],
    }).compile()

    gateway = module.get(StreamingGateway)
    gateway.server = server
  })

  describe('handleConnection', () => {
    it('debería registrar al cliente y emitir conteo de viewers', async () => {
      const client = makeClient('client-1', 'evt-1')

      gateway.handleConnection(client)
      await flush()

      expect(client.join).toHaveBeenCalledWith('event:evt-1')
      expect(streamingService.viewerCount).toHaveBeenCalledWith('evt-1')
      expect(server.to).toHaveBeenCalledWith('event:evt-1')
    })

    it('debería ignorar conexiones sin eventId', () => {
      const client = makeClient('client-2')

      gateway.handleConnection(client)
      expect(client.join).not.toHaveBeenCalled()
    })
  })

  describe('handleChat', () => {
    it('debería difundir el mensaje al room del evento', async () => {
      const client = makeClient('client-1', 'evt-1')
      gateway.handleConnection(client)

      gateway.handleChat(client, { text: '  Hola mundo  ' })
      await flush()

      expect(streamingService.sendChat).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Hola mundo' }),
      )
      expect(server.to).toHaveBeenCalledWith('event:evt-1')
    })

    it('debería ignorar mensajes vacíos', () => {
      const client = makeClient('client-1', 'evt-1')
      gateway.handleChat(client, { text: '   ' })
      expect(streamingService.sendChat).not.toHaveBeenCalled()
    })
  })

  describe('handleDisconnect', () => {
    it('debería eliminar el cliente y emitir viewers', async () => {
      const client = makeClient('client-1', 'evt-1')
      gateway.handleConnection(client)
      await flush()

      gateway.handleDisconnect(client)
      await flush()

      expect(streamingService.viewerCount).toHaveBeenCalledTimes(2)
    })
  })
})
