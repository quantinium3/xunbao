import UserProfileDropdown from "./user-profile-dropdown";
import { Link } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export default function Navbar() {
	const session = authClient.useSession();
	return (
		<div className="flex justify-between items-center p-3">
			<h1 className="text-3xl hover:underline"><Link to="/">XUNBAO</Link></h1>{" "}
			{session.data ? (
				<UserProfileDropdown />
			) : (
				<Link to="/sign-in" className="text-sm border-2 border-white">
					Sign In
				</Link>
			)}
		</div>
	);
}
