"use client";

import usePlayerStore from "@/app/store/playerStore";
import { CHANNEL_NAME } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import {
  BoxProps,
  Physics,
  Triplet,
  useBox,
  usePlane,
} from "@react-three/cannon";
import { Box, OrbitControls, Plane, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useChannel } from "ably/react";
import { useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

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
const Scene = ({ players, isGameOn }: ShowTimeProps) => {
  const boxes = useMemo(() => {
    const gap = 3;
    const size = 4;
    const dimension = 4;
    const positions = [];
    for (let x = 0; x < dimension; x++) {
      for (let y = 0; y < dimension; y++) {
        for (let z = 0; z < dimension; z++) {
          positions.push([x * gap, y * gap, z * gap]);
        }
      }
    }
    return positions;
  }, []);

  const wall = useControls("the Wall", {
    visible: false,
  });
  const boundary = useControls("Boundary box", {
    visible: false,
  });

  const { camera } = useThree(); // Access the camera from the scene
  const cameraRef = useRef(camera); // Store the reference to the camera
  const direction = new THREE.Vector3();
  console.log("im rerendered");
  camera.getWorldDirection(direction);
  console.log(
    "camera: ",
    camera.position,
    " looking at: ",
    direction,
    " rotation: ",
    camera.rotation
  );
  const gameCameraPos = { x: 154, y: 104, z: -21 };
  const gameCameraRot = { x: -1.41, y: 1.42, z: 1.41 };

  useEffect(() => {
    if (isGameOn && cameraRef.current) {
      // cameraRef.current.position.lerp(gameCameraPos, 0.1);
      cameraRef.current.position.set(
        gameCameraPos.x,
        gameCameraPos.y,
        gameCameraPos.z
      );
      cameraRef.current.lookAt(-0.94, -0.32, 0.0138);
      cameraRef.current.rotation.set(
        gameCameraRot.x,
        gameCameraRot.y,
        gameCameraRot.z
      );
    }
  }, [isGameOn]);

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
            // position={boxes[index]}
            position={[
              (Math.random() - 0.5) * 4,
              10 + (players.length - index) * 4,
              Math.random() - 0.5,
            ]}
          />
        ))}

        <PhyLevelBox
          color="red"
          position={[0, 25, -30]}
          args={[40, 2, 30]}
          rotation={[0, 0, 0]}
          visible={wall.visible}
        />
        <PhyLevelBox
          color="red"
          position={[0, 45, 30]}
          args={[40, 2, 30]}
          rotation={[0, 0, 0]}
          visible={wall.visible}
        />
        <PhyLevelBox
          color="red"
          position={[0, 65, -30]}
          args={[40, 2, 30]}
          rotation={[0, 0, 0]}
          visible={wall.visible}
        />
        <PhyLevelBox
          color="green"
          position={[0, 90, -80]}
          args={[40, 2, 60]}
          rotation={[0, 0, 0]}
          visible={wall.visible}
        />
      </Physics>
      <ambientLight intensity={1} />
      <directionalLight />
    </>
  );
};

const PhyLevelBox = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
  visible,
  color,
}: Pick<BoxProps, "args" | "position" | "rotation"> & {
  visible: boolean;
  color: string;
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
        if (true) {
          console.log("Box hit the top of the rectangle!");
          const hitObject = e.contact.bi;
          const { name } = hitObject;
          console.log(`${name} hit!`);
          if (!changed) {
            matRef.current.color = new THREE.Color("blue");
            setChanged(true);
          }
        }
      },
    }),
    useRef<THREE.Mesh>(null)
  );

  return (
    <Box
      args={args}
      ref={ref}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
      visible={visible}
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
      <meshStandardMaterial color={color} />
    </Plane>
  );
};

const PhyWall = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
  visible,
}: Pick<BoxProps, "args" | "position" | "rotation"> & { visible: boolean }) => {
  const [ref, api] = useBox(
    () => ({
      args: args,
      mass: 0,
      position,
      rotation,
    }),
    useRef<THREE.Mesh>(null)
  );

  return (
    <Box
      args={args}
      ref={ref}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
      visible={visible}
    >
      <meshNormalMaterial />
    </Box>
  );
};

