import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { MidiProvider } from '@/components/providers/MidiProvider';
import { AudioProvider } from '@/components/providers/AudioProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/ui/Navbar';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MIDI Hero – Guitar Hero für den AKAI MPK mini',
  description: 'Learn piano and MIDI controller through an addictive Guitar Hero-style game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body className={`${geistMono.variable} antialiased bg-[#080812] text-white min-h-screen`}>
        <AuthProvider>
          <MidiProvider>
            <AudioProvider>
              <Navbar />
              {children}
            </AudioProvider>
          </MidiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
