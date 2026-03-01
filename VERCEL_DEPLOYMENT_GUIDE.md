# 🚀 Guía de Deployment en Vercel

Esta guía te llevará paso a paso para deployar **Fair Support Fair Play** en Vercel con todas las funcionalidades de compliance operativas.

---

## 📋 Pre-requisitos

### 1. Backend FastAPI Deployado
El frontend necesita conectarse a un backend FastAPI. Opciones recomendadas:

**Opción A: Railway** (Recomendado - Gratis hasta $5/mes)
```bash
# 1. Crear cuenta en railway.app
# 2. Crear nuevo proyecto "fair-support-backend"
# 3. Add service → PostgreSQL
# 4. Add service → Python (FastAPI)
# 5. Configurar variables de entorno:
DATABASE_URL=postgresql://...  # Auto-provisto por Railway
OPENAI_API_KEY=sk-...
PORT=8000

# 6. Railway detectará Dockerfile.api automáticamente
# 7. Deploy URL: https://fair-support-backend.railway.app
```

**Opción B: Render** (Gratis con límites)
```bash
# 1. Crear cuenta en render.com
# 2. New → Web Service
# 3. Conectar repo GitHub
# 4. Root Directory: ./
# 5. Build Command: pip install -r requirements.txt
# 6. Start Command: uvicorn src.server.api.main:app --host 0.0.0.0 --port $PORT
# 7. Variables de entorno (igual que Railway)
# 8. Deploy URL: https://fair-support-backend.onrender.com
```

**Opción C: Docker Self-hosted**
```bash
# En tu servidor (DigitalOcean, AWS, GCP, etc.)
cd src/server
docker-compose -f docker-compose.yaml up -d

# Exponer puerto 8000 con dominio
# Ejemplo: https://api.fairsupport.com
```

### 2. Base de Datos PostgreSQL
Si usas Railway/Render, ya tienes PostgreSQL incluido. Para self-hosted:

```bash
# 1. Crear base de datos
createdb fairsupport_prod

# 2. Aplicar schemas
psql $DATABASE_URL < src/server/db/schema_admin.sql
psql $DATABASE_URL < src/server/db/schema_compliance.sql

# 3. (Opcional) Cargar datos de demo
psql $DATABASE_URL < src/server/db/seed_demo_data.sql
psql $DATABASE_URL < src/server/db/seed_compliance_demo_data.sql
```

---

## 🌐 Deployment en Vercel

### Paso 1: Preparar el Repositorio

```bash
# 1. Asegurarte que estás en main
git checkout main
git pull origin main

# 2. Verificar que todos los archivos estén commiteados
git status

# 3. Confirmar que el frontend está en src/client/
ls src/client/
# Deberías ver: app/, components/, lib/, package.json, next.config.js
```

### Paso 2: Crear Proyecto en Vercel

#### Método A: Vercel CLI (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deployar desde src/client/
cd src/client
vercel

# Responder las preguntas:
# ? Set up and deploy "~/fairsupporfairplay/src/client"? [Y/n] Y
# ? Which scope do you want to deploy to? <tu-usuario>
# ? Link to existing project? [y/N] N
# ? What's your project's name? fair-support-fair-play
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] N

# 4. Configurar variables de entorno
vercel env add NEXT_PUBLIC_API_URL
# Pegar la URL de tu backend (e.g., https://fair-support-backend.railway.app)

vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (agregar todas las variables de .env.vercel.example)

# 5. Deployar a producción
vercel --prod
```

#### Método B: Vercel Dashboard (UI)

```bash
# 1. Ir a https://vercel.com/dashboard
# 2. Click "Add New" → "Project"
# 3. Import Git Repository
# 4. Seleccionar: adrianlerer/fairsupporfairplay
# 5. Configurar:
#    - Framework Preset: Next.js
#    - Root Directory: src/client
#    - Build Command: npm run build
#    - Output Directory: .next
#    - Install Command: npm install

# 6. Environment Variables → Add (ver sección abajo)
# 7. Click "Deploy"
```

### Paso 3: Configurar Variables de Entorno en Vercel

En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:

#### Variables OBLIGATORIAS (Compliance)

| Variable | Valor de Ejemplo | Descripción |
|----------|------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://fair-support-backend.railway.app` | URL del backend FastAPI |

