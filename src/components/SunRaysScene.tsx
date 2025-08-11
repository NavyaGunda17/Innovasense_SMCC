// SunRaysScene.tsx
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import bg from "../assests/bg-1.png"
import bg3 from "../assests/bg-3.png"
import bg2 from "../assests/bg-2.png"
import bg1 from "../assests/img1.png"

const FloatingParticles: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const particles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    return geo;
  }, [particles]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
  }, []);

  useFrame(() => {
    groupRef.current.rotation.y += 0.0005;
    groupRef.current.rotation.x += 0.0002;
  });

  return <points geometry={geometry} material={material} ref={groupRef} />;
};
type ParticleProps = {
  initialAngle: number
  radius: number
  speed: number
  fadeDistance: number
}

function Particle({ initialAngle, radius, speed, fadeDistance }: ParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const opacityRef = useRef(1)

  // Starting from bottom (y = -radius), particles orbit around Y axis and move upward on z
  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Update angle to rotate around Y axis
    const angle = (initialAngle + state.clock.getElapsedTime() * speed) % (2 * Math.PI)

    // Calculate x, y, z to simulate globe rotation with rising effect on z
    // Let's say y is fixed at bottom (or you can slightly oscillate)
    const y = -radius

    // x and z on the circle (orbiting horizontally)
    const x = radius * Math.cos(angle)
    let z = radius * Math.sin(angle)

    // Move z upwards over time
    z += state.clock.getElapsedTime() * 0.5  // speed of upward movement on z

    meshRef.current.position.set(x, y, z)

    // Fade out when z passes fadeDistance
    if (z > fadeDistance) {
      opacityRef.current -= delta * 0.5 // fade speed
      if (opacityRef.current < 0) opacityRef.current = 0
    }

    // Apply fade to material
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = opacityRef.current
      meshRef.current.material.transparent = true
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="white" transparent opacity={1} />
    </mesh>
  )
}



const SunRaysLight: React.FC = () => {
  return (
    <>
      {/* Ambient background light */}
      <ambientLight intensity={0.4} />
      {/* Simulated sun light (top-left corner) */}
      <pointLight
        position={[-10, 10, -10]}
        intensity={0.2}
        color={0xfff3d1}
        distance={100}
        decay={2}
      />
      <spotLight
        position={[-10, 10, -10]}
        angle={0.8}
        penumbra={0.4}
        intensity={1}
        color={0xfff3d1}
        castShadow
      />
    </>
  );
};


function SceneBackground({ image }: { image: string }) {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, image);

  useEffect(() => {
    scene.background = texture;
  }, [scene, texture]);

  return null;
}


// // Custom shader for twinkling stars
// const TwinkleMaterial = shaderMaterial(
//   { time: 0, color: new THREE.Color('white') },
//   // Vertex shader
//   `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//       gl_PointSize = 3.5;
//       gl_Position = projectionMatrix * mvPosition;
//     }
//   `,
//   // Fragment shader
//   `
//     uniform float time;
//     uniform vec3 color;
//     varying vec2 vUv;

//     void main() {
//       float twinkle = abs(sin(time + vUv.x * 10.0)) * 0.8 + 0.2;
//       gl_FragColor = vec4(color, twinkle);
//     }
//   `
// )

// extend({ TwinkleMaterial })


// const TwinkleMaterial = shaderMaterial(
//   { time: 0, color: new THREE.Color('white') },
//   // vertex shader
//   `
//     uniform float time;
//     varying float vTwinkle;
//     void main() {
//       vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

//       // Globe orbit movement: spin around Y
//       float angle = time * 0.01 + position.y * 5.0;
//       float radius = length(position.xz);
//       float newX = cos(angle) * radius;
//       float newZ = sin(angle) * radius;

//       mvPosition.x = newX;
//       mvPosition.z = newZ;

//       gl_Position = projectionMatrix * mvPosition;

//       // Control star size
//       gl_PointSize = 60.5 / -mvPosition.z;

//       // Twinkle brightness
//       vTwinkle = abs(sin(time + position.x * 10.0));
//     }
//   `,
//   // fragment shader
//   `
//     uniform vec3 color;
//     varying float vTwinkle;
//     void main() {
//       float alpha = vTwinkle * 0.9 + 0.1;
//       gl_FragColor = vec4(color, alpha);

      
//     }
//   `
// );
// extend({ TwinkleMaterial });

// const TwinklingStarsGlobe = () => {
// const materialRef = useRef<any>(null)
//   const pointsRef = useRef<THREE.Points>(null)

//   const positions = useMemo(() => {
//     const count = 2000
//     const radius = 20
//     const positions = new Float32Array(count * 3)

//     for (let i = 0; i < count; i++) {
//       const theta = Math.random() * Math.PI * 2
//       const phi = Math.acos(2 * Math.random() - 1)
//       const r = radius * (0.6 + Math.random() * 0.4)

//       const x = r * Math.sin(phi) * Math.cos(theta)
//       const y = r * Math.sin(phi) * Math.sin(theta)
//       const z = r * Math.cos(phi)

//       positions[i * 3 + 0] = x
//       positions[i * 3 + 1] = y
//       positions[i * 3 + 2] = z
//     }

//     return positions
//   }, [])

//   useFrame(({ clock }) => {
//     if (materialRef.current) {
//       materialRef.current.uniforms.time.value = clock.getElapsedTime()
//     }
//     if (pointsRef.current) {
//       // Slight rotation on X axis (vertical motion effect)
//       pointsRef.current.rotation.x += 0.0005
//     }
//   })

