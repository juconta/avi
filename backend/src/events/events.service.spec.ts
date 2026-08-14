import { Test } from '@nestjs/testing'
import { Event, EventCategory, EventStatus, VenueKind } from '../storage/entities/event.entity'
import { EVENT_REPO } from '../storage/repositories/tokens'
import { EventsService } from './events.service'
import { MockRepo } from '../test/mock-repo'

describe('EventsService', () => {
  let service: EventsService
  let repo: MockRepo<Event>

  const now = new Date()

  function makeEvent(id: string, status: EventStatus, scheduledAt: Date): Event {
    return {
      id,
      title: `Evento ${id}`,
      description: 'Desc',
      price: 10,
      coverImage: 'img',
      streamerId: 's1',
      status,
      scheduledAt,
      durationMinutes: 60,
      category: EventCategory.SPORT,
      sport: 'Fútbol',
      venue: { kind: VenueKind.STADIUM, name: 'Estadio', cameras: [] },
      createdAt: now,
    }
  }

  beforeEach(async () => {
    repo = new MockRepo<Event>([
      makeEvent('evt-1', EventStatus.SCHEDULED, new Date(now.getTime() + 86400000)),
      makeEvent('evt-2', EventStatus.LIVE, new Date(now.getTime() - 3600000)),
      makeEvent('evt-3', EventStatus.ENDED, new Date(now.getTime() - 86400000)),
    ])

    const module = await Test.createTestingModule({
      providers: [EventsService, { provide: EVENT_REPO, useValue: repo }],
    }).compile()

    service = module.get(EventsService)
  })

  describe('findAll', () => {
    it('debería devolver todos los eventos ordenados por fecha', async () => {
      const events = await service.findAll()
      expect(events).toHaveLength(3)
      expect(events[0].id).toBe('evt-1')
    })

    it('debería filtrar por estado', async () => {
      const live = await service.findAll(EventStatus.LIVE)
      expect(live).toHaveLength(1)
      expect(live[0].id).toBe('evt-2')
    })
  })

  describe('findUpcoming', () => {
    it('debería devolver solo eventos programados', async () => {
      const upcoming = await service.findUpcoming()
      expect(upcoming).toHaveLength(1)
      expect(upcoming[0].status).toBe(EventStatus.SCHEDULED)
    })
  })

  describe('findById', () => {
    it('debería encontrar un evento existente', async () => {
      const event = await service.findById('evt-2')
      expect(event.title).toBe('Evento evt-2')
    })

    it('debería fallar si no existe', async () => {
      await expect(service.findById('nope')).rejects.toThrow('no encontrado')
    })
  })

  describe('create', () => {
    it('debería crear un evento programado', async () => {
      const created = await service.create(
        {
          title: 'Nuevo',
          description: 'Desc',
          price: 5,
          scheduledAt: new Date(now.getTime() + 7200000).toISOString(),
          durationMinutes: 90,
        },
        's1',
      )

      expect(created.status).toBe(EventStatus.SCHEDULED)
      expect(created.streamerId).toBe('s1')
      expect(created.category).toBe(EventCategory.SPORT)
      expect(created.venue.cameras.length).toBeGreaterThan(0)
      expect(repo.items).toHaveLength(4)
    })
  })

  describe('start / end', () => {
    it('debería iniciar un evento', async () => {
      const started = await service.start('evt-1')
      expect(started.status).toBe(EventStatus.LIVE)
      expect(started.startedAt).toBeInstanceOf(Date)
      expect(started.liveUrl).toBeTruthy()
    })

    it('debería finalizar un evento', async () => {
      const ended = await service.end('evt-2')
      expect(ended.status).toBe(EventStatus.ENDED)
      expect(ended.endedAt).toBeInstanceOf(Date)
    })
  })

  describe('remove', () => {
    it('debería eliminar un evento existente', async () => {
      await service.remove('evt-3')
      expect(repo.items).toHaveLength(2)
    })

    it('debería fallar si no existe', async () => {
      await expect(service.remove('nope')).rejects.toThrow('no encontrado')
    })
  })
})
