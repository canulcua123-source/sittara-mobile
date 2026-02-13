# 🚨 Gap Analysis & Remediation Plan - Sittara Mobile (v1.0 Candidate)

**Fecha:** 12 Febrero 2026  
**Estado General:** 🟠 **NO APTO PARA PRODUCCIÓN (Aún)**  
**Objetivo:** Identificar bloqueantes críticos para lanzamiento en App Store/Play Store y gaps funcionales.

---

## 🛑 1. CRÍTICOS (Showstoppers)
*Estos elementos **garantizan el rechazo** de las tiendas de aplicaciones o fallos mayores en producción. Deben resolverse antes de cualquier beta pública.*

### 1.1 Eliminar Cuenta (Account Deletion)
*   **Problema:** No existe funcionalidad para que el usuario elimine su cuenta y datos.
*   **Impacto:** **Rechazo inmediato** en Apple App Store (Guideline 5.1.1) y Google Play.
*   **Solución Requerida:**
    1.  Añadir botón "Eliminar Cuenta" en `ProfileScreen`.
    2.  Crear pantalla de confirmación (con advertencia de pérdida de datos).
    3.  Implementar endpoint (o usar Supabase Auth directamente) para borrado lógico/físico.

### 1.2 Autenticación Social (Google/Apple)
*   **Problema:** La implementación actual en `LoginScreen` es un "Mock" (simulación). Obtiene el token del proveedor pero **no crea la sesión** en el backend de Sittara (`// TODO: Call your backend`).
*   **Impacto:** El usuario creerá que se registró, pero no podrá reservar ni guardar favoritos porque no existe en la base de datos.
*   **Solución Requerida:**
    *   **Opción A (Rápida):** Ocultar los botones de Google/Facebook para la v1.0.
    *   **Opción B (Correcta):** Implementar el intercambio de token en backend (`/auth/google`) y vincularlo a un usuario real.

### 1.3 Notificaciones Push (Ciclo de Reserva)
*   **Problema:** No hay configuración de `Expo Push Token`. El usuario depende de abrir la app manualmente para saber si su reserva fue confirmada o rechazada.
*   **Impacto:** Alta tasa de "No Shows" (ausencias) y mala experiencia de usuario.
*   **Solución Requerida:**
    1.  Configurar `expo-notifications` en `_layout.tsx`.
    2.  Guardar el `push_token` del dispositivo en la tabla `users` al hacer login.
    3.  Backend debe disparar notificaciones en cambios de estado.

---

## 🟠 2. ALTA PRIORIDAD (Experiencia Core)
*Estos elementos afectan significativamente la usabilidad y la percepción de calidad.*

### 2.1 Gestión de Contraseñas
*   **Problema:** No hay forma de cambiar la contraseña estando logueado. El usuario debe cerrar sesión y usar "Olvidé mi contraseña".
*   **Solución:** Añadir sección "Cambiar Contraseña" en `ProfileScreen` -> `Security`.

### 2.2 Modificar Reserva
*   **Problema:** El usuario puede **Crear** y **Cancelar**, pero no **Editar** (cambiar hora/personas). Debe cancelar y crear una nueva, perdiendo su lugar si hay alta demanda.
*   **Solución:** Endpoint `PATCH /reservations/:id` e interfaz de edición.

### 2.3 Feedback de Estado en Tiempo Real
*   **Problema:** Si el staff marca una mesa como "Available" o confirma una reserva, la app móvil no se entera hasta que el usuario recarga manualmente (Pull-to-refresh).
*   **Solución:** Implementar *Polling* inteligente (cada 30s) o WebSockets (Supabase Realtime) en la pantalla de "Mis Reservas" para actualizar estados automáticamente.

---

## 🟡 3. DEUDA TÉCNICA & SEGURIDAD
*Mejoras necesarias para estabilidad y seguridad.*

### 3.1 Exposición de Admin
*   **Problema:** El botón de "Portal de Staff" en el perfil se muestra basado en `user.email.includes('admin')`.
*   **Riesgo:** Inseguro. Cualquier usuario puede registrarse con un email que contenga "admin".
*   **Solución:** Usar un campo `role` real en la base de datos (`user.role === 'admin' | 'staff'`).

### 3.2 Manejo de Errores Global
*   **Problema:** Si una pantalla falla al renderizar, la app se cierra (Crash).
*   **Solución:** Implementar un `ErrorBoundary` global (ya existe el import en `_layout`, falta configurarlo visualmente) para mostrar una pantalla de "Algo salió mal" amigable.

---

## ✅ LO QUE SÍ ESTÁ BIEN (No tocar)
*   **Buscador y Filtros:** Funcionan correctamente tras los últimos arreglos.
*   **Flujo de Reserva:** La selección de fecha/hora/mesa es excelente.
*   **Reseñas:** El flujo de calificación post-visita es sólido.
*   **Check-in:** El código QR se genera correctamente.

---

## 🚀 PLAN DE ACCIÓN INMEDIATO (Siguiente Sprint)

1.  **Semana 1 (Compliance):**
    *   Implementar **Eliminar Cuenta**.
    *   Decidir sobre Social Auth (Ocultar o Arreglar).
    *   Arreglar rol de Admin.

2.  **Semana 2 (Engagement):**
    *   Conectar **Push Notifications**.
    *   Implementar "Cambiar Contraseña".

3.  **Semana 3 (Polish):**
    *   Modificar reserva.
    *   Polling de estado.
