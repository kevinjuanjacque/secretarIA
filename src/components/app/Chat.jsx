import React, { useEffect, useRef, useState } from 'react';


export const Chat = ({ callback = () => {}, Apikey }) => {
  const [Loading, setLoading] = useState(false);
  const [History, setHistory] = useState([]);
  const [Text, setText] = useState('');
  const [Pregunta, setPregunta] = useState();
  const [audioContext, setAudioContext] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [Mute, setMute] = useState(true);
  
  const getTimezone = ()=>{
    // Crea un nuevo objeto Date
    const date = new Date();

    // Obtén la diferencia en minutos entre la hora local y GMT
    const offset = date.getTimezoneOffset();

    // Convierte la diferencia en horas y minutos
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;

    // Construye la cadena GMT±HH:MM
    const timezone = `GMT${offset <= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return timezone
  }


  useEffect(() => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
    }
  }, [audioContext]);

  const playAudio = (buffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    source.onended = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
  };

  const fetchAudio = async (msg) => {
    try {
      if (Mute) {
        return;
      }
      const response = await fetch('/api/speech.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Apikey,
        },
        body: JSON.stringify({
          msg,
        }),
      });
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      playAudio(buffer);
    } catch (error) {
      console.error('Error fetching or decoding audio data:', error);
    }
  };

  const handleSendForm = async (e) => {
    e.preventDefault();

    try {
      const d = new Date();
    const fechaActual = d.getTime();
    const timezone = getTimezone()

    if (Text == '') {
      return;
    }
    setLoading(true);
    setHistory((h) => [
      ...h,
      {
        role: 'user',
        content: Text,
      },
    ]);
    if (Pregunta) {
      const resp = await fetch('/api/generation.json', {
        method: 'POST',
        headers: {
          timezone: timezone,
          now: fechaActual,
          'Content-Type': 'application/json',
          'x-api-key': Apikey,
        },
        body: JSON.stringify({
          msg: Text,
          answer: Pregunta,
          history: History,
          isResponse: true,
        }),
      });
      const data = await resp.json();
      fetchAudio(data.msg);
      if (data.awaitResponse) {
        setHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: data.msg,
          },
        ]);
        setPregunta(data.msg);
      } else {
        for (const action of data.actions) {
          callback({
            type: action.type,
            title: action.title,
            desc: action.desc ?? '',
            start: action.start ?? '',
            end: action.end ?? '',
          });
        }
        setHistory([]);
        setPregunta();
      }
      setText('');
    } else {
      const resp = await fetch('/api/generation.json', {
        method: 'POST',
        headers: {
          timezone: timezone,
          now: fechaActual,
          'Content-Type': 'application/json',
          'x-api-key': Apikey,

        },
        body: JSON.stringify({
          msg: Text,
          isResponse: false,
        }),
      });
      const data = await resp.json();
      fetchAudio(data.msg);
      if (data.awaitResponse) {
        setHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: data.msg,
          },
        ]);
        setPregunta(data.msg);
      } else {
        for (const action of data.actions) {
          callback({
            type: action.type,
            title: action.title,
            desc: action.desc ?? '',
            start: action.start ?? '',
            end: action.end ?? '',
          });
        }
        setHistory([]);
        setPregunta();
      }
      setText('');
    }
    setLoading(false);
  
  }
    catch (error) {
      setLoading(false);
    }
  };
  const handleSendText = async (text) => {
    try {
      const d = new Date();
    const fechaActual = d.getTime();
    const timezone = getTimezone();

    if (text == '') {
      return;
    }
    setLoading(true);
    setHistory((h) => [
      ...h,
      {
        role: 'user',
        content: text,
      },
    ]);
    if (Pregunta) {
      const resp = await fetch('/api/generation.json', {
        method: 'POST',
        headers: {
          timezone: timezone,
          now: fechaActual,
          'Content-Type': 'application/json',
          'x-api-key': Apikey,

        },
        body: JSON.stringify({
          msg: text,
          answer: Pregunta,
          history: History,
          isResponse: true,
        }),
      });
      const data = await resp.json();
      fetchAudio(data.msg);
      if (data.awaitResponse) {
        setHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: data.msg,
          },
        ]);
        setPregunta(data.msg);
      } else {
        for (const action of data.actions) {
          callback({
            type: action.type,
            title: action.title,
            desc: action.desc ?? '',
            start: action.start ?? '',
            end: action.end ?? '',
          });
        }
        setHistory([]);
        setPregunta();
      }
    } else {
      const resp = await fetch('/api/generation.json', {
        method: 'POST',
        headers: {
          timezone: timezone,
          now: fechaActual,
          'Content-Type': 'application/json',
          'x-api-key': Apikey,

        },
        body: JSON.stringify({
          msg: text,
          isResponse: false,
        }),
      });
      const data = await resp.json();
      fetchAudio(data.msg);
      if (data.awaitResponse) {
        setHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: data.msg,
          },
        ]);
        setPregunta(data.msg);
      } else {
        for (const action of data.actions) {
          callback({
            type: action.type,
            title: action.title,
            desc: action.desc ?? '',
            start: action.start ?? '',
            end: action.end ?? '',
          });
        }
        setHistory([]);
        setPregunta();
      }
    }
    setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [AudioBlob, setAudioBlob] = useState('');
  const mediaRecorderRef = useRef(null);
  const intervalRecording = useRef(null);
  const audioChunks = useRef([]);
  const [time, setTime] = useState(0); // Tiempo en segundos

  const handleStartRecording = async () => {
    setIsRecording(true);
    intervalRecording.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
    audioChunks.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
    };

    mediaRecorderRef.current.start();
  };

  const sendAudio = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', AudioBlob, 'recording.wav');
    const response = await fetch('/api/speech-to-text.json', {
      method: 'POST',
      body: formData,
      headers: {
        'x-api-key': Apikey,
      }
    });
    const data = await response.json();
    setAudioURL('');
    setIsRecording(false);
    handleSendText(data.text);
  };

  const handleStopRecording = () => {
    clearInterval(intervalRecording.current);
    setTime(0);
    setIsRecording(false);
    mediaRecorderRef.current.stop();
  };

  return (
    <>
      <form className="flex gap-2" onSubmit={handleSendForm}>
        <div className=" border-2 border-gray-800 w-full flex-1 py-2 px-2 gap-2 rounded-lg flex flex-col justify-center ">
          {Pregunta && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-corner-right-down"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 6h6a3 3 0 0 1 3 3v10l-4 -4m8 0l-4 4" />
              </svg>
              {Pregunta}
            </span>
          )}
          {!isRecording ? (
            audioURL ? (
              <div className="w-full flex gap-2">
                <audio controls className="flex-1">
                  <source src={audioURL} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <button
                  onClick={() => {
                    setAudioURL('');
                    setIsRecording(false);
                  }}
                  // onMouseUp={handleStopRecording}
                  // onTouchStart={handleStartRecording}
                  // onTouchEnd={handleStopRecording}
                  className=" disabled:bg-gray-400 disabled:text-dark100 disabled:bg-none  rounded-full border-2 border-red-600  h-full flex flex-col justify-center items-center  p-2 aspect-square"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-trash"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#f00"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 7l16 0" />
                    <path d="M10 11l0 6" />
                    <path d="M14 11l0 6" />
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                </button>
                <button
                  onClick={sendAudio}
                  // onMouseUp={handleStopRecording}
                  // onTouchStart={handleStartRecording}
                  // onTouchEnd={handleStopRecording}
                  className=" disabled:bg-gray-400 disabled:text-dark100 disabled:bg-none  rounded-full bg-mix h-full flex flex-col justify-center items-center text-white p-3 aspect-square"
                >
                  {Loading ? (
                    <div
                      className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                      role="status"
                    >
                      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="icon icon-tabler icon-tabler-mail-fast"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="#ffffff"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M3 7h3" />
                      <path d="M3 11h2" />
                      <path d="M9.02 8.801l-.6 6a2 2 0 0 0 1.99 2.199h7.98a2 2 0 0 0 1.99 -1.801l.6 -6a2 2 0 0 0 -1.99 -2.199h-7.98a2 2 0 0 0 -1.99 1.801z" />
                      <path d="M9.8 7.5l2.982 3.28a3 3 0 0 0 4.238 .202l3.28 -2.982" />
                    </svg>
                  )}
                </button>
              </div>
            ) : (
              <input
                disabled={Loading}
                onChange={(e) => setText(e.target.value)}
                value={Text}
                placeholder="Escribe aqui, ejemplos: agenda reunion para mañana a las 14 pm con una hora de duracion, la reunion sera para hablar temas de negocio"
                type="text"
                className="w-full focus:outline-none bg-dark100 border-none border-gray-700 rounded-lg flex-1 text-white"
              ></input>
            )
          ) : (
            <>
              <div className="w-full bg-dark100 text-sm rounded-lg flex-1 gap-2 text-white flex items-center">
                <div className="rounded-full h-4 w-4 animate-redPulse transition-all flex"></div>
                <span className="flex-1 font-semibold text-lg transition-all">
                  {String(Math.floor(time / 60)).padStart(2, '0')}:
                  {String(time % 60).padStart(2, '0')}
                </span>
                <button
                  onClick={handleStopRecording}
                  className="rounded-full border-2 border-red-600 p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-player-stop"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="#ff2825"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="p-1">
          {Text ? (
            <button
              disabled={Loading}
              className=" disabled:bg-gray-400 disabled:text-dark100 disabled:bg-none  rounded-sm bg-mix h-full flex flex-col justify-center items-center text-white p-3 aspect-square"
            >
              {Loading ? (
                <div
                  className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
                </svg>
              )}
            </button>
          ) : (
            !isRecording &&
            !audioURL && (
              <button
                onClick={handleStartRecording}
                // onMouseUp={handleStopRecording}
                // onTouchStart={handleStartRecording}
                // onTouchEnd={handleStopRecording}
                className=" disabled:bg-gray-400 disabled:text-dark100 disabled:bg-none  rounded-sm bg-mix h-full flex flex-col justify-center items-center text-white p-3 aspect-square"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-microphone"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#ffffff"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <path d="M8 21l8 0" />
                  <path d="M12 17l0 4" />
                </svg>
              </button>
            )
          )}
        </div>
      </form>
      <div className="h-52 w-full p-5 flex justify-center items-center">
        {isPlaying ? (
          <div
            onClick={() => {
              setMute(!Mute);
            }}
            disabled={!isPlaying}
            className="bg-mix cursor-pointer text-white flex flex-col justify-center items-center rounded-full w-24 h-24 aspect-square disabled:bg-gray-800 animate-pulseCustom transition-all duration-1000 border-none"
          >
            {!Mute ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-volume"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#fff"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8a5 5 0 0 1 0 8" />
                <path d="M17.7 5a9 9 0 0 1 0 14" />
                <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-volume-off"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#fff"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464" />
                <path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615" />
                <path d="M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664" />
                <path d="M3 3l18 18" />
              </svg>
            )}
          </div>
        ) : (
          <div
            onClick={() => {
              setMute(!Mute);
            }}
            disabled={!isPlaying}
            className="cursor-pointer text-white flex flex-col justify-center items-center rounded-full w-24 h-24 aspect-square bg-gray-800 bg-none animate-none transition-all duration-1000 border-none"
          >
            {!Mute ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-volume"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#fff"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8a5 5 0 0 1 0 8" />
                <path d="M17.7 5a9 9 0 0 1 0 14" />
                <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-volume-off"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#fff"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464" />
                <path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615" />
                <path d="M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664" />
                <path d="M3 3l18 18" />
              </svg>
            )}
          </div>
        )}
      </div>
    </>
  );
};
