-- ============================================================================
-- FAIR SUPPORT FAIR PLAY - Demo Data para Inversores
-- ============================================================================
-- Este script crea datos realistas para demostrar la plataforma
-- © Marcelo Roffe 2026
-- ============================================================================

-- ============================================================================
-- 1. USUARIOS (Niños, Padres, Admins)
-- ============================================================================

-- Tabla users debe existir primero
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('child', 'parent', 'coach', 'admin')),
    age INT,
    sport VARCHAR(100),
    phone VARCHAR(50),
    discord_id VARCHAR(100),
    parent_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin
INSERT INTO users (id, email, name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@fairsupport.com', 'Admin Principal', 'admin');

-- Padres
INSERT INTO users (id, email, name, role, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'juan.perez@email.com', 'Juan Pérez', 'parent', '+5491123456789'),
('11111111-1111-1111-1111-111111111112', 'maria.gomez@email.com', 'María Gómez', 'parent', '+5491123456790'),
('11111111-1111-1111-1111-111111111113', 'carlos.rodriguez@email.com', 'Carlos Rodríguez', 'parent', '+5491123456791'),
('11111111-1111-1111-1111-111111111114', 'ana.martinez@email.com', 'Ana Martínez', 'parent', '+5491123456792'),
('11111111-1111-1111-1111-111111111115', 'pedro.sanchez@email.com', 'Pedro Sánchez', 'parent', '+5491123456793');

-- Niños deportistas
INSERT INTO users (id, email, name, role, age, sport, phone, parent_id) VALUES
-- Niños de Juan Pérez
('22222222-2222-2222-2222-222222222221', 'matias.p@email.com', 'Matías', 'child', 14, 'fútbol', '+5491123456800', '11111111-1111-1111-1111-111111111111'),

-- Niños de María Gómez
('22222222-2222-2222-2222-222222222222', 'sofia.g@email.com', 'Sofía', 'child', 12, 'tenis', '+5491123456801', '11111111-1111-1111-1111-111111111112'),

-- Niños de Carlos Rodríguez
('22222222-2222-2222-2222-222222222223', 'lucas.r@email.com', 'Lucas', 'child', 16, 'fútbol', '+5491123456802', '11111111-1111-1111-1111-111111111113'),

-- Niños de Ana Martínez
('22222222-2222-2222-2222-222222222224', 'valentina.m@email.com', 'Valentina', 'child', 10, 'natación', '+5491123456803', '11111111-1111-1111-1111-111111111114'),

-- Niños de Pedro Sánchez
('22222222-2222-2222-2222-222222222225', 'diego.s@email.com', 'Diego', 'child', 15, 'básquet', '+5491123456804', '11111111-1111-1111-1111-111111111115');


-- ============================================================================
-- 2. FAQ APROBADAS (Contenido de Marcelo Roffé)
-- ============================================================================

INSERT INTO faq_items (category, question, answer, author, age_group, sport, tags, helpful_count, view_count, published_at, approved_by) VALUES

-- Presión Competitiva
('Presión Competitiva', 
 '¿Cómo manejo los nervios antes de un partido importante?', 
 'Es completamente normal sentir nervios antes de un partido importante. De hecho, esos nervios son una señal de que te importa y estás comprometido. Aquí tienes 3 técnicas probadas:

1. **Respiración 4-7-8**: Inhala por 4 segundos, mantén 7 segundos, exhala por 8 segundos. Repite 3 veces.
2. **Visualización positiva**: Cierra los ojos e imagina que juegas tu mejor partido, visualiza cada movimiento exitoso.
3. **Rutina pre-partido**: Crea una rutina que repitas siempre (música, estiramientos, charla con compañeros). La familiaridad reduce la ansiedad.

Recuerda: La presión es un privilegio. Significa que estás en un nivel donde las cosas importan. Aprende a ser amigo de tus nervios, no enemigo.', 
 'Marcelo Roffé', '13-15', 'fútbol', 
 '["nervios", "ansiedad", "pre-partido", "presión"]',
 42, 156, NOW(), '00000000-0000-0000-0000-000000000001'),

('Presión Competitiva',
 '¿Qué hago cuando siento que mis padres esperan demasiado de mí?',
 'Esta es una situación muy común y es valiente de tu parte reconocerla. Aquí te propongo un plan de acción:

1. **Habla con tus padres con honestidad**: Elige un momento tranquilo (no justo después de un partido) y diles cómo te sientes. Usa frases como "Yo siento que..." en lugar de "Ustedes me hacen sentir..."

2. **Explica tu proceso**: Ayúdalos a entender que el deporte es tu camino, no el de ellos. Tú disfrutas el proceso, no solo los resultados.

3. **Pide su apoyo de otra manera**: Diles claramente qué tipo de apoyo necesitas. Por ejemplo: "Me ayuda más cuando me preguntan si me divertí, no solo si ganamos".

4. **Busca ayuda externa si es necesario**: Habla con tu entrenador. Muchas veces el entrenador puede mediar y explicar a los padres sobre presión y desarrollo deportivo.

Recuerda: Tus padres te aman y quieren lo mejor para ti. A veces no saben cómo expresarlo sin presionar. Tu comunicación puede ayudarles a ser mejores supporters.',
 'Marcelo Roffé', '13-15', 'all',
 '["padres", "presión familiar", "comunicación", "expectativas"]',
 38, 142, NOW(), '00000000-0000-0000-0000-000000000001'),

-- Manejo de Fracaso
('Manejo de Fracaso',
 '¿Cómo supero una derrota importante?',
 'Perder duele, especialmente en partidos importantes. Pero la derrota es uno de los mejores maestros en el deporte. Aquí está tu guía para procesar una derrota:

**Fase 1 - Inmediata (primeras 24 horas)**:
- PERMÍTETE sentir la tristeza, frustración o enojo. Es normal y saludable.
- EVITA tomar decisiones grandes ("voy a dejar el deporte").
- HABLA con alguien: compañeros, padres, entrenador.

**Fase 2 - Reflexión (días 2-3)**:
- ANALIZA objetivamente: ¿Qué hicimos bien? ¿Qué podemos mejorar?
- SEPARAR: Perder un partido ≠ Ser un perdedor. Es un resultado, no tu identidad.
- ESCRIBE: Haz una lista de 3 cosas que aprendiste de esta experiencia.

**Fase 3 - Acción (semana siguiente)**:
- VUELVE al entrenamiento con más motivación.
- TRABAJA en las áreas identificadas para mejorar.
- COMPARTE tu experiencia con compañeros más jóvenes (enseñar ayuda a sanar).

**Recuerda**: Todos los grandes atletas han perdido muchas veces. Messi, Ronaldo, Serena Williams, Nadal... La diferencia es que ellos usaron cada derrota como combustible para mejorar. Tú también puedes.',
 'Marcelo Roffé', 'all', 'all',
 '["derrota", "fracaso", "resiliencia", "superación"]',
 55, 203, NOW(), '00000000-0000-0000-0000-000000000001'),

('Manejo de Fracaso',
 'Cometí un error grave en el partido y siento que decepcioné a todos',
 'Escúchame bien: TODOS cometemos errores. Incluso los profesionales cometen errores en partidos importantes. La diferencia está en cómo respondemos.

**Primero, respira**:
Tu valor como persona y como jugador NO se define por un error. Un error es una acción, no tu identidad.

**Segundo, analiza con perspectiva**:
- ¿Ese error cambió el resultado del partido? (A menudo sobrestimamos nuestro impacto)
- ¿Tu equipo solo depende de ti para ganar? (El deporte es colectivo)
- ¿Tus compañeros también cometieron errores? (Seguro que sí)

**Tercero, aprende**:
Pregúntate: "¿Qué puedo entrenar para que esto no vuelva a pasar?"
Los errores son lecciones disfrazadas. Los mejores jugadores tienen libretas mentales de errores que se convirtieron en fortalezas.

**Cuarto, habla**:
- Con tu entrenador: "¿Qué puedo mejorar?"
- Con compañeros: "Lamento mi error, trabajaré para mejorar"
- Con tus padres: "Necesito su apoyo, no sus críticas"

**Finalmente, acción**:
La mejor manera de redimirte de un error es trabajar duro en el próximo entrenamiento. Muestra que ese error te hizo más fuerte, no más débil.

Frase clave: "Err is human, learn is champion" (Errar es humano, aprender es de campeones)',
 'Marcelo Roffé', '13-15', 'all',
 '["error", "culpa", "autoestima", "aprendizaje"]',
 47, 178, NOW(), '00000000-0000-0000-0000-000000000001'),

-- Relación con Entrenadores
('Relación con Entrenadores',
 'Mi entrenador me grita mucho y me siento mal',
 'Esta es una situación que muchos jóvenes deportistas enfrentan y es importante abordarla correctamente.

**Primero, entiende el contexto**:
- Algunos entrenadores gritan por pasión, no por enojo hacia ti
- El volumen alto no siempre significa crítica personal
- Sin embargo, si los gritos incluyen insultos o humillación, eso NO está bien

**Evalúa la situación**:
Pregúntate:
1. ¿El entrenador grita a todos o solo a mí?
2. ¿Los gritos son instrucciones técnicas o ataques personales?
3. ¿Me siento motivado o desmotivado después?
4. ¿Otros compañeros sienten lo mismo?

**Plan de acción**:

**Opción A - Habla con tu entrenador** (si te sientes seguro):
- Elige un momento tranquilo (no durante el entrenamiento)
- Sé respetuoso pero honesto: "Entrenador, quiero mejorar pero cuando me gritan me bloqueo. ¿Podría darme feedback de otra manera?"
- La mayoría de los entrenadores aprecian la comunicación directa

**Opción B - Habla con tus padres**:
- Cuéntales exactamente qué está pasando
- Pídeles que hablen con el entrenador
- Los padres pueden ser mediadores efectivos

**Opción C - Si hay abuso**:
Si los gritos incluyen:
- Insultos personales
- Humillación pública
- Comparaciones destructivas
- Amenazas

Entonces debes reportarlo a tus padres Y a la dirección del club. Esto no es coaching, es abuso.

**Recuerda**: Un buen entrenador te desafía, pero nunca te destruye. Tú mereces un ambiente donde puedas crecer, no donde te sientas pequeño.',
 'Marcelo Roffé', '13-15', 'all',
 '["entrenador", "gritos", "maltrato", "comunicación"]',
 33, 119, NOW(), '00000000-0000-0000-0000-000000000001'),

-- Ansiedad Pre-Competencia
('Ansiedad Pre-Competencia',
 'No puedo dormir la noche antes de un partido',
 'El insomnio pre-competencia es súper común. Tu mente está activa anticipando el partido. Aquí está tu kit de herramientas para dormir mejor:

**6 horas antes del partido**:
- EVITA: cafeína (refrescos, café, té, chocolate)
- EVITA: pantallas brillantes (celular, tablet, PC)
- HAZ: ejercicio ligero (caminata de 20 min)

**3 horas antes de dormir**:
- CENA ligera: Evita comidas pesadas
- RUTINA relajante: Ducha tibia, música suave, leer (libro físico, no pantalla)

**1 hora antes de dormir**:
- ESCRIBE: Haz una lista de preocupaciones y "déjalas en el papel"
- VISUALIZA: Imagina tu mejor versión en el partido, luego suéltalo
- RESPIRA: Técnica 4-7-8 (inhala 4s, mantén 7s, exhala 8s) x 5 veces

**Si no puedes dormir después de 30 min**:
- NO te quedes en la cama frustrándote
- Levántate, ve a otra habitación
- Lee algo aburrido o escucha audiolibro monótono
- Vuelve a la cama cuando sientas sueño

**Verdad importante**:
Dormir una noche mal NO arruinará tu rendimiento si:
1. Descansaste bien los días anteriores
2. Tu alimentación e hidratación son buenas
3. Tu calentamiento es completo

La adrenalina del partido compensará la falta de sueño.

**Truco profesional**:
Muchos atletas olímpicos practican "meditación del cuerpo" (body scan). Hay apps gratuitas como Calm o Headspace con sesiones de 10 minutos que funcionan muy bien.',
 'Marcelo Roffé', '13-15', 'all',
 '["sueño", "insomnio", "ansiedad", "pre-partido"]',
 29, 98, NOW(), '00000000-0000-0000-0000-000000000001');


-- ============================================================================
-- 3. EJERCICIOS PRÁCTICOS
-- ============================================================================

INSERT INTO exercise_items (title, description, instructions, category, duration_minutes, difficulty, age_group, sport, tags, author, published_at, approved_by) VALUES

('Respiración 4-7-8 para Ansiedad',
 'Técnica de respiración probada para reducir ansiedad rápidamente. Creada por el Dr. Andrew Weil, es usada por atletas olímpicos.',
 '[
   "Encuentra un lugar tranquilo donde puedas sentarte o recostarte cómodamente",
   "Coloca una mano en tu pecho y otra en tu abdomen para sentir tu respiración",
   "INHALA profundamente por la nariz contando hasta 4. Siente cómo tu abdomen se expande",
   "MANTÉN el aire contando hasta 7. No te fuerces, si es difícil empieza con 5 segundos",
   "EXHALA completamente por la boca contando hasta 8. Suelta todo el aire con un suspiro suave",
   "Repite el ciclo 4 veces completas",
   "Al terminar, quédate quieto 30 segundos sintiendo tu cuerpo más relajado"
 ]',
 'Ansiedad Pre-Competencia',
 5,
 'fácil',
 'all',
 'all',
 '["respiración", "ansiedad", "relajación", "mindfulness"]',
 'Marcelo Roffé',
 NOW(),
 '00000000-0000-0000-0000-000000000001'),

