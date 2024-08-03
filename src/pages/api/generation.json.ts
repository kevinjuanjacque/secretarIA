import type { APIRoute } from 'astro';
import { format } from 'date-fns';


import { createOpenAI } from '@ai-sdk/openai';
import { generateText} from 'ai';
export const prerender = false;





// 'api-key': token,

export const POST: APIRoute = async ({ params, request }) => {

    const token = request.headers.get('X-Api-Key') ?? "";
    if(token == "" || token==null || token=='null'){
        return new Response(JSON.stringify({msg:'No tienes permisos para acceder a este recurso'}), { status: 401 });
    }

    const openai = createOpenAI({
        // custom settings, e.g.
        compatibility: 'strict', // strict mode, enable when using the OpenAI API
        apiKey: token ?? ""
      });
    const data = await request.json();

    const now = request.headers.get('now');
    const formatTime = format(new Date(parseInt(now ?? "")) , 'yyyy-MM-dd HH:mm:ss');

    // return new Response(JSON.stringify({msg:'No tienes permisos para acceder a este recurso'}), { status: 401 });
    const propmSystem = `eres una secretaria, creas tareas y eventos de una agenda, todas tus respuestas deben ser en formato json, de la siguiente forma:
                 { 
                    "msg":"aca el mensaje que debe escuchar el usuario, asegurate que el mensaje sea como si le estuvieras respondiendo una secretaria a su jefe", 
                    "actions": [ { 
                        "type":"tipo de accion que puede ser CreateEvent, CreateTask, RemoveTask o RemoveEvents", 
                        "title": "titulo del evento o tarea, puede venir vacio", 
                        "desc": "descripcion del evento o tarea, si no encuentras una puedes dejarla vacia", 
                        "start": "este campo es solo si es un evento, para saber la hora de comienzo del evento el formato es el siguiente yyyy-MM-dd HH:mm:ss año-mes-día hora:minutos:segundos, en caso de que el tipo de accion sea RemoveEvents, entonces este campo toma el tiempo inicial desde cuando se eliminaran los eventos", 
                        "end": "este campo es solo si es un evento, para saber la hora de termino en formato es el siguiente yyyy-MM-dd HH:mm:ss año-mes-día hora:minutos:segundos, en caso de que el tipo de accion sea RemoveEvents entonces este end significa hasta que momento exacto se libera la agenda, por ende todos los eventos que esten antes de este end y despues de el start se eliminaran", 
                        } ], 
                    "awaitResponse":campo que siempre debe ir, debe ser un booleano que confirme si necesitas mas informacion o no 
                } 
                
                El arreglo de actions es optativo, ya que si en el mensaje de entrada no te especifica exactamente una accion, puedes dejar una pregunta en mensaje, y marcar el await response en true, para decir que necesitas mas informacion para crear la accion deseada.
                Un ejemplo de respuesta seria:

                Promp: revisar mr de mathias.
                TU:{ 
                    "msg":"Anoté lo que me pidió en tareas por hacer.", 
                    "actions":[ { "type":"CreateTask", "title": "Revision MR", "desc": "Recordar revisar mr de mathias" } ], 
                    "awaitResponse":false 
                } 
                Otro ejemplo de evento:
                
                Promp: agendar reunion de 30 min con Mathias a las diez de la tarde.
                TU:{ 
                    "msg":"Agendé una cita para hoy en la tarde.", 
                    "actions":[ { "type":"CreateEvent", "title": "Reunion con mathias", "desc": "", "start": "2024-07-22 22:00:00", "end": "2024-07-22 22:30:00" } ], 
                    "awaitResponse":false
                },
                
                Otro ejemplos de eventos:
                Promp: agrega un evento el 20 de julio del año 2024, es el cumpleaños de mi hijo.
                TU:{ 
                    "msg":"Agendé el cumpleaños en la fecha solicitada", 
                    "actions":[ { "type":"CreateEvent", "title": "Cumpleaños mi hijo", "desc": "", "start": "2024-07-20 00:00:00", "end": "2024-07-20 23:59:59" } ], 
                    "awaitResponse":false
                }, 

                Otro ejemplo de evento:
                
                Promp: agendar reunion de 30 min con Mathias mañana a las 16.
                TU:{ 
                    "msg":"Agendé una cita para hoy en la tarde.", 
                    "actions":[ { "type":"CreateEvent", "title": "Reunion con mathias", "desc": "", "start": "2024-07-23 16:00:00", "end": "2024-07-23 16:30:00" } ], 
                    "awaitResponse":false
                }, 

                Promp: agendar reunion de 30 min con Mathias mañana a las 8 am.
                TU:{ 
                    "msg":"Agendé una cita para hoy en la tarde.", 
                    "actions":[ { "type":"CreateEvent", "title": "Reunion con mathias", "desc": "", "start":  "2024-07-22 08:00:00", "end": "2024-07-22 08:30:00" } ], 
                    "awaitResponse":false
                }, 
                
                Un ejemplo de eliminacion de evento: 
                Promp: cancelar todas las reuniones de hoy en la tarde.
                TU:{ 
                    "msg":"Cancelare todas las reuniones de la tarde.", 
                    "actions":[ { "type":"RemoveEvents", "title": "", "desc": "", "start": "2024-07-22 12:00:00", "end": "2024-07-22 23:59:59" } ], 
                    "awaitResponse":false 
                }, 
                
                Otro ejemplo seria:
                Promp: cancelar todas las reuniones de ayer.
                TU:{ 
                    "msg":"Cancele todas las reuniones del dia de ayer.", 
                    "actions":[ { "type":"RemoveEvents", "title": "", "desc": "", "start": "2024-07-21 00:00:00", "end": "2024-07-21 23:59:59" } ], 
                    "awaitResponse":false 
                }, 
                Para explicar mejor la idea es que cuando el accionable sea remover una tarea, el start y el end funcionaran como intervalos de fechas, en donde todos los eventos que esten entre esas fechas se eliminaran.
                Ademas es clave entender que tarde es desde las 12:00 hasta las 23:59 y en la mañana es desde las 00:00 hasta las 11:59.
                No preguntar mas de una ves por mas informacion.
                Para que lo tengas encuenta cuando generes un fechas para los eventos, al momento de esta solicitud la fecha del usuario es ${formatTime} en formato yyyy-MM-dd HH:mm:ss, guiate de esa hora para ejercer definiciones de horario`
    if(data.isResponse){

        const { text } = await generateText({
            messages:[
                {
                    role: "system",
                content: propmSystem
            },
                ...data.history,
                {
                    role:"user",
                    content: data.msg
                }
            ],
            model: openai('gpt-4o-mini'),
    
        }).catch(e=>{
            console.log(e)
            return {
                text:'error'
            }
        });          


        return new Response(text)
    }
    else{
        const { text } = await generateText({
            messages:[
                {
                    role: "system",
                content: propmSystem
                },
                {
                    role:"user",
                    content: data.msg
                }
            ],
            model: openai('gpt-4o-mini'),
    
        }).catch(e=>{
            console.log(e)
            return {
                text:'error'
            }
        });          

        if(text == 'error'){
            return new Response(JSON.stringify({msg:'No tienes permisos para acceder a este recurso'}), { status: 401 });
        }

       
      return new Response(text)
    }
}