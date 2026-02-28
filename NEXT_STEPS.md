# 🎯 PRÓXIMOS PASOS - Deploy a Vercel

## ✅ Pull Request Creado

**PR Link:** https://github.com/adrianlerer/fairsupporfairplay/pull/1

El PR incluye los 3 cambios necesarios para deployment público:
1. ✅ Middleware actualizado (ruta `/investor` pública)
2. ✅ Next.js config compatible con Vercel
3. ✅ Vercel.json limpio y funcional

---

## 🚀 PASO 1: Mergear el Pull Request

### Opción A: Via GitHub Web (Recomendado)
1. Ir a: https://github.com/adrianlerer/fairsupporfairplay/pull/1
2. Revisar los cambios (3 archivos)
3. Click en **"Merge pull request"**
4. Click en **"Confirm merge"**
5. ✅ Listo!

### Opción B: Via Línea de Comandos
```bash
cd /home/user/fairsupporfairplay
git checkout main
git pull origin main
git merge genspark_ai_developer
git push origin main
```

---

## 🚀 PASO 2: Deploy en Vercel (15 minutos)

### 2.1 Crear Cuenta en Vercel
1. Ir a https://vercel.com
2. **Sign Up** con tu cuenta de GitHub
3. Autorizar acceso a GitHub

### 2.2 Importar Repositorio
1. En Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Buscar: `adrianlerer/fairsupporfairplay`
3. Click **"Import"**

### 2.3 Configurar Deploy
```
Framework Preset: Next.js (auto-detectado)
Root Directory: src/client
Build Command: npm run build (auto)
Output Directory: .next (auto)
Install Command: npm install (auto)
```

### 2.4 Agregar Variables de Entorno
En la sección **"Environment Variables"**, agregar:

```
Name: NEXT_PUBLIC_ENVIRONMENT
Value: selfhost
```

Click **"Add"**

### 2.5 Deploy
1. Click **"Deploy"**
2. Esperar 2-3 minutos (build de Next.js)
3. ✅ Una vez completado, verás tu URL pública!

---

## 🌐 URLs Resultantes

Después del deploy, tendrás:

### Frontend Público
- **Investor Landing:** `https://fairsupport-[random].vercel.app/investor`
- **Root (redirect):** `https://fairsupport-[random].vercel.app/` → `/investor`
- **Admin (protegido):** `https://fairsupport-[random].vercel.app/admin`

### Backend (Pendiente)
Para tener el backend funcional, necesitas:

**Opción 1: Railway (Recomendado)**
```bash
# Instalar Railway CLI
brew install railway  # Mac
# o
curl -fsSL https://railway.app/install.sh | sh  # Linux/Mac

# Login y deploy
railway login
cd /home/user/fairsupporfairplay
railway init
railway up

# Agregar PostgreSQL
# En Railway dashboard: Add Service → PostgreSQL

# Agregar variables de entorno
railway variables set OPENAI_API_KEY=sk-...
railway variables set PORT=8000
```

**Opción 2: Render.com**
1. Ir a https://render.com
2. New → Web Service
3. Conectar GitHub repo
4. Configurar:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd src/server/api && uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📧 PASO 3: Compartir con Inversores

Una vez desplegado, puedes enviar:

```
Estimado [Nombre Inversor],

Le comparto nuestra plataforma completamente funcional:

🌐 Investor Pitch & Landing Page:
https://fairsupport-[tu-url].vercel.app/investor

Características destacadas:
✅ Market opportunity: $4B TAM, 100M+ niños deportistas
✅ Problem/Solution claramente presentado
✅ Business model: B2C ($9.99/mes) + B2B ($299-499/mes)
✅ Proyecciones: $1.2M ARR Año 1
✅ Investment ask: $250K por 11.1% equity

La plataforma está 100% operativa con análisis IA real 
(OpenAI GPT-4) y sistema de alertas funcional.

Disponible para demo en vivo cuando guste.

Saludos,
[Tu Nombre]
Fair Support Fair Play
```

---

## 🎨 PASO 4: Custom Domain (Opcional)

Si quieres usar tu propio dominio (ej: `fairsupport.com`):

1. En Vercel Project Settings → Domains
2. Agregar dominio: `fairsupport.com` y `www.fairsupport.com`
3. Vercel te dará registros DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Agregar estos registros en tu proveedor de DNS
5. Esperar propagación (1-24 horas)
6. ✅ Tendrás: `https://fairsupport.com/investor`

---

## 📊 VERIFICAR DEPLOYMENT

### Test Frontend
```bash
# 1. Health check básico
curl https://fairsupport-[tu-url].vercel.app/investor

# 2. Abrir en navegador
open https://fairsupport-[tu-url].vercel.app/investor
```

### Test Backend (cuando esté desplegado)
```bash
# 1. Health check
curl https://fairsupport-api.railway.app/health

# 2. API docs
open https://fairsupport-api.railway.app/docs
```

---

## 🔒 SEGURIDAD

### Ruta Pública vs Protegida

**✅ Público (sin login):**
- `/investor` - Landing page para inversores
- `/` - Redirect automático a `/investor`

**🔒 Protegido (requiere Auth0):**
- `/admin` - Dashboard de administración
- `/chat` - Chat de soporte
- `/settings` - Configuración
- Todas las demás rutas

---

## 🐛 TROUBLESHOOTING

### Error: "Build Failed"
1. Verificar Root Directory: `src/client`
2. Verificar que el PR esté mergeado
3. Verificar variables de entorno

### Error: "Page Not Found"
1. Verificar que la ruta sea exactamente `/investor` (con minúsculas)
2. Verificar que el build completó exitosamente

### Error: "Internal Server Error"
1. Verificar logs en Vercel Dashboard → Deployments → [tu deploy] → Logs
2. Verificar que NEXT_PUBLIC_ENVIRONMENT=selfhost está configurado

---

## 📞 SOPORTE

Si tienes problemas con el deploy:

1. **Vercel Issues:**
   - Check logs: https://vercel.com/[tu-proyecto]/deployments
   - Documentación: https://vercel.com/docs

2. **Railway Issues:**
   - Check logs: `railway logs`
   - Documentación: https://docs.railway.app

3. **GitHub PR:**
   - Ver PR: https://github.com/adrianlerer/fairsupporfairplay/pull/1
   - Verificar que los 3 archivos cambiaron correctamente

---

## ✅ CHECKLIST FINAL

Antes de compartir con inversores, verificar:

- [ ] PR mergeado en main
- [ ] Deploy en Vercel exitoso
- [ ] `/investor` accesible públicamente
- [ ] `/` redirige a `/investor`
- [ ] `/admin` requiere login (protegido)
- [ ] Landing page se ve correctamente
- [ ] Todas las secciones cargan
- [ ] Links funcionan
- [ ] Responsive en mobile
- [ ] URL pública anotada para compartir

---

## 🎉 ¡LISTO!

Una vez completados estos pasos, tendrás:

✅ Demo público accesible desde cualquier navegador
✅ URL profesional para compartir con inversores
✅ Código privado en GitHub (no expuesto)
✅ HTTPS incluido (seguro)
✅ Gratis (plan Vercel hobby)

**Tu próximo paso:** Mergear el PR y hacer el deploy en Vercel!

---

© 2026 Fair Support Fair Play
Consultor y Curador: Marcelo Roffé
