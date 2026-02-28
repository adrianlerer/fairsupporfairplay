"""
SMS Integration - Fair Support Fair Play
=========================================

Integración SMS para alertas críticas usando Twilio

Uso:
- Solo para alertas ROJAS (críticas)
- Notifica a padres inmediatamente
- Incluye enlace al portal de padres

Instalación:
  pip install twilio

© Marcelo Roffe 2026
"""

from twilio.rest import Client
from typing import Optional
import logging
from datetime import datetime
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SMSPlatform:
    """
    Integración SMS para alertas críticas
    
    Solo se usa para alertas ROJAS que requieren atención inmediata
    """
    
    def __init__(
        self, 
        account_sid: str,
        auth_token: str,
        from_number: str,
        db_connection = None
    ):
        """
        Inicializa la integración de SMS
        
        Args:
            account_sid: Account SID de Twilio
            auth_token: Auth Token de Twilio
            from_number: Número de teléfono de Twilio (formato: +1234567890)
            db_connection: Conexión a PostgreSQL
        """
        self.client = Client(account_sid, auth_token)
        self.from_number = from_number
        self.db = db_connection
        
        logger.info(f"SMS Integration inicializada - From: {from_number}")
    
    async def send_critical_alert(
        self,
        parent_phone: str,
        child_name: str,
        alert_type: str = "crisis_indicators"
    ) -> bool:
        """
        Envía SMS solo para alertas críticas (ROJAS)
        
        Args:
            parent_phone: Número del padre (formato: +1234567890)
            child_name: Nombre del niño/a
            alert_type: Tipo de alerta
            
        Returns:
            bool: True si se envió exitosamente
        """
        # Mensaje SMS (limitado a 160 caracteres para SMS estándar)
        message = f"""
🔴 ALERTA CRÍTICA - Fair Support Fair Play

Su hijo/a {child_name} ha mostrado señales que requieren su atención INMEDIATA.

Por favor ingrese al portal de padres:
https://fairsupportfairplay.com/parent-portal

Si es una emergencia, contacte servicios profesionales:
- Línea de Crisis: 1-800-273-8255
        """
        
        try:
            # Enviar SMS via Twilio
            twilio_message = self.client.messages.create(
                to=parent_phone,
                from_=self.from_number,
                body=message
            )
            
            # Log en DB
            if self.db:
                await self.db.execute("""
                    INSERT INTO platform_integration_log (
                        platform, platform_user_id, direction,
                        message_type, message_content, metadata,
                        status, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """,
                    "sms",
                    parent_phone,
                    "outbound",
                    "critical_alert",
                    message,
                    json.dumps({
                        "child_name": child_name,
                        "alert_type": alert_type,
                        "twilio_sid": twilio_message.sid
                    }),
                    "sent",
                    datetime.now()
                )
            
            logger.info(f"✅ SMS crítico enviado a {parent_phone}")
            logger.info(f"   Twilio SID: {twilio_message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Error al enviar SMS: {e}")
            
            # Log error en DB
            if self.db:
                await self.db.execute("""
                    INSERT INTO platform_integration_log (
                        platform, platform_user_id, direction,
                        message_type, message_content, metadata,
                        status, error_message, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """,
                    "sms",
                    parent_phone,
                    "outbound",
                    "critical_alert",
                    message,
                    json.dumps({"child_name": child_name, "alert_type": alert_type}),
                    "failed",
                    str(e),
                    datetime.now()
                )
            
            return False
    
    async def send_bulk_sms(
        self,
        phone_numbers: list,
        message: str
    ) -> dict:
        """
        Envía SMS a múltiples números (uso administrativo)
        
        Args:
            phone_numbers: Lista de números de teléfono
            message: Mensaje a enviar
            
        Returns:
            dict: Resumen de envíos (success_count, failed_count)
        """
        results = {"success_count": 0, "failed_count": 0}
        
        for phone in phone_numbers:
            try:
                self.client.messages.create(
                    to=phone,
                    from_=self.from_number,
                    body=message
                )
                results["success_count"] += 1
                logger.info(f"✅ SMS enviado a {phone}")
                
            except Exception as e:
                results["failed_count"] += 1
                logger.error(f"❌ Error enviando a {phone}: {e}")
        
        logger.info(f"📊 Bulk SMS: {results['success_count']} exitosos, {results['failed_count']} fallidos")
        return results