('Visualización del Partido Perfecto',
 'Ejercicio de visualización mental usado por deportistas de élite. La mente no distingue entre práctica real e imaginada.',
 '[
   "Busca un lugar tranquilo. Puedes sentarte o recostarte",
   "Cierra los ojos y haz 3 respiraciones profundas",
   "Imagina que estás entrando al estadio/cancha. Siente el ambiente, los sonidos, los olores",
   "Visualízate en el vestuario preparándote. Ves tu uniforme, tus compañeros, tu emoción contenida",
   "Ahora estás en la cancha calentando. Siente tu cuerpo ágil, fuerte, preparado",
   "Comienza el partido. Visualízate ejecutando tus mejores jugadas: pases perfectos, tiros precisos, movimientos fluidos",
   "Imagina situaciones difíciles y cómo las resuelves con inteligencia y calma",
   "Visualiza el final del partido. Tú y tu equipo celebrando el esfuerzo, independiente del resultado",
   "Regresa lentamente al presente. Respira profundo y abre los ojos",
   "Anota en una libreta las emociones que sentiste durante la visualización"
 ]',
 'Presión Competitiva',
 15,
 'medio',
 '13-15',
 'all',
 '["visualización", "mentalidad", "preparación", "confianza"]',
 'Marcelo Roffé',
 NOW(),
 '00000000-0000-0000-0000-000000000001'),

