'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Perlin noise implementation for natural movement
class PerlinNoise {
  private permutation: number[];

  constructor() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const n = Math.floor(Math.random() * (i + 1));
      [p[i], p[n]] = [p[n], p[i]];
    }
    this.permutation = [...p, ...p];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.permutation[X] + Y;
    const b = this.permutation[X + 1] + Y;

    return this.lerp(
      v,
      this.lerp(u, this.grad(this.permutation[a], x, y), this.grad(this.permutation[b], x - 1, y)),
      this.lerp(
        u,
        this.grad(this.permutation[a + 1], x, y - 1),
        this.grad(this.permutation[b + 1], x - 1, y - 1)
      )
    );
  }
}

type FireflyState = 'flying' | 'hovering' | 'resting' | 'dark';

interface FireflyParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  target: THREE.Vector3;
  speed: number;
  baseGlowIntensity: number;
  glowPhase: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  state: FireflyState;
  stateTimer: number;
  sprite?: THREE.Sprite;
  hue: number;
  size: number;
  darkTimer: number;
  blinkPattern: number;
}

export const Fireflies = ({ count = 4 }: { count?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<FireflyParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const noiseRef = useRef<PerlinNoise>(new PerlinNoise());

  useEffect(() => {
    if (!containerRef.current) {
      console.log('Container ref not available');
      return;
    }

    console.log('Initializing fireflies...');

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      1000
    );
    camera.position.z = 500;
    cameraRef.current = camera;
    console.log('Camera bounds:', -width / 2, width / 2, height / 2, -height / 2);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '1';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log('Renderer created and canvas added to DOM');
    console.log('Canvas element:', renderer.domElement);

    // Create realistic firefly glow texture
    const createGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;

      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 200, 1)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 150, 0.9)');
      gradient.addColorStop(0.6, 'rgba(255, 240, 100, 0.7)');
      gradient.addColorStop(0.8, 'rgba(255, 220, 50, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);

      return new THREE.CanvasTexture(canvas);
    };

    const glowTexture = createGlowTexture();
    console.log('Glow texture created');

    // Create firefly particles
    const particles: FireflyParticle[] = [];
    const noise = noiseRef.current;

    for (let i = 0; i < count; i++) {
      // Create sprite with glow texture
      const spriteMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);

      // Random starting position - centered coordinates
      const startX = (Math.random() - 0.5) * width;
      const startY = (Math.random() - 0.5) * height;
      const size = 5 + Math.random() * 10; // Much larger for visibility

      sprite.position.set(startX, startY, 0);
      sprite.scale.set(size, size, 1);
      scene.add(sprite);

      console.log(
        `Firefly ${i} created at (${startX.toFixed(0)}, ${startY.toFixed(0)}) size: ${size.toFixed(0)})`
      );

      const particle: FireflyParticle = {
        position: new THREE.Vector3(startX, startY, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        acceleration: new THREE.Vector3(0, 0, 0),
        target: new THREE.Vector3((Math.random() - 0.5) * width, (Math.random() - 0.5) * height, 0),
        speed: 0.15 + Math.random() * 0.25,
        baseGlowIntensity: 0.8 + Math.random() * 0.2, // Brighter
        glowPhase: Math.random() * Math.PI * 2,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        state: 'flying' as FireflyState,
        stateTimer: Math.random() * 3,
        sprite: sprite,
        hue: 50 + Math.random() * 10, // Yellow-green variation
        size: size,
        darkTimer: Math.random() * 3, // Random initial dark timer
        blinkPattern: Math.random(), // Each firefly has different blink pattern
      };

      particles.push(particle);
    }
    particlesRef.current = particles;
    console.log(`Created ${particles.length} fireflies`);

    // Animation loop with realistic behavior
    let time = 0;
    const animate = () => {
      time += 0.016;

      particles.forEach(particle => {
        // Update state timer
        particle.stateTimer -= 0.016;

        // State machine for realistic behavior
        if (particle.stateTimer <= 0) {
          const rand = Math.random();
          if (rand < 0.15) {
            particle.state = 'dark'; // Go dark (turn off light)
            particle.stateTimer = 3 + Math.random() * 4; // Dark for 3-7 seconds
          } else if (rand < 0.25) {
            particle.state = 'resting';
            particle.stateTimer = 1 + Math.random() * 3;
          } else if (rand < 0.4) {
            particle.state = 'hovering';
            particle.stateTimer = 0.5 + Math.random() * 2;
          } else {
            particle.state = 'flying';
            particle.stateTimer = 3 + Math.random() * 5;
          }
        }

        // Calculate distance to target
        const distToTarget = particle.position.distanceTo(particle.target);

        // Pick new target when close - ensure full page coverage
        if (distToTarget < 50) {
          const margin = 100;
          if (Math.random() < 0.2) {
            // Go off-screen
            const side = Math.floor(Math.random() * 4);
            const offsets = [
              [(Math.random() - 0.5) * width, height / 2 + margin], // top
              [width / 2 + margin, (Math.random() - 0.5) * height], // right
              [(Math.random() - 0.5) * width, -height / 2 - margin], // bottom
              [-width / 2 - margin, (Math.random() - 0.5) * height], // left
            ];
            particle.target.set(offsets[side][0], offsets[side][1], 0);
          } else {
            // Full page coverage - anywhere on screen
            particle.target.set(
              (Math.random() - 0.5) * (width - margin),
              (Math.random() - 0.5) * (height - margin),
              0
            );
          }
        }

        // Perlin noise for organic movement
        const noiseX = noise.noise(
          (particle.position.x + particle.noiseOffsetX) * 0.002,
          time * 0.5
        );
        const noiseY = noise.noise(
          (particle.position.y + particle.noiseOffsetY) * 0.002,
          time * 0.5 + 100
        );

        // Reset acceleration
        particle.acceleration.set(0, 0, 0);

        // Apply forces based on state
        if (particle.state === 'flying') {
          // Seek target
          const desired = particle.target.clone().sub(particle.position).normalize();
          desired.multiplyScalar(particle.speed);

          // Steering force
          const steer = desired.sub(particle.velocity);
          steer.clampLength(0, 0.05);
          particle.acceleration.add(steer);

          // Add noise for wandering
          particle.acceleration.add(new THREE.Vector3(noiseX * 0.3, noiseY * 0.3, 0));
        } else if (particle.state === 'hovering') {
          // Gentle floating motion
          particle.acceleration.add(
            new THREE.Vector3(
              noiseX * 0.15,
              noiseY * 0.15 + Math.sin(time * 2 + particle.glowPhase) * 0.05,
              0
            )
          );
          // Damping
          particle.velocity.multiplyScalar(0.95);
        } else if (particle.state === 'resting') {
          // Almost still with tiny movements
          particle.acceleration.add(new THREE.Vector3(noiseX * 0.05, noiseY * 0.05, 0));
          // Heavy damping
          particle.velocity.multiplyScalar(0.9);
        } else if (particle.state === 'dark') {
          // Continue moving when dark but slowly
          const desired = particle.target.clone().sub(particle.position).normalize();
          desired.multiplyScalar(particle.speed * 0.3); // Slower when dark

          const steer = desired.sub(particle.velocity);
          steer.clampLength(0, 0.02);
          particle.acceleration.add(steer);

          particle.acceleration.add(new THREE.Vector3(noiseX * 0.1, noiseY * 0.1, 0));
        }

        // Update velocity and position
        particle.velocity.add(particle.acceleration);
        particle.velocity.clampLength(0, particle.speed * 2);
        particle.position.add(particle.velocity);

        // Natural glow pulsing with breath-like rhythm
        particle.glowPhase += 0.015 + Math.sin(time * 0.5) * 0.005;

        // More complex glow pattern with dark state
        const breathe = Math.sin(particle.glowPhase) * 0.5 + 0.5;
        const flicker = 0.85 + Math.random() * 0.15;

        let stateMod;
        if (particle.state === 'dark') {
          stateMod = 0; // Completely dark
        } else if (particle.state === 'flying') {
          stateMod = 1;
        } else if (particle.state === 'hovering') {
          stateMod = 0.7;
        } else {
          stateMod = 0.4;
        }

        let glowIntensity = particle.baseGlowIntensity * breathe * flicker * stateMod;

        // Add occasional bright flash when coming out of dark state
        if (particle.state !== 'dark' && particle.stateTimer > particle.stateTimer - 0.1) {
          if (Math.random() < 0.02) {
            // 2% chance each frame
            glowIntensity *= 2; // Bright flash
          }
        }

        // Check if off-screen
        const isOffScreen =
          particle.position.x < -width / 2 - 200 ||
          particle.position.x > width / 2 + 200 ||
          particle.position.y < -height / 2 - 200 ||
          particle.position.y > height / 2 + 200;

        if (isOffScreen) glowIntensity *= 0.1;

        // Update sprite
        if (particle.sprite) {
          particle.sprite.position.copy(particle.position);

          if (particle.state === 'dark') {
            // Completely invisible - 100% dark
            particle.sprite.visible = false;
          } else {
            // Visible states
            particle.sprite.visible = true;

            const material = particle.sprite.material as THREE.SpriteMaterial;
            material.opacity = Math.max(0.2, glowIntensity);

            // Color variation - warmer when bright, cooler when dim
            const temp = 0.5 + Math.sin(time * 0.3 + particle.glowPhase) * 0.1;
            const intensity = glowIntensity;
            material.color.setRGB(1, 0.9 + intensity * 0.1, 0.6 + intensity * 0.2);

            // Scale pulsing
            const scale = particle.size * (0.8 + glowIntensity * 0.4);
            particle.sprite.scale.set(scale, scale, 1);
          }
        }
      });

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    console.log('Animation loop started');

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.top = newHeight / 2;
      camera.bottom = -newHeight / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particles.forEach(particle => {
        if (particle.sprite) {
          scene.remove(particle.sprite);
          (particle.sprite.material as THREE.SpriteMaterial).map?.dispose();
          (particle.sprite.material as THREE.SpriteMaterial).dispose();
        }
      });
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
      }}
    />
  );
};

export default Fireflies;
