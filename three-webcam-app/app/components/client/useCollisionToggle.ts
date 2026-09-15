import type { PublicApi } from "@react-three/cannon";
import { useEffect } from "react";

/**
 * Bodies toggle between collision group 1 (active) and 0 (ignored by everything),
 * so parts of the course can be switched off without unmounting them.
 */
export const useCollisionToggle = (api: PublicApi, active: boolean) => {
  useEffect(() => {
    const group = active ? 1 : 0;
    api.collisionFilterGroup.set(group);
    api.collisionFilterMask.set(group);
  }, [api, active]);
};
