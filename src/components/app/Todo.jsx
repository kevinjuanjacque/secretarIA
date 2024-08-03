import React from 'react'

export const Todo = ({tasks=[], callback=(type,i)=>{}}) => {
  return (
    <>
        <h2 className="font-bold text-4xl mb-3">🎒 Task</h2>
        <ul className='flex flex-col gap-2'>
        {   
              tasks.map((t,i)=>(
               <li className="rounded-md group bg-[#202427] shadow-md py-1 px-3 flex" key={t.title}>
                   <div><dt className={'transition-all  duration-500 ease-out font-semibold '+ (t.finish ? 'line-through' : '')}>{t.title}</dt>
                   <dt className={'transition-all  duration-500 ease-out font-thin text-xs italic '+ (t.finish ? 'line-through' : '')}>{t.desc}</dt></div>
                   <section className='text-transparent bg-transparent group-hover:text-current flex flex-col gap-1 justify-center items-center transition-all  duration-500 ease-out'>
                        <button className='rounded-md px-2' onClick={()=>callback("ready",i)}>👍</button>
                        <button className='rounded-md px-2' onClick={()=>callback("delete",i)}>❌</button>
                   </section>
               </li>
               )
            )
        }   
        </ul>
    </>
  )
}
