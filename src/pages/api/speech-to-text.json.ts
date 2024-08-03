import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export const prerender = false;





export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Lee el archivo de audio
  const token = request.headers.get('X-Api-Key') ?? "";
    if(token == "" || token==null || token=='null'){
        return new Response(JSON.stringify({msg:'No tienes permisos para acceder a este recurso'}), { status: 401 });
    }

  const openaiReal = new OpenAI({
    apiKey: token,
  });


  const {text} = await openaiReal.audio.transcriptions.create({
    file: data.get("file") as any,
    model: "whisper-1",
    language: "es",
  });

  

  return new Response(JSON.stringify({text}));
};
