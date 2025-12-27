import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Canvas } from '@react-three/fiber'
import { Stars } from '../components/Stars'

const RootLayout = () => (
	<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
		<Canvas
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				background: '#000000',
				zIndex: -1,
			}}
			camera={{ position: [0, 0, 30], fov: 75 }}
		>
			<ambientLight intensity={0.1} />
			<Stars />
		</Canvas>
		<Outlet />
		<TanStackRouterDevtools />
	</div>
)

export const Route = createRootRoute({ component: RootLayout })
