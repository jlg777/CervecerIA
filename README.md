# 🍺 Agente de IA para Recomendación de Cerveza

Sistema inteligente de chat con un agente de IA especializado en recomendar cervezas. Utiliza Groq como LLM (modelo Llama 3.1 8B Instant) con herramientas personalizadas para sugerir tipos de cerveza según las preferencias del usuario en la cervecería "Wengan".

## 📋 Estructura del Proyecto

```
AIssistant/
├── backend/
│   ├── agents/
│   │   └── support.md           # Instrucciones y personalidad del agente
│   ├── tools/
│   │   └── cerveza.js           # Herramienta de recomendación de cervezas
│   ├── agent.js                 # Configuración y lógica del agente con tool calling
│   ├── server.js                # Servidor Express con endpoints REST
│   ├── openai.js                # Configuración del cliente LLM
│   ├── package.json             # Dependencias backend
│   └── .env                     # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # Punto de entrada React
│   │   ├── index.css            # Estilos globales
│   │   └── assets/              # Recursos estáticos
│   ├── App.jsx                  # Componente principal
│   ├── App.css                  # Estilos de la aplicación
│   ├── package.json             # Dependencias frontend
│   ├── index.html               # HTML principal
│   ├── vite.config.js           # Configuración Vite
│   └── public/                  # Recursos públicos
└── README.md                    # Este archivo
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
npm run dev        # Modo desarrollo con watch automático
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

Procesa un mensaje y obtiene respuesta del agente con recomendaciones de cerveza

**Request:**

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Quiero probar una cerveza IPA"}'
```

**Response:**

```json
{
  "reply": "Te recomiendo una buena IPA. Tenemos excelentes opciones en Wengan...",
  "success": true
}
```

**Errores:**

- `400` - Campo 'message' requerido y debe ser string
- `500` - Error al procesar el mensaje

### GET /health

Verifica el estado del servidor

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

## ✨ Características

- ✅ **Agente de IA inteligente** basado en Groq (Llama 3.1 8B Instant)
- ✅ **Tool Calling** - Herramientas personalizadas que el agente invoca automáticamente
- ✅ **Recomendador de cervezas** - Busca tipos de cerveza por preferencia del usuario
- ✅ **Personalidad definida** - Agente especializado en cervecería Wengan
- ✅ **Chat interactivo en tiempo real**
- ✅ **API REST bien documentada**
- ✅ **Manejo de errores robusto** con mensajes claros
- ✅ **CORS habilitado** para solicitudes desde frontend

## 🛠️ Stack Tecnológico

**Backend:**

- **Node.js + Express** - Framework web de bajo nivel y servidor
- **Groq API** - LLM (Llama 3.1 8B Instant)
- **OpenAI SDK** - Cliente HTTP para integración
- **Tool Calling** - Ejecución automática de herramientas por el LLM
- **CORS** - Habilitado para solicitudes del frontend
- **Dotenv** - Gestión de variables de entorno

**Frontend:**

- **React 18** - Librería para UI
- **Vite** - Build tool y dev server
- **CSS personalizado** - Estilos responsivos
- **Fetch API** - Consumo API REST

## 🔐 Configuración de Variables

Crea un archivo `.env` en la carpeta `backend`:

```env
# Groq API Key (obtener en https://console.groq.com)
GROQ_API_KEY=tu_clave_aqui

# Configuración del servidor
BACKEND_PORT=3000
NODE_ENV=development
```

En el frontend está configurado automáticamente para `http://localhost:3000` en desarrollo.

## 🍺 Cervezas Disponibles

El agente puede recomendar:

- **IPA** - India Pale Ale (60 IBU, 6.5% alcohol)
- **NEIPA** - New England IPA (25 IBU, 4.8% alcohol)
- **Barley Wine** - Cerveza fuerte (40 IBU, 5.5% alcohol)
- **Stout** - Cerveza oscura con notas de chocolate

## 💬 Ejemplos de Consultas

Algunos ejemplos que puedes probar:

- "¿Qué tipos de cerveza tienen?"
- "Recomiéndame una cerveza IPA"
- "Quiero probar algo fuerte"
- "¿Dónde está la cervecería Wengan?"
- "¿Qué tipo de cerveza es la Barley Wine?"

## 📖 Cómo Funciona el Agente

1. **Usuario envía mensaje** a `/chat`
2. **Agente LLM procesa** la consulta junto con instrucciones del sistema
3. **Decisión inteligente** - El LLM decide si necesita usar herramientas
4. **Tool Calling** - Si necesita cerveza, ejecuta `recomendarCerveza`
5. **Respuesta enriquecida** - El agente integra datos de la herramienta
6. **Respuesta final** enviada al usuario en formato JSON

### Flujo de Herramientas

```
Usuario: "Quiero una IPA"
    ↓
Agent.run() - Procesa con system instructions
    ↓
LLM decide: "Necesito executeTool(recomendarCerveza, {tipo: 'IPA'})"
    ↓
recomendarCerveza('IPA') → Filtra array de cervezas
    ↓
Respuesta: "Te recomiendo NEIPA, es una India Pale Ale..."
```

## 🔧 Agregar Nueva Herramienta

Para agregar una nueva herramienta:

1. Crea el archivo en `backend/tools/miherramienta.js`:

```javascript
export function miherramienta(param) {
  // Lógica aquí
  return resultado;
}
```

2. Registra en `backend/agent.js`:

```javascript
import { miherramienta } from "./tools/miherramienta.js";

const tools = [
  {
    type: "function",
    function: {
      name: "miherramienta",
      description: "Descripción clara",
      parameters: { ... }
    }
  }
];

async function executeTool(name, args) {
  if (name === "miherramienta") {
    return miherramienta(args.param);
  }
}
```

3. Actualiza instrucciones en `backend/agents/support.md`

## 🚀 Deploy

### Preparar para producción

```bash
# Backend - Solo necesita Node.js y variables de entorno
cd backend
npm install --production

# Frontend - Build estático
cd frontend
npm run build
```

El frontend generará un directorio `dist/` que puede servirse con cualquier servidor web estático.

### Environment para producción

```env
GROQ_API_KEY=tu_clave_aqui
BACKEND_PORT=3000
NODE_ENV=production
```

## 📝 Notas

- El agente está especializado en cervecería **Wengan** ubicada en **Calle Tomba 98, Godoy Cruz, Mendoza**
- Utiliza instrucciones personalizadas en `agents/support.md`
- El modelo es **Llama 3.1 8B Instant** que es rápido y eficiente
- Las herramientas son ejecutadas de forma automática por el LLM mediante tool calling

## 📄 Licencia

MIT
