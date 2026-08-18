import { NextResponse } from 'next/server';
import { customGenerateText } from '@/lib/custom-llm';
import { getLandingConfig } from '@/lib/landing_db';
import { CoreMessage } from '@/lib/session-store';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Obtener la configuración actual de la landing page para el System Prompt
    const configData = await getLandingConfig();
    const content = configData ? configData.content : null;

    if (!content) {
      return NextResponse.json({ error: 'Config not found' }, { status: 500 });
    }

    // Extraer servicios para inyectarlos en el prompt
    const servicios = content.services?.items?.map((s: any) => `- ${s.title}: ${s.desc}`).join('\n') || 'Construcción y consultoría de viviendas.';

    const systemPromptBase = content.chatbot?.systemPrompt || `
      Eres el asistente virtual oficial y vendedor estrella de la Constructora Maza Quiroz.
      Tu objetivo principal es ser extremadamente amable, resolver dudas de los visitantes sobre el programa Techo Propio y la construcción en sitio propio, y animarlos a contactarnos.
      Responde SIEMPRE de manera breve, clara y conversacional (máximo 2 o 3 párrafos cortos). 
      Usa emojis para hacer la conversación amena.
      Cuando menciones enlaces oficiales de Techo Propio, Fondo MIVIVIENDA o WhatsApp, usa SIEMPRE el formato Markdown: [Texto del enlace](url_del_enlace).
    `;

    const miviviendaInfo = `
      **ENLACES OFICIALES DEL FONDO MIVIVIENDA:**
      - Consulta de Entidades Técnicas Vigentes: [Ver Entidades Vigentes](https://www.mivivienda.com.pe/PORTALWEB/usuario-busca-viviendas/entidades-tecnicas.aspx)
      - Consulta de Estado de Trámite: [Estado de Trámite](https://www.mivivienda.com.pe/PORTALWEB/usuario-busca-viviendas/estados-tramite.aspx)
      - Requisitos del Programa Techo Propio: [Ver Requisitos](https://www.mivivienda.com.pe/PORTALWEB/usuario-busca-viviendas/pagina.aspx?idpage=14)
    `;

    const companyInfo = content.chatbot?.companyInfo ? `**INFORMACIÓN ADICIONAL DE LA EMPRESA Y TECHO PROPIO:**\n${content.chatbot.companyInfo}` : '';
    
    let imagesContext = '';
    if (content.chatbot?.images && content.chatbot.images.length > 0) {
      const imageList = content.chatbot.images.map((img: any) => `- ${img.title} (${img.category}): ${img.url}`).join('\n');
      imagesContext = `
      **CATÁLOGO DE IMÁGENES:**
      Si el usuario te pide ver planos, fachadas o imágenes de los proyectos, ofrécele enviarle las imágenes que tenemos disponibles.
      Para enviarle una imagen, DEBES USAR OBLIGATORIAMENTE el formato Markdown de imágenes: ![Título de la Imagen](url_de_la_imagen).
      Estas son las imágenes que tienes disponibles para enviar:
      ${imageList}
      `;
    }

    const systemPrompt = `
      ${systemPromptBase}

      **INFORMACIÓN DE LA EMPRESA (Actualizada en tiempo real desde el CMS):**
      - Teléfono de contacto / WhatsApp: ${content.hero?.phone}
      - Puedes ofrecer el enlace directo de WhatsApp: [Escríbenos al WhatsApp](https://wa.me/${content.hero?.phone?.replace(/\D/g, '')})
      - Descripción de nosotros: ${content.about?.content}

      **SERVICIOS QUE OFRECEMOS:**
      ${servicios}

      ${companyInfo}

      ${miviviendaInfo}

      ${imagesContext}

      **REGLAS IMPORTANTES:**
      1. Nunca inventes precios exactos ni medidas si no estás seguro. Invita al cliente a contactar al WhatsApp (${content.hero?.phone}) para una cotización formal.
      2. Si el usuario hace preguntas fuera de contexto (ej. recetas de cocina, chistes), dile amablemente que eres un asistente de construcción y encauza la conversación.
      3. No utilices herramientas (tools) de modificación de base de datos. Solo dedícate a responder dudas usando el conocimiento proporcionado aquí.
    `;

    // Filtramos y transformamos los mensajes para asegurarnos que tengan el formato correcto
    const coreMessages: CoreMessage[] = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    // Llamamos a nuestro LLM personalizado (sin pasar ninguna tool, para mantenerlo seguro)
    const result = await customGenerateText({
      system: systemPrompt,
      messages: coreMessages,
      tools: [], // SIN HERRAMIENTAS por seguridad
      maxSteps: 1
    });

    return NextResponse.json({ text: result.text });

  } catch (error: any) {
    console.error('Error in Landing Bot:', error);
    return NextResponse.json(
      { error: 'Hubo un error procesando tu mensaje. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
