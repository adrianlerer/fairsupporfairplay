

# Módulo de Administración - Fair Support Fair Play
## Implementación Completa del Sistema de Gestión de Contenido

---

## 📋 Resumen Ejecutivo

Este documento describe la implementación completa del **módulo de administración** para Fair Support Fair Play, incluyendo:

✅ **Sistema de Circuito Cerrado** para prevención de alucinaciones  
✅ **Conector NotebookLM** para importar contenido curado de Marcelo Roffé  
✅ **Revisión Humana Obligatoria** antes de publicación  
✅ **Integraciones Multi-Plataforma** (Discord, WhatsApp, SMS)  
✅ **Moderación Automática** con IA  

---

## 🗂️ Archivos Creados

### 1. Base de Datos

**Archivo:** `src/server/db/schema_admin.sql` (16.2 KB)

**Tablas Principales:**
- `content_review_queue` - Cola de revisión de contenido importado
- `faq_items` - FAQ aprobadas y publicadas
- `exercise_items` - Ejercicios prácticos aprobados
- `content_library` - Videos, artículos, podcasts
- `child_queries` - Log de consultas de niños
- `alerts` - Sistema de alertas semáforo para padres
- `community_posts` - Foros de comunidad moderados
- `platform_integration_log` - Log de mensajes multi-plataforma
- `admin_audit_log` - Auditoría de acciones administrativas

**Características:**
- Índices para búsqueda rápida
- Triggers automáticos (updated_at)
- Vistas SQL útiles para dashboards
- Datos de ejemplo (seed data)

### 2. Conector NotebookLM

**Archivo:** `src/server/main/admin/notebooklm_connector.py` (14.9 KB)

**Clase:** `NotebookLMConnector`

**Métodos Principales:**
```python
# Conectar al notebook de Roffé
connector = NotebookLMConnector()

# Listar fuentes del notebook
sources = await connector.list_sources()

# Importar contenido por categoría
items = await connector.import_content_by_category("Presión Competitiva")

# Importación batch de todas las categorías
results = await connector.batch_import_all_categories()
```

**Categorías Soportadas:**
- Presión Competitiva
- Manejo de Fracaso
- Relación con Padres
- Relación con Entrenadores
- Ansiedad Pre-Competencia
- Conflictos de Equipo
- Balance Vida Deportiva/Escolar
- Motivación y Objetivos
- Autoestima y Confianza
- Comunicación en Equipo

**Configuración NotebookLM:**
```bash
# Instalar MCP
pip install notebooklm-mcp

# Inicializar notebook de Roffé
uv run notebooklm-mcp init https://notebooklm.google.com/notebook/89cd6d09-50ce-4127-a507-26c2d348fbd1

# Variables de entorno
NOTEBOOKLM_NOTEBOOK_ID=89cd6d09-50ce-4127-a507-26c2d348fbd1
NOTEBOOKLM_HEADLESS=true
```

### 3. Sistema de Revisión Humana

**Archivo:** `src/server/main/admin/content_review.py` (19.8 KB)

**Clase:** `ContentReviewSystem`

**Flujo de Circuito Cerrado:**
```
1. IMPORTACIÓN → content_review_queue
2. VERIFICACIÓN IA → ai_safety_check (GPT-4)
3. REVISIÓN HUMANA → admin aprueba/rechaza
4. PUBLICACIÓN → faq_items, exercise_items, etc.
```

**Métodos Principales:**
```python
# Enviar contenido a revisión
review_id = await review_system.submit_for_review(content_item)

# Obtener items pendientes
pending = await review_system.get_pending_items(limit=50)

# Aprobar contenido
await review_system.approve_content(review_id, admin_id, notes="OK")

# Rechazar contenido
await review_system.reject_content(review_id, admin_id, reason="Información incorrecta")
```

**Verificación Automática de IA:**
- Lenguaje inapropiado para niños
- Consistencia con principios de psicología deportiva
- Detección de alucinaciones
- Nivel de riesgo: bajo / medio / alto

### 4. Bot de Discord

**Archivo:** `src/server/main/platforms/discord_bot.py` (21.0 KB)

