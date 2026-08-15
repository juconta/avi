import { Injectable, OnModuleInit } from '@nestjs/common'
import { UserRole } from '../common/decorators/roles.decorator'
import { CrudRepository } from './repositories/tokens'
import { EventCategory, EventStatus } from './entities/event.entity'
import { buildVenue } from '../events/venue.factory'

export class InMemoryRepository<T extends { id: string }> implements CrudRepository<T> {
  private readonly store = new Map<string, T>()

  constructor(private seed?: T[]) {
    if (seed) seed.forEach((item) => this.store.set(item.id, item))
  }

  async findById(id: string): Promise<T | undefined> {
    return this.store.get(id)
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.store.values())
  }

  async create(entity: T): Promise<T> {
    this.store.set(entity.id, entity)
    return entity
  }

  async update(id: string, entity: Partial<T>): Promise<T | undefined> {
    const current = this.store.get(id)
    if (!current) return undefined
    const updated = { ...current, ...entity }
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id)
  }

  async findOne(predicate: (item: T) => boolean): Promise<T | undefined> {
    return Array.from(this.store.values()).find(predicate)
  }

  async findMany(predicate: (item: T) => boolean): Promise<T[]> {
    return Array.from(this.store.values()).filter(predicate)
  }
}

export const IN_MEMORY_REPO = 'IN_MEMORY_REPO'

@Injectable()
export class InMemoryStorage implements OnModuleInit {
  readonly users = new InMemoryRepository<any>([])
  readonly events = new InMemoryRepository<any>([])
  readonly payments = new InMemoryRepository<any>([])
  readonly streamSessions = new InMemoryRepository<any>([])
  readonly vodAssets = new InMemoryRepository<any>([])
  readonly viewStats = new InMemoryRepository<any>([])
  readonly chatMessages = new InMemoryRepository<any>([])

  onModuleInit() {
    this.seedData()
  }

  private seedData() {
    const now = new Date()
    const later = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    this.users.create({
      id: 'admin-1',
      email: 'admin@avi.test',
      password: '$2a$10$hsAfFnDzrJJHeMfM08cFXuJ0sLQHeGjklz1UxiIHu//XYxICvJEM2',
      name: 'Administrador',
      role: UserRole.ADMIN,
      createdAt: now,
    })

    this.users.create({
      id: 'user-1',
      email: 'user@avi.test',
      password: '$2a$10$xq.Wbg4yXsYIQ7gnaqtXieDdlJy46ysMfj9WkoQywQl0C3tCK4/i6',
      name: 'Espectador Demo',
      role: UserRole.USER,
      createdAt: now,
    })

    this.events.create({
      id: 'evt-1',
      title: 'Final del Campeonato de Fútbol',
      description:
        'La gran final del torneo. Transmisión multi-cámara: 4 lados del estadio (superior e inferior), cámaras detrás de cada arco y cámara en el oído del árbitro.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avi1/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.LIVE,
      scheduledAt: later,
      startedAt: now,
      durationMinutes: 120,
      category: EventCategory.SPORT,
      sport: 'Fútbol',
      venue: buildVenue(EventCategory.SPORT, 'Fútbol'),
      liveUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      createdAt: now,
    })

    this.events.create({
      id: 'evt-2',
      title: 'Gran Premio de F1',
      description:
        'Carrera de automovilismo con cámaras estratégicas en la pista, en cada vehículo y en el casco de los pilotos.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avif1/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.SCHEDULED,
      scheduledAt: later,
      durationMinutes: 180,
      category: EventCategory.RACING,
      sport: 'F1',
      venue: buildVenue(EventCategory.RACING, 'F1'),
      createdAt: now,
    })

    this.events.create({
      id: 'evt-3',
      title: 'Concierto en vivo de prueba',
      description:
        'Un concierto para probar el streaming PPV con cámaras en los cuatro lados de la sala (niveles superior e inferior) y sobre el escenario.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avishow/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.SCHEDULED,
      scheduledAt: later,
      durationMinutes: 120,
      category: EventCategory.SHOW,
      sport: 'Concierto',
      venue: buildVenue(EventCategory.SHOW, 'Concierto'),
      createdAt: now,
    })

    this.events.create({
      id: 'evt-4',
      title: 'Evento finalizado',
      description: 'Un evento que ya terminó, disponible para ver el relato en cámara principal.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avi2/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.ENDED,
      scheduledAt: yesterday,
      startedAt: yesterday,
      endedAt: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000),
      durationMinutes: 120,
      category: EventCategory.SPORT,
      sport: 'Básquet',
      venue: buildVenue(EventCategory.SPORT, 'Básquet'),
      liveUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      createdAt: yesterday,
    })

