'use client';

import { useContext } from 'react';
import { AudioContext } from '@/components/providers/AudioProvider';

export function useAudio() {
  return useContext(AudioContext);
}
