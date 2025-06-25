# SOLICITUD DE PATENTE EUROPEA
## SISTEMA INTELIGENTE DE ANÁLISIS NUTRICIONAL PERSONALIZADO CON GAMIFICACIÓN DUAL

**Número de Solicitud:** [A completar por OEPM]
**Fecha de Presentación:** [Fecha de presentación]
**Solicitante:** [Nombre del solicitante]
**Inventor(es):** [Nombres de los inventores]

---

## RESUMEN

La presente invención se refiere a un sistema inteligente de análisis nutricional que combina inteligencia artificial generativa con un sistema de gamificación dual para proporcionar evaluaciones nutricionales personalizadas instantáneas. El sistema utiliza un motor de IA que procesa múltiples modalidades de entrada (imagen, texto, carga de archivos) para generar veredictos nutricionales simplificados ("SÍ", "NO", "REGULAR") junto con explicaciones personalizadas basadas en el perfil individual del usuario, objetivos de salud, preferencias dietéticas y alergias.

La innovación principal radica en el sistema de puntuación dual que separa la competición semanal del progreso de por vida, combinado con un sistema de desafíos dinámicos que previene duplicaciones mediante seguimiento temporal basado en zona horaria específica, creando un entorno gamificado único que motiva la adopción de hábitos alimentarios saludables.

---

## CAMPO TÉCNICO

La presente invención pertenece al campo de los sistemas de análisis nutricional asistidos por inteligencia artificial, específicamente a sistemas que combinan análisis de alimentos multimodal con gamificación avanzada para promover comportamientos alimentarios saludables.

---

## ESTADO DE LA TÉCNICA

Los sistemas existentes de análisis nutricional presentan las siguientes limitaciones:

1. **Sistemas de análisis básico**: Aplicaciones como MyFitnessPal o Cronometer requieren entrada manual de datos y no proporcionan análisis instantáneo basado en IA.

2. **Reconocimiento de alimentos por IA**: Sistemas como Foodvisor o Yazio utilizan IA para reconocimiento, pero carecen de personalización profunda y sistemas de motivación integrados.

3. **Sistemas de gamificación alimentaria**: Aplicaciones como Noom incorporan elementos de juego, pero no combinan análisis de IA en tiempo real con sistemas de puntuación dual.

4. **Análisis nutricional personalizado**: Sistemas existentes como Nutrino proporcionan recomendaciones personalizadas, pero requieren configuración manual extensa y no ofrecen veredictos instantáneos.

**Deficiencias identificadas en el estado de la técnica:**
- Falta de análisis instantáneo multimodal personalizado
- Ausencia de sistemas de gamificación que separen competición temporal de progreso permanente
- Carencia de prevención de duplicación de recompensas basada en zona horaria
- Falta de integración entre análisis de IA y motivación comportamental

---

## PROBLEMA TÉCNICO

Los sistemas existentes no logran combinar eficazmente:
1. Análisis nutricional instantáneo personalizado mediante IA generativa
2. Entrada multimodal (imagen, texto, archivo) procesada uniformemente
3. Sistema de gamificación dual que mantiene motivación tanto a corto como largo plazo
4. Prevención robusta de manipulación del sistema de recompensas
5. Personalización profunda basada en perfiles de salud individuales

---

## SOLUCIÓN TÉCNICA

### REIVINDICACIÓN PRINCIPAL

Sistema inteligente de análisis nutricional personalizado caracterizado por:

**a) Motor de Análisis de IA Multimodal:**
- Procesamiento unificado de entrada por imagen (cámara/carga), texto descriptivo
- Integración con modelos de IA generativa (Google Gemini) para análisis contextual
- Generación de veredictos simplificados ("SÍ", "NO", "REGULAR") con explicaciones personalizadas
- Análisis de confianza integrado para validación de resultados

**b) Sistema de Personalización Profunda:**
- Consideración de objetivos de salud del usuario (pérdida de peso, ganancia muscular, salud general)
- Integración de preferencias dietéticas (vegano, vegetariano, keto, paleo, etc.)
- Alertas automáticas de seguridad por alergias registradas
- Adaptación del tono y detalle de respuesta según nivel de suscripción

**c) Sistema de Gamificación Dual Innovador:**
- **Puntos de por vida**: Acumulación permanente para progresión de niveles (1000 puntos por nivel)
- **Puntos semanales**: Reinicio cada lunes medianoche (zona horaria Madrid) para competición
- **Puntuación diferenciada**: SÍ=10 puntos, REGULAR=5 puntos, NO=2 puntos
- **Sistema de sincronización**: Usuarios de primera semana mantienen paridad hasta primer reinicio

