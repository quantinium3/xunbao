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

		const r = Math.pow(Math.random(), 0.5)
		const radius = 10 + 90 * r
		const theta = Math.random() * Math.PI * 2
		const phi = Math.acos(Math.random() * 2 - 1)

		positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
		positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
		positions[i3 + 2] = radius * Math.cos(phi)

		const temp = Math.random()
		if (temp > 0.9) {
			// Blue giants (hot stars)
			colors[i3] = 0.5 + Math.random() * 0.5
			colors[i3 + 1] = 0.7 + Math.random() * 0.3
			colors[i3 + 2] = 1.0
		} else if (temp > 0.75) {
			// White stars
			colors[i3] = 0.9 + Math.random() * 0.1
			colors[i3 + 1] = 0.9 + Math.random() * 0.1
			colors[i3 + 2] = 1.0
		} else if (temp > 0.6) {
			// Yellow stars like our sun
			colors[i3] = 1.0
			colors[i3 + 1] = 0.8 + Math.random() * 0.2
			colors[i3 + 2] = 0.4 + Math.random() * 0.4
		} else if (temp > 0.45) {
			// Orange stars
			colors[i3] = 1.0
			colors[i3 + 1] = 0.5 + Math.random() * 0.3
			colors[i3 + 2] = 0.2 + Math.random() * 0.2
		} else if (temp > 0.3) {
			// Red dwarfs
			colors[i3] = 0.8 + Math.random() * 0.2
			colors[i3 + 1] = 0.3 + Math.random() * 0.3
			colors[i3 + 2] = 0.1 + Math.random() * 0.2
		} else {
			// Cool red giants
			colors[i3] = 0.9 + Math.random() * 0.1
			colors[i3 + 1] = 0.2 + Math.random() * 0.2
			colors[i3 + 2] = 0.05 + Math.random() * 0.1
		}

		const sizeFactor = 1 - (radius - 10) / 90
		sizes[i] = (Math.random() * 1.5 + 0.3) * sizeFactor

		velocities[i3] = (Math.random() - 0.5) * 0.005
		velocities[i3 + 1] = (Math.random() - 0.5) * 0.005
		velocities[i3 + 2] = (Math.random() - 0.5) * 0.005
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
	const count = 50000

	const starData = generateStarData(count)
	const { positions, colors, sizes, velocities } = starData
	const velocitiesRef = useRef(velocities)

	useFrame((state) => {
		if (!meshRef.current) return

		const positions = meshRef.current.geometry.attributes.position.array
		const time = state.clock.elapsedTime

		for (let i = 0; i < count; i++) {
			const i3 = i * 3

			positions[i3] += velocitiesRef.current[i3]
			positions[i3 + 1] += velocitiesRef.current[i3 + 1]
			positions[i3 + 2] += velocitiesRef.current[i3 + 2]

			const pulse = Math.sin(time * 2 + i * 0.1) * 0.000005
			positions[i3] += pulse
			positions[i3 + 1] += pulse

			const distance = Math.sqrt(
				positions[i3] ** 2 +
				positions[i3 + 1] ** 2 +
				positions[i3 + 2] ** 2
			)

			if (distance > 100 || distance < 10) {
				velocitiesRef.current[i3] *= -1
				velocitiesRef.current[i3 + 1] *= -1
				velocitiesRef.current[i3 + 2] *= -1
			}
		}

		meshRef.current.geometry.attributes.position.needsUpdate = true

		meshRef.current.rotation.y = time * 0.005
		meshRef.current.rotation.x = time * 0.005
	})

	return (
		<points ref={meshRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					args={[positions, 3]}
				/>
				<bufferAttribute
					attach="attributes-color"
					args={[colors, 3]}
				/>
				<bufferAttribute
					attach="attributes-size"
					args={[sizes, 1]}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.2}
				vertexColors
				transparent
				opacity={1.0}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				map={createStarTexture()}
			/>
		</points>
	)
}
