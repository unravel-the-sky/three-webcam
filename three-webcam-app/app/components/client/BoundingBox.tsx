import {
  BoxProps,
  Debug,
  PlaneProps,
  useBox,
  usePlane,
} from "@react-three/cannon";
import { Box } from "@react-three/drei";
import { MeshPhongMaterialProps } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { Mesh } from "three";
import * as THREE from "three";

const BoundingBox = ({
  visible,
  isActive,
}: {
  visible: boolean;
  isActive: boolean;
}) => {
  return (
    <>
      {/* <Debug color="black" scale={1.1}> */}
      <PhyWall
        position={[0, 60, -110]}
        args={[0.2, 340, 90]}
        rotation={[0, Math.PI / 2, 0]}
        visible={visible}
        isActive={isActive}
      />
      <PhyWall
        position={[-35, 60, -45]}
        args={[0.2, 340, 150]}
        rotation={[0, 0, 0]}
        visible={visible}
        isActive={isActive}
      />
      <PhyWall
        position={[0, 60, 30]}
        args={[0.2, 340, 90]}
        rotation={[0, Math.PI / 2, 0]}
        visible={visible}
        isActive={isActive}
      />
      <PhyWall
        position={[35, 60, -45]}
        args={[0.2, 340, 150]}
        rotation={[0, 0, 0]}
        visible={visible}
        isActive={isActive}
      />
      <PhyWall
        position={[5, 230, -35]}
        args={[0.2, 190, 90]}
        rotation={[0, Math.PI / 2, Math.PI / 2]}
        visible={visible}
        isActive={isActive}
      />
      {/* </Debug> */}
    </>
  );
};

type OurPlaneProps = Pick<MeshPhongMaterialProps, "color"> &
  Pick<PlaneProps, "position" | "rotation">;
const Plane = ({ color, position, ...props }: OurPlaneProps) => {
  const options = {
    x: { value: 0, min: -500, max: 500, step: 0.01 },
    y: { value: 260, min: -500, max: 500, step: 0.01 },
    z: { value: -20, min: -500, max: 500, step: 0.01 },
    visible: true,
    color: { value: "lime" },
  };

  const planePos = useControls("Plane2 positions", options);

  const [ref] = usePlane(
    () => ({
      ...props,
      position: [planePos.x, planePos.y, planePos.z],
      type: "Static",
      mass: 0,
    }),
    useRef<Mesh>(null)
  );
  return (
    <mesh
      ref={ref}
      receiveShadow
      position={[planePos.x, planePos.y, planePos.z]}
      visible={planePos.visible}
    >
      <planeGeometry args={[200, 200]} />
      <meshPhongMaterial color={color} />
    </mesh>
  );
};

const PhyWall = ({
  args = [1, 1, 1],
  position,
  rotation,
  visible,
  isActive,
}: Pick<BoxProps, "args" | "position" | "rotation"> & {
  visible?: boolean;
  isActive?: boolean;
}) => {
  const [ref, api] = useBox(
    () => ({
      args: args,
      mass: 0,
      position,
      rotation,
    }),
    useRef<THREE.Mesh>(null)
  );

  useEffect(() => {
    if (isActive) {
      // Disable collision
      api.collisionFilterGroup.set(1);
      api.collisionFilterMask.set(1);
    } else {
      // Enable collision (reset to default group and mask)
      api.collisionFilterGroup.set(0);
      api.collisionFilterMask.set(0);
    }
  }, [api.collisionFilterGroup, api.collisionFilterMask, isActive]);

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
      <meshNormalMaterial transparent opacity={0.5} />
    </Box>
  );
};

export default BoundingBox;