//   return (
//     <points ref={pointsRef}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           args={[positions, 3]}
//         />
//       </bufferGeometry>
//       {/* @ts-ignore */}
//       <twinkleMaterial ref={materialRef} />
//     </points>
//   )
// };

// / Same TwinkleMaterial but without orbit movement in vertex shader

// Your custom shader material
const TwinkleMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color("white") },
  `
    uniform float time;
    varying float vTwinkle;
     varying float vDist;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      // Globe orbit movement: spin around Y
      float angle = time * 0.1 + position.y * 5.0;
      float radius = length(position.xz);
      float newX = cos(angle) * radius;
      float newZ = sin(angle) * radius;

      mvPosition.x = newX;
      mvPosition.z = newZ;

      gl_Position = projectionMatrix * mvPosition;

      // Control star size
      gl_PointSize = 60.5 / -mvPosition.z;

      // Twinkle brightness
      vTwinkle = abs(sin(time + position.x * 10.0));

        // Distance from center (in model space)
      vDist = length(position);
    }
  `,
  `
    uniform vec3 color;
    varying float vTwinkle;
    varying float vDist;
    void main() {
    float fade = smoothstep(15.0, 20.0, vDist);
      float alpha = vTwinkle * (1.0 - fade);
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ TwinkleMaterial });

const TwinklingStarsGlobe = () => {
  const materialRef = useRef<any>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const count = 1000;
  const radius = 20;

  // Positions buffer
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.6 + Math.random() * 0.4);

      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  // Velocities buffer (random directions & speed)
  const velocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random small velocity vector
      arr[i * 3] = (Math.random() - 0.05) * 0.0015;
      arr[i * 3 + 1] = (Math.random() - 0.05) * 0.0015;
      arr[i * 3 + 2] = (Math.random() - 0.05) * 0.0015;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    for (let i = 0; i < count; i++) {
      // Update positions by velocity
      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // If star goes outside sphere radius, bounce it back or reset position
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);

      if (dist > radius) {
        // Simple bounce by reversing velocity vector for that star
        velocities[i * 3] *= -1;
        velocities[i * 3 + 1] *= -1;
        velocities[i * 3 + 2] *= -1;
      }
    }

    // Update geometry attribute with new positions
    const geometry = pointsRef.current.geometry;
    geometry.attributes.position.needsUpdate = true;

    // Slowly rotate the entire star field on X axis for globe effect
   // Slow rotations on X and Y for subtle globe movement
    pointsRef.current.rotation.x += 0.0003;
    pointsRef.current.rotation.y += 0.0002;

    // Update uniform time for twinkle effect
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions,3]}        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <twinkleMaterial ref={materialRef} />
    </points>
  );
};

const TwinklingStars = () => {
  const ref = useRef<any>(null)
  const count = 2000
  const radius = 100

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * radius * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  useFrame((state) => {
    if (ref.current) {
      ref.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <points geometry={geometry}>
      {/* @ts-ignore */}
      <twinkleMaterial ref={ref} transparent depthWrite={false} />
    </points>
  )
}



function MovingStars() {
  const starsRef = useRef<any>(null)

  useFrame((state, delta) => {
    if (!starsRef.current) return

    // Example 1: Slow rotation around Y axis
    starsRef.current.rotation.y += delta * 0.02

    // Example 2: Slow movement forward (along z)
    starsRef.current.position.z -= delta * 0.1

    // Reset position if moved too far
    if (starsRef.current.position.z < -50) {
      starsRef.current.position.z = 0
    }
  })

  return (

    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={2000}
      factor={30}
      saturation={0}
      fade
    />
  )
}


export const SunRaysScene: React.FC = () => {
  const particlesCount = 1000
  const radius = 2
  const fadeDistance = 3
    
  return (
    <>
    <div className="testing" style={{
      //  background:'linear-gradient(131deg, rgb(29, 34, 57), rgb(56, 53, 71))',
        backgroundImage: `
      linear-gradient(131deg, rgba(29, 34, 57, 0), rgba(56, 53, 71, 0)),
      url(${bg3})
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',

       width:"100vw",height:"100vh",position:"fixed",zIndex:-1
    }}>

    </div>
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ height: '100vh', 
        // background:'linear-gradient(131deg, rgb(29, 34, 57), rgb(56, 53, 71))',
        
       }}
    >
      <SunRaysLight />
   {/* <SceneBackground image={bg1} /> */}
      {/* <FloatingParticles /> */}
      {/* <MovingStars/> */}
      {/* <TwinklingStars /> */}
      <TwinklingStarsGlobe />
      <OrbitControls enableZoom={false} />
    </Canvas>
    </>
    
  );
};

export const SunRaysScene1: React.FC = () => {
  const particlesCount = 1000
  const radius = 2
  const fadeDistance = 3
    
  return (
    <>
    <div className="testing" style={{
       background:'linear-gradient(131deg, #333A3B , #0F1014',
      
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    width:"100vw",height:"100vh",
    position:"fixed",zIndex:-1
    }}>

    </div>
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ 
        height: '100vh', 
        // background:'linear-gradient(131deg, rgb(29, 34, 57), rgb(56, 53, 71))',
        
       }}
    >
      <SunRaysLight />
   {/* <SceneBackground image={bg1} /> */}
      {/* <FloatingParticles /> */}
      {/* <MovingStars/> */}
      {/* <TwinklingStars /> */}
      <TwinklingStarsGlobe />
      <OrbitControls enableZoom={false} />
    </Canvas>
    </>
    
  );
};
// export default SunRaysScene;
