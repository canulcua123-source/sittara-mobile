# 📱 Sittara Mobile

> La experiencia definitiva para descubrir y reservar en los mejores restaurantes de Yucatán.

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📝 Descripción del Proyecto

**Sittara Mobile** es una aplicación móvil premium diseñada para conectar a comensales con la vibrante escena gastronómica de la Península de Yucatán. El proyecto nace de la necesidad de modernizar el sistema de reservaciones de "Mesa Feliz", eliminando las barreras de comunicación directa y ofreciendo una plataforma centralizada, visual y eficiente.

Esta aplicación está pensada tanto para el turista que desea explorar la cocina regional como para el residente local que busca su próxima experiencia culinaria, permitiendo gestionar reservaciones en segundos desde cualquier lugar.

---

## 🚀 Funcionalidades Principales

*   **Exploración Inteligente:** Descubrimiento de restaurantes basado en zonas geográficas y tipos de cocina (Yucateca, Mariscos, Fusión, etc.).
*   **Mapa de Mesas Interactivo:** Selección visual de mesas en tiempo real, permitiendo al usuario elegir su ubicación preferida dentro del restaurante.
*   **Gestión de Ofertas:** Sección dedicada a promociones exclusivas (BOGO, descuentos porcentuales, menús especiales).
*   **Check-in vía QR:** Generación de códigos QR de alta definición para una validación rápida y segura de la llegada en la recepción.
*   **Perfiles de Usuario:** Gestión de favoritos, historial de visitas y detalles de cuenta personal.
*   **Notificaciones en Tiempo Real:** Seguimiento del estatus de la reserva (Pendiente, Confirmada, Completada).

---

## 🛠️ Tecnologías Utilizadas

### Frontend (Mobile)
*   **React Native & Expo:** Desarrollo multiplataforma eficiente.
*   **Expo Router:** Navegación basada en archivos (File-based routing) para una estructura limpia.
*   **NativeWind (Tailwind CSS):** Sistema de estilos utilitarios aplicado a componentes móviles para una interfaz moderna y coherente.
*   **TanStack Query (React Query):** Manejo profesional de caché, estados de carga y sincronización de datos asíncronos.
*   **Lucide Icons:** Set de iconos minimalistas para una experiencia de usuario premium.
*   **Axios:** Cliente HTTP para la comunicación con la API.

### Backend & Servicios
*   **Node.js & Express:** API REST robusta desplegada en **Render**.
*   **Supabase:** Base de datos PostgreSQL alojada en la nube con escalabilidad garantizada.
*   **Stripe SDK:** Integración preparada para el manejo de depósitos de garantía.

---

## 🧩 Arquitectura y Estructura

El proyecto sigue una arquitectura basada en **Hooks Personalizados** y una separación clara de responsabilidades:

```text
sittara-mobile/
├── app/               # Sistema de rutas (Expo Router)
├── components/        # Componentes UI reutilizables
├── src/
│   ├── hooks/         # Lógica de fetching y estados (useData, useAuth)
│   ├── services/      # Capa de servicios API (Axios instances)
│   ├── context/       # Manejo de estado global (AuthContext)
│   └── types/         # Definiciones de TypeScript
└── constants/         # Tokens de diseño y configuraciones
```

Se aplican principios **SOLID** y **DRY**, delegando la lógica de negocio a hooks de React Query, lo que permite mantener los componentes visuales enfocados puramente en el renderizado y la interacción.

---

## ⚙️ Procesos de Desarrollo

*   **Flujo de Git:** Se utiliza una rama `main` protegida, con despliegue continuo configurado para pruebas.
*   **Manejo de Estados:** Se prioriza el estado del servidor (Server State) mediante React Query para reducir la complejidad del estado local.
*   **Validaciones:** Uso exhaustivo de TypeScript para prevenir errores en tiempo de ejecución y asegurar la consistencia de los datos entre el Backend y el Móvil.

---

## ▶️ Instalación y Ejecución

### Requisitos Previos
*   Node.js (LTS)
*   npm o yarn
*   Expo Go app (en tu dispositivo físico) o un simulador/emulador.

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/canulcua123-source/sittara-mobile.git
   cd sittara-mobile
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` basado en `.env.example` y añade tu URL de la API:
   ```env
   EXPO_PUBLIC_API_URL=https://sittarra2.onrender.com/api
   ```

4. **Iniciar el proyecto:**
   ```bash
   npx expo start
   ```

---

## 📦 Estado del Proyecto

Actualmente en fase **MVP (Producto Mínimo Viable)** con despliegue exitoso en Render.

**Próximas mejoras:**
*   Implementación de reseñas y calificaciones detalladas.
*   Sistema de pre-orden de platillos desde el menú digital.
*   Notificaciones Push nativas.

---

## 👤 Autor

*   **GitHub:** [canulcua123-source](https://github.com/canulcua123-source)

---
Proyecto desarrollado con fines profesionales para el portafolio de desarrollo Mobile.
