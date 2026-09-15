import { useBox, type BoxProps } from "@react-three/cannon";
import { Box } from "@react-three/drei";
import { useRef } from "react";
import type * as THREE from "three";
import { useCollisionToggle } from "./useCollisionToggle";

/** Invisible walls around the course so balls can't be knocked off the map once the game is on. */
const BoundingBox = ({ visible, isActive }: { visible: boolean; isActive: boolean }) => (
  <>
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
  </>
);

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
    () => ({ args, mass: 0, position, rotation }),
    useRef<THREE.Mesh>(null),
  );
  useCollisionToggle(api, Boolean(isActive));

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
