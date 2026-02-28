# Módulo de Administración - Fair Support Fair Play
## Sistema de Gestión de Contenido con Circuito Cerrado

---

## 🎯 Objetivos Principales

### 1. **Gestión Segura de Contenido**
- Importación desde NotebookLM (contenido curado por Marcelo Roffé)
- Sistema de revisión y aprobación (circuito cerrado)
- Prevención de alucinaciones y sesgos de LLM
- Control de calidad antes de publicación

### 2. **Conectividad Multi-Plataforma**
- WhatsApp: Alertas a padres + consultas privadas
- Discord: Comunidad moderada + DMs privados al bot
- SMS: Alertas críticas a padres
- Web: Portal principal

### 3. **Protección de Menores**
- Todo contenido debe ser aprobado antes de ser visible
- Sistema de filtros y validación automática
- Moderación humana obligatoria
- Trazabilidad completa del contenido

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                  ADMIN DASHBOARD                        │
│  - Gestión de contenido                                 │
│  - Importación desde NotebookLM                         │
│  - Revisión y aprobación                                │
│  - Monitoreo de plataformas                             │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│  CONTENT DB    │   │  REVIEW QUEUE   │
│  (Approved)    │   │  (Pending)      │
└───────┬────────┘   └────────┬────────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   CONTENT ROUTER    │
        │  (Distribution)     │
        └──────────┬──────────┘
                   │
        ┌──────────┴────────────────────────────┐
        │          │          │          │       │
   ┌────▼───┐ ┌───▼───┐ ┌────▼────┐ ┌──▼───┐ ┌─▼──┐
   │  Web   │ │Discord│ │WhatsApp │ │ SMS  │ │API │
   └────────┘ └───────┘ └─────────┘ └──────┘ └────┘
```

---

## 📥 Conector NotebookLM

### Implementación con MCP (Model Context Protocol)

#### 1. **Configuración del Servidor MCP**

```javascript
// src/server/mcp_hub/notebooklm/.env.template
NOTEBOOKLM_NOTEBOOK_ID=89cd6d09-50ce-4127-a507-26c2d348fbd1
NOTEBOOKLM_HEADLESS=true
NOTEBOOKLM_AUTH_PATH=./chrome_profile_notebooklm
```

#### 2. **Instalación del MCP de NotebookLM**

```bash
# Opción 1: Python FastMCP (khengyun)
pip install notebooklm-mcp
uv run notebooklm-mcp init https://notebooklm.google.com/notebook/89cd6d09-50ce-4127-a507-26c2d348fbd1

# Opción 2: Node.js (roomi-fields)
git clone https://github.com/roomi-fields/notebooklm-mcp.git
cd notebooklm-mcp
npm install && npm run build
npm run setup-auth  # Login a Google
```

#### 3. **API de Importación de Contenido**

```python
# src/server/main/admin/notebooklm_connector.py
from typing import List, Dict, Optional
import httpx
import json

