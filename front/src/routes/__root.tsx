import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Canvas } from '@react-three/fiber'
import { Stars } from '../components/Stars'
import { Toaster } from 'react-hot-toast'

const RootLayout = () => (
	<div style={{ position: 'relative', width: '100vw', minHeight: '100vh' }}>
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundImage: 'url(/input.gif)',
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				zIndex: -2,
			}}
		/>
		<img src="/assets/corner.webp" alt="" className="fixed top-4 left-4 w-15 sm:w-20 md:w-25 z-0 invert sepia hue-rotate-30" />
		<img src="/assets/corner.webp" alt="" className="fixed top-4 right-4 w-15 sm:w-20 z-0 md:w-25 invert sepia hue-rotate-30 -scale-x-100" />
		<img src="/assets/corner.webp" alt="" className="fixed bottom-4 left-4 w-15 sm:w-20 z-0 md:w-25 invert sepia hue-rotate-30 -scale-y-100" />
		<img src="/assets/corner.webp" alt="" className="fixed bottom-4 right-4 w-15 sm:w-20 z-0 md:w-25 invert sepia hue-rotate-30 -scale-100" />
		<Canvas
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: -1,
			}}
			camera={{ position: [0, 0, 30], fov: 75 }}
		>
			<ambientLight intensity={0.1} />
			<Stars />
		</Canvas>
		<Toaster toastOptions={{ style: { fontFamily: 'system-ui, sans-serif' } }} />
		<Outlet />
		<TanStackRouterDevtools />
	</div>
)

export const Route = createRootRoute({ component: RootLayout })
