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
  useSphere,
} from "@react-three/cannon";
import { Box, OrbitControls, Plane, Sphere, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useChannel } from "ably/react";
import { useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import BoundingBox from "./BoundingBox";

interface ShowTimeProps {
  players: Player[];
  isGameOn: boolean;
}

const rgbeLoader = new RGBELoader();

export default function ShowTime({ players, isGameOn }: ShowTimeProps) {
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
        onCreated={({ scene }) => {
          rgbeLoader.load(
            "/environmentMaps/wasteland_clouds_puresky_2k.hdr",
            (environmentMap) => {
              environmentMap.mapping = THREE.EquirectangularReflectionMapping;

              scene.background = environmentMap;
              scene.environment = environmentMap;
              console.log(environmentMap);
            }
          );
        }}
      >
        <Lights />
        <Scene players={players} isGameOn={isGameOn} />
        {showAxis.val && <axesHelper scale={2} args={[5]} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

const Scene = ({ players, isGameOn }: ShowTimeProps) => {
  const boundingBox = useControls("Show bounding box", {
    show: false,
  });
  return (
    <>
      <Physics broadphase="SAP" gravity={[0, -50, 0]} allowSleep>
        <PhyPlane
          color="lightblue"
          position={[0, 0, 0]}
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
        <SpringSurface
          visible={isGameOn}
          name="spring1"
          color="green"
          args={[25, 0.1, 15]}
          position={[0, 10, 20]}
          rotation={[-Math.PI / 8, 0, 0]}
        />
        <PhyLevelBox
          color="red"
          position={[0, 25, -30]}
          args={[40, 2, 30]}
          rotation={[0, 0, 0]}
          visible={isGameOn}
        />
        <SpringSurface
          visible={isGameOn}
          name="spring2"
          color="green"
          args={[25, 0.1, 15]}
          position={[0, 60, 30]}
          rotation={[-Math.PI / 8, 0, 0]}
        />
        <PhyLevelBox
          color="red"
          position={[0, 40, 20]}
          args={[40, 2, 25]}
          rotation={[0, 0, 0]}
          visible={isGameOn}
        />
        <PhyLevelBox
          color="red"
          position={[0, 65, -30]}
          args={[40, 2, 30]}
          rotation={[0, 0, 0]}
          visible={isGameOn}
        />
        <PhyLevelBox
          color="green"
          position={[0, 90, -80]}
          args={[40, 2, 60]}
          rotation={[0, 0, 0]}
          visible={isGameOn}
          name="final"
        />
        <BoundingBox visible={boundingBox.show} isActive={isGameOn} />
      </Physics>
      <ambientLight intensity={1} />
      <directionalLight />
    </>
  );
};

const SpringSurface = ({
  args = [25, 0.1, 15],
  position = [0, 10, 20],
  rotation = [-Math.PI / 8, 0, 0],
  visible,
  name,
  color = "green",
}: Pick<BoxProps, "args" | "position" | "rotation"> & {
  visible: boolean;
  color: string;
  name: string;
}) => {
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    mass: 0,
    position: position, // Position of the surface
    rotation,
    args: args, // A very thin box to act like a plane (width, height, depth)
  }));

  useEffect(() => {
    if (visible) {
      // Disable collision
      api.collisionFilterGroup.set(1);
      api.collisionFilterMask.set(1);
    } else {
      // Enable collision (reset to default group and mask)
      api.collisionFilterGroup.set(0);
      api.collisionFilterMask.set(0);
    }
  }, [api.collisionFilterGroup, api.collisionFilterMask, visible]);

  return (
    <Box ref={ref} name={name} visible={visible}>
      <boxGeometry args={[25, 0.1, 15]} />
      <meshStandardMaterial color={color} />
    </Box>
  );
};

