import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Letter from './Letter';
import Boundaries from './Boundaries';
import MouseCursor from './MouseCursor';
import { LetterData } from '../types';

interface SceneProps {
  letters: LetterData[];
}

const Scene: React.FC<SceneProps> = ({ letters }) => {
  return (
    <div className="w-full h-full">
      <Canvas 
        shadows 
        camera={{ 
          position: [0, 0, 22], // Moved back slightly for better view
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 2, // ACESFilmicToneMapping for better colors
        }}
      >
        <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight 
                position={[-5, 10, 5]} 
                intensity={1.2} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
            />
            <pointLight position={[5, 5, 5]} intensity={0.6} />

            {/* Environment for metallic reflections */}
            <Environment preset="city" />

            {/* Physics World */}
            <Physics gravity={[0, -9.81, 0]} debug={false}>
                <Boundaries />
                
                {/* Mouse Interaction */}
                <MouseCursor />
                
                {letters.map((letter) => (
                    <Letter key={letter.id} data={letter} />
                ))}
            </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;