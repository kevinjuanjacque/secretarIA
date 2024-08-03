

import React, { useEffect, useRef, useState } from 'react'

export const Sound = ({msg="hola"}) => {
  

    // Función para obtener y decodificar el ArrayBuffer
    
  return (
    <div>
      <button
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        onTouchStart={handleStartRecording}
        onTouchEnd={handleStopRecording}
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: isRecording ? 'red' : 'green',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {isRecording ? 'Recording...' : 'Hold to Record'}
      </button>
      {audioURL && (
        <audio controls>
          <source src={audioURL} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  )
}