const PhyLevelBox = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
  visible,
  color,
  name,
}: Pick<BoxProps, "args" | "position" | "rotation"> & {
  visible: boolean;
  color: string;
  name?: string;
}) => {
  const { publish } = useChannel(CHANNEL_NAME);
  const [changed, setChanged] = useState(false);

  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const [ref, api] = useBox(
    () => ({
      args: args,
      mass: 0,
      position,
      rotation,
      onCollide: (e) => {
        const boxPosition = e.body.position; // Position of the box
        const rectanglePosition = e.target.position; // Position of the rectangle

        // Assuming rectanglePosition.y is the center of the rectangle and rectangleHeight is its height
        const topOfRectangle = rectanglePosition.y + 2 / 2;

        // If the box is above or just near the top of the rectangle, it's a top collision
        if (e.contact.contactNormal[1] === -1) {
          console.log("Box hit the top of the rectangle!");
          const hitObject = e.contact.bi;
          const { name: playerName } = hitObject;
          console.log(`${playerName} hit!`);
          if (!changed) {
            matRef.current.color = new THREE.Color("blue");
            setChanged(true);
          }
          if (name === "final") {
            publish("winner", { playerId: playerName });
          }
        }
      },
    }),
    useRef<THREE.Mesh>(null)
  );

  useEffect(() => {
    if (visible) {
      // Disable collision
      api.collisionFilterGroup.set(1);
      api.collisionFilterMask.set(1);
    } else {
      // Enable collision (reset to default group and mask)
      api.collisionFilterGroup.set(0);
      api.collisionFilterMask.set(0);
    }
  }, [api.collisionFilterGroup, api.collisionFilterMask, visible]);

  return (
    <Box
      args={args}
      ref={ref}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
      visible={visible}
      name="level"
    >
      <meshStandardMaterial ref={matRef} color={color} />
    </Box>
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
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
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
  mass: number;
}

const PhyBox = (props: PhyBoxProps) => {
  const size = 2;
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    // args: [size, size, size],
    args: [size],
    allowSleep: true,
    angularDamping: 0.95,
    onCollide: (e) => {
      if (e.body.name === "spring1") {
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
        api.applyImpulse([0, 300, 0], [0, 0, 1]);
      }
      if (e.body.name === "spring2") {
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
        api.applyImpulse([0, 310, 0], [0, 0, 1]);
      }
    },
    ...props,
  }));
  const colorMap = props.imgUrl
    ? new THREE.TextureLoader().load(props.imgUrl)
    : new THREE.TextureLoader().load("/bugsbunny-square-1.png");
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const showTexture = useControls("Show texture", {
    val: false,
  });

  const { data } = usePlayerStore();

  useEffect(() => {
    const { jumpingPlayerId, direction } = data;
    if (jumpingPlayerId === props.id) {
      switch (direction) {
        case "left":
          api.applyImpulse([0, 0, 30 / 1], [0, 0, 0]);
          break;
        case "jump":
          api.applyImpulse([0, 40, 0], [0, 0, 0]);
          break;
        case "right":
          api.applyImpulse([0, 0, -30 / 1], [0, 0, 0]);
          break;
        case "up":
          api.applyImpulse([-30 / 1, 0, 0], [0, 0, 0]);
          break;
        case "down":
          api.applyImpulse([30 / 1, 0, 0], [0, 0, 0]);
          break;
        default:
          break;
      }
    }
  }, [api, data, props.id]);

  const targetRotation = new THREE.Euler(0, 0, 0);

  useChannel(CHANNEL_NAME, "respawn", (message) => {
    const { data: respawn } = message;
    const { playerId } = respawn;
    if (playerId === props.id) {
      console.log("respawn meee");
      ref.current?.lookAt(0, 30, 0);
      api.rotation.set(targetRotation.x, targetRotation.y, targetRotation.z);
      api.position.set(0, 20 + Math.random() * 5, 0);
    }
  });

  const maxAngularVelocity = 50;

  return (
    <>
      <Sphere
        // args={[size, size, size]}
        args={[size]}
        ref={ref}
        name={props.id}
        userData={{ color: props.color }}
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
        <Text
          scale={[0.5, 0.5, 0.5]}
          color="black"
          position={[1.2, 1.3, 0.1]}
          rotation={[0, Math.PI / 2, 0]}
        >
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
        )}
      </Sphere>
    </>
  );
};

const Lights = () => {
  const directionalCtl = useControls("Directional Light", {
    visible: false,
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
        color={new THREE.Color("white")}
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
