import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';

const CharacterModel: React.FC<{ exercise: string; gender?: 'Male' | 'Female' | 'Other' }> = ({ exercise, gender = 'Male' }) => {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftForearm = useRef<THREE.Group>(null);
  const rightForearm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftLowerLeg = useRef<THREE.Group>(null);
  const rightLowerLeg = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);

  const isFemale = gender === 'Female';

  const skinMaterial = new THREE.MeshStandardMaterial({
    color: '#d0d0d0',
    metalness: 0.1,
    roughness: 0.8,
  });

  const shortsMaterial = new THREE.MeshStandardMaterial({
    color: '#050505',
    roughness: 0.9,
    metalness: 0.1,
  });

  const muscleMaterial = new THREE.MeshStandardMaterial({
    color: '#ff4444',
    metalness: 0.2,
    roughness: 0.8,
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: '#111111',
    roughness: 0.5,
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Reset rotations and positions
    if (group.current) {
      group.current.rotation.set(0, 0, 0);
      group.current.position.set(0, 0, 0);
    }
    if (torso.current) torso.current.rotation.set(0, 0, 0);
    if (leftArm.current) leftArm.current.rotation.set(0, 0, 0);
    if (rightArm.current) rightArm.current.rotation.set(0, 0, 0);
    if (leftForearm.current) leftForearm.current.rotation.set(0, 0, 0);
    if (rightForearm.current) rightForearm.current.rotation.set(0, 0, 0);
    if (leftLeg.current) leftLeg.current.rotation.set(0, 0, 0);
    if (rightLeg.current) rightLeg.current.rotation.set(0, 0, 0);
    if (leftLowerLeg.current) leftLowerLeg.current.rotation.set(0, 0, 0);
    if (rightLowerLeg.current) rightLowerLeg.current.rotation.set(0, 0, 0);

    if (exercise === 'squat') {
      const squatY = Math.sin(t * 2) * 0.4 - 0.4;
      if (group.current) group.current.position.y = squatY;
      
      const bend = -squatY * 2.5;
      if (leftLeg.current) leftLeg.current.rotation.x = bend;
      if (rightLeg.current) rightLeg.current.rotation.x = bend;
      if (leftLowerLeg.current) leftLowerLeg.current.rotation.x = -bend * 1.5;
      if (rightLowerLeg.current) rightLowerLeg.current.rotation.x = -bend * 1.5;
      if (torso.current) torso.current.rotation.x = squatY * 0.5;
    } else if (exercise === 'pushup') {
      const pushupY = Math.sin(t * 2) * 0.25 - 0.25;
      if (group.current) {
        group.current.rotation.x = Math.PI / 2;
        group.current.position.y = pushupY + 0.3;
      }
      const armBend = -pushupY * 3;
      if (leftArm.current) leftArm.current.rotation.z = armBend;
      if (rightArm.current) rightArm.current.rotation.z = -armBend;
      if (leftForearm.current) leftForearm.current.rotation.z = -armBend * 1.2;
      if (rightForearm.current) rightForearm.current.rotation.z = armBend * 1.2;
    } else if (exercise === 'plank') {
      const shake = Math.sin(t * 25) * 0.003;
      if (group.current) {
        group.current.rotation.x = Math.PI / 2;
        group.current.position.y = 0.3 + shake;
      }
      if (leftArm.current) leftArm.current.rotation.z = 0.5;
      if (rightArm.current) rightArm.current.rotation.z = -0.5;
      if (leftForearm.current) leftForearm.current.rotation.z = -0.8;
      if (rightForearm.current) rightForearm.current.rotation.z = 0.8;
    } else if (exercise === 'cobra') {
      if (group.current) {
        group.current.rotation.x = Math.PI / 2;
        group.current.position.y = 0.1;
      }
      const arch = Math.sin(t * 1.5) * 0.4 + 0.4;
      if (torso.current) torso.current.rotation.x = -arch;
      if (leftArm.current) {
        leftArm.current.rotation.x = arch * 0.5;
        leftArm.current.rotation.z = 0.2;
      }
      if (rightArm.current) {
        rightArm.current.rotation.x = arch * 0.5;
        rightArm.current.rotation.z = -0.2;
      }
    } else if (exercise === 'lunges') {
      const lungeCycle = Math.sin(t * 2);
      if (group.current) group.current.position.y = Math.abs(lungeCycle) * -0.2;
      if (leftLeg.current) leftLeg.current.rotation.x = lungeCycle > 0 ? -lungeCycle * 1.2 : lungeCycle * 0.5;
      if (rightLeg.current) rightLeg.current.rotation.x = lungeCycle < 0 ? lungeCycle * 1.2 : -lungeCycle * 0.5;
      if (leftLowerLeg.current) leftLowerLeg.current.rotation.x = lungeCycle > 0 ? lungeCycle * 1.5 : 0;
      if (rightLowerLeg.current) rightLowerLeg.current.rotation.x = lungeCycle < 0 ? -lungeCycle * 1.5 : 0;
    } else {
      if (group.current) group.current.position.y = Math.sin(t) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {/* Hips / Shorts */}
      <group ref={hips} position={[0, 0.85, 0]}>
        <mesh material={shortsMaterial}>
          <capsuleGeometry args={[isFemale ? 0.2 : 0.18, 0.25, 16, 32]} />
        </mesh>
        
        {/* Torso */}
        <group ref={torso} position={[0, 0.15, 0]}>
          {/* Abdomen */}
          <group position={[0, 0.15, 0]}>
            <mesh material={skinMaterial}>
              <capsuleGeometry args={[isFemale ? 0.12 : 0.14, 0.2, 16, 32]} />
            </mesh>
            {/* Ab Muscles */}
            <mesh position={[0, -0.05, 0.08]} material={muscleMaterial}>
              <boxGeometry args={[0.1, 0.2, 0.05]} />
            </mesh>
          </group>
          {/* Chest */}
          <group position={[0, 0.4, 0]}>
            <mesh material={skinMaterial}>
              <capsuleGeometry args={[isFemale ? 0.16 : 0.18, 0.2, 16, 32]} />
            </mesh>
            {/* Pectorals */}
            <mesh position={[-0.08, 0.05, 0.12]} material={muscleMaterial}>
              <sphereGeometry args={[0.09, 16, 16]} />
            </mesh>
            <mesh position={[0.08, 0.05, 0.12]} material={muscleMaterial}>
              <sphereGeometry args={[0.09, 16, 16]} />
            </mesh>
            {/* Shoulders */}
            <mesh position={[-0.2, 0.05, 0]} material={muscleMaterial}>
              <sphereGeometry args={[0.08, 16, 16]} />
            </mesh>
            <mesh position={[0.2, 0.05, 0]} material={muscleMaterial}>
              <sphereGeometry args={[0.08, 16, 16]} />
            </mesh>
          </group>
          
          {/* Head */}
          <group ref={head} position={[0, 0.65, 0]}>
            <mesh material={skinMaterial}>
              <sphereGeometry args={[0.12, 32, 32]} />
            </mesh>
            <mesh position={[0, -0.1, 0]} material={skinMaterial}>
              <cylinderGeometry args={[0.06, 0.08, 0.1, 16]} />
            </mesh>
            {/* Hair - Only for Female, Male is bald like the image */}
            {isFemale && (
              <group position={[0, 0.05, -0.05]}>
                <mesh material={hairMaterial}>
                  <sphereGeometry args={[0.13, 16, 16]} />
                </mesh>
                <mesh position={[0, -0.1, -0.15]} rotation={[Math.PI / 4, 0, 0]} material={hairMaterial}>
                  <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
                </mesh>
              </group>
            )}
          </group>

          {/* Arms */}
          <group ref={leftArm} position={[isFemale ? -0.2 : -0.22, 0.45, 0]}>
            <mesh position={[0, -0.15, 0]} material={skinMaterial}>
              <capsuleGeometry args={[0.06, 0.25, 16, 32]} />
            </mesh>
            {/* Bicep */}
            <mesh position={[0.02, -0.1, 0.04]} material={muscleMaterial}>
              <sphereGeometry args={[0.04, 16, 16]} />
            </mesh>
            <group ref={leftForearm} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.15, 0]} material={skinMaterial}>
                <capsuleGeometry args={[0.05, 0.25, 16, 32]} />
              </mesh>
            </group>
          </group>
          <group ref={rightArm} position={[isFemale ? 0.2 : 0.22, 0.45, 0]}>
            <mesh position={[0, -0.15, 0]} material={skinMaterial}>
              <capsuleGeometry args={[0.06, 0.25, 16, 32]} />
            </mesh>
            {/* Bicep */}
            <mesh position={[-0.02, -0.1, 0.04]} material={muscleMaterial}>
              <sphereGeometry args={[0.04, 16, 16]} />
            </mesh>
            <group ref={rightForearm} position={[0, -0.3, 0]}>
              <mesh position={[0, -0.15, 0]} material={skinMaterial}>
                <capsuleGeometry args={[0.05, 0.25, 16, 32]} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Legs */}
        <group ref={leftLeg} position={[-0.1, -0.1, 0]}>
          <mesh position={[0, -0.25, 0]} material={skinMaterial}>
            <capsuleGeometry args={[0.09, 0.4, 16, 32]} />
          </mesh>
          {/* Quad */}
          <mesh position={[0, -0.2, 0.06]} material={muscleMaterial}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
          <group ref={leftLowerLeg} position={[0, -0.5, 0]}>
            <mesh position={[0, -0.25, 0]} material={skinMaterial}>
              <capsuleGeometry args={[0.07, 0.4, 16, 32]} />
            </mesh>
            {/* Calf */}
            <mesh position={[0, -0.15, -0.04]} material={muscleMaterial}>
              <sphereGeometry args={[0.06, 16, 16]} />
            </mesh>
          </group>
        </group>
        <group ref={rightLeg} position={[0.1, -0.1, 0]}>
          <mesh position={[0, -0.25, 0]} material={skinMaterial}>
            <capsuleGeometry args={[0.09, 0.4, 16, 32]} />
          </mesh>
          {/* Quad */}
          <mesh position={[0, -0.2, 0.06]} material={muscleMaterial}>
            <sphereGeometry args={[0.08, 16, 16]} />
          </mesh>
          <group ref={rightLowerLeg} position={[0, -0.5, 0]}>
            <mesh position={[0, -0.25, 0]} material={skinMaterial}>
              <capsuleGeometry args={[0.07, 0.4, 16, 32]} />
            </mesh>
            {/* Calf */}
            <mesh position={[0, -0.15, -0.04]} material={muscleMaterial}>
              <sphereGeometry args={[0.06, 16, 16]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

const TrainingCharacter: React.FC<{ exercise: string; gender?: 'Male' | 'Female' | 'Other' }> = ({ exercise, gender }) => {
  return (
    <div className="w-full h-full bg-white rounded-lg overflow-hidden border border-accent/20">
      <Canvas shadows gl={{ antialias: true }}>
        <color attach="background" args={['#ffffff']} />
        <PerspectiveCamera makeDefault position={[0, 1.2, 3.5]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.8} 
        />
        
        <ambientLight intensity={0.8} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        <CharacterModel exercise={exercise} gender={gender} />
        
        <Grid 
          infiniteGrid 
          fadeDistance={10} 
          cellColor="#333333" 
          sectionColor="#00d1ff" 
          sectionThickness={1} 
          sectionSize={1} 
          cellSize={0.5} 
          position={[0, 0, 0]} 
        />

        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.3} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default TrainingCharacter;
