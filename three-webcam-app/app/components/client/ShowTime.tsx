"use client";

import usePlayerStore from "@/app/store/playerStore";
import { CHANNEL_NAME } from "@/app/utils";
import type { Player } from "@/lib/generated/prisma/client";
import {
  Physics,
  useBox,
  usePlane,
  useSphere,
  type BoxProps,
  type PublicApi,
  type Triplet,
} from "@react-three/cannon";
import { Box, OrbitControls, Plane, Sphere, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useChannel } from "ably/react";
import { useControls } from "leva";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import type { JumpDirection } from "./AppWrapper";
import BoundingBox from "./BoundingBox";
import { useCollisionToggle } from "./useCollisionToggle";

interface ShowTimeProps {
  players: Player[];
  isGameOn: boolean;
}

const PLACEHOLDER_TEXTURE = "/bugsbunny-square-1.png";
const hdrLoader = new HDRLoader();

/**
 * The big-screen 3D scene. Every player is a physics-driven sphere textured with
 * their selfie; phone d-pad presses arrive over Ably and become impulses.
 * When the game is on, platforms and trampolines appear - first to land on the
 * top platform wins.
 */
export default function ShowTime({ players, isGameOn }: ShowTimeProps) {
  const showAxis = useControls("Show axis helper", { val: false });

  return (
    <div className="h-full flex-1 bg-slate-200">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 1000, position: [20, 25, 20] }}
        className="h-full"
        // three r186 removed PCFSoftShadowMap (fiber's default for `shadows`), so pick PCF explicitly.
        shadows="percentage"
        onCreated={({ scene }) => {
          hdrLoader.load("/environmentMaps/wasteland_clouds_puresky_2k.hdr", (envMap) => {
            envMap.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = envMap;
            scene.environment = envMap;
          });
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
  const boundingBox = useControls("Show bounding box", { show: false });

  return (
    <>
      <Physics broadphase="SAP" gravity={[0, -50, 0]} allowSleep>
        <PhyPlane color="lightblue" position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />

        {players.map(({ image, id, color, username }, index) => (
          <PlayerBall
            key={id}
            id={id}
            imgUrl={image}
            color={color}
            username={username}
            spawnHeight={10 + (players.length - index) * 4}
          />
        ))}

        {/* The course: trampolines (green) launch balls up to the red platforms. */}
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

type LevelProps = Pick<BoxProps, "args" | "position" | "rotation"> & {
  visible: boolean;
  color: string;
  name?: string;
};

/** A thin tilted box that catapults any ball touching it (see PlayerBall.onCollide). */
const SpringSurface = ({
  args = [25, 0.1, 15],
  position = [0, 10, 20],
  rotation = [-Math.PI / 8, 0, 0],
  visible,
  name,
  color = "green",
}: LevelProps) => {
  const [ref, api] = useBox<THREE.Mesh>(() => ({ mass: 0, position, rotation, args }));
  useCollisionToggle(api, visible);

  return (
    <Box ref={ref} name={name} visible={visible}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </Box>
  );
};

/** A static platform. Turns blue once any ball lands on top; the `final` one announces the winner. */
const PhyLevelBox = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
  visible,
  color,
  name,
}: LevelProps) => {
  const { publish } = useChannel(CHANNEL_NAME);
  const [changed, setChanged] = useState(false);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const [ref, api] = useBox(
    () => ({
      args,
      mass: 0,
      position,
      rotation,
      onCollide: (e) => {
        // Contact normal pointing straight down means the ball hit the top face.
        if (e.contact.contactNormal[1] !== -1) return;

        const { name: playerId } = e.contact.bi;
        if (!changed) {
          matRef.current.color = new THREE.Color("blue");
          setChanged(true);
        }
        if (name === "final") publish("winner", { playerId });
      },
    }),
    useRef<THREE.Mesh>(null),
  );
  useCollisionToggle(api, visible);

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

const PhyPlane = ({
  color,
  ...props
}: {
  color: string;
  position?: Triplet;
  rotation?: Triplet;
}) => {
  const [ref] = usePlane<THREE.Mesh>(() => ({ ...props }));

  return (
    <Plane args={[1000, 1000]} ref={ref} receiveShadow>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </Plane>
  );
};

interface PlayerBallProps {
  imgUrl: string;
  color: string;
  id: string;
  username: string;
  /** Balls are stacked at spawn so they don't overlap. */
  spawnHeight: number;
}

const BALL_RADIUS = 2;
const BALL_MASS = 5;
const LATERAL_IMPULSE = 40;
const JUMP_IMPULSE = 55;
const SPRING_IMPULSE: Record<string, number> = { spring1: 300, spring2: 310 };
const MOVE_IMPULSE: Record<JumpDirection, Triplet> = {
  left: [0, 0, LATERAL_IMPULSE],
  right: [0, 0, -LATERAL_IMPULSE],
  up: [-LATERAL_IMPULSE, 0, 0],
  down: [LATERAL_IMPULSE, 0, 0],
  jump: [0, JUMP_IMPULSE, 0],
};

const PlayerBall = (props: PlayerBallProps) => {
  // The collide callback is created before `api` exists; read it through a ref.
  const apiRef = useRef<PublicApi | null>(null);

  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    args: [BALL_RADIUS],
    mass: BALL_MASS,
    allowSleep: true,
    angularDamping: 0.95,
    position: [(Math.random() - 0.5) * 4, props.spawnHeight, Math.random() - 0.5],
    onCollide: (e) => {
      // Trampolines: kill current motion, then launch.
      const impulse = SPRING_IMPULSE[e.body.name];
      const api = apiRef.current;
      if (!impulse || !api) return;
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      api.applyImpulse([0, impulse, 0], [0, 0, 1]);
    },
  }));

  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const colorMap = useMemo(() => {
    const texture = new THREE.TextureLoader().load(props.imgUrl || PLACEHOLDER_TEXTURE);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [props.imgUrl]);

  const showTexture = useControls("Show texture", { val: true });

  // Phone d-pad → impulse. "up"/"down" are along x, "left"/"right" along z,
  // which matches the default camera looking in from [20, 25, 20].
  useEffect(
    () =>
      usePlayerStore.subscribe(({ data }) => {
        if (data.jumpingPlayerId !== props.id || !data.direction) return;
        api.applyImpulse(MOVE_IMPULSE[data.direction], [0, 0, 0]);
      }),
    [api, props.id],
  );

  useChannel(CHANNEL_NAME, "respawn", (message) => {
    if (message.data.playerId !== props.id) return;
    ref.current?.lookAt(0, 30, 0);
    api.rotation.set(0, 0, 0);
    api.position.set(0, 20 + Math.random() * 5, 0);
  });

  return (
    <Sphere
      args={[BALL_RADIUS]}
      ref={ref}
      name={props.id}
      userData={{ color: props.color }}
      onClick={() => api.applyImpulse([10, 50, 0], [0, -1, 0])}
      receiveShadow
      castShadow
    >
      {/* Text suspends while its font loads. Catch that here: if it bubbles up to the
          Canvas, React's dev StrictMode re-mount cycle loses the WebGL context. */}
      <Suspense fallback={null}>
        <Text
          scale={[0.5, 0.5, 0.5]}
          color="black"
          position={[1.2, 1.3, 0.1]}
          rotation={[0, Math.PI / 2, 0]}
        >
          {props.username}
        </Text>
      </Suspense>
      {showTexture.val ? (
        <meshPhongMaterial map={colorMap} />
      ) : (
        <meshStandardMaterial color={new THREE.Color(props.color)} roughness={0.3} metalness={0.1} />
      )}
    </Sphere>
  );
};

const Lights = () => {
  const directionalCtl = useControls("Directional Light", {
    visible: false,
    position: { x: 9.3, y: 7.0, z: 1.4 },
    castShadow: true,
  });

  const spotCtl = useControls("Spot Light", {
    visible: true,
    position: { x: -25, y: 45, z: 45 },
    castShadow: true,
  });

  return (
    <>
      <directionalLight
        visible={directionalCtl.visible}
        position={[directionalCtl.position.x, directionalCtl.position.y, directionalCtl.position.z]}
        castShadow={directionalCtl.castShadow}
      />
      <spotLight
        visible={spotCtl.visible}
        position={[spotCtl.position.x, spotCtl.position.y, spotCtl.position.z]}
        castShadow={spotCtl.castShadow}
        intensity={2 * Math.PI}
        angle={0.3}
        decay={0}
        color="white"
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
