import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { OTPInput } from 'input-otp'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'
import { toast } from 'react-hot-toast'
import axios from "axios";
import { redirect } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Slot } from "../components/slot";
import { FakeDash } from "../components/dash";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute('/sign-up')({
	beforeLoad: async () => {
		const session = await authClient.getSession()
		if (session.data?.user) {
			throw redirect({
				to: "/play",
			})
		}
	},
	component: SignUp,
})

const signUpSchema = z.object({
	name: z.string().min(3, "name should be at least 3 characters").max(32, "name should be at most 32 characters"),
	email: z.email("email is invalid"),
	password: z.string()
		.min(8, "password is too short")
		.max(32, "password is too long")
		.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
})

type SignUpType = z.infer<typeof signUpSchema>

function SignUp() {
	const { register, handleSubmit, formState: { errors }, getValues } = useForm<SignUpType>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
		},
	})
	const [otpEnabled, setOtpEnabled] = useState(false)
	const [otp, setOtp] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate();

	const onSubmit = async (data: SignUpType) => {
		setIsLoading(true)
		try {
			const { data: otpData, error } = await authClient.emailOtp.sendVerificationOtp({
				email: data.email,
				type: "sign-in"
			})

			if (error || !otpData.success) {
				console.log("Failed to send email otp", error)
				toast.error("Failed to send email otp")
				return
			}

			toast.success("Email OTP sent")
			setOtpEnabled(true)
		} catch (error) {
			console.error("Error sending OTP: ", error)
			toast.error("An error occurred while sending OTP")
		} finally {
			setIsLoading(false)
		}
	};

	const onOTPSubmit = async () => {
		if (otp.length !== 6) {
			toast.error("Please Enter a valid OTP")
			return
		}

		setIsLoading(true)
		try {
			const formData = getValues();

			const { data: signInData, error: signInError } = await authClient.signIn.emailOtp({
				email: formData.email,
				otp,
			})

			if (signInError || !signInData.user) {
				console.log("Failed to verify OTP", signInError)
				toast.error("Failed to verify OTP")
				return
			}

			await authClient.updateUser({
				name: formData.name,
			})

			toast.success("OTP verified")

			const response = await axios.post(
				`${import.meta.env.VITE_API_URL}/api/v1/user/set-password`, {
				password: formData.password,
			}, {
				withCredentials: true,
			}
			);

			if (response.data.success) {
				console.log("signup success");
				toast.success("Sign up successful");
				navigate({ to: "/play" });
			} else {
				toast.error("Failed to set password");
			}
		} catch (error) {
			console.error("Error during signup:", error)
			toast.error("An error occurred during sign up")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex h-screen justify-center items-center text-white font-press-start-2p mx-auto">
			<form onSubmit={(e) => {
				e.preventDefault()
				if (!otpEnabled) {
					handleSubmit(onSubmit)();
				}
			}} className="w-full max-w-md px-4">
				<h1 className="text-center text-2xl font-press-start-2p my-5 underline">Sign Up</h1>
				<div className="flex flex-col space-y-2 mx-auto justify-center px-3">
					<div className="flex flex-col space-y-2">
						<div>
							<label className="text-sm">Name: </label>
							<input type="text" className="border-[1px] w-full" {...register("name")} />
						</div>
						{errors.name && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.name.message}
							</span>
						)}
					</div>

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

				{otpEnabled && (
					<div className="flex justify-center my-3 flex-col px-3">
						<span>OTP: </span>
						<OTPInput
							maxLength={6}
							value={otp}
							onChange={setOtp}
							containerClassName="group flex items-center has-[:disabled]:opacity-30 my-2"
							render={({ slots }) => (
								<>
									<div className="flex">
										{slots.slice(0, 3).map((slot, idx) => (
											<Slot key={idx} {...slot} />
										))}
									</div>

									<FakeDash />

									<div className="flex">
										{slots.slice(3).map((slot, idx) => (
											<Slot key={idx} {...slot} />
										))}
									</div>
								</>
							)}
						/>
					</div>
				)}


				{!otpEnabled ? (
					<button
						className="flex text-sm my-3 border-[1px] py-1 px-2 mx-auto hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						type="submit"
						disabled={isLoading}
					>
						{isLoading ? "Sending..." : "Send OTP"}
					</button>
				) : (
					<button
						className="flex mx-auto text-sm my-3 border-[1px] py-1 px-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						type="button"
						onClick={onOTPSubmit}
						disabled={isLoading || otp.length !== 6}
					>
						{isLoading ? "Verifying..." : "Verify & Sign Up"}
					</button>
				)}
				<div className="text-xs text-center">Already have an account? <Link to="/sign-in" className="underline">Sign in</Link></div>
			</form>
		</div>
	)
}

