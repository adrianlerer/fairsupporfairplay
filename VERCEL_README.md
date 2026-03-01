# 🚀 Fair Support Fair Play - Vercel Deployment

Este proyecto está configurado para deployar en Vercel con el frontend Next.js ubicado en `src/client/`.

## 📋 Quick Start

### Opción 1: Deploy Automático (Recomendado)

```bash
# 1. Clonar repo
git clone https://github.com/adrianlerer/fairsupporfairplay.git
cd fairsupporfairplay

# 2. Ejecutar script de deployment
./deploy_vercel.sh production
```

### Opción 2: Deploy Manual via CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd src/client
vercel --prod
```

### Opción 3: Deploy via Dashboard

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Import Git Repository: `adrianlerer/fairsupporfairplay`
3. Configure Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `src/client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add Environment Variables (ver abajo)
5. Click **Deploy**

---

## 🔧 Variables de Entorno Requeridas

### Obligatorias (Compliance Backend)

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Opcionales (Funcionalidades Existentes)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_APP_URL=https://fair-support.vercel.app
```

**Cómo agregar**:
1. Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Add Variable → Nombre + Valor
3. Seleccionar: Production, Preview, Development
4. Save

---

## 🏗️ Estructura del Proyecto

```
fairsupporfairplay/
├── src/
│   ├── client/              ← FRONTEND (Next.js) - Deploy en Vercel
│   │   ├── app/
│   │   │   ├── child/       ← Interfaz del niño
│   │   │   │   └── complaints/page.js
│   │   │   ├── parent/      ← Dashboard parental
│   │   │   │   └── compliance/page.js
│   │   │   ├── investor/    ← Landing inversores
│   │   │   │   └── page.jsx
│   │   │   └── components/
│   │   │       └── landing/ComplianceSection.jsx
│   │   ├── components/
│   │   │   └── compliance/  ← Componentes de compliance
│   │   ├── lib/
│   │   │   └── complianceApi.js  ← API client
│   │   ├── package.json
│   │   └── next.config.js
│   └── server/              ← BACKEND (FastAPI) - Deploy en Railway/Render
│       ├── api/
│       │   ├── main.py
│       │   └── compliance.py
│       └── db/
│           ├── schema_compliance.sql
│           └── seed_compliance_demo_data.sql
├── vercel.json              ← Configuración Vercel
├── deploy_vercel.sh         ← Script de deployment
└── VERCEL_DEPLOYMENT_GUIDE.md  ← Guía completa
```

---

## 🧪 Testing Post-Deployment

Después de deployar, probar estas URLs:

### 1. Landing Inversores
```
https://[tu-proyecto].vercel.app/investor
```
**Verificar**:
- Sección "Cumplimiento y Seguridad Infantil" visible
- 4 badges: GDPR, COPPA, UN CRC, UNICEF
- Grid de 6 funcionalidades
- CTA "Ver Reporte Q1 2026"

### 2. Dashboard Parental
```
https://[tu-proyecto].vercel.app/parent/compliance
```
**Verificar** (requiere backend):
- Card de uso diario con barra de progreso
- Alertas de reportes y crisis
- Panel de configuración (slider de tiempo)
- Sin errores en Console

### 3. Historial del Niño
```
https://[tu-proyecto].vercel.app/child/complaints
```
**Verificar** (requiere backend):
- Lista de reportes (o estado vacío)
- Status badges (pendiente/resuelto)
- Sin errores en Console

---

## 🐛 Troubleshooting

### Build Fails: "Cannot find module 'X'"

**Solución**: Agregar al package.json del cliente
```bash
cd src/client
npm install X --save
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push
```

### API Calls Return 404

**Causa**: `NEXT_PUBLIC_API_URL` no configurado

**Solución**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://tu-backend.railway.app`
3. Redeploy: Dashboard → Deployments → ... → Redeploy

### CORS Errors

**Causa**: Backend no permite requests desde Vercel

**Solución**: En `src/server/api/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-proyecto.vercel.app"],  # Cambiar
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### "This page could not be found"

**Causa**: Rutas no existen o error en build

**Solución**:
1. Verificar que los archivos existan: `src/client/app/parent/compliance/page.js`
2. Probar build local: `cd src/client && npm run build`
3. Si falla, revisar errores y commitear fix

---

## 📊 Performance Tips

### Habilitar Edge Caching

En componentes con datos estáticos:
```javascript
// src/client/app/investor/page.jsx
export const revalidate = 3600; // Revalidar cada 1 hora
```

### Optimizar Imágenes

Si usas imágenes:
```javascript
import Image from 'next/image';

<Image src="/logo.png" width={200} height={100} alt="Logo" />
```

### Lazy Loading de Componentes

Para componentes pesados:
```javascript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

---

## 🔗 Links Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Deployment Guide Completo**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Backend Repo**: (mismo repo, `src/server/`)

---

## ✅ Deployment Checklist

Antes de deployar a producción:

- [ ] Backend FastAPI deployado y accesible
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend correcto
- [ ] Build local exitoso (`npm run build`)
- [ ] Sin errores en ESLint (`npm run lint`)
- [ ] Variables de entorno configuradas en Vercel
- [ ] CORS configurado en backend para aceptar dominio Vercel
- [ ] Test manual de las 3 interfaces (niño, padre, inversor)

---

## 🚀 Continuous Deployment

Vercel auto-deploya en cada push a `main`:

```bash
# 1. Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push
git push origin main

# 3. Vercel deploya automáticamente
# → Ver progreso en: vercel.com/dashboard
```

Para prevenir auto-deploy:
```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": false
    }
  }
}
```

---

## 📞 Support

Si tienes problemas:

1. **Check Logs**: Vercel Dashboard → Deployments → [Latest] → View Logs
2. **Check Console**: Browser DevTools → Console
3. **Check Network**: Browser DevTools → Network tab
4. **Manual Deploy**: `cd src/client && vercel --prod --force`

---

**Última actualización**: 2026-03-01  
**Versión**: 1.0.0  
**Maintainer**: Fair Support Fair Play Team
