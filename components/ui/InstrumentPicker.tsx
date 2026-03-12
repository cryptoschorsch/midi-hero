'use client';

import React from 'react';
import type { InstrumentType } from '@/types';

interface InstrumentPickerProps {
  value: InstrumentType;
  onChange: (type: InstrumentType) => void;
}

const INSTRUMENTS: { value: InstrumentType; label: string; emoji: string; color: string }[] = [
  { value: 'piano',         label: 'Piano',         emoji: '🎹', color: '#00ffff' },
  { value: 'electric-piano',label: 'E-Piano',       emoji: '🎸', color: '#00ff88' },
  { value: 'organ',         label: 'Organ',         emoji: '🎺', color: '#ff8800' },
  { value: 'synth-lead',    label: 'Synth Lead',    emoji: '🎛️', color: '#ff00ff' },
  { value: 'strings',       label: 'Strings',       emoji: '🎻', color: '#ffff00' },
];

export function InstrumentPicker({ value, onChange }: InstrumentPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {INSTRUMENTS.map((inst) => {
        const active = value === inst.value;
        return (
          <button
            key={inst.value}
            onClick={() => onChange(inst.value)}
            className="flex items-center gap-2 px-4 py-2 rounded border font-mono text-sm transition-all"
            style={{
              borderColor: active ? inst.color : inst.color + '33',
              color: active ? inst.color : inst.color + '66',
              backgroundColor: active ? inst.color + '15' : 'transparent',
              boxShadow: active ? `0 0 12px ${inst.color}33` : 'none',
            }}
          >
            <span>{inst.emoji}</span>
            <span className="text-xs tracking-wider">{inst.label.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
