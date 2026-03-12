'use client';

import * as Tone from 'tone';

// Fully synthetic drum kit using Tone.js built-in synths

interface DrumVoice {
  trigger: (velocity: number) => void;
  dispose: () => void;
}

const drumVoices = new Map<number, DrumVoice>();

function createKick(): DrumVoice {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 8,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
  }).toDestination();
  return {
    trigger: (vel) => {
      synth.volume.value = Tone.gainToDb(vel / 127) - 3;
      synth.triggerAttackRelease('C1', '8n');
    },
    dispose: () => synth.dispose(),
  };
}

function createSnare(): DrumVoice {
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
  }).toDestination();
  return {
    trigger: (vel) => {
      noise.volume.value = Tone.gainToDb(vel / 127) - 6;
      noise.triggerAttackRelease('16n');
    },
    dispose: () => noise.dispose(),
  };
}

function createHiHat(open: boolean): DrumVoice {
  // Use NoiseSynth for hi-hat (MetalSynth API changed in Tone.js 15)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: open ? 0.25 : 0.04, sustain: 0, release: 0.01 },
  }).toDestination();
  const filter = new Tone.Filter(8000, 'highpass').toDestination();
  noise.connect(filter);
  return {
    trigger: (vel) => {
      noise.volume.value = Tone.gainToDb(vel / 127) - 14;
      noise.triggerAttackRelease(open ? '8n' : '32n');
    },
    dispose: () => { noise.dispose(); filter.dispose(); },
  };
}

function createTom(pitch: string): DrumVoice {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 },
  }).toDestination();
  return {
    trigger: (vel) => {
      synth.volume.value = Tone.gainToDb(vel / 127) - 5;
      synth.triggerAttackRelease(pitch, '8n');
    },
    dispose: () => synth.dispose(),
  };
}

function createCrash(): DrumVoice {
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.8, sustain: 0.1, release: 0.5 },
  }).toDestination();
  const filter = new Tone.Filter(6000, 'highpass').toDestination();
  noise.connect(filter);
  return {
    trigger: (vel) => {
      noise.volume.value = Tone.gainToDb(vel / 127) - 10;
      noise.triggerAttackRelease('4n');
    },
    dispose: () => { noise.dispose(); filter.dispose(); },
  };
}

const DRUM_FACTORIES: Record<number, () => DrumVoice> = {
  36: createKick,
  37: createSnare,
  38: () => createSnare(),
  39: () => createHiHat(true),
  40: () => createHiHat(false),
  41: () => createTom('G2'),
  42: () => createTom('C2'),
  43: createCrash,
};

export function initDrumKit(): void {
  disposeDrumKit();
  for (const [note, factory] of Object.entries(DRUM_FACTORIES)) {
    drumVoices.set(Number(note), factory());
  }
}

export function triggerDrum(note: number, velocity: number): void {
  const voice = drumVoices.get(note);
  if (voice) {
    voice.trigger(velocity);
  }
}

export function disposeDrumKit(): void {
  drumVoices.forEach((v) => v.dispose());
  drumVoices.clear();
}
