import Starfield from '@/components/Starfield'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: () => (
        <>
            <Starfield />
            <div className="relative z-10 w-full h-full">
                <Outlet />
            </div>
            <TanStackRouterDevtools position="bottom-right" />
        </>
    ),
})

