import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
  const req = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Asigna a Yoar Daniel al maestro Daniel Maza. Tienes que llamar a la herramienta.' },
      { role: 'user', content: 'hazlo' }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "asignar_beneficiario_a_maestro",
          description: "Asigna un beneficiario a un maestro.",
          parameters: {
            type: "object",
            properties: {
              beneficiario: { type: "string" },
              maestro: { type: "string" }
            },
            required: ["beneficiario", "maestro"]
          }
        }
      }
    ]
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify(req)
  });

  const data = await res.json();
  console.log(JSON.stringify(data.choices[0].message.tool_calls, null, 2));
}
test();