('Diálogo Interno Positivo',
 'Transforma tu crítico interno en tu mejor aliado. Aprende a hablarte como le hablarías a tu mejor amigo.',
 '[
   "Toma papel y lápiz. Este ejercicio requiere escribir",
   "Paso 1: Escribe 5 frases que te dices cuando cometes un error. Por ejemplo: \"Soy un tonto\", \"Siempre la echo a perder\", \"No sirvo para esto\"",
   "Paso 2: Imagina que tu mejor amigo cometió ese mismo error. ¿Qué le dirías? Escríbelo. Probablemente algo como: \"Todos cometemos errores\", \"Aprenderás de esto\", \"Sigue intentando\"",
   "Paso 3: ¿Notas la diferencia? Somos más duros con nosotros que con los demás",
   "Paso 4: Reescribe cada frase negativa del Paso 1 como si hablaras con tu mejor amigo",
   "Paso 5: Lee en voz alta las frases del Paso 4. Memoriza tu favorita",
   "Paso 6: La próxima vez que cometas un error, repite mentalmente esa frase positiva",
   "Práctica diaria: Cada noche antes de dormir, di 3 cosas que hiciste bien hoy en tu deporte",
   "Recuerda: Tu cerebro cree lo que le dices repetidamente. Elige palabras de campeón"
 ]',
 'Autoestima y Confianza',
 10,
 'fácil',
 '13-15',
 'all',
 '["autoestima", "diálogo interno", "confianza", "mindfulness"]',
 'Marcelo Roffé',
 NOW(),
 '00000000-0000-0000-0000-000000000001');


