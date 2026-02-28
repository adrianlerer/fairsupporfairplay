# 🚀 Guía: Deploy Demo Público (Sin Revelar Código)

## 🎯 Objetivo
Desplegar la plataforma de forma pública para demos a inversores **manteniendo el código privado en GitHub**.

---

## ⭐ OPCIÓN 1: VERCEL + RAILWAY (RECOMENDADA)

### Ventajas
- ✅ URLs públicas profesionales
- ✅ Código permanece privado
- ✅ Deploy automático desde GitHub privado
- ✅ HTTPS incluido
- ✅ Performance excelente
- ✅ Gratis para proyectos pequeños

### Paso 1: Deploy Backend en Railway

```bash
# 1. Ir a railway.app y crear cuenta
# 2. "New Project" → "Deploy from GitHub repo"
# 3. Conectar tu GitHub (puede ser repo privado)
# 4. Seleccionar: adrianlerer/fairsupporfairplay
# 5. Railway detectará automáticamente Python/FastAPI

# 6. Agregar PostgreSQL:
# En el mismo proyecto: "New" → "Database" → "PostgreSQL"

# 7. Configurar variables de entorno:
DATABASE_URL = ${POSTGRES_URL}  # Auto-llenado por Railway
OPENAI_API_KEY = sk-proj-...    # Tu API key
PORT = 8000

# 8. Configurar deploy settings:
Root Directory: /
Build Command: pip install -r requirements.txt
Start Command: cd src/server/api && uvicorn main:app --host 0.0.0.0 --port $PORT

# 9. Deploy automático - Railway te dará una URL:
# Ejemplo: https://fairsupport-api-production.up.railway.app
```

### Paso 2: Cargar Schema de Base de Datos

```bash
# Opción A: Via Railway CLI
railway login
railway link [project-id]
railway connect PostgreSQL

# Ahora estás en psql, ejecuta:
\i src/server/db/schema_admin.sql
\i src/server/db/seed_demo_data.sql

# Opción B: Via URL directa
psql "postgresql://user:pass@host:port/dbname" < src/server/db/schema_admin.sql
psql "postgresql://user:pass@host:port/dbname" < src/server/db/seed_demo_data.sql
```

### Paso 3: Deploy Frontend en Vercel

```bash
# 1. Ir a vercel.com y crear cuenta
# 2. "Import Project" → Conectar GitHub
# 3. Seleccionar: adrianlerer/fairsupporfairplay
# 4. Configuración:

Framework Preset: Next.js
Root Directory: src/client
Build Command: npm run build
Output Directory: .next
Install Command: npm install

# 5. Variables de entorno:
NEXT_PUBLIC_API_URL = https://fairsupport-api-production.up.railway.app

# 6. Deploy automático - Vercel te dará URLs:
Production: https://fairsupport.vercel.app
Admin: https://fairsupport.vercel.app/admin
Investor: https://fairsupport.vercel.app/investor
```

### Paso 4: Verificar Demo Público

```bash
# Test Backend
curl https://fairsupport-api-production.up.railway.app/health

# Test Frontend
# Abrir en navegador:
https://fairsupport.vercel.app/investor
https://fairsupport.vercel.app/admin
```

**URLs Resultantes:**
- 🌐 **Landing Inversores:** `https://fairsupport.vercel.app/investor`
- 🎛️ **Admin Dashboard:** `https://fairsupport.vercel.app/admin`
- 🔌 **API Docs:** `https://fairsupport-api-production.up.railway.app/docs`

**Privacidad:**
- ✅ Código sigue siendo privado en GitHub
- ✅ Solo las URLs públicas son accesibles
- ✅ No se expone el código fuente

---

## 🔒 OPCIÓN 2: GITHUB PAGES (Solo Frontend Estático)

**⚠️ Limitación:** GitHub Pages solo sirve archivos estáticos. No puede ejecutar backend Python/FastAPI.

### Lo que SÍ puedes hacer:

```bash
# 1. Build estático del frontend (sin API calls)
cd src/client
npm run build
npm run export  # Genera carpeta 'out' con HTML estático

# 2. Crear rama gh-pages
git checkout -b gh-pages
cp -r src/client/out/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 3. Habilitar GitHub Pages en Settings:
# Settings → Pages → Source: gh-pages branch

# URL resultante:
# https://adrianlerer.github.io/fairsupporfairplay/
```

**Problema:** Sin backend, las features dinámicas no funcionarán:
- ❌ No análisis IA en tiempo real
- ❌ No conexión a base de datos
- ❌ No API REST funcional
- ✅ Solo diseño visual de las páginas

**Solución:** Usar GitHub Pages para landing page estática + Vercel/Railway para versión completa.

---

## 💎 OPCIÓN 3: RENDER.COM (Alternativa a Railway)

Similar a Railway pero con plan gratuito más generoso:

