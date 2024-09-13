"use client";

import * as THREE from "three";
import {
  Canvas,
  useFrame,
  ThreeElements,
  useLoader,
  Vector3,
  Camera,
} from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { TextureLoader } from "three/src/loaders/TextureLoader";

export default function ShowTime({ imgList }: { imgList: string[] }) {
  return (
    <div className="flex-1 bg-slate-200">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 15] }}
        className="h-[500px]"
      >
        <Scene imgList={imgList} />
      </Canvas>
    </div>
  );
}

const Scene = ({ imgList }: { imgList: string[] }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight />
      <spotLight
        position={[50, 10, 10]}
        angle={0.25}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      {imgList.map((imgUrl, index) => (
        <PlayerBall
          imgUrl={imgUrl}
          key={imgUrl}
          position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 4, 0]}
        />
      ))}
    </>
  );
};

const PlayerBall = ({
  imgUrl,
  position,
}: {
  imgUrl: string;
  position: Vector3 | undefined;
}) => {
  const colorMap = useLoader(TextureLoader, imgUrl);

  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta;
  });

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
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  );
};

const Box = (props: ThreeElements["mesh"]) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "#2f74c0"} />
    </mesh>
  );
};
