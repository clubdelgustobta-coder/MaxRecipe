# RecetarioApp — Pendientes

---

## PENDIENTE 01 — Sistema de Login con Firebase Auth

**Descripción:** Implementar un sistema de autenticación para que solo usuarios autorizados puedan acceder a la app.

**Decisión pendiente:** Elegir entre:
- **Opción A — Validación simple de email en Firestore:** El usuario ingresa su email, la app verifica si existe en una colección de Firestore. Sin contraseña.
- **Opción B — Firebase Authentication (Recomendado):** Email + contraseña. Sesión persistente, gestión de usuarios desde la consola de Firebase, bloqueo/habilitación sin tocar código.

**Contexto:**
- El usuario ya tiene cuenta en Firestore usada en otras aplicaciones
- El usuario ya tiene cuenta en GitHub
- La app es privada/exclusiva — círculo cerrado de usuarios autorizados
- Firebase Auth ya está integrado nativamente con Firestore

**Próximos pasos una vez decidido:**
1. Instalar `@react-native-firebase/app` y `@react-native-firebase/auth`
2. Crear pantalla `LoginScreen.js`
3. Lógica de sesión persistente en `App.js` (mostrar Login o app según estado de auth)
4. Consola Firebase → agregar usuarios autorizados manualmente

---

## PENDIENTE 02 — Ideas de mejora UX y contenido

### Contenido enriquecido
- **Fotos de proceso** — imágenes de los pasos de preparación, no solo el plato final
- **Video corto** — link a YouTube embebido en la receta
- **Nivel de dificultad** — fácil / medio / difícil con ícono visual en la card
- **Tiempo de preparación** — ej. "30 min" visible en la card y en el detalle
- **Porción** — para cuántas personas está calculada la receta

### Funciones UX
- **Modo oscuro / claro** — toggle en el header para cambiar tema
- **Escalar ingredientes** — slider para 2 / 4 / 6 personas, los gramos se recalculan solos
- **Compartir receta** — botón para copiar link directo a una receta específica
- **Búsqueda por ingrediente** — "¿qué tengo en la nevera?" → recetas que lo usan
- **Historial de recetas vistas** — las últimas 5 visitadas, acceso rápido

### Personal / Social
- **Notas personales por receta** — campo libre para anotar variaciones propias
- **Valoración personal** — 1 a 5 estrellas privadas por receta
- **Fecha de última preparación** — registrar cuándo se cocinó por última vez

### Técnico
- **Modo offline** — cachear recetas en AsyncStorage para usar sin internet
- **PWA (Progressive Web App)** — instalar la app en el celular directamente desde el browser sin pasar por App Store / Play Store
