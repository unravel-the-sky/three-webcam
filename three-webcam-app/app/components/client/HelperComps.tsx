import { Triplet, useSphere } from "@react-three/cannon";
import { Sphere, useTexture } from "@react-three/drei";
import {
  Canvas,
  Vector3 as FiberVector3,
  ThreeElements,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface PlayerBallProps {
  imgUrl: string;
  position: FiberVector3 | undefined;
}

const PlayerBall = ({ imgUrl, position }: PlayerBallProps) => {
  const colorMap = useLoader(THREE.TextureLoader, imgUrl);
  const meshRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    if (meshRef.current) meshRef.current.rotation.y = Math.PI * 1.5;
  }, []);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
};

// TestScene component
const TestScene = () => {
  return (
    <Canvas className="h-2xl w-2xl">
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <CustomBox position={[-1.2, 0, 0]} />
      <CustomBox position={[1.2, 0, 0]} />
    </Canvas>
  );
};

// CustomBox component
const CustomBox = (props: ThreeElements["mesh"]) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "#2f74c0"} />
    </mesh>
  );
};

// PhySphere component
interface PhySphereProps {
  imgUrl: string;
  position?: Triplet;
}

const PhySphere = (props: PhySphereProps) => {
  const sphereSize = 1;
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    args: [sphereSize],
    mass: 2,
    ...props,
  }));
  const colorMap = useTexture(props.imgUrl) as THREE.Texture;

  return (
    <Sphere
      args={[sphereSize]}
      ref={ref}
      onClick={() => {
        api.applyImpulse(
          [(Math.random() - 0.5) * 4, Math.random() * 20, 0],
          [0, 0, 0]
        );
      }}
      rotation={[0, Math.PI * 1.5, 0]}
    >
      {colorMap ? (
        <meshStandardMaterial map={colorMap} />
      ) : (
        <meshNormalMaterial />
      )}
    </Sphere>
  );
};
