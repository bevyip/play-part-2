import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import * as THREE from 'three';

interface MouseCursorProps {
  debug?: boolean;
}

const MouseCursor: React.FC<MouseCursorProps> = ({ debug = false }) => {
  const body = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();
  const mouse = useRef(new THREE.Vector2(0, 0));
  const raycaster = useRef(new THREE.Raycaster());
  // Plane passing through origin (0,0,0) to intersect with
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const intersectPoint = useRef(new THREE.Vector3());
  const isHovering = useRef(false);

  useEffect(() => {
    const el = gl.domElement;

    const updateMouse = (x: number, y: number) => {
        const rect = el.getBoundingClientRect();
        mouse.current.x = ((x - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((y - rect.top) / rect.height) * 2 + 1;
        isHovering.current = true;
    };

    const onMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    
    const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            e.preventDefault(); 
            updateMouse(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
    
    const onLeave = () => { isHovering.current = false; };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onLeave);
    el.addEventListener('touchcancel', onLeave);
    
    return () => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onLeave);
        el.removeEventListener('touchcancel', onLeave);
    };
  }, [gl.domElement]);

  useFrame(() => {
    if (!body.current) return;

    if (!isHovering.current) {
        // Move the physical cursor out of the way when not hovering
        body.current.setTranslation({ x: 0, y: 100, z: 0 }, true);
        body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        return;
    }

    // Update plane normal to face camera, ensuring the cursor moves relative to view
    camera.getWorldDirection(plane.current.normal);
    
    // Raycast to find position
    raycaster.current.setFromCamera(mouse.current, camera);
    const didIntersect = raycaster.current.ray.intersectPlane(plane.current, intersectPoint.current);
    
    if (didIntersect) {
      // Move the kinematic body to the intersection point
      body.current.setTranslation(intersectPoint.current, true);
      
      // Reset velocities to ensure kinematic control without drift
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false} // Disable auto-colliders to use manual BallCollider
      position={[0, 100, 0]}
      restitution={1.2} // High restitution for punchy interaction
      friction={0}
    >
      <BallCollider args={[3]} /> 
      
      {/* Visual indicator for debug */}
      <mesh visible={debug}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial 
          color="cyan" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
    </RigidBody>
  );
};

export default MouseCursor;