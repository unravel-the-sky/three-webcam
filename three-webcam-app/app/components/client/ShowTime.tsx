"use client";

import * as THREE from "three";
import {
  Canvas,
  useFrame,
  ThreeElements,
  useLoader,
  Vector3 as FiberVector3,
} from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  OrbitControls,
  Plane,
  Sphere,
  useTexture,
} from "@react-three/drei";
import {
  Physics,
  Debug,
  useBox,
  usePlane,
  useSphere,
  Triplet,
} from "@react-three/cannon";

// Type for Props
interface ShowTimeProps {
  imgList: string[];
}

export default function ShowTime({ imgList }: ShowTimeProps) {
  return (
    <div className="flex-1 bg-slate-200">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 10] }}
        className="h-[500px]"
      >
        <Scene imgList={imgList} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// PhyPlane component
interface PhyPlaneProps {
  color: string;
  position?: Triplet;
  rotation?: Triplet;
}

const PhyPlane = ({ color, ...props }: PhyPlaneProps) => {
  const [ref] = usePlane<THREE.Mesh>(() => ({ ...props }));

  return (
    <Plane args={[1000, 1000]} ref={ref}>
      <meshStandardMaterial color={color} />
    </Plane>
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

// PhyBox component
interface PhyBoxProps {
  imgUrl: string;
  position?: Triplet;
}

const PhyBox = (props: PhyBoxProps) => {
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    args: [2, 2, 2],
    mass: 1,
    ...props,
  }));
  const colorMap = useTexture(props.imgUrl) as THREE.Texture;

  return (
    <Box
      args={[2, 2, 2]}
      ref={ref}
      onClick={() => {
        api.applyImpulse(
          [(Math.random() - 0.5) * 4, Math.random() * 20, 0],
          [0, -1, 0]
        );
      }}
    >
      {colorMap ? (
        <meshStandardMaterial map={colorMap} />
      ) : (
        <meshNormalMaterial />
      )}
    </Box>
  );
};

// Scene component
const Scene = ({ imgList }: ShowTimeProps) => {
  return (
    <>
      <Physics gravity={[0, -10, 0]} allowSleep>
        <PhyPlane
          color="yellow"
          position={[0, -2, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {imgList.map((imgUrl) => (
          <PhyBox
            imgUrl={imgUrl}
            key={imgUrl}
            position={[
              (Math.random() - 0.5) * 20,
              Math.random() * 40,
              (Math.random() - 0.5) * 10,
            ]}
          />
        ))}
      </Physics>
      <ambientLight intensity={0.6} />
      <directionalLight />
    </>
  );
};

// PlayerBall component
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
