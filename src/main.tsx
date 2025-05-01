import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import LeaderBoard from './pages/LeaderBoard'
import { SignIn } from './pages/SignIn'
import Quiz from './pages/Quiz'
import Register from './pages/Register'
import { Whatsapp } from './pages/Whatsapp'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Index />
            },
            /* {
                path: "register",
                element: <Register />,
            },
            {
                path: "quiz",
                element: <Quiz />,
            },
            {
                path: "signin",
                element: <SignIn />,
            },
            {
                path: "leaderboard",
                element: <LeaderBoard />,
            },
            {
                path: "whatsapp",
                element: <Whatsapp />,
            }, */
            {
                path: "*",
                element: <NotFound />,
            },
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>

        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <RouterProvider router={router} />
        </ClerkProvider>
    </StrictMode>,
)
