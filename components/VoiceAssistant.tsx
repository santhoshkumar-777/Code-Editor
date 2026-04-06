
import React, { useState, useEffect, useCallback } from 'react';
import { MicrophoneIcon, StopIcon } from './icons/VoiceIcons.tsx';

interface VoiceAssistantProps {
  onCommand: (command: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand, isActive, onToggle }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setTranscript(command);
      onCommand(command);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [onCommand]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      {isActive && transcript && (
        <div className="glass px-4 py-2 rounded-full text-xs font-medium text-white/90 animate-fade-in shadow-xl mb-2">
          {transcript}
        </div>
      )}
      
      <button
        onClick={() => {
            if(!isActive) onToggle();
            startListening();
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
          isListening 
            ? 'bg-red-500 animate-pulse scale-110' 
            : isActive 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-white/10 hover:bg-white/20 backdrop-blur-md'
        }`}
      >
        {isListening ? (
          <StopIcon className="w-6 h-6 text-white" />
        ) : (
          <MicrophoneIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/60'}`} />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
