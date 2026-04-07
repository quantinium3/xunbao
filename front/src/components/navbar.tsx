import UserProfileDropdown from "./user-profile-dropdown";
import { Link } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export default function Navbar() {
	const session = authClient.useSession();
	return (
		<div className="flex justify-between items-center p-2 mx-13 pt-11 font-bold z-10 font-enchanted-land">
			<h1 className="text-xl sm:text-3xl text-yellow-50 hover:underline underline-offset-4"><Link to="/">XUNBAO</Link></h1>{" "}
			{session.data ? (
				<UserProfileDropdown />
			) : (
				<Link to="/sign-in" className="text-[10px] sm:text-sm border-2 border-white px-2 sm:px-3 py-1">
					Sign In
				</Link>
			)}
		</div>
	);
}
