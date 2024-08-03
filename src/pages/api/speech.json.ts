import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

export const prerender = false;

// const mp3 = await openaiReal.audio.speech.create({
// // model: "tts-1",
// voice: "onyx",
// // input: parse.msg,
//   });
//   console.log(speechFile);
//   const buffer = Buffer.from(await mp3.arrayBuffer());
//   await fs.promises.writeFile(speechFile, buffer);


export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('X-Api-Key') ?? "";
    if(token == "" || token==null || token=='null'){
        return new Response(JSON.stringify({msg:'No tienes permisos para acceder a este recurso'}), { status: 401 });
    }
  const openaiReal = new OpenAI({
    apiKey: token,
  });
  
  const speechFile = path.resolve('./speech.mp3');
  const data = await request.json();

  const mp3 = await openaiReal.audio.speech.create({
    model: 'tts-1',
    voice: 'onyx',
    input: data.msg,
  });
  

  return new Response(await mp3.arrayBuffer());
};
