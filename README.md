# AVI — Asiento Virtual Interactivo

Plataforma de streaming PPV (pago por visión) con eventos en vivo, VOD, chat en tiempo real y reportes.

## Estructura

| Carpeta   | Descripción                                   | Stack                                |
|-----------|-----------------------------------------------|--------------------------------------|
| `backend` | API REST + WebSocket                          | NestJS, TypeORM, JWT, Socket.io      |
| `web`     | Panel de administración / cliente web          | Vite, React 18, TypeScript, HLS.js   |
| `mobile`  | App móvil para espectadores                    | Expo, React Native, TypeScript       |
| `shared`  | Tipos y constantes compartidas                 | TypeScript                           |

## Requisitos

- Node.js >= 18
- npm >= 9
- (Opcional) PostgreSQL — si no hay `DATABASE_URL`, el backend usa un almacén en memoria con datos de ejemplo.

## Puesta en marcha

### 1. Backend (puerto 4000)

```bash
cd backend
npm install
npm run start:dev
```

Swagger disponible en `http://localhost:4000/api/docs`.

### 2. Web (puerto 3000)

```bash
cd web
npm install
npm run dev
```

Para probar desde el móvil en la misma red local:

```bash
npx vite --host
```

### 3. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start --lan
```

Escanea el QR con Expo Go (proyecto en SDK 54). La API apunta a `http://192.168.0.7:4000/api` por defecto — si tu IP local cambia, edítala en `mobile/src/services/api.ts` y `mobile/src/services/socket.ts`, y reinicia con:

```bash
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.0.7
npx expo start --lan
```

## Cuentas de ejemplo

| Rol    | Email           | Contraseña |
|--------|-----------------|------------|
| Admin  | `admin@avi.test`| `admin123` |
| Usuario| `user@avi.test` | `password123` |

## Streaming multi-cámara

Cada evento pertenece a una categoría y tiene cámaras posicionadas según su venue:

- **Deporte** (estadio): cámaras en los 4 lados (nivel superior e inferior), cámara detrás de cada arco (fútbol, hockey, etc.) o sobre cada aro (básquet), y cámara en el oído de los árbitros.
- **Automovilismo** (F1, F2, F3, MotoGP): cámaras estratégicas en la pista, cámara en cada vehículo y en el casco de cada piloto.
- **Espectáculo** (conciertos, obras): cámaras en los 4 lados de la sala y sobre el escenario.

En la pantalla de reproducción, el botón **Cámaras** abre un croquis del venue; el usuario toca de 1 a 4 cámaras y las ve simultáneamente en el grid.

## Tests

```bash
cd backend
npm test
```

## Scripts de compilación

```bash
# Backend: TypeScript -> dist
cd backend && npm run build

# Web: build de producción
cd web && npm run build
```