const PhyWallFloor = ({
  args = [1, 1, 1],
  position,
  rotation = [0, 0, 0],
  visible,
}: Pick<BoxProps, "args" | "position" | "rotation"> & { visible: boolean }) => {
  const { publish } = useChannel(CHANNEL_NAME);
  const [announced, setAnnounced] = useState(false);

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
        if (!announced) {
          publish("winner", { playerId: name });
          setAnnounced(true);
        }
      },
    }),
    useRef<THREE.Mesh>(null)
  );

  return (
    <Box
      args={args}
      ref={ref}
      position={position}
      rotation={rotation}
      receiveShadow
      castShadow
      visible={visible}
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
    angularDamping: 0.95,
    ...props,
  }));
  const colorMap = props.imgUrl
    ? new THREE.TextureLoader().load(props.imgUrl)
    : new THREE.TextureLoader().load("/bugsbunny-square-1.png");
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const showTexture = useControls("Show texture", {
    val: false,
  });

  // const [reset, setReset] = useState(false);
  // const targetRotation = new THREE.Euler(0, 0, 0);
  // const lerpFactor = 0.95;

  // useFrame((state) => {
  //   // ref.current?.lookAt(0, 20, 0);
  //   if (reset && ref.current) {
  //     const currentRotation = ref.current.rotation;
  //     currentRotation.x = THREE.MathUtils.lerp(
  //       currentRotation.x,
  //       targetRotation.x,
  //       lerpFactor
  //     );
  //     currentRotation.y = THREE.MathUtils.lerp(
  //       currentRotation.y,
  //       targetRotation.y,
  //       lerpFactor
  //     );
  //     currentRotation.z = THREE.MathUtils.lerp(
  //       currentRotation.z,
  //       targetRotation.z,
  //       lerpFactor
  //     );

  //     api.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);

  //     api.velocity.set(0, 0, 0);
  //     api.angularVelocity.set(0, 0, 0);
  //   }
  // });

  const { data } = usePlayerStore();
  useEffect(() => {
    const { jumpingPlayerId, direction } = data;
    if (jumpingPlayerId === props.id) {
      switch (direction) {
        case "left":
          api.applyImpulse([0, 10, 30], [0, 0, 0]);
          // api.angularVelocity.set(0, 0, 0);
          break;
        case "jump":
          api.applyImpulse([0, 70, 0], [0, 0, 0]);
          break;
        case "right":
          api.applyImpulse([0, 10, -30], [0, 0, 0]);
          // api.angularVelocity.set(0, 0, 0);
          break;
        case "up":
          api.applyImpulse([-30, 10, 0], [0, 0, 0]);
          // api.angularVelocity.set(0, 0, 0);
          break;
        case "down":
          api.applyImpulse([30, 10, 0], [0, 0, 0]);
          // api.angularVelocity.set(0, 0, 0);
          break;
        default:
          break;
      }
    }
  }, [api, data, props.id]);

  return (
    <>
      <Box
        args={[size, size, size]}
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
          position={[1, 1.3, 0.1]}
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

const BoundingBox = () => {
  return (
    <group name="boundaries" position={[0, 0, 40]} visible={false}>
      <PhyWall
        position={[0, 10, -90]}
        args={[0.2, 190, 90]}
        rotation={[0, Math.PI / 2, 0]}
        visible={true}
      />
      <PhyWall
        position={[-45, 10, -45]}
        args={[0.2, 190, 90]}
        rotation={[0, 0, 0]}
        visible={true}
      />
      <PhyWall
        position={[0, 10, 30]}
        args={[0.2, 190, 90]}
        rotation={[0, Math.PI / 2, 0]}
        visible={true}
      />
      <PhyWall
        position={[45, 10, -45]}
        args={[0.2, 190, 90]}
        rotation={[0, 0, 0]}
        visible={true}
      />
    </group>
  );
};
