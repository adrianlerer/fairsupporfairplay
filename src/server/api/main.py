"""
Fair Support Fair Play - API REST
==================================

API REST completa para el sistema de apoyo emocional a niños deportistas.

Endpoints:
- /api/admin/* - Gestión de contenido
- /api/content/* - FAQ, ejercicios, biblioteca
- /api/alerts/* - Sistema de alertas
- /api/queries/* - Consultas de niños
- /api/analytics/* - Métricas y estadísticas

Tecnología: FastAPI + PostgreSQL + OpenAI

Consultor y Curador de Contenido: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import os
import asyncpg
import openai
from contextlib import asynccontextmanager

# Configuración
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/fairsupport")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# Pool de conexiones a DB
db_pool = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management"""
    # Startup
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    print("✅ Database pool created")
    
    yield
    
    # Shutdown
    await db_pool.close()
    print("❌ Database pool closed")


# FastAPI App
app = FastAPI(
    title="Fair Support Fair Play API",
    description="API REST para plataforma de apoyo emocional a niños deportistas",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# MODELS (Pydantic)
# ============================================================================

class ReviewStatus(str, Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PUBLISHED = "published"


class AlertLevel(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"


class ContentType(str, Enum):
    FAQ = "faq"
    EXERCISE = "exercise"
    VIDEO = "video"
    ARTICLE = "article"


class ContentImportRequest(BaseModel):
    category: str = Field(..., description="Categoría de contenido")
    content_types: List[str] = Field(default=["faq", "exercise"], description="Tipos a importar")


class ContentReviewResponse(BaseModel):
    review_id: str
    content_type: str
    category: str
    content_data: Dict[str, Any]
    status: ReviewStatus
    ai_safety_check: Optional[Dict[str, Any]] = None
    created_at: datetime


class ApproveContentRequest(BaseModel):
    review_id: str
    admin_id: str
    notes: str = ""


class RejectContentRequest(BaseModel):
    review_id: str
    admin_id: str
    reason: str


class FAQItem(BaseModel):
    id: Optional[str] = None
    category: str
    question: str
    answer: str
    author: str = "Fair Support Fair Play"  # Curado por Marcelo Roffé
    age_group: str = "all"
    sport: str = "fútbol"
    tags: List[str] = []
    helpful_count: int = 0
    published_at: Optional[datetime] = None


class ExerciseItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    instructions: List[str]
    category: str
    duration_minutes: int = 10
    difficulty: str = "medio"
    age_group: str = "all"
    published_at: Optional[datetime] = None


class ChildQuery(BaseModel):
    child_id: str
    query_text: str
    platform: str = "web"


class ChildQueryResponse(BaseModel):
    query_id: str
    response_text: str
    sentiment_analysis: Dict[str, Any]
    alert_generated: bool
    alert_level: Optional[AlertLevel] = None


class Alert(BaseModel):
    id: Optional[str] = None
    child_id: str
    parent_id: str
    severity: AlertLevel
    trigger_type: str
    conversation_snippet: str
    ai_analysis: Dict[str, Any]
    notification_sent: bool = False
    resolved: bool = False
    created_at: Optional[datetime] = None


class AnalyticsResponse(BaseModel):
    pending_reviews: int
    approved_content: int
    active_alerts: Dict[str, int]  # {"green": 5, "yellow": 3, "red": 1}
    queries_last_7_days: int
    approval_rate: float


# ============================================================================
# DEPENDENCY: Database Connection
# ============================================================================

async def get_db():
    """Dependency para obtener conexión de DB"""
    async with db_pool.acquire() as conn:
        yield conn


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Fair Support Fair Play API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check(db: asyncpg.Connection = Depends(get_db)):
    """Health check con verificación de DB"""
    try:
        # Test DB connection
        result = await db.fetchval("SELECT 1")
        
        return {
            "status": "healthy",
            "database": "connected" if result == 1 else "error",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database error: {str(e)}"
        )


# ============================================================================
# ADMIN ENDPOINTS - Gestión de Contenido
# ============================================================================

@app.post("/api/admin/import-from-notebooklm", response_model=Dict[str, Any])
async def import_from_notebooklm(
    request: ContentImportRequest,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Importa contenido desde NotebookLM de Marcelo Roffé
    
    Flujo:
    1. Conectar a NotebookLM MCP
    2. Extraer contenido de la categoría especificada
    3. Parsear y estructurar
    4. Enviar a content_review_queue con AI safety check
    """
    try:
        # TODO: Importar NotebookLMConnector real
        from notebooklm_connector import NotebookLMConnector
        from content_review import ContentReviewSystem
        
        connector = NotebookLMConnector()
        review_system = ContentReviewSystem(db)
        
        # Importar contenido
        items = await connector.import_content_by_category(
            category=request.category,
            content_types=request.content_types
        )
        
        # Enviar a revisión
        review_ids = []
        for item in items:
            review_id = await review_system.submit_for_review(item)
            review_ids.append(review_id)
        
        return {
            "success": True,
            "items_imported": len(items),
            "review_ids": review_ids,
            "category": request.category
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing content: {str(e)}"
        )


@app.get("/api/admin/pending-reviews", response_model=List[ContentReviewResponse])
async def get_pending_reviews(
    limit: int = 50,
    content_type: Optional[str] = None,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Obtiene contenido pendiente de revisión
    """
    try:
        query = """
            SELECT 
                id, review_id, content_type, content_data, 
                category, status, ai_safety_check, created_at
            FROM content_review_queue
            WHERE status = $1
        """
        params = [ReviewStatus.PENDING_REVIEW.value]
        
        if content_type:
            query += " AND content_type = $2"
            params.append(content_type)
        
        query += " ORDER BY created_at ASC LIMIT ${}".format(len(params) + 1)
        params.append(limit)
        
        rows = await db.fetch(query, *params)
        
        return [
            ContentReviewResponse(
                review_id=row["review_id"],
                content_type=row["content_type"],
                category=row["category"],
                content_data=row["content_data"],
                status=ReviewStatus(row["status"]),
                ai_safety_check=row["ai_safety_check"],
                created_at=row["created_at"]
            )
            for row in rows
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching pending reviews: {str(e)}"
        )


@app.post("/api/admin/approve-content")
async def approve_content(
    request: ApproveContentRequest,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Aprueba contenido y lo publica
    """
    try:
        from content_review import ContentReviewSystem
        
        review_system = ContentReviewSystem(db)
        success = await review_system.approve_content(
            review_id=request.review_id,
            admin_id=request.admin_id,
            notes=request.notes
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review ID not found"
            )
        
        return {
            "success": True,
            "review_id": request.review_id,
            "status": "approved_and_published"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving content: {str(e)}"
        )


@app.post("/api/admin/reject-content")
async def reject_content(
    request: RejectContentRequest,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Rechaza contenido
    """
    try:
        from content_review import ContentReviewSystem
        
        review_system = ContentReviewSystem(db)
        success = await review_system.reject_content(
            review_id=request.review_id,
            admin_id=request.admin_id,
            reason=request.reason
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review ID not found"
            )
        
        return {
            "success": True,
            "review_id": request.review_id,
            "status": "rejected"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rejecting content: {str(e)}"
        )


# ============================================================================
# CONTENT ENDPOINTS - FAQ, Ejercicios, Biblioteca
# ============================================================================

@app.get("/api/content/faq", response_model=List[FAQItem])
async def get_faq_items(
    category: Optional[str] = None,
    age_group: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Obtiene FAQ aprobadas y publicadas
    """
    try:
        query = "SELECT * FROM faq_items WHERE 1=1"
        params = []
        
        if category:
            params.append(category)
            query += f" AND category = ${len(params)}"
        
        if age_group:
            params.append(age_group)
            query += f" AND age_group = ${len(params)}"
        
        if search:
            params.append(f"%{search}%")
            query += f" AND (question ILIKE ${len(params)} OR answer ILIKE ${len(params)})"
        
        query += f" ORDER BY helpful_count DESC, published_at DESC LIMIT ${len(params) + 1}"
        params.append(limit)
        
        rows = await db.fetch(query, *params)
        
        return [
            FAQItem(
                id=str(row["id"]),
                category=row["category"],
                question=row["question"],
                answer=row["answer"],
                author=row["author"],
                age_group=row["age_group"],
                sport=row["sport"],
                tags=row["tags"] or [],
                helpful_count=row["helpful_count"],
                published_at=row["published_at"]
            )
            for row in rows
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching FAQ items: {str(e)}"
        )


@app.get("/api/content/exercises", response_model=List[ExerciseItem])
async def get_exercises(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: int = 20,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Obtiene ejercicios aprobados
    """
    try:
        query = "SELECT * FROM exercise_items WHERE 1=1"
        params = []
        
        if category:
            params.append(category)
            query += f" AND category = ${len(params)}"
        
        if difficulty:
            params.append(difficulty)
            query += f" AND difficulty = ${len(params)}"
        
        query += f" ORDER BY published_at DESC LIMIT ${len(params) + 1}"
        params.append(limit)
        
        rows = await db.fetch(query, *params)
        
        return [
            ExerciseItem(
                id=str(row["id"]),
                title=row["title"],
                description=row["description"],
                instructions=row["instructions"] or [],
                category=row["category"],
                duration_minutes=row["duration_minutes"],
                difficulty=row["difficulty"],
                age_group=row["age_group"],
                published_at=row["published_at"]
            )
            for row in rows
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching exercises: {str(e)}"
        )


@app.post("/api/content/faq/{faq_id}/helpful")
async def mark_faq_helpful(
    faq_id: str,
    db: asyncpg.Connection = Depends(get_db)
):
    """Marca una FAQ como útil"""
    try:
        await db.execute("""
            UPDATE faq_items 
            SET helpful_count = helpful_count + 1,
                view_count = view_count + 1
            WHERE id = $1
        """, faq_id)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error marking FAQ as helpful: {str(e)}"
        )


# ============================================================================
# QUERIES ENDPOINTS - Consultas de Niños
# ============================================================================

@app.post("/api/queries/submit", response_model=ChildQueryResponse)
async def submit_child_query(
    query: ChildQuery,
    db: asyncpg.Connection = Depends(get_db)
):
    """
    Procesa consulta de un niño
    
    Flujo:
    1. Analizar sentimiento con OpenAI
    2. Buscar respuesta en FAQ aprobadas (búsqueda semántica)
    3. Generar alerta si necesario
    4. Registrar en logs
    """
    try:
        # 1. Análisis de sentimiento
        sentiment_analysis = await analyze_sentiment(query.query_text)
        
        # 2. Buscar respuesta en FAQ
        response_text = await generate_safe_response(query.query_text, db)
        
        # 3. Determinar nivel de alerta
        alert_level = determine_alert_level(sentiment_analysis)
        alert_generated = alert_level in [AlertLevel.YELLOW, AlertLevel.RED]
        
        # 4. Registrar en DB
        query_id = await db.fetchval("""
            INSERT INTO child_queries (
                child_id, query_text, response_text, platform,
                sentiment_score, emotion_detected, alert_generated,
                alert_level, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id
        """,
            query.child_id,
            query.query_text,
            response_text,
            query.platform,
            sentiment_analysis.get("sentiment_score"),
            sentiment_analysis.get("emotion"),
            alert_generated,
            alert_level.value if alert_generated else None
        )
        
        # 5. Generar alerta si necesario
        if alert_generated:
            await create_alert(
                child_id=query.child_id,
                alert_level=alert_level,
                context=query.query_text,
                analysis=sentiment_analysis,
                db=db
            )
        
        return ChildQueryResponse(
            query_id=str(query_id),
            response_text=response_text,
            sentiment_analysis=sentiment_analysis,
            alert_generated=alert_generated,
            alert_level=alert_level if alert_generated else None
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )


# ============================================================================
# ALERTS ENDPOINTS - Sistema de Alertas
# ============================================================================

@app.get("/api/alerts/parent/{parent_id}", response_model=List[Alert])
async def get_parent_alerts(
    parent_id: str,
    unresolved_only: bool = True,
    db: asyncpg.Connection = Depends(get_db)
):
    """Obtiene alertas de un padre"""
    try:
        query = "SELECT * FROM alerts WHERE parent_id = $1"
        params = [parent_id]
        
        if unresolved_only:
            query += " AND resolved = FALSE"
        
        query += " ORDER BY created_at DESC"
        
        rows = await db.fetch(query, *params)
        
        return [
            Alert(
                id=str(row["id"]),
                child_id=str(row["child_id"]),
                parent_id=str(row["parent_id"]),
                severity=AlertLevel(row["severity"]),
                trigger_type=row["trigger_type"],
                conversation_snippet=row["conversation_snippet"],
                ai_analysis=row["ai_analysis"],
                notification_sent=row["notification_sent"],
                resolved=row["resolved"],
                created_at=row["created_at"]
            )
            for row in rows
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching alerts: {str(e)}"
        )


@app.post("/api/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    admin_id: str,
    notes: str = "",
    db: asyncpg.Connection = Depends(get_db)
):
    """Marca una alerta como resuelta"""
    try:
        await db.execute("""
            UPDATE alerts 
            SET resolved = TRUE,
                resolved_at = NOW(),
                resolved_by = $1,
                resolution_notes = $2
            WHERE id = $3
        """, admin_id, notes, alert_id)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resolving alert: {str(e)}"
        )


# ============================================================================
# ANALYTICS ENDPOINTS - Métricas y Estadísticas
# ============================================================================

@app.get("/api/analytics/overview", response_model=AnalyticsResponse)
async def get_analytics_overview(db: asyncpg.Connection = Depends(get_db)):
    """Dashboard de métricas principales"""
    try:
        # Pending reviews
        pending_reviews = await db.fetchval("""
            SELECT COUNT(*) FROM content_review_queue
            WHERE status = 'pending_review'
        """)
        
        # Approved content
        approved_content = await db.fetchval("""
            SELECT COUNT(*) FROM content_review_queue
            WHERE status = 'approved'
        """)
        
        # Active alerts by severity
        alert_rows = await db.fetch("""
            SELECT severity, COUNT(*) as count
            FROM alerts
            WHERE resolved = FALSE
            GROUP BY severity
        """)
        active_alerts = {row["severity"]: row["count"] for row in alert_rows}
        
        # Queries last 7 days
        queries_7d = await db.fetchval("""
            SELECT COUNT(*) FROM child_queries
            WHERE created_at >= NOW() - INTERVAL '7 days'
        """)
        
        # Approval rate
        approval_rate_row = await db.fetchrow("""
            SELECT 
              COUNT(CASE WHEN status = 'approved' THEN 1 END)::float / 
              NULLIF(COUNT(*)::float, 0) * 100 as rate
            FROM content_review_queue
            WHERE status IN ('approved', 'rejected')
        """)
        approval_rate = approval_rate_row["rate"] if approval_rate_row and approval_rate_row["rate"] else 0.0
        
        return AnalyticsResponse(
            pending_reviews=pending_reviews or 0,
            approved_content=approved_content or 0,
            active_alerts=active_alerts,
            queries_last_7_days=queries_7d or 0,
            approval_rate=round(approval_rate, 2)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching analytics: {str(e)}"
        )


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def analyze_sentiment(text: str) -> Dict[str, Any]:
    """Análisis de sentimiento con OpenAI"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un experto en análisis de emociones de niños deportistas."},
                {"role": "user", "content": f"""
Analiza el siguiente mensaje de un niño deportista y extrae:
1. Sentimiento general (-1 muy negativo a 1 muy positivo)
2. Emoción principal detectada
3. Palabras clave
4. Nivel de preocupación (bajo/medio/alto)

Mensaje: "{text}"

Responde en JSON:
{{"sentiment_score": float, "emotion": str, "keywords": [str], "concern_level": str}}
                """}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        # Fallback analysis
        return {
            "sentiment_score": 0.0,
            "emotion": "neutral",
            "keywords": [],
            "concern_level": "bajo"
        }


async def generate_safe_response(query: str, db: asyncpg.Connection) -> str:
    """Genera respuesta desde FAQ aprobadas"""
    # Búsqueda simple en FAQ (búsqueda semántica en siguiente versión)
    row = await db.fetchrow("""
        SELECT question, answer FROM faq_items
        WHERE question ILIKE $1 OR answer ILIKE $1
        ORDER BY helpful_count DESC
        LIMIT 1
    """, f"%{query}%")
    
    if row:
        return f"Pregunta relacionada: {row['question']}\n\n{row['answer']}"
    else:
        return "Gracias por tu pregunta. Estoy buscando la mejor respuesta para ti. ¿Puedes darme más detalles?"


def determine_alert_level(sentiment_analysis: Dict[str, Any]) -> Optional[AlertLevel]:
    """Determina nivel de alerta basado en sentimiento"""
    concern = sentiment_analysis.get("concern_level", "bajo")
    sentiment = sentiment_analysis.get("sentiment_score", 0.0)
    
    if concern == "alto" or sentiment < -0.7:
        return AlertLevel.RED
    elif concern == "medio" or sentiment < -0.3:
        return AlertLevel.YELLOW
    else:
        return AlertLevel.GREEN


async def create_alert(
    child_id: str,
    alert_level: AlertLevel,
    context: str,
    analysis: Dict[str, Any],
    db: asyncpg.Connection
):
    """Crea una alerta para padres"""
    # Obtener parent_id
    parent_id = await db.fetchval("""
        SELECT parent_id FROM users WHERE id = $1
    """, child_id)
    
    if not parent_id:
        return
    
    # Crear alerta
    await db.execute("""
        INSERT INTO alerts (
            child_id, parent_id, severity, trigger_type,
            conversation_snippet, ai_analysis, notification_sent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())
    """,
        child_id,
        parent_id,
        alert_level.value,
        "sentiment_analysis",
        context[:200],
        analysis
    )


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    print(f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║  Fair Support Fair Play API                                  ║
    ║  Running on http://0.0.0.0:{port}                              ║
    ║                                                              ║
    ║  Docs: http://0.0.0.0:{port}/docs                              ║
    ║  Consultor y Curador: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados                                        ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
