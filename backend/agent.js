import fs from "fs";
import { client } from "./openai.js";
import { recomendarCerveza } from "./tools/cerveza.js";
import {
  reservarMesa,
  obtenerReservas,
  cancelarReserva,
} from "./tools/reservarMesa.js";
import { obtenerHorarios, estaAbierto } from "./tools/horarios.js";
import {
  consultarInventario,
  obtenerInventarioCompleto,
  actualizarStock,
} from "./tools/inventario.js";
import {
  crearPedido,
  obtenerPedidos,
  actualizarEstadoPedido,
  cancelarPedido,
} from "./tools/pedidos.js";

const instructions = fs.readFileSync("./agents/support.md", "utf-8");

const tools = [
  {
    type: "function",
    function: {
      name: "recomendarCerveza",
      description: "Recomienda cervezas por tipo",
      parameters: {
        type: "object",
        properties: {
          tipo: {
            type: "string",
            description: "Tipo de cerveza a buscar, por ejemplo IPA o Stout",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obtenerReservas",
      description: "Consulta por las reservas disponibles en la cerveceria",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancelarReserva",
      description: "Cancela la reserva realizada en la cerveceria",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Identificador de la reserva",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reservarMesa",
      description:
          "Realiza una reserva de mesa. Solo incluir en la llamada los parámetros que el usuario haya proporcionado explícitamente.",
      parameters: {
        type: "object",
        properties: {
          fecha: {
            type: "string",
            description: "Fecha de la reserva (formato: YYYY-MM-DD)",
          },
          hora: {
            type: "string",
            description: "Hora de la reserva (formato: HH:MM)",
          },
          personas: {
            type: "number",
            description: "Cantidad de personas (1-20)",
          },
          nombre: {
            type: "string",
            description: "Nombre del cliente",
          },
          telefono: {
            type: "string",
            description: "Telefono de contacto",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obtenerHorarios",
      description: "Obtiene los horarios de atencion de Wengan",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "estaAbierto",
      description: "Verifica si Wengan esta abierto en este momento",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consultarInventario",
      description: "Consulta la disponibilidad de cervezas en el inventario",
      parameters: {
        type: "object",
        properties: {
          tipo: {
            type: "string",
            description: "Tipo de cerveza a consultar (opcional)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "crearPedido",
      description: "Crea un pedido para entrega a domicilio",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            description: "Lista de items con nombre y precio",
          },
          direccion: {
            type: "string",
            description: "Direccion de entrega",
          },
          nombre: {
            type: "string",
            description: "Nombre del cliente",
          },
          telefono: {
            type: "string",
            description: "Telefono de contacto",
          },
        },
        required: ["items", "direccion", "nombre"],
      },
    },
  },
];

async function executeTool(name, args, context = {}) {
  try {
    switch (name) {
      case "recomendarCerveza":
        return recomendarCerveza(args?.tipo || "");

      case "reservarMesa":
        return reservarMesa({
          sessionId: context.sessionId || "default",
          fecha: args?.fecha,
          hora: args?.hora,
          personas: args?.personas,
          nombre: args?.nombre,
          telefono: args?.telefono ?? args?.["teléfono"],
        });

      case "obtenerHorarios":
        return obtenerHorarios();

      case "estaAbierto":
        return estaAbierto();

      case "obtenerReservas":
        return obtenerReservas();

      case "cancelarReserva":
        return cancelarReserva(args?.id);

      case "consultarInventario":
        return consultarInventario(args?.tipo || "");

      case "obtenerInventarioCompleto":
        return obtenerInventarioCompleto();

      case "actualizarStock":
        return actualizarStock(args?.nombre, args?.cantidad);

      case "crearPedido":
        return crearPedido(
          args?.items,
          args?.direccion,
          args?.nombre,
          args?.telefono ?? args?.["teléfono"],
        );

      case "obtenerPedidos":
        return obtenerPedidos();

      case "actualizarEstadoPedido":
        return actualizarEstadoPedido(args?.idPedido, args?.estado);

      case "cancelarPedido":
        return cancelarPedido(args?.idPedido);

      default:
        return `Tool "${name}" no encontrada`;
    }
  } catch (error) {
    return `Error ejecutando ${name}: ${error.message}`;
  }
}

class Agent {
  constructor() {
    this.histories = new Map();
    this.maxMessagesPerSession = 40;
  }

  getHistory(sessionId) {
    if (!this.histories.has(sessionId)) {
      this.histories.set(sessionId, [
        {
          role: "system",
          content: instructions,
        },
      ]);
    }

    return this.histories.get(sessionId);
  }

  trimHistory(sessionId) {
    const history = this.histories.get(sessionId);
    if (!history || history.length <= this.maxMessagesPerSession + 1) {
      return;
    }

    const systemMessage = history[0];
    const tail = history.slice(-this.maxMessagesPerSession);
    this.histories.set(sessionId, [systemMessage, ...tail]);
  }

  async run(userMessage, sessionId = "default") {
    const messages = this.getHistory(sessionId);
    messages.push({
      role: "user",
      content: userMessage,
    });

    let response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      tools,
      tool_choice: "auto",
    });

    // manejar tool calling
    while (response.choices[0].finish_reason === "tool_calls") {
      const toolCalls = response.choices[0].message.tool_calls;
      messages.push(response.choices[0].message);

      for (const call of toolCalls) {
        let parsedArgs = {};
        try {
          parsedArgs = JSON.parse(call.function.arguments || "{}");
        } catch {
          parsedArgs = {};
        }

        const result = await executeTool(call.function.name, parsedArgs, {
          sessionId,
        });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }

      response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages,
        tools,
      });
    }

    messages.push(response.choices[0].message);
    this.trimHistory(sessionId);

    return {
      finalOutput: response.choices[0].message.content,
    };
  }
}

export const agent = new Agent();