class NotebookLMConnector:
    """Conector para importar contenido desde NotebookLM"""
    
    def __init__(self, notebook_id: str, mcp_endpoint: str):
        self.notebook_id = notebook_id
        self.mcp_endpoint = mcp_endpoint
    
    async def list_sources(self) -> List[Dict]:
        """Lista todas las fuentes del notebook"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mcp_endpoint}/tools/list_sources",
                json={"notebook_id": self.notebook_id}
            )
            return response.json()["sources"]
    
    async def query_notebook(self, question: str) -> Dict:
        """Hace una consulta al notebook de Roffé"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.mcp_endpoint}/tools/notebook_query",
                json={
                    "notebook_id": self.notebook_id,
                    "query": question
                }
            )
            return response.json()
    
    async def import_content_by_category(self, category: str) -> List[Dict]:
        """
        Importa contenido de NotebookLM filtrado por categoría
        Ejemplo: "presión competitiva", "manejo de fracaso", etc.
        """
        # Query específica para extraer contenido relevante
        query = f"""
        Del contenido de Marcelo Roffé sobre {category}, extrae:
        1. Preguntas frecuentes de niños deportistas
        2. Respuestas recomendadas
        3. Ejercicios prácticos
        4. Casos de ejemplo
        
        Formato JSON:
        {{
            "faqs": [{{"question": "...", "answer": "...", "age_group": "8-12|13-15|16-18"}}],
            "exercises": [{{"title": "...", "description": "...", "duration": "..."}}],
            "cases": [{{"title": "...", "scenario": "...", "resolution": "..."}}]
        }}
        """
        
        result = await self.query_notebook(query)
        return self._parse_import_result(result)
    
    def _parse_import_result(self, result: Dict) -> List[Dict]:
        """Parsea el resultado y crea items de contenido pendientes de revisión"""
        content_items = []
        
        try:
            data = json.loads(result.get("answer", "{}"))
            
            # Crear FAQ items
            for faq in data.get("faqs", []):
                content_items.append({
                    "type": "faq",
                    "category": result.get("category"),
                    "question": faq["question"],
                    "answer": faq["answer"],
                    "age_group": faq.get("age_group", "all"),
                    "status": "pending_review",  # ⚠️ CIRCUITO CERRADO
                    "source": "notebooklm",
                    "curator": "Marcelo Roffé",
                    "imported_at": "now()",
                    "needs_human_review": True
                })
            
            # Crear exercise items
            for exercise in data.get("exercises", []):
                content_items.append({
                    "type": "exercise",
                    "title": exercise["title"],
                    "description": exercise["description"],
                    "duration_minutes": exercise.get("duration", 10),
                    "status": "pending_review",
                    "source": "notebooklm",
                    "curator": "Marcelo Roffé",
                    "needs_human_review": True
                })
            
        except json.JSONDecodeError:
            # Fallback: crear item genérico para revisión manual
            content_items.append({
                "type": "raw_import",
                "content": result.get("answer"),
                "status": "needs_parsing",
                "source": "notebooklm",
                "needs_human_review": True
            })
        
        return content_items
```

#### 4. **Sistema de Revisión Humana (Circuito Cerrado)**

```python
# src/server/main/admin/content_review.py
from enum import Enum
from typing import Optional
from datetime import datetime