**d) Sistema de Desafíos con Prevención de Duplicación:**
- Detección automática de logros (3 SÍ consecutivos, 5 análisis diarios, etc.)
- Prevención de duplicación mediante seguimiento temporal basado en zona horaria específica
- Otorgamiento dual automático a ambos sistemas de puntuación
- Sistema de insignias basado en completación de desafíos (1 desafío = 1 insignia)

**e) Arquitectura de Datos Temporal:**
- Gestión de sesiones basada en PostgreSQL para seguridad
- Reseteo automático semanal mediante planificador temporal
- Seguimiento de actividad diaria para prevención de fraude
- Almacenamiento de historial para análisis de progreso

### REIVINDICACIONES DEPENDIENTES

**Reivindicación 2:** Sistema según reivindicación 1, caracterizado porque el motor de análisis de IA considera el nivel de suscripción del usuario para adaptar el nivel de detalle científico en las explicaciones, proporcionando análisis casual para usuarios gratuitos y análisis científico detallado para usuarios premium.

**Reivindicación 3:** Sistema según reivindicación 1, caracterizado porque el sistema de puntuación dual implementa una lógica de primera semana donde los puntos totales permanecen sincronizados con los puntos semanales hasta el primer reinicio semanal, después del cual divergen permanentemente.

**Reivindicación 4:** Sistema según reivindicación 1, caracterizado porque el sistema de prevención de duplicación utiliza la zona horaria de Madrid como referencia temporal estándar para determinar períodos de 24 horas, independientemente de la ubicación geográfica del usuario.

**Reivindicación 5:** Sistema según reivindicación 1, caracterizado porque el proceso de análisis multimodal normaliza todas las entradas (imagen, texto, archivo) a un formato unificado antes del procesamiento por IA, permitiendo tratamiento homogéneo independientemente del método de entrada.

**Reivindicación 6:** Sistema según reivindicación 1, caracterizado porque el sistema implementa respuestas dinámicas humorísticas para elementos no alimentarios detectados por la IA, utilizando diferentes estilos de humor para mantener el engagement del usuario.

**Reivindicación 7:** Sistema según reivindicación 1, caracterizado porque el sistema de desafíos incluye múltiples tipos de logros: rachas de alimentos saludables (50 puntos por 3 SÍ consecutivos), volumen de análisis (25 puntos por 5 análisis, 50 puntos por 10 análisis), y excelencia diaria (100 puntos por 5 SÍ en un día).

**Reivindicación 8:** Sistema según reivindicación 1, caracterizado porque el sistema mantiene un registro de webhooks fallidos para procesamiento de pagos, permitiendo reintento automático y monitoreo de integridad del sistema de suscripciones.

---

## DESCRIPCIÓN DETALLADA

### Arquitectura del Sistema

El sistema comprende varios módulos interconectados:

**1. Módulo de Entrada Multimodal**
El sistema acepta tres tipos de entrada que son procesados de manera unificada:
- Captura de imagen en tiempo real mediante cámara del dispositivo
- Carga de archivo de imagen desde galería del dispositivo  
- Descripción textual del alimento

Todas las entradas son normalizadas a un formato estándar que incluye metadatos temporales y de usuario antes del procesamiento.

**2. Motor de Análisis de IA**
Utiliza Google Gemini 1.5 Flash como motor principal con las siguientes características:
- Análisis contextual considerando perfil completo del usuario
- Generación de veredictos estructurados en formato JSON
- Cálculo de nivel de confianza para validación
- Adaptación de respuesta según nivel de suscripción

**3. Sistema de Personalización**
Implementa múltiples capas de personalización:
- **Objetivos de salud**: Pérdida de peso, ganancia muscular, salud general
- **Preferencias dietéticas**: 15+ tipos de dietas soportadas
- **Restricciones médicas**: Sistema de alertas por alergias
- **Nivel de suscripción**: Adaptación del detalle de análisis

**4. Sistema de Gamificación Dual**
La innovación principal del sistema, implementando:

```
updateWeeklyScore(userId, verdict) {
  // Actualiza puntos semanales (se reinician los lunes)
  // Actualiza contadores de verdicts (SÍ/NO/REGULAR)
  // Llama a updateUserPoints() para puntos de por vida
  // Verifica y otorga desafíos automáticamente
}
```

**5. Sistema de Prevención de Duplicación**
Utiliza seguimiento temporal basado en zona horaria de Madrid:

```
wasBonusAwardedToday(userId, bonusType) {
  madridToday = getMadridTime().setHours(0,0,0,0)
  madridTomorrow = madridToday + 24 horas
  // Verifica si ya existe entrada BONUS_{bonusType} en período
}
```

### Flujo de Procesamiento

**1. Entrada de Usuario:**
Usuario proporciona alimento → Sistema normaliza entrada → Validación de formato

**2. Análisis de IA:**
Entrada normalizada → Google Gemini API → Análisis personalizado → Generación de veredicto

