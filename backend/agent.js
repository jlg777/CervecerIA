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
      description: "Consulta por las reservas disponibles en la cervecería",
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
      description: "Cancela la reserva realizada en la cervecería",
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
      description: "Realiza una reserva de mesa en la cervecería",
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
          teléfono: {
            type: "string",
            description: "Teléfono de contacto",
          },
        },
        required: ["fecha", "hora", "personas"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "obtenerHorarios",
      description: "Obtiene los horarios de atención de Wengan",
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
      description: "Verifica si Wengan está abierto en este momento",
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
            description: "Dirección de entrega",
          },
          nombre: {
            type: "string",
            description: "Nombre del cliente",
          },
          teléfono: {
            type: "string",
            description: "Teléfono de contacto",
          },
        },
        required: ["items", "direccion", "nombre"],
      },
    },
  },
];

async function executeTool(name, args) {
  try {
    switch (name) {
      case "recomendarCerveza":
        return recomendarCerveza(args?.tipo || "");

      case "reservarMesa":
        return reservarMesa(
          args?.fecha,
          args?.hora,
          args?.personas,
          args?.nombre,
          args?.telefono,
        );

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
          args?.telefono,
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
  async run(userMessage) {
    const messages = [
      {
        role: "system",
        content: instructions,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

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
        const result = await executeTool(
          call.function.name,
          JSON.parse(call.function.arguments),
        );
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

    return {
      finalOutput: response.choices[0].message.content,
    };
  }
}

export const agent = new Agent();
