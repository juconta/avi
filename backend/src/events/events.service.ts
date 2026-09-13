import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Event, EventCategory, EventStatus, Venue, VenueKind, CameraType } from '../storage/entities/event.entity'
import { EVENT_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'
import { CreateEventDto, SourceDto, UpdateEventDto } from './dto/event.dto'
import { buildVenue } from './venue.factory'

const MAX_SOURCES = 12

/** Distribuye N marcadores en un anillo alrededor del centro del croquis (0..1). */
function cameraPosition(index: number, count: number): { x: number; y: number } {
  const angle = (index / Math.max(count, 1)) * Math.PI * 2
  return { x: 0.5 + 0.36 * Math.cos(angle), y: 0.5 + 0.3 * Math.sin(angle) }
}

function cameraTypeFor(category: EventCategory): CameraType {
  if (category === EventCategory.RACING) return CameraType.TRACK
  if (category === EventCategory.SHOW) return CameraType.STAGE
  return CameraType.SIDE
}

function venueKindFor(category: EventCategory): VenueKind {
  if (category === EventCategory.RACING) return VenueKind.TRACK
  if (category === EventCategory.SHOW) return VenueKind.THEATER
  return VenueKind.STADIUM
}

function venueNameFor(category: EventCategory): string {
  if (category === EventCategory.RACING) return 'Circuito Internacional'
  if (category === EventCategory.SHOW) return 'Teatro Gran Sala'
  return 'Estadio Central'
}

/** Genera un Venue con N cámaras a partir de las fuentes que carga el admin. */
function buildVenueFromSources(category: EventCategory, sources: SourceDto[]): Venue {
  const cameras = sources.map((src, i) => ({
    id: `cam-${i}-${src.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`,
    label: src.label,
    description: `Cámara ${i + 1}: ${src.label}`,
    type: cameraTypeFor(category),
    position: cameraPosition(i, sources.length),
    liveUrl: src.liveUrl,
  }))
  return { kind: venueKindFor(category), name: venueNameFor(category), cameras }
}

/** Conserva posiciones/tipo de cámaras existentes cuando es posible (update por índice). */
function mergeSources(current: Event, sources: SourceDto[]): Venue {
  const base = [...current.venue.cameras]
  const cameras = sources.map((src, i) => {
    const prev = base[i]
    return {
      id: prev?.id ?? `cam-${i}-${src.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`,
      label: src.label,
      description: prev?.description ?? `Cámara ${i + 1}: ${src.label}`,
      type: prev?.type ?? cameraTypeFor(current.category),
      position: prev?.position ?? cameraPosition(i, sources.length),
      liveUrl: src.liveUrl,
    }
  })
  return { kind: current.venue.kind, name: current.venue.name, cameras }
}

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
    const venue = dto.venue
      ? ({ ...dto.venue, kind: dto.venue.kind as VenueKind } as Venue)
      : dto.sources
        ? buildVenueFromSources(category, dto.sources)
        : buildVenue(category, dto.sport)
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
    const current = await this.findById(id)
    const updates: Partial<Event> = {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      category: dto.category ?? undefined,
      sport: dto.sport ?? undefined,
    }
    if (dto.sources) {
      updates.venue = mergeSources(current, dto.sources)
      updates.liveUrl = dto.sources[0]?.liveUrl
    }
    const event = await this.eventRepo.update(id, updates)
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

  /** Verifica que una URL de fuente sea un HLS válido y reproducible (manifest + CORS). */
  async validateSource(url: string): Promise<{ ok: boolean; status?: number; contentType?: string; cors: boolean; message: string }> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    try {
      const res = await fetch(url, { signal: controller.signal })
      const contentType = res.headers.get('content-type') ?? ''
      const acao = res.headers.get('access-control-allow-origin')
      const cors = acao === '*' || acao === 'null' || acao !== null
      const body = await res.text()
      const isM3u = body.trim().startsWith('#EXTM3U')
      if (res.ok && isM3u && cors) {
        return { ok: true, status: res.status, contentType, cors, message: 'Fuente válida y lista para reproducir.' }
      }
      return {
        ok: false,
        status: res.status,
        contentType,
        cors,
        message: !isM3u
          ? 'El contenido no parece una playlist HLS (#EXTM3U ausente).'
          : !cors
            ? 'La fuente no responde CORS: el reproductor no podrá solicitarla.'
            : `La fuente respondió HTTP ${res.status}.`,
      }
    } catch (err) {
      const aborted = (err as Error).name === 'AbortError'
      return { ok: false, cors: false, message: aborted ? 'La fuente no respondió dentro de 8 segundos.' : 'No se pudo conectar con la fuente.' }
    } finally {
      clearTimeout(timer)
    }
  }
}
