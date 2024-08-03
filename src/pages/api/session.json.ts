import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";


export const prerender = false;


export const POST: APIRoute = async ({ params, request })=>{

    const body = await request.json();

    const session = request.headers.get('session') ?? "";

    const {data, error} = await supabase.from('secretarIA').select('*').eq('session', session);
    if(error){
        return new Response(JSON.stringify({msg:'No se logro conseguir información, intentalo nuevamente'}), { status: 500 });
    }

    if(data.length == 0){
        const {data, error} = await supabase.from('secretarIA').insert({session, state: body});
        //TODO: cambiar el msg y el codigo de respuesta
        return new Response(JSON.stringify({msg:'No tienes permisos para acceder a este recurso',data:{state:data}}), { status: 401 });
    }

    return new Response(JSON.stringify({msg:'ok',data:data[0]}), { status: 200 });
}


export const PUT: APIRoute = async ({ params, request })=>{
    const body = await request.json();

    const session = request.headers.get('session') ?? "";

    const {data, error} = await supabase.from('secretarIA').update({state: body}).eq('session', session);
    if(error){
        return new Response(JSON.stringify({msg:'No se logro conseguir información, intentalo nuevamente'}), { status: 500 });
    }


    return new Response(JSON.stringify({msg:'ok, data updated'}), { status: 200 });
}