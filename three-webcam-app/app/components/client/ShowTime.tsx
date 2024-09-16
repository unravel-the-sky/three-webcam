"use client";

import usePlayerStore from "@/app/store/playerStore";
import { CHANNEL_NAME } from "@/app/utils";
import { Player } from "@prisma/client";
import {
  BoxProps,
  Physics,
  Triplet,
  useBox,
  usePlane,
} from "@react-three/cannon";
import { Box, OrbitControls, Plane, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useChannel } from "ably/react";
import { useControls } from "leva";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { JumpDirection } from "./AppWrapper";

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
          fov: 45,
          near: 0.1,
          far: 1000,
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
// const radius = useControls("Shape radius", {
//   val: 12,
// });
// const totalCount = useControls("Total number", {
//   val: 20,
// });
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
const Scene = ({ players }: ShowTimeProps) => {
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

  return (
    <>
      <Physics broadphase="SAP" gravity={[0, -50, 0]} allowSleep>
        <PhyPlane
          color="lightblue"
          position={[0, -2, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {players.map(({ image, id, color, username }, index) => (
          <PhyBox
            imgUrl={image}
            id={id}
            color={color}
            key={id}
            username={username}
            mass={5}
            position={[
              (Math.random() - 0.5) * 4,
              10 + (players.length - index) * 4,
              Math.random() - 0.5,
            ]}
          />
        ))}
        <PhyWall
          position={[2, 10, -20]}
          args={[1, 30, 90]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <PhyWallFloor
          position={[0, -1, -65]}
          args={[1, 90, 90]}
          rotation={[0, 0, Math.PI / 2]}
        />
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

const PhyWall = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
}: Pick<BoxProps, "args" | "position" | "rotation">) => {
  const [ref, api] = useBox(
    () => ({
      args: args,
      mass: 0,
      position,
      rotation,
    }),
    useRef<THREE.Mesh>(null)
  );

  const wall = useControls("the Wall", {
    visible: false,
  });

  return (
    <Box
      args={args}
      ref={ref}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
      visible={wall.visible}
    >
      <meshNormalMaterial />
    </Box>
  );
};

const PhyWallFloor = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
}: Pick<BoxProps, "args" | "position" | "rotation">) => {
  const [ref, api] = useBox(
    () => ({
      args: args,
      mass: 0,
      position,
      rotation,
      onCollide: (e) => {
        const hitObject = e.contact.bi;
        const { name } = hitObject;
        console.log(`${name} won!`);
      },
    }),
    useRef<THREE.Mesh>(null)
  );

  const wall = useControls("the Wall", {
    visible: false,
  });

  return (
    <Box
      args={args}
      ref={ref}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
      visible={wall.visible}
    >
      <meshNormalMaterial />
    </Box>
  );
};

// PhyBox component
interface PhyBoxProps {
  imgUrl: string;
  position?: Triplet;
  color: string;
  id: string;
  username: string;
  mass: number;
}

const PhyBox = (props: PhyBoxProps) => {
  const size = 2;
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    args: [size, size, size],
    allowSleep: true,
    ...props,
  }));
  const colorMap = props.imgUrl
    ? new THREE.TextureLoader().load(props.imgUrl)
    : new THREE.TextureLoader().load("/bugsbunny-square-1.png");
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const showTexture = useControls("Show texture", {
    val: false,
  });

  const { channel } = useChannel(CHANNEL_NAME, "jump", (message) => {
    console.log("msg: ", message);
    const { data: jumpData } = message;
    const { playerId } = jumpData;
    const direction = jumpData.direction as JumpDirection;

    if (playerId === props.id) {
      switch (direction) {
        case "left":
          api.applyImpulse([0, 0, 30], [0, 0, 0]);
          return;
        case "up":
          api.applyImpulse([0, 65, 0], [0, 0, 0]);
          return;
        case "right":
          api.applyImpulse([0, 0, -30], [0, 0, 0]);
          return;
        default:
          return;
      }
    }
  });

  return (
    <>
      <Box
        args={[size, size, size]}
        ref={ref}
        name={props.id}
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