-- ============================================================================
-- 4. CONSULTAS DE NIÑOS (Ejemplos realistas)
-- ============================================================================

-- Consultas con diferentes niveles de severidad

-- Consulta VERDE (normal)
INSERT INTO child_queries (
    child_id, query_text, response_text, platform,
    sentiment_score, emotion_detected, alert_generated, alert_level, created_at
) VALUES
('22222222-2222-2222-2222-222222222221',
 '¿Qué ejercicios puedo hacer para mejorar mi velocidad?',
 'Excelente pregunta, Matías! Aquí tienes 3 ejercicios específicos para mejorar velocidad: 1) Sprints de 20 metros con recuperación completa, 2) Escalera de coordinación, 3) Saltos pliométricos. Te recomiendo hacerlos 3 veces por semana. ¿Quieres que te explique alguno en detalle?',
 'web',
 0.8,
 'curiosidad',
 false,
 'green',
 NOW() - INTERVAL '2 days');

-- Consulta AMARILLA (ansiedad moderada)
INSERT INTO child_queries (
    child_id, query_text, response_text, platform,
    sentiment_score, emotion_detected, alert_generated, alert_level, created_at
) VALUES
('22222222-2222-2222-2222-222222222222',
 'Estoy muy nerviosa por el torneo de mañana, no sé si voy a jugar bien',
 'Sofía, es completamente normal sentir nervios antes de un torneo importante. Esos nervios son señal de que te importa y estás comprometida. Te recomiendo: 1) Práctica tu técnica de respiración 4-7-8 esta noche, 2) Visualiza tu mejor versión en la cancha, 3) Recuerda que el resultado no define tu valor. ¿Has probado alguna técnica de relajación antes?',
 'discord',
 -0.4,
 'ansiedad',
 true,
 'yellow',
 NOW() - INTERVAL '1 day');

