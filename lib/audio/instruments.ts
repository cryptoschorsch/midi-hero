'use client';

import * as Tone from 'tone';
import type { InstrumentType } from '@/types';

type ToneInstrument = Tone.PolySynth | Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.MonoSynth;

let currentInstrument: ToneInstrument | null = null;
let currentReverb: Tone.Reverb | null = null;
let masterGain: Tone.Gain | null = null;

export function getMasterGain(): Tone.Gain {
  if (!masterGain) {
    masterGain = new Tone.Gain(0.8).toDestination();
  }
  return masterGain;
}

export function setMasterVolume(vol: number): void {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, vol));
}

export function disposeInstrument(): void {
  if (currentInstrument) {
    currentInstrument.disconnect();
    currentInstrument.dispose();
    currentInstrument = null;
  }
  if (currentReverb) {
    currentReverb.dispose();
    currentReverb = null;
  }
}

export function createInstrument(type: InstrumentType): ToneInstrument {
  disposeInstrument();
  const gain = getMasterGain();

  switch (type) {
    case 'piano': {
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.25 });
      reverb.connect(gain);
      currentReverb = reverb;
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 1.0 },
        volume: -8,
      });
      synth.connect(reverb);
      currentInstrument = synth;
      break;
    }

    case 'electric-piano': {
      const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.2 });
      reverb.connect(gain);
      currentReverb = reverb;
      const synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.8 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 },
        volume: -10,
      });
      synth.connect(reverb);
      currentInstrument = synth;
      break;
    }

    case 'organ': {
      const synth = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2,
        envelope: { attack: 0.01, decay: 0.01, sustain: 1.0, release: 0.1 },
        volume: -12,
      });
      synth.connect(gain);
      currentInstrument = synth;
      break;
    }

    case 'synth-lead': {
      const filter = new Tone.Filter(2000, 'lowpass');
      filter.connect(gain);
      const synth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.3 },
        filter: { Q: 5, frequency: 2000, rolloff: -24, type: 'lowpass', gain: 0 },
        filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, release: 2, baseFrequency: 200, octaves: 2.6, exponent: 2 },
        volume: -10,
      });
      synth.connect(filter);
      currentInstrument = synth;
      break;
    }

    case 'strings': {
      const reverb = new Tone.Reverb({ decay: 3.0, wet: 0.4 });
      reverb.connect(gain);
      currentReverb = reverb;
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.4, decay: 0.1, sustain: 0.8, release: 1.5 },
        volume: -10,
      });
      synth.connect(reverb);
      currentInstrument = synth;
      break;
    }

    default:
      throw new Error(`Unknown instrument: ${type}`);
  }

  return currentInstrument!;
}

export function getCurrentInstrument(): ToneInstrument | null {
  return currentInstrument;
}

export function playNote(
  note: number,
  velocity: number,
  duration: number,
  instrument?: ToneInstrument
): void {
  const inst = instrument ?? currentInstrument;
  if (!inst) return;

  const freq = Tone.Frequency(note, 'midi').toFrequency();
  const vol = velocity / 127;
  const dur = Math.max(0.05, duration);

  try {
    if (inst instanceof Tone.MonoSynth) {
      inst.volume.value = Tone.gainToDb(vol) - 6;
      inst.triggerAttackRelease(freq, dur);
    } else if ('triggerAttackRelease' in inst) {
      (inst as Tone.PolySynth).triggerAttackRelease(
        freq,
        dur,
        Tone.now(),
        vol
      );
    }
  } catch {
    // Ignore scheduling errors (e.g. too many voices)
  }
}

export function stopNote(note: number, instrument?: ToneInstrument): void {
  const inst = instrument ?? currentInstrument;
  if (!inst) return;
  const freq = Tone.Frequency(note, 'midi').toFrequency();
  try {
    if ('triggerRelease' in inst && !(inst instanceof Tone.MonoSynth)) {
      (inst as Tone.PolySynth).triggerRelease(freq);
    }
  } catch {
    // ignore
  }
}

export async function startAudioContext(): Promise<void> {
  await Tone.start();
}
