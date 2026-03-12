'use client';

import React, { useState, useEffect } from 'react';
import { useMidi } from '@/hooks/useMidi';
import { useAudio } from '@/hooks/useAudio';
import { InstrumentPicker } from '@/components/ui/InstrumentPicker';
import type { InstrumentType } from '@/types';

const SettingSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  color = '#00ffff',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  color?: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-mono text-white/60">{label}</span>
      <span className="text-sm font-mono" style={{ color }}>
        {value > 0 ? `+${value}` : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: color }}
    />
  </div>
);

export default function SettingsPage() {
  const midi = useMidi();
  const audio = useAudio();

  const [audioLatency, setAudioLatency] = useState(0);
  const [inputLatency, setInputLatency] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(280);
  const [volume, setVolume] = useState(80);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');

  // Calibration tap state
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapBpm, setTapBpm] = useState<number | null>(null);

  const handleTap = () => {
    const now = performance.now();
    setTapTimes((prev) => {
      const times = [...prev, now].slice(-8); // Keep last 8 taps
      if (times.length >= 2) {
        const intervals = times.slice(1).map((t, i) => t - times[i]);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        setTapBpm(Math.round(60000 / avgInterval));
      }
      return times;
    });
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audio.changeVolume(v / 100);
  };

  const handleInstrumentChange = (inst: InstrumentType) => {
    setInstrument(inst);
    audio.changeInstrument(inst);
  };

  return (
    <main className="min-h-[calc(100vh-60px)] p-6 max-w-3xl mx-auto">
      <h1
        className="text-3xl font-black font-mono mb-8"
        style={{ color: '#ffff00', textShadow: '0 0 20px #ffff0044' }}
      >
        SETTINGS
      </h1>

      <div className="space-y-6">

        {/* MIDI Device */}
        <Section title="MIDI Device" color="#00ffff">
          {!midi.isSupported ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-sm">
              ⚠️ Web MIDI API not supported. Please use Chrome, Edge, or another Chromium browser.
            </div>
          ) : midi.devices.length === 0 ? (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded text-orange-400 font-mono text-sm">
              No MIDI devices detected. Connect your AKAI MPK mini via USB and refresh.
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={midi.selectedDeviceId ?? 'all'}
                onChange={(e) => midi.selectDevice(e.target.value === 'all' ? null : e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Devices</option>
                {midi.devices.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <p className="text-xs text-white/30 font-mono">
                {midi.devices.length} device(s) connected
              </p>
            </div>
          )}
        </Section>

        {/* Octave Offset */}
        <Section title="Keyboard Octave" color="#00ffff">
          <SettingSlider
            label="Octave Offset (semitones)"
            value={octaveOffset}
            min={-24}
            max={24}
            step={12}
            unit=" st"
            onChange={setOctaveOffset}
            color="#00ffff"
          />
          <p className="text-xs text-white/30 font-mono mt-1">
            Adjust if your MPK mini sends different note numbers
          </p>
        </Section>

        {/* Latency Calibration */}
        <Section title="Latency Calibration" color="#ff8800">
          <div className="space-y-4">
            <SettingSlider
              label="Audio Output Latency"
              value={audioLatency}
              min={-100}
              max={100}
              unit="ms"
              onChange={setAudioLatency}
              color="#ff8800"
            />
            <SettingSlider
              label="MIDI Input Latency"
              value={inputLatency}
              min={-100}
              max={100}
              unit="ms"
              onChange={(v) => {
                setInputLatency(v);
                midi.setLatencyOffset(v);
              }}
              color="#ff8800"
            />

            {/* Tap calibration */}
            <div className="mt-4">
              <button
                onClick={handleTap}
                className="px-6 py-3 border border-orange-500/50 text-orange-400 font-mono rounded hover:bg-orange-500/10 transition-colors w-full"
              >
                TAP TO CALIBRATE {tapTimes.length > 0 && `(${tapTimes.length} taps)`}
              </button>
              {tapBpm !== null && (
                <p className="text-xs text-orange-400/60 font-mono mt-2 text-center">
                  Detected: {tapBpm} BPM
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* Audio Settings */}
        <Section title="Audio" color="#ff00ff">
          <div className="space-y-4">
            <SettingSlider
              label="Master Volume"
              value={volume}
              min={0}
              max={100}
              unit="%"
              onChange={handleVolumeChange}
              color="#ff00ff"
            />
            <div>
              <div className="text-sm font-mono text-white/60 mb-2">Instrument</div>
              <InstrumentPicker value={instrument} onChange={handleInstrumentChange} />
            </div>
          </div>
        </Section>

        {/* Scroll Speed */}
        <Section title="Gameplay" color="#00ff88">
          <SettingSlider
            label="Note Scroll Speed"
            value={scrollSpeed}
            min={100}
            max={600}
            step={10}
            unit=" px/s"
            onChange={setScrollSpeed}
            color="#00ff88"
          />
          <p className="text-xs text-white/30 font-mono mt-1">
            Higher = faster falling notes (more challenge, less preparation time)
          </p>
        </Section>

      </div>
    </main>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
      <div
        className="px-4 py-3 border-b border-white/10"
        style={{ borderLeftColor: color, borderLeftWidth: 3 }}
      >
        <h2 className="font-mono font-bold text-sm tracking-widest uppercase" style={{ color }}>
          {title}
        </h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
