"""
NotebookLM Connector - Fair Support Fair Play
==============================================

Conector para importar contenido curado desde NotebookLM.
Utiliza el MCP (Model Context Protocol) para acceder al notebook de contenido curado.
https://notebooklm.google.com/notebook/89cd6d09-50ce-4127-a507-26c2d348fbd1

IMPORTANTE: Todo contenido importado va a cola de revisión (CIRCUITO CERRADO)

Instalación del MCP:
  pip install notebooklm-mcp
  uv run notebooklm-mcp init https://notebooklm.google.com/notebook/89cd6d09-50ce-4127-a507-26c2d348fbd1

Consultor y Curador de Contenido: Marcelo Roffé
© Fair Support Fair Play 2026 - Todos los derechos reservados
"""

from typing import List, Dict, Optional, Any
import httpx
import json
import logging
from datetime import datetime
from uuid import uuid4

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotebookLMConnector:
    """
    Conector para importar contenido desde NotebookLM de Marcelo Roffé
    
    Características:
    - Importación por categoría de contenido
    - Parsing estructurado de respuestas
    - Validación automática de formato
    - Envío a cola de revisión humana
    """
    
    # ID del notebook de Marcelo Roffé
    DEFAULT_NOTEBOOK_ID = "89cd6d09-50ce-4127-a507-26c2d348fbd1"
    
    # Categorías de contenido soportadas
    CATEGORIES = [
        "Presión Competitiva",
        "Manejo de Fracaso",
        "Relación con Padres",
        "Relación con Entrenadores",
        "Ansiedad Pre-Competencia",
        "Conflictos de Equipo",
        "Balance Vida Deportiva/Escolar",
        "Motivación y Objetivos",
        "Autoestima y Confianza",
        "Comunicación en Equipo"
    ]
    
    def __init__(
        self, 
        mcp_endpoint: str = "http://localhost:8000",
        notebook_id: Optional[str] = None
    ):
        """
        Inicializa el conector
        
        Args:
            mcp_endpoint: URL del servidor MCP de NotebookLM
            notebook_id: ID del notebook (usa el default de Roffé si no se especifica)
        """
        self.mcp_endpoint = mcp_endpoint
        self.notebook_id = notebook_id or self.DEFAULT_NOTEBOOK_ID
        self.client = httpx.AsyncClient(timeout=60.0)
        
        logger.info(f"NotebookLM Connector inicializado - Notebook: {self.notebook_id}")
    
    async def test_connection(self) -> bool:
        """
        Verifica que el servidor MCP esté accesible
        
        Returns:
            bool: True si la conexión es exitosa
        """
        try:
            response = await self.client.get(f"{self.mcp_endpoint}/health")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error al conectar con MCP: {e}")
            return False
    
    async def list_sources(self) -> List[Dict[str, Any]]:
        """
        Lista todas las fuentes del notebook de Roffé
        
        Returns:
            List de diccionarios con metadata de cada fuente
        """
        try:
            response = await self.client.post(
                f"{self.mcp_endpoint}/tools/list_sources",
                json={"notebook_id": self.notebook_id}
            )
            response.raise_for_status()
            
            data = response.json()
            sources = data.get("sources", [])
            
            logger.info(f"Encontradas {len(sources)} fuentes en el notebook")
            return sources
            
        except Exception as e:
            logger.error(f"Error al listar fuentes: {e}")
            return []
    
    async def query_notebook(self, question: str) -> Dict[str, Any]:
        """
        Hace una consulta al notebook de Roffé
        
        Args:
            question: Pregunta o query a realizar
            
        Returns:
            Diccionario con la respuesta del notebook
        """
        try:
            response = await self.client.post(
                f"{self.mcp_endpoint}/tools/notebook_query",
                json={
                    "notebook_id": self.notebook_id,
                    "query": question
                }
            )
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error al consultar notebook: {e}")
            return {"error": str(e)}
    
    async def import_content_by_category(
        self, 
        category: str,
        content_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Importa contenido de NotebookLM filtrado por categoría
        
        Args:
            category: Categoría de contenido (debe estar en CATEGORIES)
            content_types: Tipos de contenido a extraer ['faq', 'exercise', 'case']
            
        Returns:
            List de items de contenido pendientes de revisión
        """
        if category not in self.CATEGORIES:
            logger.warning(f"Categoría '{category}' no reconocida")
        
        if content_types is None:
            content_types = ['faq', 'exercise', 'case']
        
        # Construir query específica
        query = self._build_import_query(category, content_types)
        
        logger.info(f"Importando contenido de categoría: {category}")
        logger.debug(f"Query: {query}")
        
        # Realizar consulta al notebook
        result = await self.query_notebook(query)
        
        # Parsear resultado y crear items de contenido
        content_items = self._parse_import_result(result, category)
        
        logger.info(f"Importados {len(content_items)} items de {category}")
        
        return content_items
    
    def _build_import_query(
        self, 
        category: str, 
        content_types: List[str]
    ) -> str:
        """
        Construye la query para importar contenido estructurado
        
        Args:
            category: Categoría de contenido
            content_types: Tipos de contenido a extraer
            
        Returns:
            Query formateada para NotebookLM
        """
        query = f"""
Del contenido de Marcelo Roffé sobre "{category}", extrae la siguiente información
estructurada para una plataforma de apoyo emocional a niños deportistas (8-18 años):

"""
        
        if 'faq' in content_types:
            query += """
1. PREGUNTAS FRECUENTES (FAQs):
   - Pregunta típica que un niño/adolescente deportista haría
   - Respuesta empática, clara y práctica
   - Grupo de edad apropiado: 8-12, 13-15, 16-18, o "all"
   - Deporte específico si aplica (fútbol, tenis, etc.) o "all"
"""
        
        if 'exercise' in content_types:
            query += """
2. EJERCICIOS PRÁCTICOS:
   - Título del ejercicio
   - Descripción breve
   - Instrucciones paso a paso
   - Duración estimada en minutos
   - Nivel de dificultad: fácil, medio, avanzado
"""
        
        if 'case' in content_types:
            query += """
3. CASOS DE EJEMPLO:
   - Título del caso
   - Escenario o situación
   - Resolución recomendada
   - Lecciones aprendidas
"""
        
        query += """
IMPORTANTE:
- Responde en formato JSON estrictamente siguiendo esta estructura:
{
  "faqs": [
    {
      "question": "string",
      "answer": "string",
      "age_group": "8-12|13-15|16-18|all",
      "sport": "string o 'all'"
    }
  ],
  "exercises": [
    {
      "title": "string",
      "description": "string",
      "instructions": ["paso1", "paso2", "paso3"],
      "duration_minutes": number,
      "difficulty": "fácil|medio|avanzado"
    }
  ],
  "cases": [
    {
      "title": "string",
      "scenario": "string",
      "resolution": "string",
      "lessons": "string"
    }
  ]
}

- Lenguaje apropiado para niños y adolescentes
- Tono empático y alentador
- Basado estrictamente en el contenido del notebook
- NO inventes información que no esté en las fuentes
"""
        
        return query.strip()
    
    def _parse_import_result(
        self, 
        result: Dict[str, Any], 
        category: str
    ) -> List[Dict[str, Any]]:
        """
        Parsea el resultado de la query y crea items de contenido
        
        Args:
            result: Resultado de la query al notebook
            category: Categoría del contenido importado
            
        Returns:
            List de items de contenido con metadata
        """
        content_items = []
        
        try:
            # Extraer la respuesta del notebook
            answer = result.get("answer", "{}")
            
            # Intentar parsear JSON
            try:
                data = json.loads(answer)
            except json.JSONDecodeError:
                # Si no es JSON válido, intentar extraer del texto
                logger.warning("Respuesta no es JSON válido, creando item raw para revisión manual")
                return [{
                    "review_id": str(uuid4()),
                    "type": "raw_import",
                    "category": category,
                    "content": answer,
                    "status": "needs_parsing",
                    "source": "notebooklm",
                    "author": "Fair Support Fair Play"  # Curado por Marcelo Roffé,
                    "imported_at": datetime.now().isoformat(),
                    "needs_human_review": True,
                    "parsing_error": "JSON inválido"
                }]
            
            # Parsear FAQs
            for faq in data.get("faqs", []):
                content_items.append({
                    "review_id": str(uuid4()),
                    "type": "faq",
                    "category": category,
                    "question": faq.get("question", ""),
                    "answer": faq.get("answer", ""),
                    "age_group": faq.get("age_group", "all"),
                    "sport": faq.get("sport", "fútbol"),
                    "tags": [category.lower().replace(" ", "_")],
                    "status": "pending_review",  # ⚠️ CIRCUITO CERRADO
                    "source": "notebooklm",
                    "author": "Fair Support Fair Play"  # Curado por Marcelo Roffé,
                    "imported_at": datetime.now().isoformat(),
                    "needs_human_review": True
                })
            
            # Parsear Ejercicios
            for exercise in data.get("exercises", []):
                content_items.append({
                    "review_id": str(uuid4()),
                    "type": "exercise",
                    "category": category,
                    "title": exercise.get("title", ""),
                    "description": exercise.get("description", ""),
                    "instructions": exercise.get("instructions", []),
                    "duration_minutes": exercise.get("duration_minutes", 10),
                    "difficulty": exercise.get("difficulty", "medio"),
                    "status": "pending_review",
                    "source": "notebooklm",
                    "author": "Fair Support Fair Play"  # Curado por Marcelo Roffé,
                    "imported_at": datetime.now().isoformat(),
                    "needs_human_review": True
                })
            
            # Parsear Casos
            for case in data.get("cases", []):
                content_items.append({
                    "review_id": str(uuid4()),
                    "type": "case",
                    "category": category,
                    "title": case.get("title", ""),
                    "scenario": case.get("scenario", ""),
                    "resolution": case.get("resolution", ""),
                    "lessons": case.get("lessons", ""),
                    "status": "pending_review",
                    "source": "notebooklm",
                    "author": "Fair Support Fair Play"  # Curado por Marcelo Roffé,
                    "imported_at": datetime.now().isoformat(),
                    "needs_human_review": True
                })
            
            # Log de items parseados
            logger.info(
                f"Parseados: {len(data.get('faqs', []))} FAQs, "
                f"{len(data.get('exercises', []))} ejercicios, "
                f"{len(data.get('cases', []))} casos"
            )
            
        except Exception as e:
            logger.error(f"Error al parsear resultado: {e}")
            # Crear item de error para revisión manual
            content_items.append({
                "review_id": str(uuid4()),
                "type": "raw_import",
                "category": category,
                "content": str(result),
                "status": "parsing_error",
                "source": "notebooklm",
                "error_message": str(e),
                "needs_human_review": True,
                "imported_at": datetime.now().isoformat()
            })
        
        return content_items
    
    async def batch_import_all_categories(self) -> Dict[str, List[Dict]]:
        """
        Importa contenido de todas las categorías disponibles
        
        Returns:
            Diccionario mapeando categoría -> lista de items importados
        """
        results = {}
        
        for category in self.CATEGORIES:
            try:
                items = await self.import_content_by_category(category)
                results[category] = items
                logger.info(f"✅ {category}: {len(items)} items importados")
            except Exception as e:
                logger.error(f"❌ Error en {category}: {e}")
                results[category] = []
        
        total_items = sum(len(items) for items in results.values())
        logger.info(f"🎉 Importación completa: {total_items} items totales")
        
        return results
    
    async def close(self):
        """Cierra el cliente HTTP"""
        await self.client.aclose()


# ===================================================================
# EJEMPLO DE USO
# ===================================================================

async def main():
    """Ejemplo de uso del conector"""
    
    # Inicializar conector
    connector = NotebookLMConnector()
    
    # Verificar conexión
    if not await connector.test_connection():
        logger.error("No se pudo conectar al servidor MCP")
        return
    
    # Listar fuentes del notebook
    sources = await connector.list_sources()
    print(f"\n📚 Fuentes en el notebook de Roffé: {len(sources)}")
    for i, source in enumerate(sources[:3], 1):
        print(f"  {i}. {source.get('title', 'Sin título')}")
    
    # Importar contenido de una categoría
    category = "Presión Competitiva"
    print(f"\n📥 Importando contenido de: {category}")
    items = await connector.import_content_by_category(category)
    
    print(f"\n✅ Importados {len(items)} items:")
    for item in items[:3]:  # Mostrar primeros 3
        print(f"  - [{item['type']}] {item.get('question', item.get('title', 'Sin título'))[:60]}...")
    
    # Cerrar conexión
    await connector.close()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
