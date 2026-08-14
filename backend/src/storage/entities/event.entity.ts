export enum EventStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum EventCategory {
  SPORT = 'sport',
  RACING = 'racing',
  SHOW = 'show',
}

export enum VenueKind {
  STADIUM = 'stadium',
  THEATER = 'theater',
  TRACK = 'track',
}

export enum CameraType {
  SIDE = 'side',
  GOAL = 'goal',
  HOOP = 'hoop',
  REFEREE = 'referee',
  TRACK = 'track',
  VEHICLE = 'vehicle',
  DRIVER = 'driver',
  STAGE = 'stage',
}

export interface CameraPosition {
  id: string
  label: string
  description: string
  type: CameraType
  /** Coordenadas normalizadas (0..1) dentro del croquis del venue. */
  position: { x: number; y: number }
  liveUrl: string
}

export interface Venue {
  kind: VenueKind
  name: string
  cameras: CameraPosition[]
}

export interface Event {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  streamerId: string
  status: EventStatus
  scheduledAt: Date
  startedAt?: Date
  endedAt?: Date
  durationMinutes: number
  /** Señal principal (cámara del director), para compatibilidad y repeticiones. */
  liveUrl?: string
  category: EventCategory
  sport?: string
  venue: Venue
  createdAt: Date
}