**Clase:** `FairSupportDiscordBot`

**Características:**
- ✅ Comunidad pública moderada
- ✅ DMs privados para consultas individuales
- ✅ Comandos: `!faq`, `!ayuda`, `!ejercicio`
- ✅ Moderación automática de mensajes
- ✅ Alertas a padres integradas
- ✅ Registro en logs de todas las interacciones

**Canales del Servidor:**
```
#bienvenida - Introducción y reglas
#presion-competitiva - Discusión sobre presión
#relacion-entrenadores - Dudas sobre entrenadores
#relacion-padres - Cómo hablar con padres
#exitos-fracasos - Compartir experiencias
#ejercicios - Mindfulness y relajación
#preguntas-frecuentes - FAQ bot
#moderacion-log - Log privado (moderadores)
```

**Comandos Disponibles:**
```
!faq <pregunta>           - Buscar en base de conocimiento
!ayuda                    - Ver comandos disponibles
!ejercicio [dificultad]   - Ejercicio de mindfulness al azar
```

**Configuración:**
```python
from discord_bot import create_bot

bot = create_bot(db_connection, review_system, token="YOUR_DISCORD_TOKEN")
bot.run(token)
```

### 5. Integración WhatsApp

**Archivo:** `src/server/main/platforms/whatsapp_integration.py` (9.9 KB)

**Clase:** `WhatsAppPlatform`

**Características:**
- ✅ Alertas a padres (🟢🟡🔴)
- ✅ Consultas privadas de niños
- ✅ Respuestas desde contenido aprobado
- ✅ Log completo de mensajes

**Uso:**
```python
from whatsapp_integration import WhatsAppPlatform

whatsapp = WhatsAppPlatform(waha_url="http://localhost:3000")

# Enviar alerta a padre
await whatsapp.send_parent_alert(
    parent_phone="+1234567890",
    child_name="Juan",
    alert_level="yellow",
    message="Tu hijo mostró señales de ansiedad leve"
)

# Manejar consulta privada
await whatsapp.handle_child_private_message(
    phone="+0987654321",
    message="Estoy nervioso por el partido de mañana"
)
```

**Configuración WAHA:**
```bash
# Ejecutar servidor WAHA
docker run -d -p 3000:3000 devlikeapro/waha

# Configurar webhook para mensajes entrantes
POST http://localhost:3000/api/webhook
```

### 6. Integración SMS (Twilio)

**Archivo:** `src/server/main/platforms/sms_integration.py` (5.5 KB)

**Clase:** `SMSPlatform`

**Uso:** Solo para alertas ROJAS (críticas)

```python
from sms_integration import SMSPlatform

sms = SMSPlatform(
    account_sid="AC...",
    auth_token="...",
    from_number="+1234567890"
)

# Enviar alerta crítica
await sms.send_critical_alert(
    parent_phone="+1234567890",
    child_name="Juan",
    alert_type="crisis_indicators"
)
```

**Configuración Twilio:**
```bash
# Variables de entorno
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🚀 Instalación y Configuración

### Paso 1: Dependencias

```bash
# Backend Python
pip install notebooklm-mcp
pip install discord.py
pip install httpx
pip install twilio
pip install openai  # Para verificación de IA
pip install asyncpg  # Para PostgreSQL async

# Base de datos
# Instalar PostgreSQL 14+
```

### Paso 2: Crear Base de Datos

```bash
# Crear base de datos
createdb fairsupport

# Ejecutar schema
psql fairsupport < src/server/db/schema_admin.sql
```

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env`:

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/fairsupport

# OpenAI (para verificación IA)
OPENAI_API_KEY=sk-...

# NotebookLM MCP
NOTEBOOKLM_NOTEBOOK_ID=89cd6d09-50ce-4127-a507-26c2d348fbd1
NOTEBOOKLM_HEADLESS=true

# Discord
DISCORD_BOT_TOKEN=...

# WhatsApp (WAHA)
WAHA_URL=http://localhost:3000
WAHA_SESSION=fairsupport

# Twilio SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

### Paso 4: Inicializar Servicios

