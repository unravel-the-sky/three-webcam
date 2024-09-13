"use client";

import * as THREE from "three";
import {
  Canvas,
  useFrame,
  ThreeElements,
  useLoader,
  Vector3,
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
} from "@react-three/cannon";

export default function ShowTime({ imgList }: { imgList: string[] }) {
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

const PhyPlane = ({ color, ...props }) => {
  const [ref] = usePlane(() => ({ ...props }));

  return (
    <Plane args={[1000, 1000]} ref={ref}>
      <meshStandardMaterial color={color} />
    </Plane>
  );
};

const PhySphere = (props) => {
  const sphereSize = 1;
  const [ref, api] = useSphere(() => ({
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

const PhyBox = (props) => {
  const [ref, api] = useBox(() => ({ args: [2, 2, 2], mass: 1, ...props }));
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

const Scene = ({ imgList }: { imgList: string[] }) => {
  return (
    <>
      <Physics gravity={[0, -10, 0]} allowSleep>
        {/* <Debug scale={1} color="black"> */}
        <PhyPlane
          color="yellow"
          position={[0, -2, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {/* </Debug> */}
        {imgList.map((imgUrl, index) => (
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
      {/* {imgList.map((imgUrl, index) => (
        <PlayerBall
          imgUrl={imgUrl}
          key={imgUrl}
          position={[(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 4, 0]}
        />
      ))} */}
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
  const colorMap = useLoader(THREE.TextureLoader, imgUrl);

  const meshRef = useRef<THREE.Mesh>(null!);

  // useFrame((state, delta) => {
  //   meshRef.current.rotation.x += delta;
  //   meshRef.current.rotation.y += delta;
  // });

  useEffect(() => {
    if (meshRef.current) meshRef.current.rotation.y = Math.PI * 1.5;
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => {
        api.applyImpulse([0, 10, 0], [0, 0, 0]);
      }}
    >
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
      <CustomBox position={[-1.2, 0, 0]} />
      <CustomBox position={[1.2, 0, 0]} />
    </Canvas>
  );
};

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
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "#2f74c0"} />
    </mesh>
  );
};
