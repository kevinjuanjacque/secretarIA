import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addHours from 'date-fns/addHours';
import addMinutes from 'date-fns/addMinutes';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import compareAsc from 'date-fns/compareAsc';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { es } from 'date-fns/locale';
import { getMessagesEs } from './utils/helpers';
import { Todo } from './Todo';
import { Chat } from './Chat';

import { v4 as uuidv4 } from 'uuid';
import { parseISO } from 'date-fns';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default function MySidebar() {
  const [Apikey, setApikey] = useState(
    ''
  );
  const [state, setState] = useState({
    events: [
    ],
    todos: [
    ],
  });
  const [Loading, setLoading] = useState(false);

  useEffect(() => {
    

    const session = uuidv4();
    const local = localStorage.getItem('session');

    if (!local) {
      localStorage.setItem('session', session);
      fetch('/api/session.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          session,
        },
        body: JSON.stringify(state),
      });
      setLoading(false);

    } else {
      const getSession = async () => {
        const resp = await fetch('/api/session.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            session: local,
          },
          body: JSON.stringify(state),
        });
        const data = await resp.json();

        const newEvents = {
          ...data.data.state,
          events: data.data.state.events.map((e) => ({ ...e, start: parseISO(e.start), end: parseISO(e.end) }))
        }
        setState(newEvents);
        setLoading(false);
      };

      getSession();
    }
    return () => {};
  }, []);

  function notification(msg) {
    if (!('Notification' in window)) {
      // Check if the browser supports notifications
      alert('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      const notification = new Notification(msg);
      // …
    } else if (Notification.permission !== 'denied') {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === 'granted') {
          const notification = new Notification(msg);
          // …
        }
      });
    }
  }

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const events = state.events;
        const now = new Date();
        const next = addMinutes(now, 5);
        const existEvent = events.find((e) => {
          const dif = differenceInMinutes(e.start, now);
          if (dif < 0) {
            return false;
          }
          return (
            compareAsc(new Date(e.start), next) === -1 &&
            compareAsc(new Date(e.end), now) === 1
          );
        });
        if (existEvent) {
          const msg = `Tienes un evento, ${
            differenceInMinutes(existEvent.start, now) == 0
              ? 'en menos de un minuto'
              : 'dentro de ' +
                differenceInMinutes(existEvent.start, now) +
                ' minutos'
          }`;
          notification(msg);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }, 300000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // CreateEvent, CreateTask, RemoveTask o RemoveEvent
  

  const fetchUpdateState = (newState) => {
    return fetch('/api/session.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        session: localStorage.getItem('session'),
      },
      body: JSON.stringify(newState),
    });
  }

  const createAction = ({
    type,
    title = '',
    desc = '',
    start = '',
    end = '',
  }) => {
    switch (type) {
      case 'CreateEvent':
        setState({
          ...state,
          events: [
            ...state.events,
            {
              allDay: false,
              title,
              start: parse(start, 'yyyy-MM-dd HH:mm:ss', new Date()),
              end: parse(end, 'yyyy-MM-dd HH:mm:ss', new Date()),
            },
          ],
        });
        fetch('/api/session.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            session: localStorage.getItem('session'),
          },
          body: JSON.stringify({
            ...state,
            events: [
              ...state.events,
              {
                allDay: false,
                title,
                start: parse(start, 'yyyy-MM-dd HH:mm:ss', new Date()),
                end: parse(end, 'yyyy-MM-dd HH:mm:ss', new Date()),
              },
            ],
          }),
        });
        break;
      case 'CreateTask':
        setState({
          ...state,
          todos: [{ title, desc, finish: false }, ...state.todos],
        });
        fetch('/api/session.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            session: localStorage.getItem('session'),
          },
          body: JSON.stringify({
            ...state,
            todos: [{ title, desc, finish: false }, ...state.todos],
          }),
        });
        break;
      case 'RemoveEvents':
        //hora de inicio 1
        // hora del evento 2
        // hora de fin evento 3
        // hora de fin 4

        setState((statePrev) => ({
          ...statePrev,
          events: statePrev.events.filter((e) => {
            const startBool =
              compareAsc(
                new Date(e.start),
                parse(start, 'yyyy-MM-dd HH:mm:ss', new Date())
              ) === 1;
            const endBool =
              compareAsc(
                new Date(e.end),
                parse(end, 'yyyy-MM-dd HH:mm:ss', new Date())
              ) === -1;
            if (startBool && endBool) {
              return false;
            } else {
              return true;
            }
          }),
        }));
        fetch('/api/session.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            session: localStorage.getItem('session'),
          },
          body: JSON.stringify({
            ...state,
            events: state.events.filter((e) => {
              const startBool =
                compareAsc(
                  new Date(e.start),
                  parse(start, 'yyyy-MM-dd HH:mm:ss', new Date())
                ) === 1;
              const endBool =
                compareAsc(
                  new Date(e.end),
                  parse(end, 'yyyy-MM-dd HH:mm:ss', new Date())
                ) === -1;
              if (startBool && endBool) {
                return false;
              } else {
                return true;
              }
            }),
          }),
        });
        break;
      default:
        break;
    }

  };

  

  const handlerTODO = (type, i) => {
    switch (type) {
      case "ready":
        const newState = {
          ...state,
          todos: state.todos.map((t, index) => {
            if (index === i) {
              return { ...t, finish: true };
            }
            return t;
          }),
        }
        setState(newState)
        fetchUpdateState(newState)
        break;
      case "delete":
        
        const newStateDelete = {
          ...state,
          todos: state.todos.filter((t, index) => index !== i),

        }
        setState(newStateDelete)
        fetchUpdateState(newStateDelete)
        break;
      default:
        break;
    }
  }

  if (Loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container m-auto w-full flex justify-center items-center mb-4">
        <input
          onChange={(e) => {
            setApikey(e.target.value);
          }}
          value={Apikey}
          type="password"
          className="bg-transparent border-2 border-gray-400 w-1/2 px-2 py-1 rounded-md text-white"
          placeholder="Ingresa tu API-KEY de OpenAI"
        />
      </div>
      <div className="flex gap-5 w-full container px-5 md:px-0 md:flex-row flex-col">
        <div className="flex-1">
          <DnDCalendar
            className="bg-dark100 text-white text-sm"
            culture="es"
            messages={getMessagesEs()}
            localizer={localizer}
            events={state.events.map((event) => ({
              ...event,
              title: (
                <span
                  className={
                    compareAsc(new Date(), new Date(event.end)) == 1
                      ? 'line-through'
                      : ''
                  }
                >
                  {event.title}
                </span>
              ),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500, width: "100%" }}
            eventPropGetter={(event) => {
              return {
                style: { background: 'hsl(276, 79%, 69%)', border: 'none' },
              };
            }}
          />
        </div>
        <div className="secondary w-full md:w-52 border-[1px] border-gray-500 rounded-md px-2 py-3 text-white">
          <Todo tasks={state.todos} callback={handlerTODO} />
        </div>
      </div>
        <div className="bottom w-full container mt-5 px-5 md:px-0">
          <Chat callback={createAction} Apikey={Apikey} />
        </div>
    </>
  );
}