**3. Procesamiento de Resultado:**
Veredicto + explicación → Presentación al usuario → Decisión de acción (Yum/Nah)

**4. Gamificación:**
Si "Yum" → updateWeeklyScore() → Puntos duales → Verificación de desafíos → Otorgamiento de bonos

**5. Persistencia:**
Almacenamiento en base de datos → Actualización de estadísticas → Cálculo de rankings

### Aspectos Técnicos Innovadores

**Sincronización de Primera Semana:**
Para usuarios nuevos, el sistema mantiene paridad entre puntos semanales y totales hasta el primer reinicio semanal, después del cual divergen según diseño dual.

**Gestión de Zona Horaria:**
Todo el sistema opera en zona horaria de Madrid independientemente de la ubicación del usuario, asegurando consistencia global en reinicios y validaciones temporales.

**Arquitectura de Sesiones:**
Utiliza PostgreSQL para almacenamiento de sesiones con TTL automático, proporcionando seguridad robusta y limpieza automática.

---

## VENTAJAS TÉCNICAS

1. **Análisis Instantáneo Personalizado**: Combina IA generativa con personalización profunda para análisis nutricional inmediato adaptado al usuario individual.

2. **Gamificación Sostenible**: El sistema dual permite motivación tanto a corto plazo (competición semanal) como a largo plazo (progresión de niveles), evitando la fatiga común en sistemas de gamificación tradicionales.

3. **Robustez Anti-Fraude**: El sistema de prevención de duplicación basado en zona horaria específica impide manipulación del sistema de recompensas.

4. **Escalabilidad**: Arquitectura basada en servicios permite escalado independiente de componentes según demanda.

5. **Personalización Profunda**: Consideración simultánea de múltiples factores (salud, dieta, alergias, suscripción) para análisis verdaderamente personalizado.

---

## APLICACIÓN INDUSTRIAL

El sistema tiene aplicación directa en:
- Aplicaciones móviles de salud y nutrición
- Plataformas de coaching nutricional
- Sistemas de gestión de dietas clínicas
- Programas corporativos de bienestar
- Investigación en comportamiento alimentario

---

## MODO DE REALIZACIÓN PREFERENTE

### Implementación Técnica

**Frontend:**
- React 18 con TypeScript para interfaz responsiva
- Shadcn/UI para componentes accesibles
- TanStack Query para gestión de estado del servidor
- Wouter para enrutado ligero

**Backend:**
- Node.js 20 con Express.js para API RESTful
- PostgreSQL con Drizzle ORM para persistencia tipo-segura
- Integración nativa con Google Gemini AI
- Sistema de sesiones basado en PostgreSQL

**Base de Datos:**
```sql
-- Tabla de usuarios con gamificación dual
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  total_points INTEGER DEFAULT 0,  -- Puntos de por vida
  current_level INTEGER DEFAULT 1, -- Nivel basado en total_points
  health_goals VARCHAR,
  dietary_preferences VARCHAR[],
  allergies VARCHAR[]
);

-- Tabla de puntuaciones semanales
CREATE TABLE weekly_scores (
  user_id VARCHAR REFERENCES users(id),
  week_start TIMESTAMP,
  weekly_points INTEGER DEFAULT 0,  -- Se reinicia cada lunes
  yes_count INTEGER DEFAULT 0,
  ok_count INTEGER DEFAULT 0,
  no_count INTEGER DEFAULT 0
);
```

**Despliegue:**
- Google Cloud Run con escalado automático 0-20 instancias
- Contenedor Docker multi-etapa para optimización
- CI/CD automatizado mediante Cloud Build
- Monitoreo de salud integrado

---

## DIBUJOS

[Nota: En una solicitud real se incluirían diagramas técnicos mostrando:]

**Figura 1:** Diagrama de flujo del sistema de análisis multimodal
**Figura 2:** Arquitectura del sistema de gamificación dual  
**Figura 3:** Esquema de prevención de duplicación temporal
**Figura 4:** Diagrama de personalización basada en perfil de usuario
**Figura 5:** Flujo de procesamiento de entrada a resultado

---

## CONCLUSIÓN

La presente invención proporciona una solución técnica innovadora que combina análisis nutricional instantáneo mediante IA generativa con un sistema de gamificación dual único. La integración de estos elementos con personalización profunda y prevención robusta de fraude crea un sistema técnicamente superior que aborda las limitaciones identificadas en el estado de la técnica.

La aplicabilidad industrial del sistema es amplia, con potencial significativo en el mercado creciente de aplicaciones de salud digital y sistemas de modificación de comportamiento alimentario.

---

**FECHA:** [Fecha de presentación]
**FIRMA:** [Firma del solicitante/representante]

---

*Este documento ha sido preparado de acuerdo con el Convenio Europeo de Patentes y la normativa española de propiedad industrial. Se reservan todos los derechos de propiedad intelectual.*