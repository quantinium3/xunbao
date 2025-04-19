import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import "./index.css";
import { routeTree } from './routeTree.gen';
import { ClerkProvider } from '@clerk/clerk-react';

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
        queryClient,
    },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Clerk Publishable Key");
}

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
                    <RouterProvider router={router} />
                </ClerkProvider>
            </QueryClientProvider>
        </StrictMode>,
    );
}
