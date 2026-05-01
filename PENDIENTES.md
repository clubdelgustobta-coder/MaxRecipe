# RecetarioApp — Pendientes

---

## ✅ PENDIENTE 01 — Sistema de Login con Firebase Auth *(FIX 34)*

Firebase Auth implementado con email + contraseña. Flujo de solicitud de acceso por WhatsApp al admin. Gestión de usuarios desde consola Firebase sin tocar código.

---

## PENDIENTE 02 — Panel de Administración (plan por fases)

### Fase 1 — Sin plan Blaze (implementar ahora)
- **Pantalla Admin** — visible solo para el administrador (detectado por UID)
- **Lista de usuarios activos** — leída desde Firestore colección `users`
- **Último ingreso** — fecha/hora del último login de cada usuario
- **Primer ingreso** — fecha de alta en la app
- Firestore se actualiza automáticamente en cada login del usuario

### Fase 2 — Con plan Blaze + Cloud Functions (futuro)
- **Crear usuario** desde la app (sin pasar por Firebase Console)
- **Deshabilitar usuario** — bloquear acceso con un tap
- **Eliminar usuario** — borrar cuenta definitivamente
- **Ver solicitudes pendientes** — lista de quienes pidieron acceso por WhatsApp
- Requiere: cambiar proyecto `Recetario-Max` a plan Blaze + deploy de Cloud Functions

---

## PENDIENTE 03 — Ideas de mejora UX y contenido

### Contenido enriquecido
- **Fotos de proceso** — imágenes de los pasos de preparación, no solo el plato final
- **Video corto** — link a YouTube embebido en la receta
- **Nivel de dificultad** — fácil / medio / difícil con ícono visual en la card
- **Tiempo de preparación** — ej. "30 min" visible en la card y en el detalle
- **Porción** — para cuántas personas está calculada la receta

### Funciones UX
- **Modo oscuro / claro** — toggle en el header para cambiar tema
- ✅ ~~**Escalar ingredientes** — botones 2p/4p/6p, base 2 personas~~ *(FIX 32)*
- ✅ ~~**Compartir receta por WhatsApp** — link directo a la receta~~ *(FIX 31)*
- **Búsqueda por ingrediente** — "¿qué tengo en la nevera?" → recetas que lo usan
- **Historial de recetas vistas** — las últimas 5 visitadas, acceso rápido

### Personal / Social
- ✅ ~~**Notas personales por receta** — campo libre, guardado en AsyncStorage~~ *(FIX 33)*
- **Valoración personal** — 1 a 5 estrellas privadas por receta
- **Fecha de última preparación** — registrar cuándo se cocinó por última vez

### Técnico
- **Modo offline** — cachear recetas en AsyncStorage para usar sin internet
- **PWA (Progressive Web App)** — instalar la app en el celular directamente desde el browser sin pasar por App Store / Play Store