-- Consulta ROJA (señales de crisis)
INSERT INTO child_queries (
    child_id, query_text, response_text, platform,
    sentiment_score, emotion_detected, alert_generated, alert_level, created_at
) VALUES
('22222222-2222-2222-2222-222222222223',
 'Perdimos el partido por mi culpa, todos me odian, ya no quiero jugar más',
 'Lucas, primero quiero que respires profundo. Lo que estás sintiendo es muy doloroso, y te entiendo. Pero necesito que sepas algo importante: Un error en un partido NO define quién eres como jugador ni como persona. Todos los grandes jugadores han cometido errores. Vamos a hablar de esto con más calma. También voy a avisar a tus padres porque creo que necesitas apoyo ahora. ¿Estás en un lugar seguro donde podamos hablar?',
 'whatsapp',
 -0.85,
 'desesperanza',
 true,
 'red',
 NOW() - INTERVAL '3 hours');


-- ============================================================================
-- 5. ALERTAS GENERADAS
-- ============================================================================

-- Alerta AMARILLA (ansiedad pre-competencia)
INSERT INTO alerts (
    child_id, parent_id, severity, trigger_type,
    conversation_snippet, ai_analysis,
    notification_sent, resolved, created_at
) VALUES
('22222222-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111112',
 'yellow',
 'ansiedad_pre_competencia',
 'Estoy muy nerviosa por el torneo de mañana, no sé si voy a jugar bien',
 '{"sentiment_score": -0.4, "emotion": "ansiedad", "keywords": ["nerviosa", "torneo", "no sé"], "concern_level": "medio", "recommendation": "Acompañar sin presionar, recordar que el resultado no define su valor"}',
 true,
 false,
 NOW() - INTERVAL '1 day');

-- Alerta ROJA (crisis emocional)
INSERT INTO alerts (
    child_id, parent_id, severity, trigger_type,
    conversation_snippet, ai_analysis,
    notification_sent, resolved, created_at
) VALUES
('22222222-2222-2222-2222-222222222223',
 '11111111-1111-1111-1111-111111111113',
 'red',
 'crisis_emocional',
 'Perdimos el partido por mi culpa, todos me odian, ya no quiero jugar más',
 '{"sentiment_score": -0.85, "emotion": "desesperanza", "keywords": ["culpa", "odian", "no quiero más"], "concern_level": "alto", "recommendation": "URGENTE: Hablar inmediatamente con el niño. Considerar apoyo psicológico profesional. Frases de desesperanza requieren atención."}',
 true,
 false,
 NOW() - INTERVAL '3 hours');


