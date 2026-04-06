
import React, { useRef, useEffect } from 'react';

type SoundType = 'none' | 'rain' | 'lofi' | 'waves';

interface AmbientSoundProps {
  type: SoundType;
}

const SOUND_URLS: Record<Exclude<SoundType, 'none'>, string> = {
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', // Note: Using sample URLs as actual sound assets are not provided
  lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  waves: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
};

const AmbientSound: React.FC<AmbientSoundProps> = ({ type }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (type === 'none') {
        audioRef.current.pause();
      } else {
        audioRef.current.src = SOUND_URLS[type];
        audioRef.current.play().catch(e => console.log("Audio playback failed", e));
      }
    }
  }, [type]);

  return (
    <audio 
      ref={audioRef}
      loop
      hidden
    />
  );
};

export default AmbientSound;