```bash
# 1. Iniciar servidor WAHA (WhatsApp)
docker run -d -p 3000:3000 --name waha devlikeapro/waha

# 2. Inicializar NotebookLM MCP
uv run notebooklm-mcp init https://notebooklm.google.com/notebook/89cd6d09-50ce-4127-a507-26c2d348fbd1

# 3. Ejecutar Discord Bot (Python)
python src/server/main/platforms/discord_bot_runner.py
```

---

## 📊 Flujo de Trabajo Completo

### 1. Importación de Contenido

```python
from notebooklm_connector import NotebookLMConnector
from content_review import ContentReviewSystem

# Inicializar sistemas
connector = NotebookLMConnector()
review_system = ContentReviewSystem(db_connection)

# Importar contenido de una categoría
items = await connector.import_content_by_category("Presión Competitiva")

# Enviar a revisión
for item in items:
    review_id = await review_system.submit_for_review(item)
    print(f"✅ {item['type']} enviado a revisión: {review_id}")
```

### 2. Revisión y Aprobación (Dashboard Admin)

```python
# Obtener items pendientes
pending = await review_system.get_pending_items()

for item in pending:
    print(f"\n📝 {item['content_type']}: {item['review_id']}")
    print(f"   Riesgo IA: {item['ai_safety_check']['risk_level']}")
    print(f"   Contenido: {item['content_data']}")
    
    # Admin decide
    action = input("Aprobar (A), Rechazar (R), o Siguiente (N)? ")
    
    if action == 'A':
        await review_system.approve_content(
            review_id=item['review_id'],
            admin_id='admin-uuid',
            notes='Contenido verificado y apropiado'
        )
        print("✅ Aprobado y publicado")
    
    elif action == 'R':
        reason = input("Razón del rechazo: ")
        await review_system.reject_content(
            review_id=item['review_id'],
            admin_id='admin-uuid',
            reason=reason
        )
        print("❌ Rechazado")
```

### 3. Consulta de Niño (Discord/WhatsApp)

```
Usuario niño: "Estoy muy nervioso por el partido de mañana"
              ↓
     Análisis de sentimiento con IA
              ↓
  Detección de emoción: ansiedad (nivel: medio)
              ↓
   Búsqueda en FAQ aprobadas sobre "ansiedad pre-competencia"
              ↓
  Respuesta generada desde contenido curado
              ↓
    Alerta AMARILLA generada para padre
              ↓
   Notificación vía WhatsApp + Email al padre
```

### 4. Sistema de Alertas

```python
# Cuando el análisis detecta nivel amarillo o rojo:

if sentiment_analysis['alert_level'] in ['yellow', 'red']:
    # Crear alerta en DB
    await db.execute("""
        INSERT INTO alerts (child_id, parent_id, severity, trigger_type, ...)
        VALUES (...)
    """)
    
    # Notificar padre via WhatsApp
    await whatsapp.send_parent_alert(
        parent_phone=parent['phone'],
        child_name=child['name'],
        alert_level='yellow',
        message='Tu hijo mostró señales de ansiedad...'
    )
    
    # Si es ROJA (crítica), también enviar SMS
    if sentiment_analysis['alert_level'] == 'red':
        await sms.send_critical_alert(
            parent_phone=parent['phone'],
            child_name=child['name']
        )
```

---

## 🔒 Protecciones del Circuito Cerrado

### 1. Verificación Automática con IA

**Prompt usado:**
```
Analiza el siguiente contenido destinado a niños deportistas (8-18 años):

1. ¿Contiene lenguaje inapropiado? (Sí/No)
2. ¿Es consistente con principios de psicología deportiva? (Sí/No)
3. ¿Detectas alucinaciones o información no verificable? (Sí/No)
4. Nivel de riesgo: bajo / medio / alto
5. Recomendaciones para el revisor humano
```

### 2. Revisión Humana Obligatoria

- ✅ TODO contenido requiere aprobación de admin
- ✅ No se publica nada automáticamente
- ✅ Trazabilidad completa (quién, cuándo, por qué)

### 3. Respuestas Solo Desde Contenido Aprobado

