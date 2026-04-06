import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authClient } from "../lib/auth-client";
import { redirect } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const BRANCHES = [
	"CSE",
	"IT",
	"ECE",
	"EE",
	"ME",
	"CE",
	"OTHER",
] as const

export const Route = createFileRoute('/onboarding')({
	beforeLoad: async () => {
		const session = await authClient.getSession()
		if (!session.data?.user) {
			throw redirect({
				to: "/sign-in",
			})
		}

		const user = session.data.user as { roll_number?: string; college?: string; branch?: string; phone_number?: string }
		if (user.roll_number && user.college && user.branch && user.phone_number) {
			throw redirect({
				to: "/play",
			})
		}
	},
	component: Onboarding,
})

const onboardingSchema = z.object({
	roll_number: z.string().min(1, "Roll number is required"),
	college: z.string().min(1, "College is required"),
	branch: z.string().min(1, "Please select a branch"),
	phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
})

type OnboardingType = z.infer<typeof onboardingSchema>

function Onboarding() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const { register, handleSubmit, formState: { errors } } = useForm<OnboardingType>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			roll_number: "",
			college: "",
			branch: undefined,
			phone_number: "",
		},
	})

	const onSubmit = async (data: OnboardingType) => {
		setLoading(true)
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/complete-profile`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})

			const result = await response.json()

			if (!result.success) {
				toast.error(result.error || "Failed to save profile")
				return
			}

			toast.success("Profile saved successfully")
			navigate({ to: "/play" })
		} catch (error) {
			console.error("Profile save error:", error)
			toast.error("An error occurred while saving profile")
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
				<h1 className="text-center text-xl font-press-start-2p my-5 underline">Complete Your Profile</h1>
				<p className="text-xs text-center mb-6 text-gray-300">Please fill in your details to continue</p>

				<div className="flex flex-col space-y-4 mx-auto justify-center px-3">
					<div className="flex flex-col space-y-2">
						<label className="text-sm">Roll Number: </label>
						<input type="text" className="border-[1px] w-full px-2 py-1" {...register("roll_number")} />
						{errors.roll_number && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.roll_number.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-2">
						<label className="text-sm">College: </label>
						<input type="text" className="border-[1px] w-full px-2 py-1" {...register("college")} />
						{errors.college && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.college.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-2">
						<label className="text-sm">Branch: </label>
						<select className="border-[1px] w-full px-2 py-1" {...register("branch")}>
							<option value="">Select branch</option>
							{BRANCHES.map((branch) => (
								<option key={branch} value={branch}>
									{branch}
								</option>
							))}
						</select>
						{errors.branch && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.branch.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-2">
						<label className="text-sm">Phone Number: </label>
						<input type="tel" className="border-[1px] w-full px-2 py-1" {...register("phone_number")} />
						{errors.phone_number && (
							<span className="text-red-500 text-xs break-words block max-w-full overflow-wrap-anywhere">
								{errors.phone_number.message}
							</span>
						)}
					</div>
				</div>

				<button className="flex text-sm self-center mx-auto my-5 border-[1px] py-2 px-4 hover:text-black hover:bg-white" type="submit" disabled={loading}>
					{loading ? "Saving..." : "Continue"}
				</button>
			</form>
		</div>
	)
}