class ReviewStatus(str, Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_EDITING = "needs_editing"
    PUBLISHED = "published"

class ContentReviewSystem:
    """Sistema de revisión y aprobación de contenido"""
    
    async def submit_for_review(self, content_item: Dict) -> str:
        """Envía contenido importado a cola de revisión"""
        review_id = generate_uuid()
        
        await db.execute("""
            INSERT INTO content_review_queue (
                review_id, 
                content_type,
                content_data,
                source,
                author,
                status,
                created_at,
                ai_safety_check,
                needs_human_review
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """, 
        review_id,
        content_item["type"],
        json.dumps(content_item),
        content_item["source"],
        content_item.get("author", "Unknown"),
        ReviewStatus.PENDING_REVIEW,
        datetime.now(),
        await self._ai_safety_check(content_item),
        True  # ⚠️ Siempre requiere revisión humana
        )
        
        return review_id
    
    async def _ai_safety_check(self, content: Dict) -> Dict:
        """
        Verificación automática de seguridad con IA
        - Detección de lenguaje inapropiado
        - Verificación de exactitud vs fuente
        - Detección de posibles alucinaciones
        """
        prompt = f"""
        Analiza el siguiente contenido destinado a niños deportistas (8-18 años):
        
        Tipo: {content["type"]}
        Contenido: {json.dumps(content, indent=2)}
        
        Verifica:
        1. ¿Contiene lenguaje inapropiado para niños? (sí/no)
        2. ¿Es consistente con principios de psicología deportiva infantil? (sí/no)
        3. ¿Detectas posibles alucinaciones o información no verificable? (sí/no)
        4. Nivel de riesgo: bajo/medio/alto
        5. Recomendaciones para el revisor humano
        
        Responde en JSON.
        """
        
        result = await call_llm(prompt)
        return json.loads(result)
    
    async def approve_content(self, review_id: str, admin_id: str, notes: str = "") -> bool:
        """Aprueba contenido después de revisión humana"""
        # 1. Marcar como aprobado
        await db.execute("""
            UPDATE content_review_queue 
            SET status = $1, 
                reviewed_by = $2,
                reviewed_at = $3,
                review_notes = $4
            WHERE review_id = $5
        """, ReviewStatus.APPROVED, admin_id, datetime.now(), notes, review_id)
        
        # 2. Mover a base de datos de contenido publicado
        content = await db.fetchone("""
            SELECT content_data FROM content_review_queue WHERE review_id = $1
        """, review_id)
        
        await self._publish_content(json.loads(content["content_data"]))
        
        return True
    
    async def _publish_content(self, content: Dict):
        """Publica contenido aprobado en la base de datos principal"""
        if content["type"] == "faq":
            await db.execute("""
                INSERT INTO faq_items (
                    category, question, answer, author, 
                    age_group, tags, published_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
            content["category"],
            content["question"],
            content["answer"],
            content["author"],
            content["age_group"],
            json.dumps(content.get("tags", [])),
            datetime.now()
            )
```

---

## 🎨 Dashboard de Administración

### Interfaz de Usuario

```javascript
// src/client/app/admin/content-import/page.js
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ContentImportPage() {
  const [importing, setImporting] = useState(false)
  const [category, setCategory] = useState('')
  
  const categories = [
    'Presión Competitiva',
    'Manejo de Fracaso',
    'Relación con Padres',
    'Relación con Entrenadores',
    'Ansiedad Pre-Competencia',
    'Conflictos de Equipo',
    'Balance Vida Deportiva/Escolar'
  ]
  
  const handleImport = async () => {
    setImporting(true)
    
    try {
      const response = await fetch('/api/admin/content/import-from-notebooklm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      })
      
      const result = await response.json()
      
      alert(`✅ Importados ${result.items_count} items a cola de revisión`)
    } catch (error) {
      alert('❌ Error al importar: ' + error.message)
    } finally {
      setImporting(false)
    }
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        📥 Importación desde NotebookLM
      </h1>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            Cuaderno: Marcelo Roffé - Mi hijo el campeón
          </h2>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">
                Categoría a Importar
              </label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar categoría...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Circuito Cerrado:</strong> Todo contenido importado
                irá a cola de revisión y requiere aprobación humana antes de publicarse.
              </p>
            </div>
            
            <Button 
              onClick={handleImport}
              disabled={!category || importing}
              className="w-full"
            >
              {importing ? '⏳ Importando...' : '📥 Importar Contenido'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Panel de contenido pendiente de revisión */}
      <ReviewQueuePanel />
    </div>
  )
}
```

### Panel de Revisión de Contenido

```javascript
// src/client/app/admin/content-review/page.js
'use client'

import { useState, useEffect } from 'react'

export default function ContentReviewPage() {
  const [pendingItems, setPendingItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  
  useEffect(() => {
    loadPendingItems()
  }, [])
  
  const loadPendingItems = async () => {
    const response = await fetch('/api/admin/content/pending-review')
    const data = await response.json()
    setPendingItems(data.items)
  }
  
  const handleApprove = async (reviewId, notes) => {
    await fetch('/api/admin/content/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, notes })
    })
    
    loadPendingItems()
    setSelectedItem(null)
  }
  
  const handleReject = async (reviewId, reason) => {
    await fetch('/api/admin/content/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, reason })
    })
    
    loadPendingItems()
    setSelectedItem(null)
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        ✅ Revisión de Contenido Pendiente
      </h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
        <p className="text-sm text-blue-800">
          📊 <strong>{pendingItems.length}</strong> items pendientes de revisión
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de items pendientes */}
        <div className="md:col-span-1 space-y-4">
          {pendingItems.map(item => (
            <Card 
              key={item.review_id}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedItem?.review_id === item.review_id ? 'border-blue-500' : ''
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                      {item.content_type}
                    </span>
                    <p className="mt-2 text-sm font-medium line-clamp-2">
                      {item.content_data.question || item.content_data.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {item.ai_safety_check?.risk_level && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.ai_safety_check.risk_level === 'high' 
                        ? 'bg-red-100 text-red-700'
                        : item.ai_safety_check.risk_level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.ai_safety_check.risk_level}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Detalle del item seleccionado */}
        {selectedItem && (
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  Revisar: {selectedItem.content_type}
                </h2>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Contenido */}
                <div>
                  <h3 className="font-medium mb-2">Contenido:</h3>
                  <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedItem.content_data, null, 2)}
                  </pre>
                </div>
                
                {/* Verificación automática de IA */}
                {selectedItem.ai_safety_check && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <h3 className="font-medium mb-2">🤖 Verificación Automática:</h3>
                    <ul className="text-sm space-y-1">
                      <li>
                        Lenguaje inapropiado: {
                          selectedItem.ai_safety_check.inappropriate_language ? '❌ Sí' : '✅ No'
                        }
                      </li>
                      <li>
                        Consistente con principios: {
                          selectedItem.ai_safety_check.consistent_principles ? '✅ Sí' : '❌ No'
                        }
                      </li>
                      <li>
                        Posibles alucinaciones: {
                          selectedItem.ai_safety_check.hallucinations_detected ? '⚠️ Sí' : '✅ No'
                        }
                      </li>
                      <li className="font-medium mt-2">
                        Nivel de riesgo: 
                        <span className={`ml-2 ${
                          selectedItem.ai_safety_check.risk_level === 'high' ? 'text-red-600' :
                          selectedItem.ai_safety_check.risk_level === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {selectedItem.ai_safety_check.risk_level.toUpperCase()}
                        </span>
                      </li>
                    </ul>
                    
                    {selectedItem.ai_safety_check.recommendations && (
                      <div className="mt-3 p-3 bg-white rounded">
                        <p className="text-sm font-medium">Recomendaciones:</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {selectedItem.ai_safety_check.recommendations}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Acciones */}
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      const notes = prompt('Notas de aprobación (opcional):')
                      handleApprove(selectedItem.review_id, notes || '')
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✅ Aprobar y Publicar
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      const reason = prompt('Razón del rechazo:')
                      if (reason) handleReject(selectedItem.review_id, reason)
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    ❌ Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📱 Conectividad Multi-Plataforma

### 1. WhatsApp Integration

```python
# src/server/main/platforms/whatsapp_integration.py
from typing import Optional
import httpx

class WhatsAppPlatform:
    """
    Integración con WhatsApp usando WAHA (WhatsApp HTTP API)
    Ya existe en el codebase de Sentient
    """
    
    async def send_parent_alert(
        self, 
        parent_phone: str, 
        child_name: str,
        alert_level: str,
        message: str
    ):
        """Envía alerta a padre vía WhatsApp"""
        emoji = "🟢" if alert_level == "green" else "🟡" if alert_level == "yellow" else "🔴"
        
        full_message = f"""
{emoji} *Alerta de Fair Support Fair Play*

*Niño/a:* {child_name}
*Nivel:* {alert_level.upper()}

{message}

_Revisa el portal de padres para más detalles._
        """
        
        await self.waha_client.send_text(
            phone=parent_phone,
            text=full_message
        )
    
    async def handle_child_private_message(self, phone: str, message: str):
        """
        Maneja consulta privada de un niño vía WhatsApp
        - Verifica que el número esté registrado
        - Analiza el mensaje con IA
        - Responde con contenido aprobado
        - Genera alerta si necesario
        """
        # 1. Verificar usuario
        child = await db.fetchone("""
            SELECT * FROM users WHERE phone = $1 AND role = 'child'
        """, phone)
        
        if not child:
            return "Lo siento, no encuentro tu registro. Pide a tus padres que te registren en fairsupportfairplay.com"
        
        # 2. Analizar mensaje
        analysis = await self.analyze_child_message(message, child)
        
        # 3. Generar respuesta desde contenido aprobado
        response = await self.generate_safe_response(message, child)
        
        # 4. Enviar respuesta
        await self.waha_client.send_text(
            phone=phone,
            text=response
        )
        
        # 5. Generar alerta si necesario
        if analysis["alert_level"] in ["yellow", "red"]:
            await self.send_parent_alert(
                parent_phone=child["parent_phone"],
                child_name=child["name"],
                alert_level=analysis["alert_level"],
                message=analysis["alert_message"]
            )
```

### 2. Discord Integration

```python
# src/server/main/platforms/discord_integration.py
import discord
from discord.ext import commands
from typing import Optional

class DiscordPlatform(commands.Bot):
    """
    Bot de Discord para Fair Support Fair Play
    - Comunidad pública moderada
    - DMs privados para consultas individuales
    """
    
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True
        
        super().__init__(command_prefix='!', intents=intents)
        
        # Cargar categorías del servidor
        self.faq_categories = {}
        self.moderation_log_channel = None
    
    async def on_ready(self):
        print(f'✅ Bot conectado como {self.user}')
        
        # Configurar canales
        guild = self.guilds[0]  # Servidor principal
        self.moderation_log_channel = discord.utils.get(
            guild.channels, 
            name='moderacion-log'
        )
    
    async def on_message(self, message: discord.Message):
        """Maneja todos los mensajes"""
        if message.author.bot:
            return
        
        # DM privado al bot
        if isinstance(message.channel, discord.DMChannel):
            await self.handle_private_consultation(message)
            return
        
        # Mensaje en servidor público
        await self.handle_community_message(message)
        await self.process_commands(message)
    
    async def handle_private_consultation(self, message: discord.Message):
        """
        Maneja consulta privada de un niño/a
        - Similar al flujo de WhatsApp
        - Respuestas desde contenido aprobado
        - Genera alertas a padres si necesario
        """
        # 1. Verificar registro
        child = await db.fetchone("""
            SELECT * FROM users 
            WHERE discord_id = $1 AND role = 'child'
        """, str(message.author.id))
        
        if not child:
            await message.channel.send("""
👋 ¡Hola! Para poder ayudarte, necesito que estés registrado en Fair Support Fair Play.

Pide a tus padres que completen tu registro en: https://fairsupportfairplay.com

Una vez registrado, podrás hacerme consultas privadas sobre deporte, presión, ansiedad, y mucho más. 🏆
            """)
            return
        
        # 2. Mostrar "typing..." mientras procesamos
        async with message.channel.typing():
            # 3. Analizar mensaje
            analysis = await self.analyze_child_message(
                message.content, 
                child
            )
            
            # 4. Generar respuesta segura
            response = await self.generate_safe_response(
                message.content,
                child,
                platform="discord"
            )
            
            # 5. Enviar respuesta
            await message.channel.send(response)
            
            # 6. Generar alerta si necesario
            if analysis["alert_level"] in ["yellow", "red"]:
                await self.notify_parents(
                    child=child,
                    alert_level=analysis["alert_level"],
                    context=message.content,
                    response=response
                )
    
    async def handle_community_message(self, message: discord.Message):
        """
        Moderación automática de mensajes en comunidad
        - Filtro de lenguaje inapropiado
        - Detección de bullying
        - Log de moderación
        """
        # Análisis de moderación
        moderation_result = await self.moderate_message(message.content)
        
        if moderation_result["should_delete"]:
            await message.delete()
            
            # Enviar DM al autor
            try:
                await message.author.send(f"""
⚠️ Tu mensaje en Fair Support Fair Play fue eliminado porque: {moderation_result["reason"]}

Recuerda que esta es una comunidad segura para todos los deportistas jóvenes. Por favor, sé respetuoso y constructivo.

Si tienes dudas, puedes escribirme aquí en privado.
                """)
            except:
                pass  # Usuario tiene DMs deshabilitados
            
            # Log de moderación
            if self.moderation_log_channel:
                await self.moderation_log_channel.send(
                    f"⚠️ Mensaje eliminado de {message.author.mention}\n"
                    f"Razón: {moderation_result['reason']}\n"
                    f"Contenido: ||{message.content}||"
                )
    
    @commands.command(name='faq')
    async def faq_command(self, ctx, *, query: str):
        """
        !faq <pregunta>
        Busca en la base de conocimiento aprobada
        """
        results = await db.fetch("""
            SELECT question, answer, category
            FROM faq_items
            WHERE 
                question ILIKE $1 OR 
                answer ILIKE $1 OR
                tags @> $2
            LIMIT 3
        """, f"%{query}%", json.dumps([query]))
        
        if not results:
            await ctx.send("❓ No encontré respuestas a esa pregunta. ¿Quieres preguntarme por DM?")
            return
        
        embed = discord.Embed(
            title=f"📚 Resultados para: {query}",
            color=discord.Color.blue()
        )
        
        for i, result in enumerate(results, 1):
            embed.add_field(
                name=f"{i}. {result['question']}",
                value=f"{result['answer'][:200]}...\n*Categoría: {result['category']}*",
                inline=False
            )
        
        embed.set_footer(text="💬 Escríbeme por DM para consultas privadas")
        
        await ctx.send(embed=embed)
    
    @commands.command(name='ayuda')
    async def help_command(self, ctx):
        """Muestra comandos disponibles"""
        embed = discord.Embed(
            title="⚽ Fair Support Fair Play - Comandos",
            description="Bot de apoyo emocional para deportistas jóvenes",
            color=discord.Color.green()
        )
        
        embed.add_field(
            name="!faq <pregunta>",
            value="Busca en la base de conocimiento",
            inline=False
        )
        
        embed.add_field(
            name="DM Privado",
            value="Escríbeme en privado para consultas personales",
            inline=False
        )
        
        embed.add_field(
            name="Comunidad",
            value="Participa en los canales temáticos del servidor",
            inline=False
        )
        
        await ctx.send(embed=embed)
```

### 3. SMS Integration (Twilio)

```python
# src/server/main/platforms/sms_integration.py
from twilio.rest import Client

class SMSPlatform:
    """
    Integración SMS para alertas críticas
    Solo se usa para alertas ROJAS a padres
    """
    
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.client = Client(account_sid, auth_token)
        self.from_number = from_number
    
    async def send_critical_alert(
        self,
        parent_phone: str,
        child_name: str,
        alert_type: str
    ):
        """
        Envía SMS solo para alertas críticas (ROJAS)
        """
        message = f"""
🔴 ALERTA CRÍTICA - Fair Support Fair Play

Su hijo/a {child_name} ha mostrado señales que requieren su atención inmediata.

Por favor ingrese al portal de padres lo antes posible:
https://fairsupportfairplay.com/parent-portal

Si es una emergencia, contacte servicios profesionales:
- Línea de Crisis: 1-800-XXX-XXXX
        """
        
        try:
            self.client.messages.create(
                to=parent_phone,
                from_=self.from_number,
                body=message
            )
            
            # Log SMS enviado
            await db.execute("""
                INSERT INTO sms_log (
                    parent_phone, child_name, alert_type, sent_at
                ) VALUES ($1, $2, $3, NOW())
            """, parent_phone, child_name, alert_type)
            
        except Exception as e:
            # Log error pero no falla el sistema
            print(f"Error sending SMS: {e}")
```

---

## 🔒 Sistema de Circuito Cerrado - Flujo Completo

### Diagrama de Flujo

```
1. IMPORTACIÓN DESDE NOTEBOOKLM
   ↓
   [Conector MCP extrae contenido]
   ↓
2. VERIFICACIÓN AUTOMÁTICA (IA)
   ↓
   [Análisis de seguridad, detección de alucinaciones]
   ↓
3. COLA DE REVISIÓN HUMANA ⚠️
   ↓
   [Admin revisa y aprueba/rechaza]
   ↓
4. PUBLICACIÓN EN BD APROBADA
   ↓
   [Contenido disponible para plataformas]
   ↓
5. DISTRIBUCIÓN MULTI-PLATAFORMA
   ↓
   [Web, Discord, WhatsApp]
```

### Protecciones Implementadas

1. **✅ Verificación Automática con IA**
   - Detección de lenguaje inapropiado
   - Verificación de consistencia con fuente
   - Detección de alucinaciones
   - Nivel de riesgo asignado

2. **✅ Revisión Humana Obligatoria**
   - TODO contenido debe ser aprobado por admin
   - No se publica nada automáticamente
   - Trazabilidad completa (quién aprobó, cuándo, notas)

3. **✅ Respuestas Basadas en Contenido Aprobado**
   - El bot SOLO responde con contenido de la BD aprobada
   - Búsqueda semántica en FAQ aprobadas
   - No genera respuestas "on the fly"

4. **✅ Moderación Continua**
   - Mensajes de comunidad moderados automáticamente
   - Log completo de moderación
   - Escalamiento a humanos cuando necesario

---

## 📊 Métricas y Monitoreo

### Dashboard de Administración

```sql
-- Métricas clave a mostrar en admin dashboard

-- 1. Contenido pendiente de revisión
SELECT COUNT(*) as pending_count
FROM content_review_queue
WHERE status = 'pending_review';

-- 2. Contenido aprobado por categoría
SELECT category, COUNT(*) as approved_count
FROM faq_items
GROUP BY category;

-- 3. Alertas generadas (últimos 7 días)
SELECT alert_level, COUNT(*) as count
FROM alerts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY alert_level;

-- 4. Consultas por plataforma
SELECT platform, COUNT(*) as queries_count
FROM child_queries
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY platform;

-- 5. Tasa de aprobación de contenido
SELECT 
  COUNT(CASE WHEN status = 'approved' THEN 1 END)::float / 
  COUNT(*)::float * 100 as approval_rate
FROM content_review_queue;
```

---

## 🚀 Plan de Implementación

### Fase 1 (Semana 1-2): Core Admin
- [ ] Configurar MCP de NotebookLM
- [ ] Crear tablas de DB (review_queue, faq_items, etc.)
- [ ] API de importación desde NotebookLM
- [ ] Sistema de verificación automática con IA
- [ ] Dashboard básico de admin

### Fase 2 (Semana 3-4): Revisión y Publicación
- [ ] UI de cola de revisión
- [ ] Sistema de aprobación/rechazo
- [ ] Publicación en BD aprobada
- [ ] Búsqueda semántica en FAQ

### Fase 3 (Semana 5-6): Multi-Plataforma
- [ ] Bot de Discord completo
- [ ] Integración WhatsApp (WAHA)
- [ ] SMS para alertas críticas
- [ ] Sistema de moderación automática

### Fase 4 (Semana 7-8): Testing y Refinamiento
- [ ] Testing end-to-end
- [ ] Refinamiento de prompts de IA
- [ ] Optimización de búsqueda
- [ ] Documentación para admins

---

## ⚠️ Consideraciones de Seguridad

1. **Autenticación de Admin**
   - 2FA obligatorio para admins
   - Roles: super_admin, content_reviewer, moderator
   - Audit log completo

2. **Rate Limiting**
   - Límite de consultas por niño/día
   - Protección contra spam
   - Detección de abuso

3. **Privacidad**
   - Conversaciones privadas encriptadas
   - No almacenar datos sensibles sin necesidad
   - Cumplimiento COPPA/GDPR

4. **Backup y Recuperación**
   - Backup diario de BD
   - Versionado de contenido aprobado
   - Plan de recuperación ante desastres

---

**Marcelo Roffe © 2026 - Todos los Derechos Reservados**

Este documento describe el sistema de administración seguro y con circuito cerrado para proteger a los niños deportistas mientras se brinda apoyo emocional de calidad.
