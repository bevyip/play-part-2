import React, { useState, useCallback, useEffect } from 'react';
import Scene from './components/Scene';
import InputField from './components/InputField';
import { LetterData } from './types';
import { MAX_LETTERS, SPAWN_HEIGHT, SPAWN_RANGE_X, SPAWN_RANGE_Z } from './constants';

const App: React.FC = () => {
  const [letters, setLetters] = useState<LetterData[]>([]);

  // Initialize with 5 random letters on mount
  useEffect(() => {
    const initialLetters: LetterData[] = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < 5; i++) {
      const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      initialLetters.push({
        id: Date.now() + Math.random() + i, // Unique ID
        char: randomChar,
        position: [
          (Math.random() - 0.5) * SPAWN_RANGE_X, // Random X
          SPAWN_HEIGHT + Math.random() * 2,      // Varied start height
          (Math.random() - 0.5) * SPAWN_RANGE_Z  // Random Z
        ],
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ]
      });
    }
    
    setLetters(initialLetters);
  }, []);

  const handleInput = useCallback((char: string) => {
    setLetters((prev) => {
      // Performance optimization: Remove oldest if over limit
      const currentLetters = prev.length >= MAX_LETTERS ? prev.slice(1) : prev;

      const newLetter: LetterData = {
        id: Date.now() + Math.random(), // Unique ID
        char: char.toUpperCase(), // Force uppercase for better visual consistency
        position: [
          (Math.random() - 0.5) * SPAWN_RANGE_X, // Random X
          SPAWN_HEIGHT + Math.random() * 2,      // Varied start height
          (Math.random() - 0.5) * SPAWN_RANGE_Z  // Random Z
        ],
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ]
      };

      return [...currentLetters, newLetter];
    });
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* 2D UI Overlay */}
      <InputField onInput={handleInput} />

      {/* 3D Scene */}
      <Scene letters={letters} />
    </div>
  );
};

export default App;