```bash
# 1. Ir a render.com
# 2. "New +" → "Web Service"
# 3. Conectar GitHub (repo privado OK)
# 4. Seleccionar repo

# Configuración Backend:
Name: fairsupport-api
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: cd src/server/api && uvicorn main:app --host 0.0.0.0 --port $PORT

# 5. Agregar PostgreSQL:
"New +" → "PostgreSQL"

# 6. Conectar variables de entorno
DATABASE_URL = ${DATABASE_URL}  # Auto de Render
OPENAI_API_KEY = sk-...

# URL: https://fairsupport-api.onrender.com
```

---

## 🎨 OPCIÓN 4: NETLIFY (Alternativa a Vercel)

Muy similar a Vercel:

```bash
# 1. Ir a netlify.com
# 2. "Import from Git" → GitHub
# 3. Seleccionar repo (privado OK)

# Configuración:
Base directory: src/client
Build command: npm run build
Publish directory: .next

# Variables de entorno:
NEXT_PUBLIC_API_URL = https://fairsupport-api.onrender.com

# URL: https://fairsupport.netlify.app
```

---

## 📊 COMPARACIÓN DE OPCIONES

| Feature | Vercel + Railway | GitHub Pages | Render | Netlify |
|---------|-----------------|--------------|---------|---------|
| **Precio** | Gratis | Gratis | Gratis | Gratis |
| **Frontend** | ✅ | ✅ | ✅ | ✅ |
| **Backend API** | ✅ | ❌ | ✅ | ❌ |
| **Base de Datos** | ✅ | ❌ | ✅ | ❌ |
| **Código Privado** | ✅ | ❌* | ✅ | ✅ |
| **HTTPS** | ✅ | ✅ | ✅ | ✅ |
| **Custom Domain** | ✅ | ✅ | ✅ | ✅ |
| **CI/CD Auto** | ✅ | Manual | ✅ | ✅ |

*GitHub Pages requiere repo público o GitHub Pro

---

## 🚀 RECOMENDACIÓN FINAL

### Para Demo Completo a Inversores:

**Stack Recomendado:**
1. **Frontend:** Vercel (Next.js)
2. **Backend:** Railway (FastAPI)
3. **Database:** Railway PostgreSQL

**Resultado:**
- 🌐 **Investor Landing:** `https://fairsupport.vercel.app/investor`
- 🎛️ **Admin Dashboard:** `https://fairsupport.vercel.app/admin`
- 🔌 **API:** `https://fairsupport-api.railway.app/docs`

**Costo:** $0 (planes gratuitos)

**Tiempo de setup:** 30 minutos

**Privacidad:** ✅ Código permanece privado

---

## 🔐 SEGURIDAD ADICIONAL

### Proteger Rutas Sensibles

```javascript
// src/client/middleware.js (Next.js)
export function middleware(request) {
  // Proteger /admin con password básico
  const basicAuth = request.headers.get('authorization');
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!basicAuth) {
      return new Response('Auth required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"'
        }
      });
    }
    
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
    
    if (user !== 'admin' || pwd !== 'demo2026') {
      return new Response('Invalid credentials', { status: 401 });
    }
  }
  
  return NextResponse.next();
}
```

### Agregar Rate Limiting

```python
# src/server/api/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/queries/submit")
@limiter.limit("10/minute")  # Max 10 requests por minuto
async def submit_query(request: Request, query: QueryRequest):
    # ... código existente
```

---

## 📧 COMPARTIR CON INVERSORES

### Email Template

```
Asunto: Fair Support Fair Play - Demo en Vivo

Estimado [Nombre Inversor],

Le comparto acceso a nuestra plataforma completamente funcional:

🌐 Landing Page (Pitch):
https://fairsupport.vercel.app/investor

🎛️ Admin Dashboard (Demo Producto):
https://fairsupport.vercel.app/admin

🔌 API REST (Documentación Técnica):
https://fairsupport-api.railway.app/docs

Credenciales Admin Demo:
Usuario: admin
Password: demo2026

La plataforma está 100% operativa con:
✅ Análisis IA real (OpenAI GPT-4)
✅ Base de datos PostgreSQL con datos demo
✅ Sistema de alertas funcional
✅ 15+ endpoints REST

No dude en explorar todas las funcionalidades.

Quedo a disposición para una demo guiada.

Saludos,
[Tu Nombre]
Fair Support Fair Play
investors@fairsupport.com
```

---

## 🎯 PRÓXIMOS PASOS

1. **Deploy en 30 minutos:**
   ```bash
   # Terminal 1: Setup Railway
   railway login
   railway init
   railway up
   
   # Terminal 2: Setup Vercel
   vercel login
   vercel --prod
   ```

2. **Test completo**
3. **Compartir URLs con inversores**
4. **Opcional: Custom domain (fairsupport.com)**

---

¿Necesitas ayuda con el deploy? ¡Te guío paso a paso!
