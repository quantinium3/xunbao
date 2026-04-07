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

		const user = session.data.user;
		if (user.is_onboarding_complete) {
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
				body: JSON.stringify({ ...data, onboarding_status: true }),
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
		<div className="flex h-screen justify-center items-center text-white mx-auto px-4">
			<form onSubmit={(e) => {
				e.preventDefault()
				handleSubmit(onSubmit)();
			}} className="w-full max-w-md">
				<h1 className="text-center text-3xl sm:text-5xl font-enchanted-land my-3 sm:my-5 underline">Complete Your Profile</h1>
				<p className="text-xl sm:text-2xl text-center mb-4 sm:mb-6">Please fill in your details to continue</p>

				<div className="flex flex-col space-y-3 sm:space-y-4 mx-auto justify-center">
					<div className="flex flex-col space-y-1 sm:space-y-2">
						<label className="text-2xl sm:text-3xl font-medium">Roll Number: </label>
						<input type="text" className="border w-full px-2 py-1 sm:py-2 font-serif backdrop-blur" {...register("roll_number")} />
						{errors.roll_number && (
							<span className="text-red-500 text-[10px] sm:text-xs wrap-break-words block max-w-full overflow-wrap-anywhere">
								{errors.roll_number.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-1 sm:space-y-2">
						<label className="text-2xl sm:text-3xl font-medium:">College: </label>
						<input type="text" className="border w-full px-2 py-1 sm:py-2 backdrop-blur font-serif" {...register("college")} />
						{errors.college && (
							<span className="text-red-500 text-[10px] sm:text-xs wrap-break-words block max-w-full overflow-wrap-anywhere">
								{errors.college.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-1 sm:space-y-2">
						<label className="text-2xl sm:text-3xl font-medium">Branch: </label>
						<select className="border w-full px-2 py-1 sm:py-2 text-sm font-serif backdrop-blur" {...register("branch")}>
							<option value="" className='text-xl font-serif bg-black'>Select branch</option>
							{BRANCHES.map((branch) => (
								<option key={branch} value={branch} className='bg-black font-serif'>
									{branch}
								</option>
							))}
						</select>
						{errors.branch && (
							<span className="text-red-500 font-serif block max-w-full overflow-wrap-anywhere">
								{errors.branch.message}
							</span>
						)}
					</div>

					<div className="flex flex-col space-y-1 sm:space-y-2">
						<label className="text-2xl sm:text-3xl">Phone Number: </label>
						<input type="tel" className="border w-full px-2 py-1 sm:py-2 font-serif backdrop-blur font-semibold" {...register("phone_number")} />
						{errors.phone_number && (
							<span className="text-red-500 text-[10px] sm:text-xs wrap-break-words block max-w-full overflow-wrap-anywhere">
								{errors.phone_number.message}
							</span>
						)}
					</div>
				</div>

				<button className="flex font-serif self-center mx-auto my-4 sm:my-5 border py-2 px-4 hover:text-black hover:bg-white rounded-xl" type="submit" disabled={loading}>
					{loading ? "Saving..." : "Continue"}
				</button>
			</form>
		</div>
	)
}
