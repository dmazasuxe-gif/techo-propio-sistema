import { CoreMessage } from './session-store';

export async function customGenerateText(options: {
  system: string,
  messages: CoreMessage[],
  tools: any[],
  maxSteps?: number
}) {
  let currentMessages: any[] = [
    { role: 'system', content: options.system },
    ...options.messages
  ];

  let steps = 0;
  let finalResponse = "";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  while (steps < (options.maxSteps || 5)) {
    steps++;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: currentMessages,
        tools: options.tools.map(t => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parametersSchema
          }
        })),
        tool_choice: "auto"
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const msg = data.choices[0].message;
    currentMessages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      finalResponse = msg.content;
      break;
    }

    for (const tc of msg.tool_calls) {
      const toolDef = options.tools.find(t => t.name === tc.function.name);
      if (!toolDef) {
        currentMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify({ error: "Tool not found" }) });
        continue;
      }
      try {
        const args = JSON.parse(tc.function.arguments || "{}");
        const result = await toolDef.execute(args);
        currentMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      } catch (e: any) {
        currentMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify({ error: e.message }) });
      }
    }
  }

  // Si se acaban los steps o devolvió tool calls pero sin texto final, forzamos un resumen
  if (!finalResponse) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          ...currentMessages,
          { role: 'user', content: "Genera una respuesta amigable al usuario resumiendo lo que acabas de hacer con la herramienta." }
        ]
      })
    });
    const data = await res.json();
    finalResponse = data.choices[0].message.content;
    currentMessages.push(data.choices[0].message);
  }

  // Convertir los currentMessages de vuelta a CoreMessage (limpiando objetos de tools)
  const finalMessages = currentMessages
    .filter(m => m.role === 'user' || (m.role === 'assistant' && typeof m.content === 'string' && m.content))
    .map(m => ({ role: m.role, content: m.content }));

  return { text: finalResponse, messages: finalMessages };
}
