import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "../lib/auth-client";
import { redirect } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute('/sign-in')({
	beforeLoad: async () => {
		const session = await authClient.getSession()
		if (session.data?.user) {
			throw redirect({
				to: "/play",
			})
		}
	},
	component: SignIn,
})

const signInSchema = z.object({
	email: z.email("email is invalid"),
	password: z.string()
		.min(8, "password is too short")
		.max(32, "password is too long")
		.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
})

type SignInType = z.infer<typeof signInSchema>

function SignIn() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const { register, handleSubmit, formState: { errors } } = useForm<SignInType>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	const onSubmit = async (data: SignInType) => {
		setLoading(true)
		try {
			const { data: signInData, error } = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			})

			if (error) {
				console.log("Failed to sign in", error)
				toast.error("Failed to sign in")
				return
			}

			if (signInData.user) {
				toast.success("Sign in successful")
				navigate({ to: "/play" })
			}
		} catch (error) {
			console.error("Sign in error:", error)
			toast.error("An error occurred during sign in")
		} finally {
			setLoading(false)
		}
	};

	return (
		<div className="flex h-screen justify-center items-center text-white font-press-start-2p mx-auto">
			<form onSubmit={(e) => {
				e.preventDefault()
				handleSubmit(onSubmit)();
			}} className="w-full max-w-md px-4">
				<h1 className="text-center text-2xl font-press-start-2p my-5 underline">Sign In</h1>
				<div className="flex flex-col space-y-2 mx-auto justify-center px-3">
					<div className="flex flex-col space-y-2">
						<div>
							<label className="text-sm">Email: </label>
							<input type="text" className="border-[1px] w-full" {...register("email")} />
						</div>
						{errors.email && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.email.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-2">
						<div>
							<label className="text-sm">Password: </label>
							<input type="password" className="border-[1px] w-full" {...register("password")} />
						</div>
						{errors.password && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.password.message}
							</span>
						)}
					</div>
				</div>
				<button className="flex text-sm self-center mx-auto my-3 border-[1px] py-1 px-2" type="submit" disabled={loading}>
					{loading ? "Loading..." : "Submit"}
				</button>
				<span>Don't have an account? <Link to="/sign-up" className="underline">Sign up</Link></span>
			</form>
		</div>
	)
}
