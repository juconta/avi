# Deploy AVI en Render (demo para inversores)

Arquitectura: **2 servicios gratuitos**.

| Servicio | Tipo | URL ejemplo | Duerme |
|---|---|---|---|
| Backend (API + Socket.IO) | Web Service | `https://avi-api.onrender.com` | Sí (15 min inactividad) |
| Web (React/Vite) | Static Site (CDN) | `https://avi-web.onrender.com` | No (siempre arriba) |

> ⚠️ Antes de la demo abre la URL del backend para "despertarlo". Tarda ~1 min.

---

## Paso 0 — Requisitos

1. Una cuenta en https://render.com (GitHub login recomendado).
2. El repo `https://github.com/juconta/avi` ya pusheado con estos cambios.

> Los cambios de Fase 1 deben estar pusheados en Git **antes** de crear los servicios (los pasos de abajo asumen eso).

---

## Paso 1 — Backend (Web Service)

En Render → **New** → **Web Service** → conectar el repo `juconta/avi`.

Configuración:

- **Name**: `avi-api`
- **Region**: la más cercana (Frankfurt / Oregon / Virginia)
- **Branch**: `master`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

Variables de entorno (Environment):

| Variable | Valor |
|---|---|
| `JWT_SECRET` | Una clave larga y aleatoria, ej. `openssl rand -hex 32` |
| `NODE_ENV` | `production` |
| `PORT` | Render la asigna solo (no la fijes) |
| `DEBUG_MOBILE_LOG` | `1` (solo si querés que la app móvil escriba su log de diagnóstico en `/.debug/mobile.log`) |

> ⚠️ El backend **NO tiene base de datos**: usa memoria. Cada restart resetea usuarios/eventos. Para la demo está perfecto (los datos de ejemplo se recrean solos). Los SSDs de Render en free son efímeros, no persistir nada allí.

### Verificar backend
- Abrir `https://avi-api.onrender.com/api/docs` → debe verse Swagger.
- Abrir `https://avi-api.onrender.com/api/events` → debe responder JSON.

---

## Paso 2 — Web (Static Site)

En Render → **New** → **Static Site** → conectar el mismo repo.

Configuración:

- **Name**: `avi-web`
- **Branch**: `master`
- **Root Directory**: `web`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

Varibles de entorno (Environment, se inyectan **en build**):

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://avi-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://avi-api.onrender.com` |

> El nombre de backend debe ser el real (ej. `avi-api.onrender.com` exacto, sin `http`).

### Verificar web
- Abrir `https://avi-web.onrender.com` → debe verse la home con los 9 eventos.
- Entrar a un evento **live** → el video debe reproducirse con hls.js (carga desde CDN).
- Probar chat y contador de espectadores (necesita al backend despierto).

---

## Paso 3 — Probarlo de verdad (fuera de tu casa)

1. **Apagá el WiFi** del celular y usá datos móviles.
2. Abrí la URL de la web → carga + video.
3. Accedé desde el navegador **del teléfono del inversor** también.

---

## Paso 4 — (Opcional) Rebuild APK apuntando a la nube

El APK actual apunta a la IP local. Para que funcione desde cualquier red:

```bash
cd mobile
set EXPO_PUBLIC_API_URL=https://avi-api.onrender.com/api
set EXPO_PUBLIC_SOCKET_URL=https://avi-api.onrender.com
cmd /c "...gradlew assembleRelease --no-daemon"
```

(Guía completa en la fase 3 del plan; la firma es la misma, el teléfono actualiza sin desinstalar.)

---

## Notas / riesgos

- **Sleep del backend**: el chat y el contador de espectadores "mueren" cuando el backend está dormido; la web sigue mostrando la home pero sin datos frescos hasta despertarlo. En la demo: abrir la API 1-2 min antes y dejar a alguien chateando/viendo para mantenerlo vivo.
- **Streams demo** (`test-streams.mux.dev`): son externos y públicos; pueden caerse. No dependen de Render.
- **Costo**: mientras sea free tier, el backend suma 750 h/mes (≈ 31 días de uso continuo). Suficiente para demos. Si algún mes se necesita continuidad, hay que pagar (~USD 7/mes) o usar el plan gratis con cuidado.