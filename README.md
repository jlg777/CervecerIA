# 🤖 Agente de Navegación Inteligente

Sistema de chat con agente inteligente que ayuda a navegar por una aplicación y buscar información de usuarios.

## 📋 Estructura del Proyecto

```
mi-proyecto/
├── backend/
│   ├── agents/
│   │   └── support.md           # Instrucciones del agente
│   ├── tools/
│   │   └── searchUser.js        # Herramienta de búsqueda
│   ├── agent.js                 # Configuración del agente
│   ├── server.js                # Servidor Express
│   ├── package.json             # Dependencias backend
│   └── .env                     # Variables de entorno
├── frontend/
│   ├── src/
│   │   └── main.jsx             # Punto de entrada React
│   ├── App.jsx                  # Componente principal
│   ├── App.css                  # Estilos
│   ├── package.json             # Dependencias frontend
│   ├── index.html               # HTML principal
│   └── vite.config.js           # Configuración Vite
└── .env.example                 # Plantilla de variables
```

## 🔧 Instalación

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## ▶️ Ejecución

### Backend (Terminal 1)

```bash
cd backend
npm run dev        # Modo desarrollo con watch
# o
npm start         # Modo producción
```

El servidor estará disponible en `http://localhost:3000`

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📡 Endpoints API

### POST /chat

Procesa un mensaje y obtiene respuesta del agente

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Busca juan@gmail.com"}'
```

### GET /health

Verifica el estado del servidor

```bash
curl http://localhost:3000/health
```

## ✨ Características

- ✅ Agente inteligente basado en OpenAI
- ✅ Búsqueda de usuarios por email
- ✅ Chat interactivo en tiempo real
- ✅ Interfaz moderna y responsiva
- ✅ Manejo de errores robusto
- ✅ Variables de entorno configurables

## 🛠️ Stack Tecnológico

**Backend:**

- Node.js + Express
- OpenAI Agents API
- CORS habilitado
- Dotenv para variables de entorno

**Frontend:**

- React 18
- Vite
- CSS personalizado
- Fetch API

## 🔐 Configuración de Variables

Copia `.env.example` a `.env` y configura:

```
BACKEND_PORT=3000
NODE_ENV=development
OPENAI_API_KEY=tu_clave_aqui
VITE_API_URL=http://localhost:3000
```

## 📝 Datos de Prueba

El agente tiene usuarios de prueba:

- juan@gmail.com - Plan "pro"
- ana@gmail.com - Plan "free"

Puedes buscar: **"Buscar juan@gmail.com"** o **"¿Qué plan tiene ana?"**

## 🚀 Deploy

Para producción:

```bash
# Backend
npm run build

# Frontend
npm run build
```

## 📄 Licencia

MIT
