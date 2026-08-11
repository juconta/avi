import { Injectable, OnModuleInit } from '@nestjs/common'
import { UserRole } from '../common/decorators/roles.decorator'
import { CrudRepository } from './repositories/tokens'

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
      title: 'Concierto en vivo de prueba',
      description: 'Un concierto para probar el streaming PPV.',
      price: 9.99,
      coverImage: 'https://picsum.photos/seed/avi1/1280/720',
      streamerId: 'admin-1',
      status: 'scheduled',
      scheduledAt: later,
      durationMinutes: 120,
      createdAt: now,
    })

    this.events.create({
      id: 'evt-2',
      title: 'Evento finalizado',
      description: 'Un evento que ya terminó, disponible para ver el resumen.',
      price: 4.99,
      coverImage: 'https://picsum.photos/seed/avi2/1280/720',
      streamerId: 'admin-1',
      status: 'ended',
      scheduledAt: yesterday,
      startedAt: yesterday,
      endedAt: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000),
      durationMinutes: 120,
      liveUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      createdAt: yesterday,
    })

    this.vodAssets.create({
      id: 'vod-1',
      title: 'Documental: La historia del streaming',
      description: 'Un documental sobre la evolución de la transmisión en vivo.',
      durationSeconds: 3600,
      thumbUrl: 'https://picsum.photos/seed/avivod/1280/720',
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      price: 2.99,
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
