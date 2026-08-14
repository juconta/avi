import { CameraPosition, CameraType, EventCategory, Venue, VenueKind } from '../storage/entities/event.entity'

/**
 * Señales de demostración distintas por cámara (HLS público).
 * Se rotan para que cada cámara tenga un feed propio en la vista múltiple.
 */
const DEMO_STREAMS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://test-streams.mux.dev/pts_shift/master.m3u8',
  'https://test-streams.mux.dev/tos_ismc/main.m3u8',
  'https://test-streams.mux.dev/bbb/bbb.m3u8',
  'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
]

const cameraTypesWithGoals: string[] = ['futbol', 'fútbol', 'hockey', 'handball', 'futsal', 'handbol']
const basketballLike: string[] = ['basquet', 'básquet', 'basketball', 'baloncesto']

function streamFor(index: number): string {
  return DEMO_STREAMS[index % DEMO_STREAMS.length]
}

function makeCamera(kind: CameraType, label: string, description: string, x: number, y: number): CameraPosition {
  const id = `${kind}-${label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')}`
  return { id, label, description, type: kind, position: { x, y }, liveUrl: '' }
}

const REFEREE_CAMS: CameraPosition[] = [
  makeCamera(CameraType.REFEREE, 'Árbitro Principal', 'Cámara en el oído del árbitro principal. Elige lado izquierdo.', 0.5, 0.08),
  makeCamera(CameraType.REFEREE, 'Árbitro Secundario', 'Cámara en el oído del árbitro secundario. Elige lado derecho.', 0.5, 0.92),
]

/** Cámaras de tribuna: 4 lados × 2 niveles (superior e inferior). */
function stadiumSideCameras(): CameraPosition[] {
  const sides = [
    { side: 'Norte', x: 0.5, yUp: 0.04, yLow: 0.14 },
    { side: 'Este', x: 0.86, yUp: 0.5, yLow: 0.62 },
    { side: 'Sur', x: 0.5, yUp: 0.96, yLow: 0.86 },
    { side: 'Oeste', x: 0.14, yUp: 0.5, yLow: 0.38 },
  ]
  const cameras: CameraPosition[] = []
  sides.forEach((s) => {
    cameras.push(
      makeCamera(CameraType.SIDE, `Tribuna ${s.side} Superior`, `Cámara en el nivel superior de la tribuna ${s.side}.`, s.x, s.yUp),
      makeCamera(CameraType.SIDE, `Tribuna ${s.side} Inferior`, `Cámara en el nivel inferior de la tribuna ${s.side}.`, s.x, s.yLow),
    )
  })
  return cameras
}

function goalCameras(): CameraPosition[] {
  return [
    makeCamera(CameraType.GOAL, 'Arco Norte', 'Cámara detrás del arco norte, visión de los goles.', 0.3, 0.2),
    makeCamera(CameraType.GOAL, 'Arco Sur', 'Cámara detrás del arco sur, visión de los goles.', 0.7, 0.8),
  ]
}

function hoopCameras(): CameraPosition[] {
  return [
    makeCamera(CameraType.HOOP, 'Aro Este', 'Cámara en la parte superior del aro este.', 0.82, 0.3),
    makeCamera(CameraType.HOOP, 'Aro Oeste', 'Cámara en la parte superior del aro oeste.', 0.18, 0.7),
  ]
}

function trackCameras(): CameraPosition[] {
  return [
    makeCamera(CameraType.TRACK, 'Largada', 'Cámara en la recta de largada.', 0.5, 0.5),
    makeCamera(CameraType.TRACK, 'Curva 1', 'Cámara estratégica en la curva 1.', 0.9, 0.5),
    makeCamera(CameraType.TRACK, 'Recta principal', 'Cámara en la recta principal.', 0.5, 0.15),
    makeCamera(CameraType.TRACK, 'Chicana', 'Cámara en la zona de la chicana.', 0.1, 0.5),
  ]
}

function vehicleCameras(count = 3): CameraPosition[] {
  const spots: Array<[number, number]> = [
    [0.55, 0.9],
    [0.55, 0.82],
    [0.55, 0.74],
  ]
  const cars = [
    { name: 'Auto 1', pilot: 'Piloto 1' },
    { name: 'Auto 2', pilot: 'Piloto 2' },
    { name: 'Auto 3', pilot: 'Piloto 3' },
  ]
  const cameras: CameraPosition[] = []
  for (let i = 0; i < count; i++) {
    const car = cars[i]
    const spot = spots[i]
    cameras.push(
      makeCamera(CameraType.VEHICLE, `${car.name} · Cabina`, `Cámara dentro del habitáculo del ${car.name}.`, spot[0], spot[1]),
      makeCamera(CameraType.DRIVER, `${car.pilot} · Casco`, `Cámara en el casco del ${car.pilot}.`, spot[0] + 0.12, spot[1] - 0.03),
    )
  }
  return cameras
}

function stageCameras(): CameraPosition[] {
  return [
    makeCamera(CameraType.STAGE, 'Escenario Central', 'Cámara frontal del escenario.', 0.5, 0.35),
    makeCamera(CameraType.STAGE, 'Escenario Lateral Izq.', 'Cámara lateral izquierda del escenario.', 0.3, 0.55),
    makeCamera(CameraType.STAGE, 'Escenario Lateral Der.', 'Cámara lateral derecha del escenario.', 0.7, 0.55),
    makeCamera(CameraType.STAGE, 'Plano General Sala', 'Cámara de plano general de toda la sala.', 0.5, 0.85),
  ]
}

export function buildVenue(category: EventCategory, sport?: string): Venue {
  const kind = category === EventCategory.RACING ? VenueKind.TRACK : category === EventCategory.SHOW ? VenueKind.THEATER : VenueKind.STADIUM
  const name = category === EventCategory.RACING ? 'Circuito Internacional' : category === EventCategory.SHOW ? 'Teatro Gran Sala' : 'Estadio Central'

  let cameras: CameraPosition[] = []
  if (kind === VenueKind.STADIUM) {
    cameras = [...stadiumSideCameras()]
    const sportNorm = (sport ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (cameraTypesWithGoals.some((g) => sportNorm.includes(g))) cameras.push(...goalCameras())
    if (basketballLike.some((b) => sportNorm.includes(b))) cameras.push(...hoopCameras())
    cameras.push(...REFEREE_CAMS)
  } else if (kind === VenueKind.TRACK) {
    cameras = [...trackCameras(), ...vehicleCameras(3)]
  } else {
    cameras = [...stadiumSideCameras(), ...stageCameras()]
  }

  cameras = cameras.map((c, i) => ({ ...c, liveUrl: streamFor(i) }))

  return { kind, name, cameras }
}