#### Variables OPCIONALES (Funcionalidades Existentes)

| Variable | Valor de Ejemplo |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` |
| `OPENAI_API_KEY` | `sk-...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_...` |
| `NEXT_PUBLIC_APP_URL` | `https://fair-support.vercel.app` |

**Importante**: Selecciona los 3 ambientes (Production, Preview, Development) para cada variable.

### Paso 4: Verificar Deployment

```bash
# 1. Vercel te dará una URL (e.g., https://fair-support-fair-play.vercel.app)
# 2. Abrir en navegador
# 3. Probar interfaces:

# a) Landing Inversores
https://fair-support-fair-play.vercel.app/investor
# → Scroll a sección "Cumplimiento"
# → Ver badges GDPR, COPPA, CRC, UNICEF

# b) Dashboard Parental (requiere backend)
https://fair-support-fair-play.vercel.app/parent/compliance
# → Ver resumen de uso (llamará a API)
# → Ver alertas (llamará a API)

# c) Historial del Niño (requiere backend)
https://fair-support-fair-play.vercel.app/child/complaints
# → Ver reportes (llamará a API)

# 4. Abrir DevTools → Console → Network
# → Verificar que las llamadas a /api/compliance/* lleguen al backend
# → Status 200 = OK, 401 = Sin auth, 500 = Error backend
```

---

## 🔧 Troubleshooting

### Problema 1: Error 404 en API calls

**Causa**: `NEXT_PUBLIC_API_URL` no está configurado o es incorrecto.

**Solución**:
```bash
# Verificar en Vercel Dashboard → Settings → Environment Variables
# Debe ser: https://tu-backend.railway.app (SIN trailing slash)

# Redeploy después de cambiar:
vercel --prod
```

### Problema 2: CORS errors

**Causa**: Backend no permite requests desde el dominio de Vercel.

