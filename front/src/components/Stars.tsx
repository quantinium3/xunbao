import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function generateStarData(count: number) {
	const positions = new Float32Array(count * 3)
	const colors = new Float32Array(count * 3)
	const sizes = new Float32Array(count)
	const velocities = new Float32Array(count * 3)

	for (let i = 0; i < count; i++) {
		const i3 = i * 3

		const x = (Math.random() - 0.5) * 60
		const y = -30 + Math.random() * 60
		const z = (Math.random() - 0.5) * 30

		positions[i3] = x
		positions[i3 + 1] = y
		positions[i3 + 2] = z

		const temp = Math.random()
		if (temp > 0.9) {
			colors[i3] = 0.5 + Math.random() * 0.5
			colors[i3 + 1] = 0.7 + Math.random() * 0.3
			colors[i3 + 2] = 1.0
		} else if (temp > 0.75) {
			colors[i3] = 0.9 + Math.random() * 0.1
			colors[i3 + 1] = 0.9 + Math.random() * 0.1
			colors[i3 + 2] = 1.0
		} else if (temp > 0.6) {
			colors[i3] = 1.0
			colors[i3 + 1] = 0.8 + Math.random() * 0.2
			colors[i3 + 2] = 0.4 + Math.random() * 0.4
		} else if (temp > 0.45) {
			colors[i3] = 1.0
			colors[i3 + 1] = 0.5 + Math.random() * 0.3
			colors[i3 + 2] = 0.2 + Math.random() * 0.2
		} else if (temp > 0.3) {
			colors[i3] = 0.8 + Math.random() * 0.2
			colors[i3 + 1] = 0.3 + Math.random() * 0.3
			colors[i3 + 2] = 0.1 + Math.random() * 0.2
		} else {
			colors[i3] = 0.9 + Math.random() * 0.1
			colors[i3 + 1] = 0.2 + Math.random() * 0.2
			colors[i3 + 2] = 0.05 + Math.random() * 0.1
		}

		sizes[i] = Math.random() * 2 + 0.5

		velocities[i3] = (Math.random() - 0.5) * 0.03
		velocities[i3 + 1] = Math.random() * 0.04 + 0.02
		velocities[i3 + 2] = (Math.random() - 0.5) * 0.03
	}

	return { positions, colors, sizes, velocities }
}

function createStarTexture() {
	const canvas = document.createElement('canvas')
	canvas.width = 64
	canvas.height = 64
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Canvas context not available')

	const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
	gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
	gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)')
	gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

	ctx.fillStyle = gradient
	ctx.fillRect(0, 0, 64, 64)

	const texture = new THREE.CanvasTexture(canvas)
	return texture
}

export function Stars() {
	const meshRef = useRef<THREE.Points>(null)
	const count = 500

	const starData = generateStarData(count)
	const { positions, colors, sizes, velocities } = starData
	const velocitiesRef = useRef(velocities)

	useFrame(() => {
		if (!meshRef.current) return

		const posArray = meshRef.current.geometry.attributes.position.array

		for (let i = 0; i < count; i++) {
			const i3 = i * 3

			posArray[i3] += velocitiesRef.current[i3] + (Math.random() - 0.5) * 0.01
			posArray[i3 + 1] += velocitiesRef.current[i3 + 1]
			posArray[i3 + 2] += velocitiesRef.current[i3 + 2] + (Math.random() - 0.5) * 0.01

			if (posArray[i3 + 1] > 30) {
				posArray[i3 + 1] = -30
				posArray[i3] = (Math.random() - 0.5) * 60
				posArray[i3 + 2] = (Math.random() - 0.5) * 30
				velocitiesRef.current[i3] = (Math.random() - 0.5) * 0.03
				velocitiesRef.current[i3 + 2] = (Math.random() - 0.5) * 0.03
			}
		}

		meshRef.current.geometry.attributes.position.needsUpdate = true

		meshRef.current.rotation.z = -Math.PI / 6
	})

	return (
		<points ref={meshRef}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				<bufferAttribute attach="attributes-color" args={[colors, 3]} />
				<bufferAttribute attach="attributes-size" args={[sizes, 1]} />
			</bufferGeometry>
			<pointsMaterial
				size={0.3}
				vertexColors
				transparent
				opacity={0.8}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				map={createStarTexture()}
			/>
		</points>
	)
}