
import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

interface AudioContextType {
  playSfx: (type: 'BOOT' | 'KEYPRESS' | 'NOTIFICATION' | 'ERROR' | 'SUCCESS') => void;
  playAmbience: (play: boolean) => void;
  mute: (muted: boolean) => void;
}

const AudioContextReact = createContext<AudioContextType | undefined>(undefined);

// Web Audio API based sound generator - no external dependencies
class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceOscillators: OscillatorNode[] = [];
  private ambiencePlaying = false;
  private muted = false;

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
      } catch (e) {
        console.warn('Web Audio API not supported');
        return null;
      }
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }

  playBoot() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    // Mechanical boot sound - rising tone with buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  playKeypress() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    // Subtle click sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playNotification() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    // Pleasant chime - two tones
    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  }

  playError() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    // Harsh buzz sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(120, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    // Ascending success chime
    [392, 523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.25);
    });
  }

  startAmbience() {
    if (this.ambiencePlaying) return;
    const ctx = this.getContext();
    if (!ctx || this.muted) return;

    this.ambiencePlaying = true;

    // Create a subtle server room hum with multiple low frequencies
    [60, 120, 180].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      this.ambienceOscillators.push(osc);
    });
  }

  stopAmbience() {
    this.ambienceOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.ambienceOscillators = [];
    this.ambiencePlaying = false;
  }

  cleanup() {
    this.stopAmbience();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const soundGeneratorRef = useRef<SoundGenerator | null>(null);

  useEffect(() => {
    soundGeneratorRef.current = new SoundGenerator();

    // Auto-start ambience on interaction (browser policy requires user gesture)
    const startAudio = () => {
      soundGeneratorRef.current?.startAmbience();
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);

    return () => {
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
      soundGeneratorRef.current?.cleanup();
    };
  }, []);

  const playSfx = useCallback((type: 'BOOT' | 'KEYPRESS' | 'NOTIFICATION' | 'ERROR' | 'SUCCESS') => {
    const sg = soundGeneratorRef.current;
    if (!sg) return;

    switch (type) {
      case 'BOOT':
        sg.playBoot();
        break;
      case 'KEYPRESS':
        sg.playKeypress();
        break;
      case 'NOTIFICATION':
        sg.playNotification();
        break;
      case 'ERROR':
        sg.playError();
        break;
      case 'SUCCESS':
        sg.playSuccess();
        break;
    }
  }, []);

  const playAmbience = useCallback((play: boolean) => {
    if (play) {
      soundGeneratorRef.current?.startAmbience();
    } else {
      soundGeneratorRef.current?.stopAmbience();
    }
  }, []);

  const mute = useCallback((muted: boolean) => {
    soundGeneratorRef.current?.setMuted(muted);
  }, []);

  return (
    <AudioContextReact.Provider value={{ playSfx, playAmbience, mute }}>
      {children}
    </AudioContextReact.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContextReact);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
