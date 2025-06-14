"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface SyringeModelProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setIsLoading: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  isRotating: boolean;
}

export default function SyringeModel({
  containerRef,
  canvasRef,
  setIsLoading,
  setLoadingProgress,
  isRotating
}: SyringeModelProps) {  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const syringeRef = useRef<THREE.Group | null>(null);
  const liquidRef = useRef<THREE.Mesh | null>(null);
  const liquidSurfaceRef = useRef<THREE.Mesh | null>(null);
  const bubblesRef = useRef<THREE.Mesh[]>([]);
    useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    // Set initial loading state
    setIsLoading(true);
    setLoadingProgress(10);
    
    // Initialize scene
    const init = () => {      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff); // Pure white to match the app's background
        // Force THREE.js to load completely
      THREE.Object3D.DEFAULT_UP.set(0, 1, 0);
      
      sceneRef.current = scene;
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(
        60,
        containerRef.current!.clientWidth / containerRef.current!.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;
        // Create renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: true,
        alpha: true,
        premultipliedAlpha: true, // Better blending with the page background
      });
      renderer.setSize(containerRef.current!.clientWidth, containerRef.current!.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0xffffff, 0); // Ensure transparent background matches the page
      rendererRef.current = renderer;
      
      // Create lighting
      setupLights(scene);
      
      // Create controls for user interaction
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 3;
      controls.maxDistance = 10;
      controls.enablePan = false;
      controlsRef.current = controls;
      
      // Create syringe model directly
      createSyringeModel(scene);
      
      // Handle window resize
      window.addEventListener("resize", handleResize);
    };
      // Setup lighting system for realistic rendering
    const setupLights = (scene: THREE.Scene) => {
      // Ambient light for overall illumination - increased for better visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      
      // Main key light - slightly warmer for better look
      const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.2);
      keyLight.position.set(5, 5, 5);
      keyLight.castShadow = true;
      scene.add(keyLight);
      
      // Fill light - cooler to create contrast
      const fillLight = new THREE.DirectionalLight(0xf0f8ff, 0.8);
      fillLight.position.set(-5, 0, 5);
      scene.add(fillLight);
      
      // Rim light for highlighting edges - stronger
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
      rimLight.position.set(0, 3, -5);
      scene.add(rimLight);
      
      // Additional soft light from bottom for better definition
      const bottomLight = new THREE.DirectionalLight(0xffffff, 0.3);
      bottomLight.position.set(0, -5, 2);
      scene.add(bottomLight);
    };
    
    // Create the syringe model directly in Three.js
    const createSyringeModel = (scene: THREE.Scene) => {
      const syringeGroup = new THREE.Group();
      syringeRef.current = syringeGroup;
      
      // Set loading progress for UI feedback
      setLoadingProgress(30);
      
      // Create syringe barrel (transparent)
      const barrelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 32);
      const barrelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf5f5f5,
        transparent: true,
        opacity: 0.8,
        metalness: 0.1,
        roughness: 0.2,
        clearcoat: 0.3,
        transmission: 0.95,
      });
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);      barrel.rotation.z = Math.PI / 2;
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      syringeGroup.add(barrel);
      
      // Add a second barrel layer to improve visibility
      const innerBarrelGeometry = new THREE.CylinderGeometry(0.29, 0.29, 2.4, 32);
      const innerBarrelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        metalness: 0.1,
        roughness: 0.2,
      });
      const innerBarrel = new THREE.Mesh(innerBarrelGeometry, innerBarrelMaterial);
      innerBarrel.rotation.z = Math.PI / 2;
      syringeGroup.add(innerBarrel);      
      setLoadingProgress(50);
      
      // Add VaxTrack text to the syringe
      const loader = new THREE.TextureLoader();
      // Create a canvas to draw the text
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      if (context) {
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        
      }
      
      // Create a texture from the canvas
      const texture = new THREE.CanvasTexture(canvas);
      
      // Create a plane to apply the texture
      const labelGeometry = new THREE.PlaneGeometry(1.2, 0.3);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      
      const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
      labelMesh.rotation.z = Math.PI / 2;
      labelMesh.rotation.y = Math.PI / 2;
      labelMesh.position.y = 0.31; // Position on top of the barrel
      syringeGroup.add(labelMesh);
      
      // Create interactive green liquid with enhanced visual effects - only half full
      const liquidGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.0, 32); // Half the height (1.0 instead of 2.0)
      const liquidMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00ff44, // Bright emerald green for the vaccine liquid
        transparent: true,
        opacity: 0.95, // Higher opacity to ensure visibility
        metalness: 0.0,
        roughness: 0.1,
        transmission: 0.1, // Less transmission to make it more opaque/visible
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        emissive: 0x00ff44, // Match the color for better visibility
        emissiveIntensity: 0.5, // Brighter glow
        side: THREE.DoubleSide, // Render both sides to improve visibility from all angles
      });
      const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
      liquid.rotation.z = Math.PI / 2;
      liquid.position.x = -0.4; // Start at the left side of the barrel (half full)
      liquid.castShadow = true;
      liquid.receiveShadow = true;
      syringeGroup.add(liquid);
      liquidRef.current = liquid;      // Add liquid surface effect (meniscus)
      const surfaceGeometry = new THREE.CircleGeometry(0.24, 32);
      const surfaceMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00ff44, // Brighter green matching the liquid
        transparent: true,
        opacity: 0.9,
        metalness: 0.1,
        roughness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        emissive: 0x00ff44, // Match the liquid color
        emissiveIntensity: 0.5, // Brighter glow
        side: THREE.DoubleSide, // Render both sides
      });
      const liquidSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
      liquidSurface.rotation.z = Math.PI / 2;
      liquidSurface.position.set(0.1, 0, 0); // Initial position for the surface
      syringeGroup.add(liquidSurface);
      liquidSurfaceRef.current = liquidSurface;
        // Add bubbles for more realistic liquid effect
      const bubblesArray: THREE.Mesh[] = [];
      for (let i = 0; i < 8; i++) {
        const bubbleGeometry = new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 8, 8);
        const bubbleMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x88ff88,
          transparent: true,
          opacity: 0.6,
          transmission: 0.9,
          roughness: 0.0,
        });
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        // Position bubbles within the left half of the syringe (half-full area)
        bubble.position.set(
          -0.4 + Math.random() * 0.8, // Constrain x to the liquid area
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        );
        syringeGroup.add(bubble);
        bubblesArray.push(bubble);
      }
      bubblesRef.current = bubblesArray;
      
      setLoadingProgress(70);
      
      // Create plunger
      const plungerGroup = new THREE.Group();
      
      // Plunger head
      const plungerHeadGeometry = new THREE.CylinderGeometry(0.29, 0.29, 0.2, 32);
      const plungerMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.5,
      });
      const plungerHead = new THREE.Mesh(plungerHeadGeometry, plungerMaterial);
      plungerHead.rotation.z = Math.PI / 2;
      plungerHead.position.x = -1;
      plungerGroup.add(plungerHead);
      
      // Plunger rod
      const rodGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 16);
      const rodMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.3,
      });
      const rod = new THREE.Mesh(rodGeometry, rodMaterial);
      rod.rotation.z = Math.PI / 2;
      rod.position.x = -1.7;
      plungerGroup.add(rod);
      
      syringeGroup.add(plungerGroup);
      
      setLoadingProgress(85);
      
      // Create needle
      const needleGeometry = new THREE.CylinderGeometry(0.03, 0.01, 1.5, 16);
      const needleMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.8,
        roughness: 0.2,
      });
      const needle = new THREE.Mesh(needleGeometry, needleMaterial);
      needle.rotation.z = Math.PI / 2;
      needle.position.x = 1.9;
      syringeGroup.add(needle);
      
      // Finger grips
      const gripGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.2);
      const gripMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
      });
      
      const topGrip = new THREE.Mesh(gripGeometry, gripMaterial);
      topGrip.position.set(-0.9, 0.4, 0);
      syringeGroup.add(topGrip);
      
      const bottomGrip = new THREE.Mesh(gripGeometry, gripMaterial);
      bottomGrip.position.set(-0.9, -0.4, 0);
      syringeGroup.add(bottomGrip);
      
      setLoadingProgress(100);
        // Position the entire syringe with a more interesting tilt
      syringeGroup.rotation.y = Math.PI / 4; // More tilted y-axis rotation
      syringeGroup.rotation.z = Math.PI / 24; // Slight tilt on the z-axis for better perspective
      scene.add(syringeGroup);
      
      // Set loading complete
      setIsLoading(false);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      requestAnimationFrame(animate);
      
      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }
        // Animate the green liquid (subtle pulsing effect)
      if (liquidRef.current) {
        const time = Date.now() * 0.001;
        const scaleFactor = 1.0 + Math.sin(time) * 0.02;
        liquidRef.current.scale.y = scaleFactor;
        liquidRef.current.scale.z = scaleFactor;
        
        // Animate bubbles rising
        bubblesRef.current.forEach((bubble, index) => {
          // Apply oscillating movement to bubbles
          const bubbleSpeed = 0.001 * (1 + index % 3);
          bubble.position.y += Math.sin(time * 2 + index) * bubbleSpeed;
          bubble.position.x += Math.cos(time + index * 0.7) * bubbleSpeed * 0.5;
          
          // Reset bubbles that go out of bounds
          if (bubble.position.y > 0.25) {
            bubble.position.y = -0.25;
          }
        });
      }
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    // Initialize the scene
    init();
    
    // Start animation loop
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      if (sceneRef.current) sceneRef.current.clear();
    };
  }, [containerRef, canvasRef, setIsLoading, setLoadingProgress]);
  // Rotate model when isRotating is true
  useEffect(() => {
    const modelRotationInterval = setInterval(() => {
      if (isRotating && syringeRef.current) {
        syringeRef.current.rotation.y += 0.005;
      }
    }, 16);
    
    return () => clearInterval(modelRotationInterval);
  }, [isRotating]);
  // Handle gravity effect on the liquid
  useEffect(() => {
    // Create a vector to represent gravity direction
    const gravityDirection = new THREE.Vector3(0, -1, 0);
    
    // Force initial gravity effect to be visible
    const applyInitialGravityEffect = () => {
      if (liquidRef.current && liquidSurfaceRef.current && syringeRef.current) {
        // Set initial gravity effect (liquid at half-barrel position)
        liquidRef.current.position.x = -0.4;
        liquidSurfaceRef.current.position.x = 0.1;
        
        // Make sure liquid is visible initially
        const liquidMaterial = liquidRef.current.material as THREE.MeshPhysicalMaterial;
        liquidMaterial.opacity = 0.95;
        liquidMaterial.emissiveIntensity = 0.5;
        
        // Move bubbles to visible positions
        bubblesRef.current.forEach(bubble => {
          bubble.position.x = -0.4 + Math.random() * 0.8;
        });
      }
    };
    
    // Call immediately to ensure initial rendering is correct
    applyInitialGravityEffect();
    
    // Track device orientation for mobile devices
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (!syringeRef.current || !liquidRef.current || !liquidSurfaceRef.current) return;
      
      // Convert device orientation to radians
      const beta = event.beta ? (event.beta * Math.PI) / 180 : 0; // X-axis rotation (tilt front/back)
      const gamma = event.gamma ? (event.gamma * Math.PI) / 180 : 0; // Y-axis rotation (tilt left/right)
      
      // Update gravity direction based on device orientation - with stronger effect
      gravityDirection.set(
        Math.sin(gamma) * 1.5, 
        -Math.cos(gamma) * Math.cos(beta) * 1.5, 
        -Math.cos(gamma) * Math.sin(beta) * 1.5
      );
      gravityDirection.normalize(); // Ensure unit vector
      
      // Get the syringe's local axes
      const syringeRight = new THREE.Vector3(1, 0, 0).applyQuaternion(syringeRef.current.quaternion);
      const syringeUp = new THREE.Vector3(0, 1, 0).applyQuaternion(syringeRef.current.quaternion);
      const syringeForward = new THREE.Vector3(0, 0, 1).applyQuaternion(syringeRef.current.quaternion);
      
      // Calculate gravity projection on the syringe's x-axis (along the barrel)
      const gravityAlongBarrel = gravityDirection.dot(syringeRight);
      
      // Calculate how much the liquid should move along the barrel - with exaggerated effect
      const maxOffset = 1.2; // Maximum liquid movement distance (increased for visibility)
      const currentOffset = Math.max(-maxOffset, Math.min(maxOffset, gravityAlongBarrel * maxOffset));
      
      // Adjust liquid position with smoother transition
      liquidRef.current.position.x = THREE.MathUtils.lerp(
        liquidRef.current.position.x, 
        -0.4 + currentOffset, 
        0.1
      );
      
      // Adjust liquid surface position
      liquidSurfaceRef.current.position.x = THREE.MathUtils.lerp(
        liquidSurfaceRef.current.position.x,
        0.1 + currentOffset,
        0.1
      );
      
      // Tilt the liquid surface based on gravity angle - with exaggerated effect
      const tiltAngle = Math.atan2(
        gravityDirection.dot(syringeUp) * 1.5,
        gravityDirection.dot(syringeForward) * 1.5
      );
      
      // Move bubbles based on gravity
      bubblesRef.current.forEach(bubble => {
        // Slowly move bubbles in the opposite direction of gravity
        const bubbleVector = new THREE.Vector3().copy(bubble.position);
        bubbleVector.addScaledVector(gravityDirection, -0.01);
        
        // Keep bubbles within the liquid area
        bubble.position.x = Math.max(-0.8, Math.min(0.8, bubbleVector.x));
        bubble.position.y = Math.max(-0.2, Math.min(0.2, bubbleVector.y));
        bubble.position.z = Math.max(-0.2, Math.min(0.2, bubbleVector.z));
      });
    };
    
    // Use window.DeviceOrientationEvent type assertion for TypeScript
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS 13+ requires permission
      const requestPermission = async () => {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        } catch (error) {
          console.error("Error requesting device orientation permission:", error);
          // Fallback to manual simulation for iOS devices that denied permission
          simulateGravityEffect();
        }
      };
      
      // Request permission when user interacts with the model
      containerRef.current?.addEventListener('click', requestPermission, { once: true });
    } else if (window.DeviceOrientationEvent) {
      // Standard implementation for other devices
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    } else {
      // Fallback for unsupported devices
      simulateGravityEffect();
    }
      // Function to simulate gravity effect with the model rotation
    function simulateGravityEffect() {
      // Apply initial gravity effect even if no device orientation
      applyInitialGravityEffect();
      
      const simulationInterval = setInterval(() => {
        if (!syringeRef.current || !liquidRef.current || !liquidSurfaceRef.current) return;
        
        // Get the rotation of the syringe
        const rotation = new THREE.Euler().copy(syringeRef.current.rotation);
        
        // Calculate gravity direction based on model rotation
        const gravityDirection = new THREE.Vector3(0, -1, 0);
        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(rotation);
        gravityDirection.applyMatrix4(rotationMatrix);
        
        // Exaggerate gravity effect for better visibility
        gravityDirection.multiplyScalar(1.5);
        gravityDirection.normalize();
        
        // Calculate gravity along the barrel (x-axis of syringe)
        const syringeRight = new THREE.Vector3(1, 0, 0).applyQuaternion(syringeRef.current.quaternion);
        const gravityAlongBarrel = gravityDirection.dot(syringeRight);
        
        // Move the liquid based on gravity with exaggerated effect
        const maxOffset = 1.2; // Increased for visibility
        const currentOffset = Math.max(-maxOffset, Math.min(maxOffset, gravityAlongBarrel * maxOffset));
        
        // Adjust liquid and surface positions with smooth transition
        liquidRef.current.position.x = THREE.MathUtils.lerp(
          liquidRef.current.position.x,
          -0.4 + currentOffset,
          0.1
        );
        liquidSurfaceRef.current.position.x = THREE.MathUtils.lerp(
          liquidSurfaceRef.current.position.x,
          0.1 + currentOffset,
          0.1
        );
        
        // Tilt the liquid surface
        const syringeUp = new THREE.Vector3(0, 1, 0).applyQuaternion(syringeRef.current.quaternion);
        const syringeForward = new THREE.Vector3(0, 0, 1).applyQuaternion(syringeRef.current.quaternion);
        const tiltAngle = Math.atan2(
          gravityDirection.dot(syringeUp),
          gravityDirection.dot(syringeForward)
        );
        liquidSurfaceRef.current.rotation.y = tiltAngle;
        
        // Move bubbles
        bubblesRef.current.forEach(bubble => {
          // Bubbles rise in the opposite direction of gravity
          const bubbleVector = new THREE.Vector3().copy(bubble.position);
          bubbleVector.addScaledVector(gravityDirection, -0.01);
          
          // Keep bubbles within liquid bounds
          bubble.position.x = Math.max(-0.8, Math.min(0.8, bubbleVector.x));
          bubble.position.y = Math.max(-0.2, Math.min(0.2, bubbleVector.y));
          bubble.position.z = Math.max(-0.2, Math.min(0.2, bubbleVector.z));
        });
      }, 16);
      
      return () => clearInterval(simulationInterval);
    }
    
    // Setup the simulation as a fallback
    const simulationCleanup = simulateGravityEffect();
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (simulationCleanup) simulationCleanup();
    };
  }, [containerRef]);

  return null; // This component doesn't render anything directly
}