-- ============================================================================
-- 6. POSTS DE COMUNIDAD (Moderados y aprobados)
-- ============================================================================

INSERT INTO community_posts (
    author_id, anonymous, display_name, title, content,
    category, sport, age_group, moderation_status,
    moderated_by, like_count, created_at
) VALUES
('22222222-2222-2222-2222-222222222221',
 true,
 'Futbolista 14 años',
 '¿Cómo manejan la presión de los penales?',
 'Hola! Ayer tuve que patear un penal decisivo y lo erré. Me siento terrible. ¿Alguien tiene tips para manejar mejor la presión en penales? Gracias',
 'Presión Competitiva',
 'fútbol',
 '13-15',
 'approved',
 '00000000-0000-0000-0000-000000000001',
 8,
 NOW() - INTERVAL '5 days'),

('22222222-2222-2222-2222-222222222224',
 true,
 'Nadadora 10 años',
 'Mi entrenadora es muy exigente',
 'A veces mi entrenadora me corrige muy fuerte y me dan ganas de llorar. Pero después veo que tengo razón y mejoro. ¿Es normal sentirse así? ¿Alguien más le pasa?',
 'Relación con Entrenadores',
 'natación',
 '8-12',
 'approved',
 '00000000-0000-0000-0000-000000000001',
 12,
 NOW() - INTERVAL '3 days');


-- ============================================================================
-- 7. CONTENIDO PENDIENTE DE REVISIÓN (Para demo de dashboard admin)
-- ============================================================================

INSERT INTO content_review_queue (
    review_id, content_type, content_data, category,
    source, author, status, ai_safety_check, needs_human_review, created_at
) VALUES
(gen_random_uuid()::text,
 'faq',
 '{"question": "¿Cómo puedo mejorar mi concentración durante el partido?", "answer": "La concentración es clave en el deporte. Aquí tienes 3 técnicas: 1) Práctica mindfulness 10 min diarios, 2) Establece señales de reset (ej: tocar tu número), 3) Enfócate en el presente, no en el resultado final. El cerebro solo puede estar 100% en el ahora.", "age_group": "13-15", "sport": "all"}',
 'Presión Competitiva',
 'notebooklm',
 'Marcelo Roffé',
 'pending_review',
 '{"inappropriate_language": false, "consistent_principles": true, "hallucinations_detected": false, "risk_level": "bajo", "recommendations": "Contenido apropiado, verificar fuentes de las técnicas mencionadas"}',
 true,
 NOW() - INTERVAL '2 hours'),

(gen_random_uuid()::text,
 'exercise',
 '{"title": "Técnica de Reset Mental", "description": "Ejercicio rápido para recuperar concentración durante el partido", "instructions": ["Identifica una señal física (tocar tu número, ajustar tu cinta)", "Asocia esa señal con un pensamiento positivo", "Cada vez que pierdas concentración, ejecuta tu señal", "Respira profundo 2 veces", "Vuelve al juego con mente fresca"], "duration_minutes": 1, "difficulty": "fácil"}',
 'Concentración',
 'notebooklm',
 'Marcelo Roffé',
 'pending_review',
 '{"inappropriate_language": false, "consistent_principles": true, "hallucinations_detected": false, "risk_level": "bajo", "recommendations": "Excelente ejercicio práctico, listo para aprobar"}',
 true,
 NOW() - INTERVAL '1 hour');


-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 'Demo data created successfully!' as message;

SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'FAQ Items', COUNT(*) FROM faq_items
UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercise_items
UNION ALL
SELECT 'Child Queries', COUNT(*) FROM child_queries
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'Community Posts', COUNT(*) FROM community_posts
UNION ALL
SELECT 'Pending Reviews', COUNT(*) FROM content_review_queue WHERE status = 'pending_review';
