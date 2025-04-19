import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const getRandomParticlePos = (particleCount: number) => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  };

  const getRandomVelocities = (particleCount: number) => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 0.001;
    }
    return arr;
  };

  const resizeRendererToDisplaySize = (renderer: THREE.WebGLRenderer) => {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setClearColor(new THREE.Color('#000000'));
    const scene = new THREE.Scene();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const fov = 75;
    const aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    const near = 1.5;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const particleCounts = [350, 1500];
    const geometrys = [
      new THREE.BufferGeometry(),
      new THREE.BufferGeometry(),
    ];
    geometrys[0].setAttribute(
      'position',
      new THREE.BufferAttribute(getRandomParticlePos(particleCounts[0]), 3)
    );
    geometrys[1].setAttribute(
      'position',
      new THREE.BufferAttribute(getRandomParticlePos(particleCounts[1]), 3)
    );

    const velocities = [
      getRandomVelocities(particleCounts[0]),
      getRandomVelocities(particleCounts[1]),
    ];

    const loader = new THREE.TextureLoader();
    const materials = [
      new THREE.PointsMaterial({
        size: 0.05,
        map: loader.load('https://raw.githubusercontent.com/Kuntal-Das/textures/main/sp1.png'),
        transparent: true,
        opacity: 1,
      }),
      new THREE.PointsMaterial({
        size: 0.075,
        map: loader.load('https://raw.githubusercontent.com/Kuntal-Das/textures/main/sp2.png'),
        transparent: true,
        opacity: 1,
      }),
    ];

    const starsT1 = new THREE.Points(geometrys[0], materials[0]);
    const starsT2 = new THREE.Points(geometrys[1], materials[1]);
    scene.add(starsT1, starsT2);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const animate = () => {
      time += 0.01;

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      starsT1.position.x = mouseX.current * 0.0001;
      starsT1.position.y = mouseY.current * -0.0001;
      starsT2.position.x = mouseX.current * 0.0001;
      starsT2.position.y = mouseY.current * -0.0001;

      for (let i = 0; i < 2; i++) {
        const positions = geometrys[i].attributes.position.array as Float32Array;
        for (let j = 0; j < positions.length; j += 3) {
          positions[j] += velocities[i][j];
          positions[j + 1] += velocities[i][j + 1];
          positions[j + 2] += velocities[i][j + 2];

          if (Math.abs(positions[j]) > 5) velocities[i][j] *= -1;
          if (Math.abs(positions[j + 1]) > 5) velocities[i][j + 1] *= -1;
          if (Math.abs(positions[j + 2]) > 5) velocities[i][j + 2] *= -1;
        }
        geometrys[i].attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute w-full h-full z-0"
      style={{ display: 'block' }}
    />
  );
};

export default StarField;
