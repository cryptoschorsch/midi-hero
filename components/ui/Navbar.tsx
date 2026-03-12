'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMidi } from '@/hooks/useMidi';
import { useAuth } from '@/components/providers/AuthProvider';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, isSupported } = useMidi();
  const { user, profile } = useAuth();

  const links = [
    { href: '/', label: 'HOME' },
    { href: '/songs', label: 'SONGS' },
    { href: '/leaderboard', label: 'LEADERBOARD' },
    { href: '/settings', label: 'SETTINGS' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-black/80 border-b border-cyan-500/20 backdrop-blur-md z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span
          className="text-2xl font-black font-mono tracking-wider"
          style={{
            color: '#00ffff',
            textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff44',
          }}
        >
          MIDI
        </span>
        <span
          className="text-2xl font-black font-mono tracking-wider"
          style={{
            color: '#ff00ff',
            textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff44',
          }}
        >
          HERO
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-sm tracking-widest transition-all"
            style={{
              color: pathname === link.href ? '#00ffff' : 'rgba(255,255,255,0.5)',
              textShadow: pathname === link.href ? '0 0 10px #00ffff' : 'none',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        {/* MIDI status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: !isSupported
                ? '#ff3333'
                : isConnected
                ? '#00ff88'
                : '#ff8800',
              boxShadow: isConnected ? '0 0 8px #00ff88' : undefined,
            }}
          />
          <span className="text-white/40">
            {!isSupported ? 'NO MIDI' : isConnected ? 'MIDI OK' : 'NO DEVICE'}
          </span>
        </div>

        {/* User */}
        {profile ? (
          <span className="text-xs font-mono text-cyan-400/60">{profile.username}</span>
        ) : (
          <Link
            href="/auth"
            className="text-xs font-mono text-white/40 hover:text-white/70 transition-colors"
          >
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
}
