import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { CameraPosition, Venue } from '../../../shared/src/types/event'
import { colors, radius, spacing } from '../theme/colors'

interface Props {
  venue: Venue
  selectedIds: string[]
  onToggle: (camera: CameraPosition) => void
  maxSelectable?: number
}

const typeColor: Record<string, string> = {
  side: colors.primary,
  goal: colors.warning,
  hoop: colors.warning,
  referee: colors.success,
  track: colors.danger,
  vehicle: colors.danger,
  driver: colors.danger,
  stage: colors.primary,
}

function markerLabel(camera: CameraPosition): string {
  const parts = camera.label.split(' ').filter((p) => p.length > 2)
  return parts.slice(0, 2).join('\n') || camera.label.slice(0, 2)
}

export default function VenueMap({ venue, selectedIds, onToggle, maxSelectable = 4 }: Props) {
  const selected = new Set(selectedIds)

  return (
    <View>
      <View style={styles.schematicArea}>
        <View style={[styles.silhouette, venue.kind === 'theater' ? styles.theaterSilhouette : venue.kind === 'track' ? styles.trackSilhouette : styles.stadiumSilhouette]}>
          {venue.kind === 'stadium' && <View style={styles.fieldLine} />}
          {venue.kind === 'theater' && <Text style={styles.stageLabel}>ESCENARIO</Text>}
          {venue.kind === 'track' && <Text style={styles.stageLabel}>CIRCUITO</Text>}
        </View>

        {venue.cameras.map((camera) => {
          const isSelected = selected.has(camera.id)
          const color = typeColor[camera.type] ?? colors.primary
          return (
            <Pressable
              key={camera.id}
              onPress={() => onToggle(camera)}
              style={[
                styles.marker,
                {
                  left: `${camera.position.x * 100}%`,
                  top: `${camera.position.y * 100}%`,
                  backgroundColor: color,
                },
                isSelected && styles.markerSelected,
              ]}
            >
              <Text style={styles.markerText}>{markerLabel(camera)}</Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={styles.hint}>
        Toca para seleccionar de 1 a {maxSelectable} cámaras. Seleccionadas: {selectedIds.length}/{maxSelectable}.
      </Text>
    </View>
  )
}

export function cameraBadgeColor(type: string): string {
  return typeColor[type] ?? colors.primary
}

const styles = StyleSheet.create({
  schematicArea: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  silhouette: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: radius.sm,
    borderColor: colors.border,
  },
  stadiumSilhouette: {
    top: '18%',
    left: '18%',
    right: '18%',
    bottom: '18%',
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
  },
  theaterSilhouette: {
    top: '10%',
    left: '15%',
    right: '15%',
    bottom: '35%',
    backgroundColor: 'rgba(108, 92, 231, 0.10)',
  },
  trackSilhouette: {
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    borderWidth: 8,
    borderRadius: 40,
    borderColor: colors.border,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  fieldLine: {
    position: 'absolute',
    top: '50%',
    left: '0%',
    right: '0%',
    height: 1,
    backgroundColor: colors.border,
  },
  stageLabel: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  marker: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    marginLeft: -23,
    marginTop: -23,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  markerSelected: {
    borderColor: colors.white,
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  markerText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
})