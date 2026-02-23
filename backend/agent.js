import fs from "fs";
import { client } from "./openai.js";
import { recomendarCerveza } from "./tools/cerveza.js";

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
];

async function executeTool(name, args) {
  if (name === "recomendarCerveza" || name === "cerveza") {
    if (!args?.tipo) {
      return recomendarCerveza("");
    }
    return recomendarCerveza(args.tipo);
  }
  return "Tool no encontrada";
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
          content: String(result),
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
