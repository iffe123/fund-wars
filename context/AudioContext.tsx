
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

interface AudioContextType {
  playSfx: (type: 'BOOT' | 'KEYPRESS' | 'NOTIFICATION' | 'ERROR' | 'SUCCESS') => void;
  playAmbience: (play: boolean) => void;
  mute: (muted: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ambienceRef = useRef<Howl | null>(null);

  // Load Sounds
  const sfxRefs = useRef({
    BOOT: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'], volume: 0.5 }), // Mechanical hum
    KEYPRESS: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'], volume: 0.2 }), // Click
    NOTIFICATION: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3'], volume: 0.4 }), // Chime
    ERROR: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3'], volume: 0.5 }), // Buzz
    SUCCESS: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3'], volume: 0.5 }), // Success chime
  });

  useEffect(() => {
    // Ambience (Server Room Hum)
    ambienceRef.current = new Howl({
      src: ['https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3'], // Low hum
      loop: true,
      volume: 0.05,
    });
    
    // Auto-start ambience on interaction (browser policy)
    const startAudio = () => {
        if (ambienceRef.current && !ambienceRef.current.playing()) {
            ambienceRef.current.play();
        }
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
    
    return () => {
        ambienceRef.current?.unload();
    };
  }, []);

  const playSfx = (type: keyof typeof sfxRefs.current) => {
    const sound = sfxRefs.current[type];
    if (sound) {
        // Randomize pitch slightly for organic feel
        sound.rate(0.9 + Math.random() * 0.2);
        sound.play();
    }
  };

  const playAmbience = (play: boolean) => {
    if (play) ambienceRef.current?.play();
    else ambienceRef.current?.pause();
  };

  const mute = (muted: boolean) => {
    Howler.mute(muted);
  };

  return (
    <AudioContext.Provider value={{ playSfx, playAmbience, mute }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
