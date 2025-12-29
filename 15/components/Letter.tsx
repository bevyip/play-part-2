import React, { useMemo } from 'react';
import { Text3D, Center } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { ThreeElements } from '@react-three/fiber';
import { LetterData } from '../types';
import { FONT_URL, COLORS } from '../constants';
import * as THREE from 'three';

interface LetterProps {
  data: LetterData;
}

const Letter: React.FC<LetterProps> = ({ data }) => {
  // Randomize material slightly for visual variety
  const color = useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);
  
  return (
    <RigidBody 
      position={data.position} 
      rotation={data.rotation} 
      colliders="cuboid" // Changed to cuboid for stable collision with mouse cursor
      restitution={0.6} // Bounciness
      friction={0.5}
    >
      <Center>
        <Text3D
          font={FONT_URL}
          size={2.8} // Significantly increased size
          height={0.6} // Thicker to match size increase
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.06}
          bevelSize={0.06}
          bevelOffset={0}
          bevelSegments={5}
        >
          {data.char}
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </Text3D>
      </Center>
    </RigidBody>
  );
};

export default React.memo(Letter);