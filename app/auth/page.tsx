'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/supabase/auth';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-60px)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1
          className="text-3xl font-black font-mono mb-8 text-center"
          style={{ color: '#00ffff', textShadow: '0 0 20px #00ffff44' }}
        >
          {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-black/40 border border-white/10 rounded-lg p-6">
          {mode === 'signup' && (
            <Input
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="midi_hero_42"
            />
          )}
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-mono font-bold tracking-widest border-2 rounded transition-all hover:scale-105 disabled:opacity-50"
            style={{
              borderColor: '#00ffff',
              color: '#00ffff',
              backgroundColor: 'rgba(0,255,255,0.1)',
            }}
          >
            {loading ? 'LOADING...' : mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full text-white/40 font-mono text-sm hover:text-white/60 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </form>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-white/40 uppercase tracking-widest mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none placeholder-white/20"
      />
    </div>
  );
}
