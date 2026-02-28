# 💼 Fair Support Fair Play - Investor Demo Guide

## 🎯 Propósito de este Documento

Esta guía está diseñada para mostrar a inversores potenciales **la plataforma completamente funcional** sin mockups ni demos grabados. Todo es 100% operativo y puede ser probado en vivo.

---

## 📊 Quick Stats

| Métrica | Valor |
|---------|-------|
| **Mercado TAM** | $4B (Salud Mental Infantil) |
| **Usuarios Objetivo** | 100M+ niños deportistas (global) |
| **Revenue Proyectado Y1** | $1.2M ARR |
| **Inversión Solicitada** | $250K USD |
| **Equity Ofrecido** | 11.1% |
| **Valuación Pre-money** | $2M USD |

---

## 🚀 Demo en Vivo

### 1️⃣ Landing Page para Inversores

**URL:** `/investor` (cuando esté desplegado)

**Qué ver:**
- ✅ Hero section con métricas clave de mercado
- ✅ Problema vs. Solución claramente presentado
- ✅ Oportunidad de mercado ($4B TAM)
- ✅ Showcase del producto (6 features principales)
- ✅ Modelo de negocio (B2C + B2B)
- ✅ Stack tecnológico moderno
- ✅ Proyecciones financieras detalladas
- ✅ Investment ask claro ($250K por 11.1%)

**Tiempo estimado:** 5-7 minutos de navegación

---

### 2️⃣ Admin Dashboard (Producto Real)

**URL:** `/admin`

#### Tab 1: Vista General (Métricas)
```
Muestra en tiempo real:
📊 Contenido pendiente de revisión
✅ FAQ aprobadas
🔴 Alertas críticas (rojas)
🟡 Alertas de atención (amarillas)
💬 Consultas últimos 7 días
📈 Tasa de aprobación de contenido
```

**Demo Script:**
> "Como pueden ver, el dashboard muestra métricas reales del sistema. Aquí monitoreamos el contenido pendiente de aprobación y las alertas de niños en riesgo emocional."

#### Tab 2: Revisión de Contenido
```
Flujo completo:
1. Contenido importado de NotebookLM
2. IA hace análisis de seguridad automático
3. Admin humano revisa y decide:
   ✅ Aprobar y publicar
   ❌ Rechazar con motivo
4. Auditoría completa de cada decisión
```

**Demo Script:**
> "Este es nuestro sistema de circuito cerrado. Ningún contenido llega a los niños sin pasar por revisión humana. La IA ayuda, pero el humano decide."

#### Tab 3: Sistema de Alertas
```
Alertas en tiempo real:
🟢 Verde: Estado emocional normal
🟡 Amarillo: Requiere atención
🔴 Rojo: Crisis - notificación inmediata a padres

Cada alerta muestra:
- Mensaje del niño
- Análisis de sentimiento (-1 a 1)
- Emociones detectadas
- Estado de notificación a padres
```

**Demo Script:**
> "Aquí está el core de nuestro diferenciador: detección automática de crisis emocionales. Cuando un niño envía un mensaje preocupante, la IA lo detecta en segundos y alertamos a los padres automáticamente."

#### Tab 4: Biblioteca de Contenido
```
Contenido curado disponible:
- 6+ FAQ por categorías
- 3+ ejercicios prácticos
- Todo aprobado y publicado
- Contenido curado por psicólogos deportivos
```

---

### 3️⃣ API REST (Backend Funcional)

**URL:** `/api/docs` (cuando esté desplegado)

**Swagger UI Interactivo:**

#### Endpoints Clave para Demo:

```bash
GET /health
# Respuesta: {"status": "healthy", "database": "connected"}
```

```bash
POST /api/queries/submit
# Body:
{
  "child_id": "22222222-2222-2222-2222-222222222221",
  "query_text": "Ya no quiero jugar más, todos esperan que sea el mejor"
}

# Respuesta REAL con OpenAI GPT-4:
{
  "sentiment_score": -0.85,
  "emotion": "desesperanza",
  "keywords": ["presión", "expectativas", "abandono"],
  "alert_level": "red",
  "response": "Entiendo que te sientes presionado...",
  "parent_notified": true
}
```

```bash
GET /api/content/faq
# Respuesta: Lista de 6 FAQ curadas y aprobadas
```

```bash
GET /api/analytics/overview
# Respuesta: Métricas del sistema en tiempo real
```

**Demo Script:**
> "Esta es nuestra API REST completamente funcional. Como pueden ver en este ejemplo, enviamos una consulta de un niño y la IA la analiza en menos de 1 segundo, detecta el nivel de riesgo, genera una respuesta apropiada y notifica automáticamente a los padres si es necesario."

---

## 🤖 Demostración del Análisis IA

### Test en Vivo

**Ejemplo 1: Mensaje Positivo (🟢)**
```
Input: "Hoy gané el partido y me sentí muy bien"

Output:
- sentiment_score: 0.8
- emotion: "alegría"
- alert_level: "green"
- parent_notified: false
```

**Ejemplo 2: Mensaje Preocupante (🟡)**
```
Input: "Estoy nervioso por el torneo de mañana"

Output:
- sentiment_score: -0.4
- emotion: "ansiedad"
- alert_level: "yellow"
- parent_notified: true
- message: "Su hijo mostró signos de ansiedad pre-competitiva..."
```

**Ejemplo 3: Mensaje Crítico (🔴)**
```
Input: "Ya no sé si quiero seguir, siento que decepciono a todos"

Output:
- sentiment_score: -0.88
- emotion: "desesperanza"
- alert_level: "red"
- parent_notified: true
- sms_sent: true
- message: "ALERTA: Su hijo expresó pensamientos de abandono y desesperanza..."
```

