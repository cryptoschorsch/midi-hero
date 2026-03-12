'use client';

import React from 'react';
import type { Difficulty } from '@/types';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: 'beginner',     label: 'BEGINNER',     color: '#00ff88' },
  { value: 'intermediate', label: 'INTERMEDIATE', color: '#ffff00' },
  { value: 'advanced',     label: 'ADVANCED',     color: '#ff00ff' },
];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-4 py-2 rounded font-mono text-xs tracking-wider border transition-all"
            style={{
              borderColor: active ? opt.color : opt.color + '44',
              color: active ? opt.color : opt.color + '88',
              backgroundColor: active ? opt.color + '22' : 'transparent',
              boxShadow: active ? `0 0 10px ${opt.color}44` : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
