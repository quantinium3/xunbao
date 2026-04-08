import { Link } from "@tanstack/react-router";
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'


export default function Navbar() {
	return (
		<div className="flex justify-between items-center p-2 mx-13 pt-11 font-bold z-10 font-sans">
			<h1 className="text-xl sm:text-3xl text-yellow-50 hover:underline underline-offset-4 font-enchanted-land"><Link to="/">XUNBAO</Link></h1>{" "}
			<Show when="signed-out">
				<SignInButton />
				<SignUpButton />
			</Show>
			<Show when="signed-in">
				<UserButton />
			</Show>
		</div>
	);
}
