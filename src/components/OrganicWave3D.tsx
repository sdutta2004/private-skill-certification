"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function OrganicWave3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 1. Organic Landscape Geometry (Wavy Silk Mesh)
    const gridX = 120;
    const gridY = 90;
    const planeGeo = new THREE.PlaneGeometry(24, 16, gridX, gridY);
    planeGeo.rotateX(-Math.PI / 2.3);
    planeGeo.translate(0, -2.2, 0);

    // Custom shader material for velvet organic lighting with specular rim edge
    const waveMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uColorDark: { value: new THREE.Color("#07060c") },
        uColorVelvet: { value: new THREE.Color("#18132f") },
        uColorEdge: { value: new THREE.Color("#7b52f7") },
        uColorHighlight: { value: new THREE.Color("#c4b5fd") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vElevation;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 transformed = position;

          // Multi-frequency wave calculation for natural organic silk motion
          float elevation = sin(transformed.x * 0.45 + uTime * 0.6) * cos(transformed.z * 0.35 + uTime * 0.4) * 1.35;
          elevation += sin(transformed.x * 0.9 - uTime * 0.5) * 0.4;
          elevation += cos(transformed.z * 0.8 + uTime * 0.45) * 0.3;
          transformed.y += elevation;

          vElevation = elevation;

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorDark;
        uniform vec3 uColorVelvet;
        uniform vec3 uColorEdge;
        uniform vec3 uColorHighlight;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying float vElevation;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          // Deep velvet base gradient according to elevation
          float t = clamp((vElevation + 1.2) / 2.5, 0.0, 1.0);
          vec3 baseColor = mix(uColorDark, uColorVelvet, t);

          // Specular rim lighting (grazing angles on wave ridges)
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.2);
          vec3 rim = mix(uColorEdge, uColorHighlight, fresnel * 0.6) * fresnel * 1.6;

          // Crest highlight
          float crest = smoothstep(0.7, 1.4, vElevation) * 0.35;
          vec3 finalColor = baseColor + rim + (uColorHighlight * crest);

          // Soft alpha blend at boundary
          float alpha = smoothstep(-2.2, -0.6, vElevation + 1.0) * 0.94;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      wireframe: false,
    });

    const waveMesh = new THREE.Mesh(planeGeo, waveMaterial);
    scene.add(waveMesh);

    // 2. Ambient Floating Star / Dust Particles
    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.2) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      particleScales[i] = Math.random() * 0.8 + 0.3;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("scale", new THREE.BufferAttribute(particleScales, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0xddd6fe,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 3. Mouse Parallax Motion
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      targetX = x * 0.45;
      targetY = y * 0.3;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 4. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // 5. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      waveMaterial.uniforms.uTime.value = elapsedTime;

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      camera.position.x = mouseX * 1.2;
      camera.position.y = 2.5 + mouseY * 0.6;
      camera.lookAt(0, 0, 0);

      // Slow particle drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(elapsedTime * 0.5 + i) * 0.002;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      planeGeo.dispose();
      waveMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
}
