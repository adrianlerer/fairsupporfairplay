"""
Content Review System - Fair Support Fair Play
===============================================

Sistema de revisión y aprobación humana de contenido (CIRCUITO CERRADO)

Flujo:
1. Contenido importado desde NotebookLM → content_review_queue
2. Verificación automática con IA → ai_safety_check
3. Revisión humana OBLIGATORIA → admin aprueba/rechaza
4. Solo después de aprobación → publicación en tablas públicas

Protección:
- TODO contenido requiere aprobación humana
- Verificación automática de seguridad
- Detección de alucinaciones y sesgos
- Trazabilidad completa

Consultor y Curador: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados
"""

from typing import Dict, List, Optional, Any
from enum import Enum
from datetime import datetime
import json
import logging
from uuid import uuid4

# Para análisis de IA (requiere OpenAI o LLM local)
import openai

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ReviewStatus(str, Enum):
    """Estados posibles del contenido en revisión"""
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_EDITING = "needs_editing"
    PUBLISHED = "published"


class ContentReviewSystem:
    """
    Sistema de revisión y aprobación de contenido con circuito cerrado
    
    Características:
    - Verificación automática con IA
    - Revisión humana obligatoria
    - Prevención de alucinaciones
    - Audit trail completo
    """
    
    def __init__(self, db_connection, openai_api_key: Optional[str] = None):
        """
        Inicializa el sistema de revisión
        
        Args:
            db_connection: Conexión a la base de datos PostgreSQL
            openai_api_key: API key de OpenAI (opcional, usa variable de entorno)
        """
        self.db = db_connection
        
        # Configurar OpenAI si se proporciona API key
        if openai_api_key:
            openai.api_key = openai_api_key
        
        logger.info("Content Review System inicializado")
    
    async def submit_for_review(
        self, 
        content_item: Dict[str, Any]
    ) -> str:
        """
        Envía contenido importado a cola de revisión
        
        Args:
            content_item: Diccionario con datos del contenido
            
        Returns:
            review_id: ID único de la revisión
        """
        review_id = content_item.get("review_id", str(uuid4()))
        
        # Ejecutar verificación automática de seguridad con IA
        ai_safety_check = await self._ai_safety_check(content_item)
        
        # Insertar en la cola de revisión
        await self.db.execute("""
            INSERT INTO content_review_queue (
                review_id, 
                content_type,
                content_data,
                category,
                source,
                author,
                status,
                ai_safety_check,
                needs_human_review,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, 
            review_id,
            content_item.get("type"),
            json.dumps(content_item),
            content_item.get("category"),
            content_item.get("source", "notebooklm"),
            content_item.get("author", "Marcelo Roffé"),
            ReviewStatus.PENDING_REVIEW.value,
            json.dumps(ai_safety_check),
            True,  # ⚠️ Siempre requiere revisión humana
            datetime.now()
        )
        
        logger.info(f"✅ Contenido enviado a revisión: {review_id}")
        logger.info(f"   Tipo: {content_item.get('type')}, Categoría: {content_item.get('category')}")
        logger.info(f"   Nivel de riesgo IA: {ai_safety_check.get('risk_level', 'unknown')}")
        
        return review_id
    
    async def _ai_safety_check(
        self, 
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Verificación automática de seguridad con IA
        
        Analiza:
        - Lenguaje inapropiado para niños
        - Consistencia con principios de psicología deportiva
        - Posibles alucinaciones o información no verificable
        - Nivel de riesgo general
        
        Args:
            content: Diccionario con el contenido a analizar
            
        Returns:
            Diccionario con resultados de la verificación
        """
        try:
            # Construir prompt de verificación
            prompt = f"""
Eres un experto en psicología deportiva infantil y seguridad de contenido para menores.

Analiza el siguiente contenido destinado a niños deportistas (8-18 años) y evalúa su seguridad:

TIPO: {content.get("type")}
CATEGORÍA: {content.get("category")}
CONTENIDO: {json.dumps(content, indent=2, ensure_ascii=False)}

Por favor analiza:

1. LENGUAJE INAPROPIADO:
   ¿Contiene lenguaje inapropiado, violento, sexual o discriminatorio?
   Respuesta: Sí/No
   Si Sí, especifica qué encontraste.

2. CONSISTENCIA CON PRINCIPIOS:
   ¿Es consistente con principios éticos de psicología deportiva infantil?
   ¿Promueve valores positivos como resiliencia, fair play, respeto?
   Respuesta: Sí/No
   Explicación breve.

3. ALUCINACIONES Y VERIFICABILIDAD:
   ¿Detectas información que parece inventada o no verificable?
   ¿Hace afirmaciones médicas o psicológicas sin fundamento?
   Respuesta: Sí/No
   Si Sí, especifica qué contenido es sospechoso.

4. TONO Y ENFOQUE:
   ¿El tono es empático, apropiado para la edad y alentador?
   ¿Evita presionar o generar ansiedad adicional?
   Respuesta: Sí/No

5. NIVEL DE RIESGO GENERAL:
   Basado en tu análisis, clasifica el nivel de riesgo:
   - "bajo": Contenido seguro y apropiado
   - "medio": Necesita pequeñas correcciones
   - "alto": Problemático, requiere revisión detallada

6. RECOMENDACIONES PARA EL REVISOR HUMANO:
   Proporciona 2-3 puntos clave que el revisor humano debe verificar.

Responde SOLO en formato JSON:
{{
  "inappropriate_language": boolean,
  "inappropriate_details": "string o null",
  "consistent_principles": boolean,
  "principles_explanation": "string",
  "hallucinations_detected": boolean,
  "hallucination_details": "string o null",
  "appropriate_tone": boolean,
  "risk_level": "bajo|medio|alto",
  "recommendations": "string con 2-3 recomendaciones"
}}
"""
            
            # Llamar a la IA
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Eres un experto en seguridad de contenido infantil y psicología deportiva."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Respuestas más determinísticas
                max_tokens=800
            )
            
            # Extraer y parsear la respuesta
            ai_response = response.choices[0].message.content.strip()
            
            # Intentar parsear JSON
            try:
                safety_check = json.loads(ai_response)
            except json.JSONDecodeError:
                # Si falla el parsing, crear resultado de fallback
                logger.warning("No se pudo parsear respuesta de IA como JSON")
                safety_check = {
                    "inappropriate_language": False,
                    "inappropriate_details": None,
                    "consistent_principles": True,
                    "principles_explanation": "Análisis automático no disponible",
                    "hallucinations_detected": False,
                    "hallucination_details": None,
                    "appropriate_tone": True,
                    "risk_level": "medio",
                    "recommendations": "Revisión manual completa necesaria debido a error de parsing de IA"
                }
            
            # Añadir metadata
            safety_check["checked_at"] = datetime.now().isoformat()
            safety_check["ai_model"] = "gpt-4"
            
            return safety_check
            
        except Exception as e:
            logger.error(f"Error en AI safety check: {e}")
            
            # En caso de error, asumir riesgo medio y requerir revisión
            return {
                "inappropriate_language": False,
                "inappropriate_details": None,
                "consistent_principles": True,
                "principles_explanation": "Verificación IA falló",
                "hallucinations_detected": False,
                "hallucination_details": None,
                "appropriate_tone": True,
                "risk_level": "medio",
                "recommendations": f"Verificación automática falló ({str(e)}). Revisión manual obligatoria.",
                "error": str(e),
                "checked_at": datetime.now().isoformat()
            }
    
    async def get_pending_items(
        self, 
        limit: int = 50,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtiene items pendientes de revisión
        
        Args:
            limit: Número máximo de items a retornar
            filters: Filtros opcionales (content_type, category, risk_level)
            
        Returns:
            Lista de items pendientes
        """
        query = """
            SELECT 
                id,
                review_id,
                content_type,
                content_data,
                category,
                source,
                author,
                ai_safety_check,
                created_at
            FROM content_review_queue
            WHERE status = $1
        """
        params = [ReviewStatus.PENDING_REVIEW.value]
        
        # Aplicar filtros opcionales
        if filters:
            if "content_type" in filters:
                query += f" AND content_type = ${len(params) + 1}"
                params.append(filters["content_type"])
            
            if "category" in filters:
                query += f" AND category = ${len(params) + 1}"
                params.append(filters["category"])
        
        query += f" ORDER BY created_at ASC LIMIT ${len(params) + 1}"
        params.append(limit)
        
        rows = await self.db.fetch(query, *params)
        
        # Convertir a lista de dicts
        items = []
        for row in rows:
            item = dict(row)
            # Parsear JSON fields
            item["content_data"] = json.loads(item["content_data"]) if isinstance(item["content_data"], str) else item["content_data"]
            item["ai_safety_check"] = json.loads(item["ai_safety_check"]) if isinstance(item["ai_safety_check"], str) else item["ai_safety_check"]
            items.append(item)
        
        return items
    
    async def approve_content(
        self, 
        review_id: str, 
        admin_id: str,
        notes: str = ""
    ) -> bool:
        """
        Aprueba contenido después de revisión humana
        
        Args:
            review_id: ID de la revisión a aprobar
            admin_id: ID del administrador que aprueba
            notes: Notas opcionales de la revisión
            
        Returns:
            bool: True si se aprobó exitosamente
        """
        try:
            # 1. Marcar como aprobado en la cola
            await self.db.execute("""
                UPDATE content_review_queue 
                SET 
                    status = $1,
                    reviewed_by = $2,
                    reviewed_at = $3,
                    review_notes = $4,
                    updated_at = $5
                WHERE review_id = $6
            """, 
                ReviewStatus.APPROVED.value,
                admin_id,
                datetime.now(),
                notes,
                datetime.now(),
                review_id
            )
            
            # 2. Obtener el contenido aprobado
            row = await self.db.fetchrow("""
                SELECT content_data, content_type 
                FROM content_review_queue 
                WHERE review_id = $1
            """, review_id)
            
            if not row:
                logger.error(f"No se encontró review_id: {review_id}")
                return False
            
            content_data = json.loads(row["content_data"]) if isinstance(row["content_data"], str) else row["content_data"]
            content_type = row["content_type"]
            
            # 3. Publicar en la tabla correspondiente
            await self._publish_content(content_data, content_type, review_id, admin_id)
            
            # 4. Actualizar status a published
            await self.db.execute("""
                UPDATE content_review_queue 
                SET status = $1, updated_at = $2
                WHERE review_id = $3
            """, ReviewStatus.PUBLISHED.value, datetime.now(), review_id)
            
            # 5. Registrar en audit log
            await self._log_admin_action(
                admin_id=admin_id,
                action_type="content_approved",
                resource_type="content_review_queue",
                resource_id=review_id,
                details={"notes": notes, "content_type": content_type}
            )
            
            logger.info(f"✅ Contenido aprobado y publicado: {review_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error al aprobar contenido {review_id}: {e}")
            return False
    
    async def reject_content(
        self, 
        review_id: str, 
        admin_id: str,
        reason: str
    ) -> bool:
        """
        Rechaza contenido después de revisión humana
        
        Args:
            review_id: ID de la revisión a rechazar
            admin_id: ID del administrador que rechaza
            reason: Razón del rechazo
            
        Returns:
            bool: True si se rechazó exitosamente
        """
        try:
            await self.db.execute("""
                UPDATE content_review_queue 
                SET 
                    status = $1,
                    reviewed_by = $2,
                    reviewed_at = $3,
                    review_notes = $4,
                    updated_at = $5
                WHERE review_id = $6
            """, 
                ReviewStatus.REJECTED.value,
                admin_id,
                datetime.now(),
                reason,
                datetime.now(),
                review_id
            )
            
            # Registrar en audit log
            await self._log_admin_action(
                admin_id=admin_id,
                action_type="content_rejected",
                resource_type="content_review_queue",
                resource_id=review_id,
                details={"reason": reason}
            )
            
            logger.info(f"❌ Contenido rechazado: {review_id}")
            logger.info(f"   Razón: {reason}")
            return True
            
        except Exception as e:
            logger.error(f"Error al rechazar contenido {review_id}: {e}")
            return False
    
    async def _publish_content(
        self, 
        content: Dict[str, Any], 
        content_type: str,
        review_id: str,
        admin_id: str
    ):
        """
        Publica contenido aprobado en la base de datos principal
        
        Args:
            content: Datos del contenido
            content_type: Tipo de contenido ('faq', 'exercise', etc.)
            review_id: ID de la revisión original
            admin_id: ID del admin que aprobó
        """
        if content_type == "faq":
            await self.db.execute("""
                INSERT INTO faq_items (
                    category, question, answer, author, 
                    age_group, sport, tags, 
                    published_at, approved_by, source_review_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
                content.get("category"),
                content.get("question"),
                content.get("answer"),
                content.get("author", "Marcelo Roffé"),
                content.get("age_group", "all"),
                content.get("sport", "fútbol"),
                json.dumps(content.get("tags", [])),
                datetime.now(),
                admin_id,
                review_id
            )
            
        elif content_type == "exercise":
            await self.db.execute("""
                INSERT INTO exercise_items (
                    title, description, instructions,
                    category, duration_minutes, difficulty,
                    age_group, sport, tags,
                    author, published_at, approved_by, source_review_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            """,
                content.get("title"),
                content.get("description"),
                json.dumps(content.get("instructions", [])),
                content.get("category"),
                content.get("duration_minutes", 10),
                content.get("difficulty", "medio"),
                content.get("age_group", "all"),
                content.get("sport", "fútbol"),
                json.dumps(content.get("tags", [])),
                content.get("author", "Marcelo Roffé"),
                datetime.now(),
                admin_id,
                review_id
            )
        
        # Otros tipos de contenido pueden manejarse aquí...
        
        logger.info(f"📦 Contenido publicado en {content_type}")
    
    async def _log_admin_action(
        self,
        admin_id: str,
        action_type: str,
        resource_type: str,
        resource_id: str,
        details: Dict[str, Any]
    ):
        """
        Registra acción administrativa en audit log
        
        Args:
            admin_id: ID del administrador
            action_type: Tipo de acción
            resource_type: Tipo de recurso afectado
            resource_id: ID del recurso
            details: Detalles adicionales
        """
        await self.db.execute("""
            INSERT INTO admin_audit_log (
                admin_id, action_type, resource_type, resource_id,
                action_details, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
        """,
            admin_id,
            action_type,
            resource_type,
            resource_id,
            json.dumps(details),
            datetime.now()
        )
    
    async def get_review_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del sistema de revisión
        
        Returns:
            Diccionario con métricas clave
        """
        stats = {}
        
        # Total pendiente
        row = await self.db.fetchrow("""
            SELECT COUNT(*) as count
            FROM content_review_queue
            WHERE status = $1
        """, ReviewStatus.PENDING_REVIEW.value)
        stats["pending_count"] = row["count"] if row else 0
        
        # Total aprobado
        row = await self.db.fetchrow("""
            SELECT COUNT(*) as count
            FROM content_review_queue
            WHERE status = $1
        """, ReviewStatus.APPROVED.value)
        stats["approved_count"] = row["count"] if row else 0
        
        # Total rechazado
        row = await self.db.fetchrow("""
            SELECT COUNT(*) as count
            FROM content_review_queue
            WHERE status = $1
        """, ReviewStatus.REJECTED.value)
        stats["rejected_count"] = row["count"] if row else 0
        
        # Tasa de aprobación
        total = stats["approved_count"] + stats["rejected_count"]
        stats["approval_rate"] = (stats["approved_count"] / total * 100) if total > 0 else 0.0
        
        return stats
