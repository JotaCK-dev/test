# RyVen Chat 🚀

Una aplicación de chat en tiempo real con inteligencia artificial, construida con React, TypeScript, Supabase y Google Gemini AI.

## ✨ Características

### 🌟 Chat Global
- **Comunicación en tiempo real** entre todos los usuarios
- **Envío de imágenes** y mensajes de texto
- **Editar, eliminar y copiar mensajes**
- **Actualizaciones en vivo** con Supabase Realtime

### 🤖 Chats con IA
- **Múltiples chats privados** con RyVen AI (Gemini)
- **Análisis de imágenes** con IA
- **Conversaciones contextuales** que recuerdan participantes
- **Respuestas inteligentes** en español

### 🎨 Diseño
- **Tema oscuro** con toques rojos
- **Diseño minimalista** y moderno
- **Animaciones suaves** con Framer Motion
- **Completamente responsive**
- **Botones redondeados** y elementos elegantes

### 🔐 Autenticación
- **Sistema de login/register** con Supabase Auth
- **Sin confirmación de email** requerida
- **Sesiones persistentes**

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Base de Datos**: Supabase (PostgreSQL)
- **Tiempo Real**: Supabase Realtime
- **IA**: Google Gemini AI
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd ryven-chat
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/)
2. Ve al SQL Editor y ejecuta el contenido de `supabase_schema.sql`
3. Habilita Realtime para las tablas en Database > Replication

### 4. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Completa las variables:
```env
REACT_APP_GEMINI_API_KEY=tu_gemini_api_key_aqui
```

**Para obtener la API key de Gemini:**
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Cópiala a tu archivo `.env`

### 5. Ejecutar la aplicación
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Esquema de Base de Datos

### Tablas principales:

- **`profiles`**: Información de usuarios
- **`chats`**: Chats (global y con IA)
- **`messages`**: Mensajes de chat
- **`chat_participants`**: Participantes en chats con IA

### Características de la BD:
- **Row Level Security (RLS)** habilitado
- **Triggers automáticos** para crear perfiles
- **Índices optimizados** para rendimiento
- **Realtime habilitado** en todas las tablas

## 🚀 Funcionalidades

### Chat Global
- Todos los usuarios pueden participar
- Mensajes en tiempo real
- Soporte para imágenes (base64)
- Funciones de editar/eliminar/copiar

### Chats con IA
- Los usuarios pueden crear múltiples chats
- Cada chat tiene participantes específicos
- La IA conoce el contexto y participantes
- Análisis de imágenes con Gemini Vision

### Sistema de Mensajes
- **Envío**: Texto e imágenes
- **Edición**: Solo mensajes propios
- **Eliminación**: Soft delete
- **Copia**: Al portapapeles
- **Tiempo real**: Actualizaciones instantáneas

## 📱 Responsive Design

- **Mobile First**: Optimizado para móviles
- **Sidebar responsive**: Se oculta en móviles
- **Touch friendly**: Botones y gestos táctiles
- **Progressive Web App**: Funciona offline básico

## 🎨 Personalización

### Colores del tema:
```css
dark-100: #1a1a1a  /* Fondo principal */
dark-200: #2d2d2d  /* Componentes */
dark-300: #404040  /* Inputs */
red-primary: #dc2626  /* Acento rojo */
```

### Animaciones:
- **fade-in**: Aparición suave
- **slide-up**: Deslizamiento hacia arriba
- **bounce-gentle**: Rebote suave

## 🔧 Scripts Disponibles

```bash
npm start          # Desarrollo
npm run build      # Construcción para producción
npm test           # Ejecutar tests
npm run eject      # Eyectar configuración (no recomendado)
```

## 📋 TODO / Mejoras Futuras

- [ ] Notificaciones push
- [ ] Búsqueda de mensajes
- [ ] Temas personalizables
- [ ] Emojis y reacciones
- [ ] Archivos adjuntos (PDF, etc.)
- [ ] Videollamadas
- [ ] Estados de usuario (online/offline)
- [ ] Mensajes temporales

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Supabase** por la infraestructura backend
- **Google** por la IA Gemini
- **Vercel** por el hosting
- **Tailwind CSS** por el sistema de diseño
- **Framer Motion** por las animaciones

---

**Desarrollado con ❤️ por el equipo RyVen**

¿Tienes preguntas? Abre un issue o contacta al equipo de desarrollo.