    this.events.create({
      id: 'evt-5',
      title: 'Semifinal de Básquet en vivo',
      description:
        'Partido de básquet con cámaras en los cuatro lados del estadio, sobre cada aro y en el oído de los árbitros.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avibasket/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.LIVE,
      scheduledAt: later,
      startedAt: now,
      durationMinutes: 110,
      category: EventCategory.SPORT,
      sport: 'Básquet',
      venue: buildVenue(EventCategory.SPORT, 'Básquet'),
      liveUrl: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
      createdAt: now,
    })

    this.events.create({
      id: 'evt-6',
      title: 'Final de Tenis: Master 1000',
      description:
        'La final del torneo de tenis con transmisión multi-cámara desde todos los ángulos de la cancha central.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avitenis/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.SCHEDULED,
      scheduledAt: later,
      durationMinutes: 150,
      category: EventCategory.SPORT,
      sport: 'Tenis',
      venue: buildVenue(EventCategory.SPORT, 'Tenis'),
      createdAt: now,
    })

    this.events.create({
      id: 'evt-7',
      title: 'Vóley Playa: Campeonato Mundial',
      description:
        'Vóley playa con cámaras en los cuatro lados de la cancha y en el oído del árbitro principal.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avivoley/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.SCHEDULED,
      scheduledAt: later,
      durationMinutes: 90,
      category: EventCategory.SPORT,
      sport: 'Vóley Playa',
      venue: buildVenue(EventCategory.SPORT, 'Vóley Playa'),
      createdAt: now,
    })

    this.events.create({
      id: 'evt-8',
      title: 'Gran Premio de MotoGP',
      description:
        'Motociclismo con cámaras estratégicas en la pista, en cada moto y en el casco de los pilotos.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/avimoto/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.SCHEDULED,
      scheduledAt: later,
      durationMinutes: 120,
      category: EventCategory.RACING,
      sport: 'MotoGP',
      venue: buildVenue(EventCategory.RACING, 'MotoGP'),
      createdAt: now,
    })

    this.events.create({
      id: 'evt-9',
      title: 'Obra de Teatro: El Fantasma de la Ópera',
      description:
        'Obra de teatro en directo con cámaras en los cuatro lados de la sala (niveles superior e inferior) y sobre el escenario.',
      price: 0,
      coverImage: 'https://picsum.photos/seed/aviteatro/1280/720',
      streamerId: 'admin-1',
      status: EventStatus.SCHEDULED,
      scheduledAt: later,
      durationMinutes: 150,
      category: EventCategory.SHOW,
      sport: 'Obra de teatro',
      venue: buildVenue(EventCategory.SHOW, 'Obra de teatro'),
      createdAt: now,
    })

    this.vodAssets.create({
      id: 'vod-1',
      title: 'Documental: La historia del streaming',
      description: 'Un documental sobre la evolución de la transmisión en vivo.',
      durationSeconds: 3600,
      thumbUrl: 'https://picsum.photos/seed/avivod/1280/720',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      price: 0,
      createdAt: now,
    })

    this.vodAssets.create({
      id: 'vod-2',
      title: 'Masterclass de producción audiovisual',
      description: 'Aprende a producir contenido audiovisual de calidad.',
      durationSeconds: 5400,
      thumbUrl: 'https://picsum.photos/seed/avivod2/1280/720',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      price: 0,
      createdAt: now,
    })
  }
}
