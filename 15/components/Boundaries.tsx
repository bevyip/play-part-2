import React from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

const Boundaries: React.FC = () => {
  const { viewport } = useThree();
  const width = viewport.width;
  const height = viewport.height;
  const depth = 4;
  
  // Wall thickness (invisible but needed for physics)
  const thickness = 2;

  return (
    <group key={`${width}-${height}`}>
      {/* Floor */}
      <RigidBody type="fixed" position={[0, -height / 2 - thickness/2, 0]} restitution={0.5} friction={1}>
        <CuboidCollider args={[width / 2 + thickness, thickness/2, depth / 2 + thickness]} />
      </RigidBody>

      {/* Left Wall */}
      <RigidBody type="fixed" position={[-width / 2 - thickness/2, 0, 0]} restitution={0.5}>
        <CuboidCollider args={[thickness/2, height, depth / 2]} />
      </RigidBody>
      
      {/* Right Wall */}
      <RigidBody type="fixed" position={[width / 2 + thickness/2, 0, 0]} restitution={0.5}>
        <CuboidCollider args={[thickness/2, height, depth / 2]} />
      </RigidBody>

      {/* Back Wall */}
      <RigidBody type="fixed" position={[0, 0, -depth / 2 - thickness/2]} restitution={0.5}>
        <CuboidCollider args={[width / 2 + thickness, height, thickness/2]} />
      </RigidBody>

      {/* Front Wall - constrain objects within the depth */}
      <RigidBody type="fixed" position={[0, 0, depth / 2 + thickness/2]} restitution={0.5}>
        <CuboidCollider args={[width / 2 + thickness, height, thickness/2]} />
      </RigidBody>
    </group>
  );
};

export default Boundaries;