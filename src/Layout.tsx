import { Outlet } from "react-router"
import { SpaceElements } from "./components/SpaceElements"
import StarField from "./components/Starfield"
import { UserButton } from "@clerk/clerk-react"
import { Toaster } from "sonner";

const Layout = () => {
    return (
        <>
            <StarField />
            <SpaceElements />
            <div className="absolute top-4 right-4 z-50">
                <UserButton />
            </div>
            <Outlet />
            <Toaster richColors />
        </>
    )
}

export default Layout
