"""
Discord Bot - Fair Support Fair Play
====================================

Bot de Discord para la plataforma de apoyo emocional a niños deportistas

Características:
- Comunidad pública moderada (canales temáticos)
- DMs privados para consultas individuales
- Comandos !faq, !ayuda
- Moderación automática con IA
- Alertas a padres integradas

Instalación:
  pip install discord.py

© Marcelo Roffe 2026
"""

import discord
from discord.ext import commands
from typing import Optional, Dict, Any, List
import logging
import json
from datetime import datetime

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FairSupportDiscordBot(commands.Bot):
    """
    Bot de Discord para Fair Support Fair Play
    
    Canales del servidor:
    - #bienvenida: Introducción y reglas
    - #presion-competitiva: Discusión sobre presión y ansiedad
    - #relacion-entrenadores: Dudas sobre entrenadores
    - #relacion-padres: Cómo hablar con padres
    - #exitos-fracasos: Compartir experiencias
    - #ejercicios: Ejercicios de mindfulness y relajación
    - #preguntas-frecuentes: FAQ bot
    - #moderacion-log: Log privado para moderadores
    """
    
    def __init__(self, db_connection, review_system, **kwargs):
        """
        Inicializa el bot de Discord
        
        Args:
            db_connection: Conexión a PostgreSQL
            review_system: Sistema de revisión de contenido
        """
        # Configurar intents
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True
        intents.dm_messages = True
        
        # Inicializar bot
        super().__init__(
            command_prefix='!',
            intents=intents,
            help_command=None,  # Usaremos nuestro comando custom
            **kwargs
        )
        
        self.db = db_connection
        self.review_system = review_system
        
        # Canales especiales
        self.moderation_log_channel = None
        self.welcome_channel = None
        
        # Categorías de canales
        self.channel_categories = {
            "presion-competitiva": "Presión Competitiva",
            "relacion-entrenadores": "Relación con Entrenadores",
            "relacion-padres": "Relación con Padres",
            "exitos-fracasos": "Manejo de Fracaso",
            "ejercicios": "Ejercicios y Mindfulness",
            "preguntas-frecuentes": "FAQ"
        }
        
        logger.info("Discord Bot inicializado")
    
    async def on_ready(self):
        """Evento: Bot conectado y listo"""
        logger.info(f'✅ Bot conectado como {self.user} (ID: {self.user.id})')
        logger.info(f'   Conectado a {len(self.guilds)} servidor(es)')
        
        # Configurar canales especiales
        if self.guilds:
            guild = self.guilds[0]  # Servidor principal
            
            # Canal de moderación
            self.moderation_log_channel = discord.utils.get(
                guild.channels, 
                name='moderacion-log'
            )
            
            # Canal de bienvenida
            self.welcome_channel = discord.utils.get(
                guild.channels, 
                name='bienvenida'
            )
            
            logger.info(f"📌 Servidor principal: {guild.name}")
            logger.info(f"   Miembros: {guild.member_count}")
    
    async def on_message(self, message: discord.Message):
        """
        Evento: Nuevo mensaje recibido
        
        Maneja:
        - DMs privados → consultas individuales
        - Mensajes en servidor → moderación automática
        """
        # Ignorar mensajes del bot
        if message.author.bot:
            return
        
        # DM privado al bot
        if isinstance(message.channel, discord.DMChannel):
            await self.handle_private_consultation(message)
            return
        
        # Mensaje en servidor público
        await self.handle_community_message(message)
        
        # Procesar comandos (!faq, !ayuda, etc.)
        await self.process_commands(message)
    
    async def on_member_join(self, member: discord.Member):
        """Evento: Nuevo miembro se une al servidor"""
        if self.welcome_channel:
            embed = discord.Embed(
                title=f"¡Bienvenido/a {member.name}! ⚽🏀🎾",
                description="""
**Fair Support Fair Play** es una comunidad de apoyo para jóvenes deportistas.

**Reglas importantes:**
1. 🤝 Respeto mutuo siempre
2. 🔒 Tu privacidad es importante (puedes ser anónimo)
3. 💬 Comparte experiencias, no juzgues
4. 🚫 No bullying, no discriminación
5. 📨 Para consultas privadas, escríbeme por DM

**Canales disponibles:**
• `#presion-competitiva` - Manejo de presión y ansiedad
• `#relacion-entrenadores` - Dudas sobre entrenadores
• `#relacion-padres` - Cómo hablar con tus padres
• `#exitos-fracasos` - Compartir experiencias
• `#ejercicios` - Ejercicios de relajación

**Comandos útiles:**
• `!faq <pregunta>` - Buscar en base de conocimiento
• `!ayuda` - Ver todos los comandos

¡Disfruta la comunidad! 🏆
                """,
                color=discord.Color.green()
            )
            embed.set_thumbnail(url=member.avatar.url if member.avatar else None)
            
            await self.welcome_channel.send(embed=embed)
    
    async def handle_private_consultation(self, message: discord.Message):
        """
        Maneja consulta privada de un niño/a via DM
        
        Flujo:
        1. Verificar registro en la plataforma
        2. Analizar mensaje con IA
        3. Generar respuesta desde contenido aprobado
        4. Generar alerta a padres si necesario
        5. Registrar en logs
        """
        user_id = str(message.author.id)
        
        # 1. Verificar registro
        child = await self.db.fetchrow("""
            SELECT u.*, p.discord_id as parent_discord_id
            FROM users u
            LEFT JOIN users p ON u.parent_id = p.id
            WHERE u.discord_id = $1 AND u.role = 'child'
        """, user_id)
        
        if not child:
            # Usuario no registrado
            await message.channel.send("""
👋 **¡Hola!** Para poder ayudarte, necesito que estés registrado en **Fair Support Fair Play**.

Pide a tus padres que completen tu registro en:
🌐 https://fairsupportfairplay.com

Una vez registrado, podrás:
✅ Hacerme consultas privadas sobre deporte, presión, ansiedad
✅ Acceder a ejercicios y recursos personalizados
✅ Participar en la comunidad de manera segura

¡Te espero! 🏆
            """)
            
            # Log de intento no registrado
            await self._log_platform_message(
                platform="discord",
                platform_user_id=user_id,
                direction="inbound",
                message_type="unregistered_dm",
                message_content=message.content,
                metadata={"username": str(message.author)}
            )
            
            return
        
        # 2. Mostrar "typing..." mientras procesamos
        async with message.channel.typing():
            # 3. Analizar mensaje con IA
            analysis = await self._analyze_child_message(
                message.content, 
                child
            )
            
            # 4. Generar respuesta segura desde contenido aprobado
            response = await self._generate_safe_response(
                message.content,
                child,
                platform="discord"
            )
            
            # 5. Enviar respuesta
            await message.channel.send(response)
            
            # 6. Generar alerta si necesario
            if analysis.get("alert_level") in ["yellow", "red"]:
                await self._notify_parents(
                    child=child,
                    alert_level=analysis["alert_level"],
                    context=message.content,
                    response=response
                )
            
            # 7. Registrar en logs
            await self._log_child_query(
                child_id=child["id"],
                query_text=message.content,
                response_text=response,
                platform="discord",
                sentiment_analysis=analysis
            )
    
    async def handle_community_message(self, message: discord.Message):
        """
        Moderación automática de mensajes en comunidad
        
        Verifica:
        - Lenguaje inapropiado
        - Bullying o discriminación
        - Spam
        - Contenido prohibido
        """
        # Analizar con IA
        moderation_result = await self._moderate_message(message.content)
        
        if moderation_result.get("should_delete", False):
            # Eliminar mensaje
            await message.delete()
            
            # Enviar DM al autor
            try:
                await message.author.send(f"""
⚠️ **Tu mensaje en Fair Support Fair Play fue eliminado**

**Razón:** {moderation_result.get("reason", "Violación de las reglas de la comunidad")}

Recuerda que esta es una **comunidad segura** para todos los deportistas jóvenes. 
Por favor, sé respetuoso y constructivo.

Si tienes dudas sobre las reglas, puedes escribirme aquí en privado o usar el comando `!ayuda`.

**Reglas principales:**
1. 🤝 Respeto mutuo
2. 🚫 No bullying
3. 💬 Constructivo, no destructivo
4. 🔒 Respeta la privacidad
                """)
            except discord.Forbidden:
                # Usuario tiene DMs deshabilitados
                logger.warning(f"No se pudo enviar DM a {message.author} (DMs deshabilitados)")
            
            # Log de moderación
            if self.moderation_log_channel:
                await self.moderation_log_channel.send(
                    f"⚠️ **Mensaje eliminado**\n"
                    f"**Usuario:** {message.author.mention} (ID: {message.author.id})\n"
                    f"**Canal:** {message.channel.mention}\n"
                    f"**Razón:** {moderation_result.get('reason')}\n"
                    f"**Contenido:** ||{message.content}||\n"
                    f"**Timestamp:** {datetime.now().isoformat()}"
                )
    
    # ===================================================================
    # COMANDOS DEL BOT
    # ===================================================================
    
    @commands.command(name='faq')
    async def faq_command(self, ctx, *, query: str = None):
        """
        !faq <pregunta>
        Busca en la base de conocimiento aprobada
        
        Ejemplo:
          !faq presión antes del partido
        """
        if not query:
            await ctx.send("""
❓ **Cómo usar el comando FAQ**

**Uso:** `!faq <tu pregunta>`

**Ejemplos:**
• `!faq ¿Cómo manejo la presión?`
• `!faq Relación con mi entrenador`
• `!faq Perdimos el partido y estoy triste`

📚 También puedes escribirme por **DM** para consultas privadas.
            """)
            return
        
        # Buscar en FAQ aprobadas
        results = await self.db.fetch("""
            SELECT question, answer, category, author
            FROM faq_items
            WHERE 
                question ILIKE $1 OR 
                answer ILIKE $1 OR
                tags::text ILIKE $1
            ORDER BY helpful_count DESC
            LIMIT 3
        """, f"%{query}%")
        
        if not results:
            await ctx.send(
                f"❓ No encontré respuestas a **'{query}'**.\n\n"
                "💬 ¿Quieres preguntarme por **DM** para una consulta privada?\n"
                "📚 O intenta reformular tu pregunta."
            )
            return
        
        # Crear embed con resultados
        embed = discord.Embed(
            title=f"📚 Resultados para: {query}",
            description=f"Encontré {len(results)} respuesta(s) relevante(s):",
            color=discord.Color.blue()
        )
        
        for i, result in enumerate(results, 1):
            # Truncar respuesta si es muy larga
            answer = result["answer"]
            if len(answer) > 300:
                answer = answer[:297] + "..."
            
            embed.add_field(
                name=f"{i}. {result['question']}",
                value=f"{answer}\n\n*Categoría: {result['category']} | Por: {result['author']}*",
                inline=False
            )
        
        embed.set_footer(text="💬 Escríbeme por DM para consultas privadas personalizadas")
        
        await ctx.send(embed=embed)
        
        # Incrementar view_count en DB
        for result in results:
            await self.db.execute("""
                UPDATE faq_items 
                SET view_count = view_count + 1
                WHERE question = $1
            """, result["question"])
    
    @commands.command(name='ayuda')
    async def help_command(self, ctx):
        """Muestra comandos disponibles y cómo usar el bot"""
        embed = discord.Embed(
            title="⚽ Fair Support Fair Play - Ayuda",
            description="Bot de apoyo emocional para deportistas jóvenes",
            color=discord.Color.green()
        )
        
        embed.add_field(
            name="📚 !faq <pregunta>",
            value="Busca en la base de conocimiento aprobada por Marcelo Roffé",
            inline=False
        )
        
        embed.add_field(
            name="💬 DM Privado",
            value="Escríbeme en privado para consultas personales y confidenciales",
            inline=False
        )
        
        embed.add_field(
            name="🏆 Canales de Comunidad",
            value=(
                "`#presion-competitiva` - Manejo de ansiedad\n"
                "`#relacion-padres` - Hablar con tus padres\n"
                "`#relacion-entrenadores` - Dudas sobre entrenadores\n"
                "`#exitos-fracasos` - Compartir experiencias\n"
                "`#ejercicios` - Mindfulness y relajación"
            ),
            inline=False
        )
        
        embed.add_field(
            name="📖 Reglas de la Comunidad",
            value=(
                "1. 🤝 Respeto mutuo siempre\n"
                "2. 🚫 No bullying ni discriminación\n"
                "3. 🔒 Respeta la privacidad de otros\n"
                "4. 💬 Sé constructivo, no destructivo"
            ),
            inline=False
        )
        
        embed.set_footer(text="© Marcelo Roffe 2026 - Fair Support Fair Play")
        
        await ctx.send(embed=embed)
    
    @commands.command(name='ejercicio')
    async def exercise_command(self, ctx, difficulty: str = "medio"):
        """
        !ejercicio [fácil|medio|avanzado]
        Muestra un ejercicio de mindfulness al azar
        """
        # Buscar ejercicio aprobado
        row = await self.db.fetchrow("""
            SELECT title, description, instructions, duration_minutes
            FROM exercise_items
            WHERE difficulty = $1
            ORDER BY RANDOM()
            LIMIT 1
        """, difficulty)
        
        if not row:
            await ctx.send(f"❌ No encontré ejercicios de nivel **{difficulty}**. Intenta: `fácil`, `medio`, o `avanzado`.")
            return
        
        # Crear embed
        embed = discord.Embed(
            title=f"🧘 {row['title']}",
            description=row['description'],
            color=discord.Color.purple()
        )
        
        # Parsear instrucciones
        instructions = json.loads(row['instructions']) if isinstance(row['instructions'], str) else row['instructions']
        
        if instructions:
            steps = "\n".join([f"{i}. {step}" for i, step in enumerate(instructions, 1)])
            embed.add_field(
                name="📝 Instrucciones",
                value=steps,
                inline=False
            )
        
        embed.add_field(
            name="⏱️ Duración",
            value=f"{row['duration_minutes']} minutos",
            inline=True
        )
        
        embed.add_field(
            name="💪 Dificultad",
            value=difficulty.capitalize(),
            inline=True
        )
        
        embed.set_footer(text="¡Recuerda practicar regularmente! 🏆")
        
        await ctx.send(embed=embed)
    
    # ===================================================================
    # MÉTODOS AUXILIARES
    # ===================================================================
    
    async def _analyze_child_message(
        self, 
        message_text: str, 
        child: Dict
    ) -> Dict[str, Any]:
        """
        Analiza mensaje de niño con IA para detectar emociones y alertas
        
        Returns:
            Dict con sentiment_score, emotion_detected, alert_level, etc.
        """
        # TODO: Implementar análisis real con LLM
        # Por ahora, retornar estructura base
        return {
            "sentiment_score": 0.5,
            "emotion_detected": "neutral",
            "alert_level": "green",
            "keywords_detected": [],
            "alert_reason": None
        }
    
    async def _generate_safe_response(
        self,
        query: str,
        child: Dict,
        platform: str
    ) -> str:
        """
        Genera respuesta segura desde contenido aprobado
        
        Returns:
            Texto de la respuesta
        """
        # TODO: Implementar búsqueda semántica en FAQ + generación con LLM
        # Por ahora, respuesta genérica
        return f"""
Gracias por tu consulta. Estoy aquí para ayudarte. 🏆

Mientras proceso mejor tu pregunta, te recomiendo:
1. Revisar nuestro FAQ con `!faq {query[:30]}`
2. Explorar los canales temáticos del servidor
3. Hablar con tus padres o entrenador si es algo urgente

¿Hay algo más específico en lo que pueda ayudarte?
        """
    
    async def _moderate_message(self, content: str) -> Dict[str, Any]:
        """
        Modera mensaje con IA
        
        Returns:
            Dict con should_delete, reason
        """
        # TODO: Implementar moderación real con LLM
        # Lista básica de palabras prohibidas
        banned_words = ["tonto", "idiota", "estúpido", "gordo", "feo"]
        
        content_lower = content.lower()
        for word in banned_words:
            if word in content_lower:
                return {
                    "should_delete": True,
                    "reason": "Lenguaje inapropiado detectado"
                }
        
        return {"should_delete": False}
    
    async def _notify_parents(
        self,
        child: Dict,
        alert_level: str,
        context: str,
        response: str
    ):
        """Notifica a padres sobre alerta generada"""
        # TODO: Implementar notificación real (email, SMS, etc.)
        logger.warning(f"⚠️ ALERTA {alert_level.upper()}: Niño {child['id']}")
    
    async def _log_child_query(self, **kwargs):
        """Registra consulta de niño en la base de datos"""
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
    
    async def _log_platform_message(self, **kwargs):
        """Registra mensaje de plataforma en logs"""
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


# ===================================================================
# INICIALIZACIÓN DEL BOT
# ===================================================================

def create_bot(db_connection, review_system, token: str):
    """
    Crea e inicializa el bot de Discord
    
    Args:
        db_connection: Conexión a PostgreSQL
        review_system: Sistema de revisión
        token: Token del bot de Discord
        
    Returns:
        Instancia del bot
    """
    bot = FairSupportDiscordBot(db_connection, review_system)
    
    logger.info("Bot de Discord creado")
    logger.info("Para ejecutar: bot.run(token)")
    
    return bot
