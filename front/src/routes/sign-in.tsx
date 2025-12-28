import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { redirect } from "@tanstack/react-router";

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
	otp: z.string().optional(),
})

type SignInType = z.infer<typeof signInSchema>

function SignIn() {
	const [otpSent, setOtpSent] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { register, handleSubmit, formState: { errors } } = useForm<SignInType>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			otp: "",
		},
	})

	const sendOtp = async (email: string) => {
		setLoading(true);
		const { error } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
		});
		setLoading(false);
		if (error) {
			console.error("Error sending OTP:", error);
			alert("Failed to send OTP. Please try again.");
			return;
		}
		setOtpSent(true);
	};

	const verifyOtp = async (data: SignInType) => {
		if (!data.otp) return;
		setLoading(true);
		const { data: sessionData, error } = await authClient.signIn.emailOtp({
			email: data.email,
			otp: data.otp,
		});
		setLoading(false);
		if (error) {
			console.error("Error verifying OTP:", error);
			alert("Invalid OTP. Please try again.");
			return;
		}
		if (!sessionData) {
			alert("Sign-in failed. Please try again.");
			return;
		}
		navigate({ to: "/play" });
	};

	const onSubmit = async (data: SignInType) => {
		if (!otpSent) {
			await sendOtp(data.email);
		} else {
			await verifyOtp(data);
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
							<input type="email" className="border-[1px] w-full" {...register("email")} disabled={otpSent} />
						</div>
						{errors.email && (
							<span className="text-red-500 text-xs break-words block max-w-full">
								{errors.email.message}
							</span>
						)}
					</div>
					{otpSent && (
						<div className="flex flex-col space-y-2">
							<div>
								<label className="text-sm">OTP: </label>
								<input type="text" className="border-[1px] w-full" {...register("otp")} />
							</div>
							{errors.otp && (
								<span className="text-red-500 text-xs break-words block max-w-full">
									{errors.otp.message}
								</span>
							)}
						</div>
					)}
				</div>
				<button className="flex text-sm self-center mx-auto my-3 border-[1px] py-1 px-2" type="submit" disabled={loading}>
					{loading ? "Loading..." : otpSent ? "Verify OTP" : "Send OTP"}
				</button>
			</form>
		</div>
	)
}
