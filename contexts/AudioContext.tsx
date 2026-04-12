
import { useCallback } from 'react';

export type SfxType = 'BOOT' | 'KEYPRESS' | 'NOTIFICATION' | 'ERROR' | 'SUCCESS';

interface AudioContextType {
  playSfx: (type: SfxType) => void;
  playAmbience: (play: boolean) => void;
  mute: (muted: boolean) => void;
}

// Audio system removed — all functions are no-ops
const noop = () => {};

export const useAudio = (): AudioContextType => {
  const playSfx = useCallback((_type: SfxType) => {}, []);
  const playAmbience = useCallback((_play: boolean) => {}, []);
  const mute = useCallback((_muted: boolean) => {}, []);
  return { playSfx, playAmbience, mute };
};
