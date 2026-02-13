# 🛠️ Instalación de Componentes de Alta Fidelidad

Ejecuta estos comandos en tu terminal dentro de la carpeta `sittara-mobile` para instalar el stack que solicitaste:

### 1. Sistema Base y Estilos
```bash
# NativeWind (Tailwind)
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# Iconos Lucide
npm install lucide-react-native

# Navegación y Performance
npm install @shopify/flash-list @tanstack/react-query axios
```

### 2. UI y Experiencia de Usuario (Exploración y Reservas)
```bash
# Bottom Sheet (Action Sheet de Reserva)
npm install @gorhom/bottom-sheet@^4

# Gráficos y Mapas
npm install react-native-svg react-native-chart-kit

# Feedback y Notificaciones
npm install expo-haptics react-native-toast-message
```

### 3. Utilidades Avanzadas
```bash
# Cámara y QR
npx expo install expo-camera

# Gestión de Gestos (Requerido por BottomSheet y Mapa de Mesas)
npx expo install react-native-gesture-handler
```

---

## ⚙️ Configuración Obligatoria

### A. Babel Config (`babel.config.js`)
IMPORTANTE: Reemplaza el contenido de tu archivo `babel.config.js` por este:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel", "react-native-reanimated/plugin"],
  };
};
```

### B. Tailwind Config (`tailwind.config.js`)
Crea o edita el archivo `tailwind.config.js` en la raíz:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#(Copia el color de tu web)",
        secondary: "#(Copia el color de tu web)",
      },
    },
  },
  plugins: [],
}
```

### C. Configuración de Gesture Handler (App Entry)
En tu archivo `app/_layout.tsx`, debes envolver todo con `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* El resto de tu configuración de Tabs/Stack */}
    </GestureHandlerRootView>
  );
}
```
