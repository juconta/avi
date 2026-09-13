import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Event, EventCategory, EventStatus, Venue, VenueKind } from '../storage/entities/event.entity'
import { EVENT_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'
import { CreateEventDto, UpdateEventDto } from './dto/event.dto'
import { buildVenue } from './venue.factory'

@Injectable()
export class EventsService {
  constructor(@Inject(EVENT_REPO) private readonly eventRepo: CrudRepository<Event>) {}

  async findAll(status?: EventStatus): Promise<Event[]> {
    const events = await this.eventRepo.findAll()
    const sorted = events.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    return status ? sorted.filter((e) => e.status === status) : sorted
  }

  async findUpcoming(): Promise<Event[]> {
    const events = await this.findAll()
    return events.filter((e) => e.status === EventStatus.SCHEDULED)
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepo.findById(id)
    if (!event) throw new NotFoundException(`Evento ${id} no encontrado`)
    return event
  }

  async create(dto: CreateEventDto, streamerId: string): Promise<Event> {
    const category = dto.category ?? EventCategory.SPORT
    const venue = dto.venue ? ({ ...dto.venue, kind: dto.venue.kind as VenueKind } as Venue) : buildVenue(category, dto.sport)
    const event: Event = {
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description,
      price: dto.price,
      coverImage: dto.coverImage ?? `https://picsum.photos/seed/${crypto.randomUUID()}/1280/720`,
      streamerId,
      status: EventStatus.SCHEDULED,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes,
      category,
      sport: dto.sport,
      venue,
      createdAt: new Date(),
    }
    return this.eventRepo.create(event)
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.eventRepo.update(id, {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      category: dto.category ?? undefined,
      sport: dto.sport ?? undefined,
    })
    if (!event) throw new NotFoundException(`Evento ${id} no encontrado`)
    return event
  }

  async start(id: string): Promise<Event> {
    const current = await this.findById(id)
    const venue: Venue = {
      ...current.venue,
      cameras: current.venue.cameras.map((c, i) => ({
        ...c,
        liveUrl: c.liveUrl || this.defaultStream(current.category, current.sport, i),
      })),
    }
    const event = await this.eventRepo.update(id, {
      status: EventStatus.LIVE,
      startedAt: new Date(),
      liveUrl: this.defaultStream(current.category, current.sport, 0),
      venue,
    })
    if (!event) throw new NotFoundException(`Evento ${id} no encontrado`)
    return event
  }

  private defaultStream(category: EventCategory, sport: string | undefined, index: number): string {
    const venue = buildVenue(category, sport)
    return venue.cameras[index % venue.cameras.length]?.liveUrl
      ?? 'https://avi-zaus.onrender.com/hls/football_a/index.m3u8'
  }

  async end(id: string): Promise<Event> {
    const event = await this.eventRepo.update(id, {
      status: EventStatus.ENDED,
      endedAt: new Date(),
    })
    if (!event) throw new NotFoundException(`Evento ${id} no encontrado`)
    return event
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.eventRepo.delete(id)
    if (!deleted) throw new NotFoundException(`Evento ${id} no encontrado`)
  }
}
