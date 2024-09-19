import { Player } from "@prisma/client";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const rgbeLoader = new RGBELoader();

export default function ShowTimeNew({
  players,
  isGameOn,
}: {
  players: Player[];
  isGameOn: boolean;
}) {
  return (
    <Canvas>
      <ambientLight intensity={0.25} />
      <pointLight intensity={1.75} position={[500, 500, 1000]} />

      <Box position={[70, 70, 0]} />
      <Box position={[-70, 70, 0]} />
      <Box position={[70, -70, 0]} />
      <Box position={[-70, -70, 0]} />

      <OrbitControls />

      {/* <OrthographicCamera
        makeDefault
        zoom={1}
        top={200}
        bottom={-200}
        left={200}
        right={-200}
        near={1}
        far={2000}
        position={[0, 0, 200]}
      /> */}
    </Canvas>
  );
}

const Box = (props: any) => {
  const boxRef = useRef();

  return (
    <mesh ref={boxRef} {...props}>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color={"red"} />
    </mesh>
  );
};
