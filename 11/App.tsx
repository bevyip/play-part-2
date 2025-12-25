import React from 'react';
import { GameCanvas } from './components/GameCanvas';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <header className="mb-4 text-center">
            <h1 className="text-2xl text-neutral-400 font-bold font-google-sans-code tracking-widest uppercase">Block Party</h1>
            <p className="text-xs text-neutral-600 font-google-sans-code mt-1">Non-interactive Observer • Audio Enabled on Interaction</p>
        </header>
        <main className="w-full">
            <GameCanvas />
        </main>
        <footer className="mt-8 text-center text-neutral-700 font-mono text-xs">
        </footer>
      </div>
    </div>
  );
}