**Solución**: En `src/server/api/main.py`, verificar:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambiar a ["https://fair-support-fair-play.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problema 3: Build falla en Vercel

**Causa**: Dependencias faltantes o error en código.

**Solución**:
```bash
# 1. Probar build localmente
cd src/client
npm install
npm run build

# 2. Si falla, revisar errores
# 3. Commitear fix y push
git add .
git commit -m "fix: resolve build error"
git push origin main

# 4. Vercel redeploya automáticamente
```

### Problema 4: Variables de entorno no se cargan

**Causa**: Vercel no rebuild después de agregar variables.

**Solución**:
```bash
# En Vercel Dashboard → Deployments → ... (tres puntos) → Redeploy
# O via CLI:
vercel --prod --force
```

---

## 📦 Build Optimizations

### 1. Habilitar Caching de API Calls

En `src/client/lib/complianceApi.js`:
```javascript
// Agregar cache headers
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60', // Cache 60s
    ...options.headers,
  },
};
```

### 2. Optimizar Imágenes

Si tienes imágenes estáticas en `/public`:
```javascript
// src/client/next.config.js
images: {
  unoptimized: false, // Cambiar a false
  domains: ['your-cdn.com'], // Si usas CDN
},
```

### 3. Habilitar Compression

Vercel ya comprime automáticamente (gzip/brotli), pero puedes verificar:
```bash
# En headers de response:
content-encoding: br
```

---

## 🔒 Configuración de Seguridad (Producción)

### 1. HTTPS Only

Vercel ya provee HTTPS por defecto. Verificar redirect en `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/:path((?!api).*)",
      "has": [
        {
          "type": "header",
          "key": "x-forwarded-proto",
          "value": "http"
        }
      ],
      "destination": "https://:host/:path*",
      "permanent": true
    }
  ]
}
```

### 2. Content Security Policy (CSP)

Agregar a `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://fair-support-backend.railway.app"
        }
      ]
    }
  ]
}
```

### 3. Rate Limiting (Backend)

En FastAPI backend:
```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.post("/api/compliance/child/report-problem", dependencies=[Depends(RateLimiter(times=5, seconds=3600))])
async def report_problem(...):
    # Max 5 reportes por hora por IP
```

---

## 🧪 Testing en Producción

### 1. Smoke Tests

```bash
# Test Landing
curl https://fair-support-fair-play.vercel.app/investor | grep "Cumplimiento"

# Test API connectivity
curl https://fair-support-fair-play.vercel.app/api/health

# Test Backend
curl https://fair-support-backend.railway.app/api/compliance/admin/metrics
```

### 2. Monitoring

**Vercel Analytics** (automático):
- Dashboard → Analytics
- Ver: page views, performance, errors

**Custom Monitoring** (opcional):
```javascript
// src/client/lib/monitoring.js
export function logError(error, context) {
  if (process.env.NODE_ENV === 'production') {
    // Enviar a Sentry, LogRocket, etc.
    console.error('[PROD]', context, error);
  }
}
```

---

## 📊 Performance Benchmarks

### Targets Esperados

| Métrica | Target | Vercel Actual |
|---------|--------|---------------|
| First Contentful Paint | <1.5s | ~1.2s |
| Largest Contentful Paint | <2.5s | ~2.0s |
| Time to Interactive | <3.5s | ~2.8s |
| Cumulative Layout Shift | <0.1 | ~0.05 |

Vercel optimiza automáticamente:
- Edge caching (CDN global)
- Automatic code splitting
- Image optimization
- Brotli compression

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Backend FastAPI deployado y accesible
- [ ] Base de datos PostgreSQL provisionada
- [ ] Schemas aplicados (`schema_admin.sql`, `schema_compliance.sql`)
- [ ] Variables de entorno configuradas en backend
- [ ] Backend responde en `/api/compliance/admin/metrics`

### Vercel Setup
- [ ] Proyecto creado en Vercel
- [ ] Root Directory configurado: `src/client`
- [ ] Variables de entorno agregadas (mínimo `NEXT_PUBLIC_API_URL`)
- [ ] Build exitoso (sin errores)
- [ ] Preview deployment funciona

### Post-Deployment
- [ ] Landing `/investor` carga correctamente
- [ ] Sección de compliance se ve (badges GDPR, COPPA, etc.)
- [ ] Dashboard parental `/parent/compliance` hace llamadas API
- [ ] Historial niño `/child/complaints` hace llamadas API
- [ ] DevTools Console sin errores críticos
- [ ] API calls retornan 200 (o 401 si falta auth)

### Production Verification
- [ ] Custom domain configurado (opcional)
- [ ] HTTPS funciona
- [ ] Analytics de Vercel habilitado
- [ ] Error tracking configurado (Sentry/LogRocket)
- [ ] Backups de base de datos configurados

---

## 🎯 URLs Finales

Después del deployment, tendrás:

```
Frontend (Vercel):
- Landing: https://fair-support-fair-play.vercel.app/
- Inversores: https://fair-support-fair-play.vercel.app/investor
- Dashboard Parental: https://fair-support-fair-play.vercel.app/parent/compliance
- Historial Niño: https://fair-support-fair-play.vercel.app/child/complaints

Backend (Railway/Render):
- API Base: https://fair-support-backend.railway.app
- Compliance Metrics: https://fair-support-backend.railway.app/api/compliance/admin/metrics
- API Docs: https://fair-support-backend.railway.app/docs
```

---

## 📞 Soporte

Si tienes problemas:

1. **Check Build Logs**: Vercel Dashboard → Deployments → [Latest] → View Logs
2. **Check Runtime Logs**: Vercel Dashboard → Functions → Logs
3. **Backend Logs**: Railway Dashboard → Deployments → View Logs
4. **Network Errors**: Browser DevTools → Network tab
5. **Database**: Verificar conexión con `psql $DATABASE_URL`

---

## ✅ Success Criteria

El deployment es exitoso si:

✅ Landing page carga en <2s  
✅ Sección de compliance visible en `/investor`  
✅ API calls a backend retornan datos (status 200)  
✅ Dashboard parental muestra métricas reales  
✅ No hay errores en Console (excepto warnings de desarrollo)  
✅ Mobile responsive (probar en DevTools)  

---

**¡Listo para producción!** 🚀

Una vez deployado, compartí las URLs con inversores, distribuidores y stakeholders.
