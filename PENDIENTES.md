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
