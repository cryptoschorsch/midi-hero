import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Background grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(0,255,255,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <div>
          <h1 className="text-7xl md:text-9xl font-black font-mono tracking-tight">
            <span style={{ color: '#00ffff', textShadow: '0 0 30px #00ffff, 0 0 80px #00ffff44', display: 'block' }}>
              MIDI
            </span>
            <span style={{ color: '#ff00ff', textShadow: '0 0 30px #ff00ff, 0 0 80px #ff00ff44', display: 'block' }}>
              HERO
            </span>
          </h1>
          <p className="text-white/50 font-mono text-sm tracking-widest mt-4 uppercase">
            Guitar Hero für den AKAI MPK mini
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/songs"
            className="px-10 py-4 font-mono font-bold text-lg tracking-widest border-2 rounded transition-all hover:scale-105"
            style={{
              borderColor: '#00ffff',
              color: '#00ffff',
              backgroundColor: 'rgba(0,255,255,0.1)',
              boxShadow: '0 0 20px rgba(0,255,255,0.3)',
            }}
          >
            PLAY NOW
          </Link>
          <Link
            href="/leaderboard"
            className="px-10 py-4 font-mono font-bold text-lg tracking-widest border-2 rounded transition-all hover:scale-105"
            style={{
              borderColor: '#ff00ff',
              color: '#ff00ff',
              backgroundColor: 'rgba(255,0,255,0.1)',
              boxShadow: '0 0 20px rgba(255,0,255,0.3)',
            }}
          >
            LEADERBOARD
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '🎹', title: '25 Tasten', desc: 'Keyboard-Melodien' },
            { icon: '🥁', title: '8 Pads', desc: 'Drum-Patterns' },
            { icon: '🏆', title: '13 Songs', desc: 'Inkl. Klassiker' },
          ].map((f) => (
            <div key={f.title} className="p-4 rounded-lg border border-white/10 bg-white/5">
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="text-white font-mono font-bold text-sm">{f.title}</div>
              <div className="text-white/40 font-mono text-xs">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
