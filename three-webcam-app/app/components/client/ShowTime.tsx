"use client";

import usePlayerStore from "@/app/store/playerStore";
import { Player } from "@prisma/client";
import { Physics, Triplet, useBox, usePlane } from "@react-three/cannon";
import { Box, OrbitControls, Plane, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface ShowTimeProps {
  players: Player[];
}

export default function ShowTime({ players }: ShowTimeProps) {
  const showAxis = useControls("Show axis helper", {
    val: false,
  });

  return (
    <div className="flex-1 bg-slate-200 h-full">
      <Canvas
        camera={{
          fov: 50,
          near: 0.1,
          far: 100,
          position: [20, 25, 20],
        }}
        className="h-full"
        shadows
        onCreated={({ scene }) =>
          (scene.background = new THREE.Color("lightblue"))
        }
      >
        <Lights />
        <Scene players={players} />
        {showAxis.val && <axesHelper scale={2} args={[5]} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// Scene component
// const radius = 12;
// const totalCount = 20;
const Scene = ({ players }: ShowTimeProps) => {
  // const radius = useControls("Shape radius", {
  //   val: 12,
  // });
  // const totalCount = useControls("Total number", {
  //   val: 20,
  // });

  const boxes = useMemo(() => {
    const gap = 2;
    const size = 1;
    const dimension = 4;
    const positions = [];
    for (let x = 0; x < dimension; x++) {
      for (let y = 0; y < dimension; y++) {
        for (let z = 0; z < dimension; z++) {
          positions.push([x * gap, y * gap + 5, z * gap]);
        }
      }
    }
    return positions;
  }, []);

  const groupRef = useRef<any>(null!);

  return (
    <>
      <Physics broadphase="SAP" gravity={[0, -50, 0]} allowSleep>
        <PhyPlane
          color="lightblue"
          position={[0, -2, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <group ref={groupRef}>
          {players.map(({ image, id, color, username }, index) => (
            <PhyBox
              imgUrl={image}
              id={id}
              color={color}
              key={id}
              username={username}
              position={[
                (Math.random() - 0.5) * 4,
                10 + (players.length - index) * 4,
                Math.random() - 0.5,
              ]}
              // position={boxes[index]}
              // position={[
              // circular here:
              // radius.val * Math.cos((index / totalCount.val) * Math.PI * 2),
              // Math.random() * 40,
              // radius.val * Math.sin((index / totalCount.val) * Math.PI * 2),
              // helt random here:
              // (Math.random() - 0.5) * 20,
              // Math.random() * 40,
              // (Math.random() - 0.5) * 10,
              // ]}
            />
          ))}
        </group>
      </Physics>
      <ambientLight intensity={1} />
      <directionalLight />
    </>
  );
};

// PhyPlane component
interface PhyPlaneProps {
  color: string;
  position?: Triplet;
  rotation?: Triplet;
}

const PhyPlane = ({ color, ...props }: PhyPlaneProps) => {
  const [ref] = usePlane<THREE.Mesh>(() => ({ ...props }));

  return (
    <Plane args={[1000, 1000]} ref={ref} receiveShadow>
      <meshStandardMaterial color={color} />
    </Plane>
  );
};

// PhyBox component
interface PhyBoxProps {
  imgUrl: string;
  position?: Triplet;
  color: string;
  id: string;
  username: string;
}

const PhyBox = (props: PhyBoxProps) => {
  const size = 2;
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    args: [size, size, size],
    mass: 3,
    allowSleep: true,
    ...props,
  }));
  const colorMap = props.imgUrl
    ? new THREE.TextureLoader().load(props.imgUrl)
    : new THREE.TextureLoader().load("/bugsbunny-square-1.png");
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const { data } = usePlayerStore();

  const showTexture = useControls("Show texture", {
    val: false,
  });

  useEffect(() => {
    if (data && data.imgList.length > 0) {
      if (data.imgList.includes(props.id)) {
        console.log("yello i shall jump! id: ", props.id);
        api.applyImpulse([(Math.random() - 0.5) * 10, 80, 0], [0, -1, 0]);
      }
    }
  }, [api, data, props.id]);

  return (
    <>
      <Box
        args={[size, size, size]}
        ref={ref}
        onClick={() => {
          api.applyImpulse(
            // [(Math.random() - 0.5) * 10, Math.random() * 50, 0],
            [10, 50, 0],
            [0, -1, 0]
          );
        }}
        receiveShadow
        castShadow
      >
        <Text scale={[0.5, 0.5, 0.5]} color="black" position={[0, 1.2, 1.1]}>
          {props.username}
        </Text>
        {showTexture.val ? (
          <meshPhongMaterial map={colorMap} />
        ) : (
          <meshStandardMaterial
            color={new THREE.Color(props.color)}
            roughness={0.3}
            metalness={0.1}
          />
          // <meshNormalMaterial />
        )}
      </Box>
    </>
  );
};

const Lights = () => {
  const directionalCtl = useControls("Directional Light", {
    visible: true,
    position: {
      x: 9.3,
      y: 7.0,
      z: 1.4,
    },
    castShadow: true,
  });

  const spotCtl = useControls("Spot Light", {
    visible: true,
    position: {
      x: -25,
      y: 45,
      z: 45,
    },
    castShadow: true,
  });

  return (
    <>
      <directionalLight
        visible={directionalCtl.visible}
        position={[
          directionalCtl.position.x,
          directionalCtl.position.y,
          directionalCtl.position.z,
        ]}
        castShadow={directionalCtl.castShadow}
      />
      <spotLight
        visible={spotCtl.visible}
        position={[spotCtl.position.x, spotCtl.position.y, spotCtl.position.z]}
        castShadow={spotCtl.castShadow}
        intensity={2 * Math.PI}
        angle={0.3}
        decay={0}
        penumbra={1}
      />
      <spotLight
        angle={0.3}
        castShadow
        decay={0}
        intensity={0.2 * Math.PI}
        penumbra={1}
        position={[10, 10, 10]}
      />
    </>
  );
};

// PlayerBall component