```python
# ❌ MAL: Generar respuesta "on the fly"
response = llm.generate("Responde a: " + user_query)

# ✅ BIEN: Buscar en FAQ aprobadas
faq_results = await db.fetch("""
    SELECT question, answer FROM faq_items
    WHERE question ILIKE $1 OR answer ILIKE $1
    LIMIT 3
""", f"%{user_query}%")

# Generar respuesta SOLO basada en FAQ aprobadas
response = format_faq_response(faq_results)
```

### 4. Moderación Continua

- Moderación automática de posts de comunidad
- Log completo de moderación
- Escalamiento a humanos cuando necesario

---

## 📈 Métricas y Monitoreo

### Dashboard de Administración

**Queries SQL útiles:**

```sql
-- 1. Contenido pendiente de revisión
SELECT COUNT(*) as pending_count
FROM content_review_queue
WHERE status = 'pending_review';

-- 2. Tasa de aprobación
SELECT 
  COUNT(CASE WHEN status = 'approved' THEN 1 END)::float / 
  COUNT(*)::float * 100 as approval_rate
FROM content_review_queue
WHERE status IN ('approved', 'rejected');

-- 3. Alertas últimos 7 días por nivel
SELECT severity, COUNT(*) as count
FROM alerts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY severity;

-- 4. Consultas por plataforma
SELECT platform, COUNT(*) as queries_count
FROM child_queries
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY platform;

-- 5. Items más útiles (FAQ)
SELECT question, helpful_count, view_count
FROM faq_items
ORDER BY helpful_count DESC
LIMIT 10;
```

---

## 🧪 Testing

### Test de Integración: NotebookLM

```python
# tests/test_notebooklm_connector.py
import pytest
from notebooklm_connector import NotebookLMConnector

@pytest.mark.asyncio
async def test_import_category():
    connector = NotebookLMConnector()
    items = await connector.import_content_by_category("Presión Competitiva")
    
    assert len(items) > 0
    assert items[0]['status'] == 'pending_review'
    assert items[0]['needs_human_review'] == True
```

### Test de Circuito Cerrado

```python
@pytest.mark.asyncio
async def test_content_cannot_be_published_without_approval():
    # Contenido importado debe estar en pending_review
    review_id = await review_system.submit_for_review(mock_content)
    
    # Verificar que NO está en faq_items
    result = await db.fetchone("""
        SELECT * FROM faq_items WHERE source_review_id = $1
    """, review_id)
    
    assert result is None  # No debe existir aún
    
    # Aprobar
    await review_system.approve_content(review_id, 'admin-1')
    
    # Ahora SÍ debe estar en faq_items
    result = await db.fetchone("""
        SELECT * FROM faq_items WHERE source_review_id = $1
    """, review_id)
    
    assert result is not None  # Ahora existe
```

---

## 🔧 Próximos Pasos

### Fase 1 (Completada) ✅
- [x] Schema de base de datos
- [x] Conector NotebookLM
- [x] Sistema de revisión humana
- [x] Bot de Discord
- [x] Integración WhatsApp
- [x] Integración SMS

### Fase 2 (Pendiente)
- [ ] Dashboard admin React (UI)
- [ ] Búsqueda semántica en FAQ (embeddings)
- [ ] Análisis de sentimiento mejorado
- [ ] Sistema de moderación con modelos fine-tuned
- [ ] API REST para integraciones externas

### Fase 3 (Futuro)
- [ ] App móvil (React Native)
- [ ] Notificaciones push
- [ ] Analytics avanzado
- [ ] Multi-idioma
- [ ] Integración con clubes deportivos

---

## 📞 Soporte

**Documentación Adicional:**
- [Especificación del Módulo Admin](./ADMIN_MODULE_SPEC.md)
- [Propuesta Técnica Completa](./PROYECTO_ROFFE_PROPUESTA.md)
- [Resumen Ejecutivo](./RESUMEN_EJECUTIVO_ES.md)

**Contacto:**
- Email: admin@fairsupportfairplay.com
- GitHub Issues: https://github.com/adrianlerer/fairsupporfairplay/issues

---

**Consultor y Curador: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados - Fair Support Fair Play**  
*Todos los Derechos Reservados*
