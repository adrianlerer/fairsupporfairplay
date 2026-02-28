"""
WhatsApp Integration - Fair Support Fair Play
==============================================

Integración con WhatsApp usando WAHA (WhatsApp HTTP API)
https://github.com/devlikeapro/waha

Características:
- Alertas a padres (semáforo 🟢🟡🔴)
- Consultas privadas de niños
- Respuestas desde contenido aprobado
- Log completo de mensajes

Instalación WAHA:
  docker run -d -p 3000:3000 devlikeapro/waha

© Marcelo Roffe 2026
"""

from typing import Optional, Dict, Any
import httpx
import logging
from datetime import datetime
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WhatsAppPlatform:
    """
    Integración con WhatsApp para Fair Support Fair Play
    
    Usa WAHA (WhatsApp HTTP API) como bridge
    """
    
    def __init__(
        self, 
        waha_url: str = "http://localhost:3000",
        session_name: str = "fairsupport",
        db_connection = None
    ):
        """
        Inicializa la integración de WhatsApp
        
        Args:
            waha_url: URL del servidor WAHA
            session_name: Nombre de la sesión de WhatsApp
            db_connection: Conexión a PostgreSQL
        """
        self.waha_url = waha_url
        self.session_name = session_name
        self.client = httpx.AsyncClient(timeout=30.0)
        self.db = db_connection
        
        logger.info(f"WhatsApp Integration inicializada - WAHA: {waha_url}")
    
    async def send_parent_alert(
        self, 
        parent_phone: str, 
        child_name: str,
        alert_level: str,
        message: str
    ) -> bool:
        """
        Envía alerta a padre vía WhatsApp
        
        Args:
            parent_phone: Número de teléfono del padre (formato: +1234567890)
            child_name: Nombre del niño/a
            alert_level: 'green', 'yellow', o 'red'
            message: Mensaje de la alerta
            
        Returns:
            bool: True si se envió exitosamente
        """
        # Emojis según nivel
        emoji_map = {
            "green": "🟢",
            "yellow": "🟡",
            "red": "🔴"
        }
        emoji = emoji_map.get(alert_level, "⚠️")
        
        # Construir mensaje
        full_message = f"""
{emoji} *Alerta de Fair Support Fair Play*

*Niño/a:* {child_name}
*Nivel:* {alert_level.upper()}

{message}

_Revisa el portal de padres para más detalles:_
https://fairsupportfairplay.com/parent-portal

_Este es un mensaje automático. No responder._
        """
        
        try:
            # Enviar mensaje via WAHA
            response = await self.client.post(
                f"{self.waha_url}/api/sendText",
                json={
                    "session": self.session_name,
                    "chatId": parent_phone.replace("+", "") + "@c.us",
                    "text": full_message
                }
            )
            response.raise_for_status()
            
            # Log en DB
            if self.db:
                await self._log_platform_message(
                    platform="whatsapp",
                    platform_user_id=parent_phone,
                    direction="outbound",
                    message_type="parent_alert",
                    message_content=full_message,
                    metadata={"alert_level": alert_level, "child_name": child_name}
                )
            
            logger.info(f"✅ Alerta {alert_level} enviada a {parent_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Error al enviar alerta WhatsApp: {e}")
            return False
    
    async def handle_child_private_message(
        self, 
        phone: str, 
        message: str
    ) -> Optional[str]:
        """
        Maneja consulta privada de un niño vía WhatsApp
        
        Flujo:
        1. Verificar que el número esté registrado
        2. Analizar mensaje con IA
        3. Generar respuesta desde contenido aprobado
        4. Generar alerta a padres si necesario
        5. Enviar respuesta
        
        Args:
            phone: Número de teléfono
            message: Mensaje del niño
            
        Returns:
            Texto de la respuesta o None si error
        """
        if not self.db:
            logger.error("DB connection no disponible")
            return None
        
        # 1. Verificar usuario
        child = await self.db.fetchrow("""
            SELECT u.*, p.phone as parent_phone, p.name as parent_name
            FROM users u
            LEFT JOIN users p ON u.parent_id = p.id
            WHERE u.phone = $1 AND u.role = 'child'
        """, phone)
        
        if not child:
            response = """
👋 Hola! Para poder ayudarte, necesito que estés registrado en *Fair Support Fair Play*.

Pide a tus padres que completen tu registro en:
🌐 fairsupportfairplay.com

Una vez registrado, podrás hacer consultas privadas sobre deporte, presión, ansiedad y más. 🏆
            """
            
            await self.send_text_message(phone, response)
            return response
        
        # 2. Analizar mensaje (TODO: implementar análisis real con IA)
        analysis = {
            "sentiment_score": 0.5,
            "emotion_detected": "neutral",
            "alert_level": "green",
            "alert_reason": None
        }
        
        # 3. Generar respuesta (TODO: desde FAQ aprobadas)
        response = f"""
Gracias por tu mensaje, {child['name']}. 🏆

Estoy aquí para ayudarte. Recuerda que puedes:
• Preguntarme sobre presión competitiva
• Hablar sobre tus entrenamientos
• Compartir cómo te sientes

¿Hay algo específico en lo que pueda ayudarte hoy?

_Respuestas basadas en contenido de Marcelo Roffé_
        """
        
        # 4. Enviar respuesta
        await self.send_text_message(phone, response)
        
        # 5. Log en DB
        await self._log_child_query(
            child_id=child["id"],
            query_text=message,
            response_text=response,
            platform="whatsapp",
            sentiment_analysis=analysis
        )
        
        # 6. Generar alerta si necesario
        if analysis["alert_level"] in ["yellow", "red"]:
            await self.send_parent_alert(
                parent_phone=child["parent_phone"],
                child_name=child["name"],
                alert_level=analysis["alert_level"],
                message=f"Tu hijo/a ha mostrado señales que requieren atención. Mensaje: '{message[:100]}...'"
            )
        
        return response
    
    async def send_text_message(
        self, 
        phone: str, 
        text: str
    ) -> bool:
        """
        Envía un mensaje de texto simple via WhatsApp
        
        Args:
            phone: Número de teléfono (formato: +1234567890)
            text: Texto del mensaje
            
        Returns:
            bool: True si se envió exitosamente
        """
        try:
            response = await self.client.post(
                f"{self.waha_url}/api/sendText",
                json={
                    "session": self.session_name,
                    "chatId": phone.replace("+", "") + "@c.us",
                    "text": text
                }
            )
            response.raise_for_status()
            
            logger.info(f"✅ Mensaje enviado a {phone}")
            return True
            
        except Exception as e:
            logger.error(f"Error al enviar mensaje WhatsApp: {e}")
            return False
    
    async def _log_platform_message(self, **kwargs):
        """Registra mensaje en platform_integration_log"""
        if not self.db:
            return
        
        await self.db.execute("""
            INSERT INTO platform_integration_log (
                platform, platform_user_id, direction,
                message_type, message_content, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
            kwargs.get("platform"),
            kwargs.get("platform_user_id"),
            kwargs.get("direction"),
            kwargs.get("message_type"),
            kwargs.get("message_content"),
            json.dumps(kwargs.get("metadata", {})),
            datetime.now()
        )
    
    async def _log_child_query(self, **kwargs):
        """Registra consulta de niño en child_queries"""
        if not self.db:
            return
        
        await self.db.execute("""
            INSERT INTO child_queries (
                child_id, query_text, response_text, platform,
                sentiment_score, emotion_detected, alert_generated,
                alert_level, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
            kwargs.get("child_id"),
            kwargs.get("query_text"),
            kwargs.get("response_text"),
            kwargs.get("platform"),
            kwargs.get("sentiment_analysis", {}).get("sentiment_score"),
            kwargs.get("sentiment_analysis", {}).get("emotion_detected"),
            kwargs.get("sentiment_analysis", {}).get("alert_level") in ["yellow", "red"],
            kwargs.get("sentiment_analysis", {}).get("alert_level"),
            datetime.now()
        )
    
    async def close(self):
        """Cierra el cliente HTTP"""
        await self.client.aclose()


# Webhook handler para mensajes entrantes
async def handle_whatsapp_webhook(payload: Dict[str, Any], whatsapp_platform: WhatsAppPlatform):
    """
    Maneja webhooks de WAHA para mensajes entrantes
    
    Args:
        payload: Payload del webhook
        whatsapp_platform: Instancia de WhatsAppPlatform
    """
    event = payload.get("event")
    
    if event == "message":
        data = payload.get("payload", {})
        phone = data.get("from")
        text = data.get("body")
        
        if phone and text:
            await whatsapp_platform.handle_child_private_message(phone, text)
