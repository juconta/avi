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
npx expo start
```

Escanea el QR con Expo Go. La API apunta a `http://192.168.0.9:4000/api` por defecto (ajustar en `mobile/src/services/api.ts`).

## Cuentas de ejemplo

| Rol    | Email           | Contraseña |
|--------|-----------------|------------|
| Admin  | `admin@avi.test`| `admin123` |
| Usuario| `user@avi.test` | `password123` |

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
