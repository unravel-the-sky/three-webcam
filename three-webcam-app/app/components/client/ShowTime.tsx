"use client";

import usePlayerStore from "@/app/store/playerStore";
import { Player } from "@prisma/client";
import { Physics, Triplet, useBox, usePlane } from "@react-three/cannon";
import { Box, OrbitControls, Plane } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

interface ShowTimeProps {
  players: Player[];
}

export default function ShowTime({ players }: ShowTimeProps) {
  const data = useMemo(() => {
    return players.map((player) => ({ imageUrl: player.image, id: player.id }));
  }, [players]);

  return (
    <div className="flex-1 bg-slate-200 h-full">
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [0, 25, 15],
          rotation: [0, Math.PI * 0.5, 0],
        }}
        className="h-full"
        shadows
      >
        <Lights />
        <Scene data={data} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

// Scene component
// const radius = 12;
// const totalCount = 20;
const Scene = ({
  data,
}: {
  data: {
    imageUrl: string;
    id: string;
  }[];
}) => {
  const radius = useControls("Shape radius", {
    val: 12,
  });
  const totalCount = useControls("Total number", {
    val: 20,
  });

  return (
    <>
      <Physics gravity={[0, -10, 0]} allowSleep>
        <PhyPlane
          color="yellow"
          position={[0, -2, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {data.map(({ imageUrl, id }, index) => (
          <PhyBox
            imgUrl={imageUrl}
            id={id}
            key={id}
            position={[
              radius.val * Math.cos((index / totalCount.val) * Math.PI * 2),
              Math.random() * 40,
              radius.val * Math.sin((index / totalCount.val) * Math.PI * 2),
              // (Math.random() - 0.5) * 20,
              // Math.random() * 40,
              // (Math.random() - 0.5) * 10,
            ]}
          />
        ))}
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
  colorMap?: any;
  id: string;
}

const PhyBox = (props: PhyBoxProps) => {
  const [ref, api] = useBox<THREE.Mesh>(() => ({
    args: [2, 2, 2],
    mass: 1,
    ...props,
  }));
  const colorMap = new THREE.TextureLoader().load(props.imgUrl);
  colorMap.colorSpace = THREE.SRGBColorSpace;

  const { data } = usePlayerStore();

  useEffect(() => {
    if (data && data.imgList.length > 0) {
      if (data.imgList.includes(props.id)) {
        console.log("yello i shall jump! id: ", props.id);
        api.applyImpulse([0, Math.random() * 10, 0], [0, -1, 0]);
      }
    }
  }, [api, data, props.id]);

  return (
    <Box
      args={[2, 2, 2]}
      ref={ref}
      onClick={() => {
        api.applyImpulse(
          // [(Math.random() - 0.5) * 4, Math.random() * 10, 0],
          [0, Math.random() * 10, 0],
          [0, -1, 0]
        );
      }}
      receiveShadow
      castShadow
    >
      {/* <meshNormalMaterial /> */}
      {colorMap && <meshPhongMaterial map={colorMap} />}
    </Box>
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
    visible: false,
    position: {
      x: 3,
      y: 2.5,
      z: 1,
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
      />
    </>
  );
};

// PlayerBall component
