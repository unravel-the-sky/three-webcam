// useEffect(() => {
  //   const { jumpingPlayerId, direction, stopPlayerId } = data;
  //   if (jumpingPlayerId === props.id) {
  //     console.log("immea moveee: ", direction);
  //     api.velocity.subscribe(([vx, vy, vz]) => {
  //       let newVelocity = [vx, vy, vz];

  //       switch (direction) {
  //         case "left":
  //           newVelocity = [0, vy, Math.min(maxSpeed, vz + 1)]; // Add velocity to move left, cap speed
  //           break;
  //         case "jump":
  //           newVelocity = [vx, Math.min(maxSpeed, vy + 1), vz]; // Add vertical velocity, cap jump speed
  //           break;
  //         case "right":
  //           newVelocity = [0, vy, Math.max(-maxSpeed, vz - 1)]; // Add velocity to move right, cap speed
  //           break;
  //         case "up":
  //           newVelocity = [Math.max(-maxSpeed, vx - 1), vy, vz]; // Add velocity to move forward, cap speed
  //           break;
  //         case "down":
  //           newVelocity = [Math.min(maxSpeed, vx + 1), vy, vz]; // Add velocity to move backward, cap speed
  //           break;
  //         default:
  //           break;
  //       }

  //       // Set the new capped velocity
  //       api.velocity.set(newVelocity[0], newVelocity[1], newVelocity[2]);
  //     });
  //   }

  //   if (stopPlayerId === props.id) {
  //     console.log("i shall stoppp ", props.id);
  //     // Reset both linear and angular velocity to zero
  //     api.velocity.set(0, 0, 0);
  //     api.angularVelocity.set(0, 0, 0);
  //     api.applyForce([0, 0, 0], [0, 0, 0]);
  //   }
  // }, [api, data, props.id]);




  // angular velocity stuff
  // useEffect(() => {
  //   // Subscribe to angular velocity updates
  //   const unsubscribe = api.angularVelocity.subscribe((angularVelocity) => {
  //     const [x, y, z] = angularVelocity;

  //     // Check if angular velocity exceeds the max limit
  //     const clampedX = Math.min(
  //       Math.max(x, -maxAngularVelocity),
  //       maxAngularVelocity
  //     );
  //     const clampedY = Math.min(
  //       Math.max(y, -maxAngularVelocity),
  //       maxAngularVelocity
  //     );
  //     const clampedZ = Math.min(
  //       Math.max(z, -maxAngularVelocity),
  //       maxAngularVelocity
  //     );

  //     // If the angular velocity exceeds the limit, clamp it
  //     if (x !== clampedX || y !== clampedY || z !== clampedZ) {
  //       api.angularVelocity.set(clampedX, clampedY, clampedZ);
  //     }
  //   });

  //   // Cleanup subscription when component unmounts
  //   return () => unsubscribe();
  // }, [api]);


  // angular damping
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
  


  // camera rotation
    // const { camera } = useThree(); // Access the camera from the scene
  // const cameraRef = useRef(camera); // Store the reference to the camera
  // const direction = new THREE.Vector3();
  // console.log("im rerendered");
  // camera.getWorldDirection(direction);
  // console.log(
  //   "camera: ",
  //   camera.position,
  //   " looking at: ",
  //   direction,
  //   " rotation: ",
  //   camera.rotation
  // );
  // const gameCameraPos = { x: 154, y: 104, z: -21 };
  // const gameCameraRot = { x: -1.41, y: 1.42, z: 1.41 };

  // useEffect(() => {
  //   if (isGameOn && cameraRef.current) {
  //     // cameraRef.current.position.lerp(gameCameraPos, 0.1);
  //     cameraRef.current.position.set(
  //       gameCameraPos.x,
  //       gameCameraPos.y,
  //       gameCameraPos.z
  //     );
  //     cameraRef.current.lookAt(-0.64, -0.39, 0.65);
  //     cameraRef.current.rotation.set(
  //       gameCameraRot.x,
  //       gameCameraRot.y,
  //       gameCameraRot.z
  //     );
  //   }
  // }, [isGameOn]);


//   the wall and floor
// const PhyWall = ({
//     args = [1, 1, 1],
//     position,
//     rotation,
//     visible,
//     isActive,
//   }: Pick<BoxProps, "args" | "position" | "rotation"> & {
//     visible?: boolean;
//     isActive?: boolean;
//   }) => {
//     const [ref, api] = useBox(
//       () => ({
//         args: args,
//         mass: 0,
//         position,
//         rotation,
//       }),
//       useRef<THREE.Mesh>(null)
//     );
  
//     useEffect(() => {
//       if (isActive) {
//         // Disable collision
//         api.collisionFilterGroup.set(1);
//         api.collisionFilterMask.set(1);
//       } else {
//         // Enable collision (reset to default group and mask)
//         api.collisionFilterGroup.set(0);
//         api.collisionFilterMask.set(0);
//       }
//     }, [api.collisionFilterGroup, api.collisionFilterMask, isActive]);
  
//     return (
//       <Box
//         args={args}
//         ref={ref}
//         position={position}
//         rotation={rotation}
//         receiveShadow
//         castShadow
//         visible={visible}
//       >
//         <meshNormalMaterial />
//       </Box>
//     );
//   };
  
//   const PhyWallFloor = ({
//     args = [1, 1, 1],
//     position,
//     rotation = [0, 0, 0],
//     visible,
//   }: Pick<BoxProps, "args" | "position" | "rotation"> & { visible: boolean }) => {
//     const { publish } = useChannel(CHANNEL_NAME);
//     const [announced, setAnnounced] = useState(false);
  
//     const [ref, api] = useBox(
//       () => ({
//         args: args,
//         mass: 0,
//         position,
//         rotation,
//         onCollide: (e) => {
//           const hitObject = e.contact.bi;
//           const { name } = hitObject;
//           console.log(`${name} won!`);
//           if (!announced) {
//             publish("winner", { playerId: name });
//             // setAnnounced(true);
//           }
//         },
//       }),
//       useRef<THREE.Mesh>(null)
//     );
  
//     return (
//       <Box
//         args={args}
//         ref={ref}
//         position={position}
//         rotation={rotation}
//         receiveShadow
//         castShadow
//         visible={visible}
//       >
//         <meshNormalMaterial />
//       </Box>
//     );
//   };


// jumping cooldown code
    // if (isCooldown || (direction === "jump" && jumpCount >= maxJumps)) {
    //   console.log("sorry bro cooldown a bit");
    //   setIsCooldown(true);
    //   return;
    // }

    // // Increment jump count
    // direction === "jump" && setJumpCount(jumpCount + 1);

    // // If maximum jump count is reached, trigger cooldown
    // if (jumpCount + 1 >= maxJumps && direction === "jump") {
    //   setIsCooldown(true);
    //   setTimeout(() => {
    //     setJumpCount(0); // Reset jump count after cooldown
    //     setIsCooldown(false);
    //   }, cooldownTime);
    // }


// Scene stuff
// const boxes = useMemo(() => {
//     const gap = 3;
//     const size = 4;
//     const dimension = 4;
//     const positions = [];
//     for (let x = 0; x < dimension; x++) {
//       for (let y = 0; y < dimension; y++) {
//         for (let z = 0; z < dimension; z++) {
//           positions.push([x * gap, y * gap, z * gap]);
//         }
//       }
//     }
//     return positions;
//   }, []);

//   const wall = useControls("the Wall", {
//     visible: false,
//   });
//   const boundary = useControls("Boundary box", {
//     visible: false,
//   });