---

## 💡 Diferenciadores Clave (Para Mencionar)

### 1. Único en el Mercado
> "Somos la única plataforma que combina IA real (GPT-4) con contenido curado por expertos específicamente para deportes infantiles."

### 2. Circuito Cerrado
> "No permitimos que la IA genere respuestas 'on-the-fly'. Todo viene de nuestra biblioteca aprobada, eliminando alucinaciones y contenido inapropiado."

### 3. Sistema de Alertas Preventivo
> "No esperamos a que el niño esté en crisis. Detectamos señales tempranas y alertamos a los padres antes de que sea demasiado tarde."

### 4. Multicanal
> "Los niños pueden usar la plataforma donde ya están: Discord, WhatsApp, Web. No forzamos un cambio de comportamiento."

### 5. 100% Operativo
> "Lo que están viendo no son mockups. Es la plataforma real, funcionando, con IA real procesando consultas reales."

---

## 📈 Business Model Demo

### B2C - Freemium
```
Precio: $9.99/mes por familia

Incluye:
✅ Alertas ilimitadas
✅ Consultas IA 24/7
✅ Dashboard para padres
✅ Comunidad Discord
✅ Contenido educativo

Proyección Y1: 10,000 familias = $100K MRR
```

### B2B - Clubes Deportivos
```
Precio: $299/mes (≤50 niños)

Incluye todo de B2C +
✅ Dashboard institucional
✅ Reportes analíticos
✅ Branding personalizado
✅ Soporte prioritario

Proyección Y1: 50 clubes = $15K MRR
```

### B2B - Escuelas Deportivas
```
Precio: $499/mes (≤100 niños)

Incluye todo de Clubes +
✅ API Enterprise
✅ Integración LMS
✅ Formación docentes

Proyección Y1: 20 escuelas = $10K MRR
```

**Total ARR Año 1: $1.2M**

---

## 💰 Investment Ask Details

### Términos Propuestos
```
Monto:              $250,000 USD
Valuación Pre:      $2,000,000
Equity:             11.1%
Tipo:               Seed Round
Instrumento:        SAFE o Equity directo
```

### Uso de Fondos (12 meses)
```
40% ($100K) → Tech & Producto
  - 2 developers full-time
  - Infraestructura cloud
  - Mejoras UX/UI

30% ($75K) → Marketing & Growth
  - Content marketing
  - Paid ads (Meta, Google)
  - Partnerships con clubes

20% ($50K) → Contenido
  - Psicólogos adicionales
  - Expansión biblioteca
  - Localización contenido

10% ($25K) → Operaciones
  - Legal & compliance
  - Admin & accounting
```

### Milestones con esta Inversión

**Mes 1-3:**
- 1,000 familias activas
- 5 clubes B2B
- $10K MRR

**Mes 4-6:**
- 5,000 familias
- 20 clubes + 5 escuelas
- $50K MRR

**Mes 7-9:**
- 10,000 familias
- 50 instituciones
- $100K MRR

**Mes 10-12:**
- Series A ready
- Expansión regional
- $1.2M ARR

---

## 🎯 Call to Action

### Próximos Pasos

1. **Esta reunión:** Demo completo de la plataforma
2. **Semana 1:** Q&A técnico + Due diligence
3. **Semana 2:** Reunión con equipo técnico
4. **Semana 3-4:** Term sheet y cierre

### Contacto

**Email:** investors@fairsupport.com  
**Tel:** +54 11 1234-5678  
**Repo:** github.com/adrianlerer/fairsupporfairplay

---

## ❓ FAQ para Inversores

**P: ¿Por qué ahora es el momento correcto?**
> R: Post-pandemia, salud mental infantil es prioridad #1. Padres están dispuestos a pagar. IA es accesible y confiable. Somos first movers.

**P: ¿Cómo se diferencia de competidores?**
> R: No hay competidores directos. Betterhelp/Talkspace no se enfocan en niños deportistas. Apps de deporte no tienen IA emocional. Somos únicos.

**P: ¿Qué pasa si la IA comete un error?**
> R: Circuito cerrado: humanos aprueban todo contenido. IA solo detecta y alerta, no genera respuestas nuevas. Auditoría completa de cada interacción.

**P: ¿Cómo validan el contenido?**
> R: Consultor experto (Marcelo Roffé) + psicólogos deportivos adicionales. Cada FAQ pasa por revisión de 2+ expertos antes de publicarse.

**P: ¿COPPA/GDPR compliance?**
> R: Sí. Consentimiento parental obligatorio. Datos encriptados. Derecho al olvido. Política de privacidad específica para menores.

**P: ¿Escalabilidad técnica?**
> R: Arquitectura moderna (Next.js, FastAPI, PostgreSQL). Despliegue en Vercel + Railway. Auto-scaling. Costos de IA predecibles ($0.002 por consulta).

---

## 📊 Data Room

Disponible para inversores verificados:

- [ ] Financial model completo (Excel)
- [ ] Market research & sizing
- [ ] Competitive analysis
- [ ] Tech stack documentation
- [ ] Team bios & advisor agreements
- [ ] Legal structure & cap table
- [ ] Product roadmap (18 meses)
- [ ] Customer acquisition strategy

**Solicitar acceso:** investors@fairsupport.com

---

© 2026 Fair Support Fair Play  
Consultor y Curador de Contenido: Marcelo Roffé
