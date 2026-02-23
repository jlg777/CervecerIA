import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { agent } from "./agent.js";

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor activo" });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Validación
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Campo 'message' requerido y debe ser string",
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: "El mensaje no puede estar vacío",
      });
    }

    // Procesar con el agente
    const response = await agent.run(message);

    res.json({
      reply: response.finalOutput,
      success: true,
    });
  } catch (error) {
    console.error("Error en /chat:", error.message);
    res.status(500).json({
      error: "Error al procesar el mensaje",
      message: error.message,
      success: false,
    });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📝 Endpoint: POST http://localhost:${PORT}/chat`);
  console.log(`💚 Health check: GET http://localhost:${PORT}/health`);
});
