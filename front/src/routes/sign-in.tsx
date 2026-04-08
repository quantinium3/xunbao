import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toast } from "react-hot-toast";
import { z } from "zod"
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, useSignIn } from '@clerk/react';

export const Route = createFileRoute('/sign-in')({
	component: SignIn,
})

const signInSchema = z.object({
	emailAddress: z.email({ error: "Invalid Email" })
})

type signInType = z.infer<typeof signInSchema>

function SignIn() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(signInSchema)
	})
	const { signIn, errors: clerkErrors, fetchStatus } = useSignIn();
	const nav = useNavigate();
	const { isSignedIn } = useAuth();
	if (isSignedIn) {
		nav({ to: "/play" })
	}

	const onSubmit: SubmitHandler<signInType> = async (data) => {
		try {
			const { error } = await signIn.create({
				identifier: data.emailAddress
			})
			if (error) {
				console.error(JSON.stringify(error, null, 2))
				toast.error(error.message || "Failed to sign in user")
				return
			}

			if (!error) await signIn.emailCode.sendCode({ emailAddress: data.emailAddress })

			if (signIn.status === 'complete') {
				await signIn.finalize({
					navigate: ({ session, decorateUrl }) => {
						if (session?.currentTask) {
							console.log(session?.currentTask)
							return
						}
						const url = decorateUrl('/play')
						if (url.startsWith('http')) {
							window.location.href = url
						} else {
							nav({ to: url })
						}
					}
				})
			} else {
				console.error('Sign-in attempt not complete:', signIn)
				toast.error("failed to sign in user")
			}
		} catch (err) {
			console.error("failed to sign in user", err)
		}
	}

	const handleVerification = async (data: FormData) => {
		try {
			const code = data.get('code') as string
			await signIn.emailCode.verifyCode({ code })
			if (signIn.status === 'complete') {
				await signIn.finalize({
					navigate: ({ session, decorateUrl }) => {
						if (session?.currentTask) {
							console.log(session?.currentTask)
							return
						}

						const url = decorateUrl('/play')
						if (url.startsWith('http')) {
							window.location.href = url
						} else {
							nav({ to: url })
						}
					},
				})
			} else {
				console.error('Sign-in attempt not complete:', signIn)
			}
		} catch (err) {
			console.error("failed to verify email: ", err)
		}
	}

	if (signIn.status === 'needs_first_factor') {
		return (
			<div className="font-sans text-white flex justify-center items-center mx-auto min-h-screen">
				<div className="border backdrop-blur-xl p-3 rounded-md">
					<h1>Verify your Email</h1>
					<form action={handleVerification}>
						<label htmlFor="code">Enter your verification code</label>
						<input id="code" name="code" type="text" />
						{clerkErrors.fields.code && <p>{clerkErrors.fields.code.message}</p>}
						<button type="submit" disabled={fetchStatus === 'fetching'}>
							Verify
						</button>
					</form>
					<button onClick={() => signIn.emailCode.sendCode()}>I need a new code</button>
					<button onClick={() => signIn.reset()}>Start over</button>
				</div>
			</div>
		)
	}

	return (
		<div className="font-sans text-white flex justify-center items-center mx-auto min-h-screen">
			<div className="border backdrop-blur-xl p-3 rounded-md">
				<h1 className="font-bold font-enchanted-land text-center text-4xl underline underline-offset-4 my-3">Sign Up</h1>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
					<div className='flex flex-col mx-auto'>
						<label htmlFor="emailAddress" className='font-bold'>Email: </label>
						<input
							id="emailAddress"
							type="email"
							className='border rounded-md px-2'
							{...register("emailAddress")}
						/>
					</div>
					<p className='text-red-600 text-xs'>{errors.emailAddress?.message}</p>

					<div className='flex justify-center py-3 flex-col'>
						<button
							type="submit"
							disabled={fetchStatus === 'fetching'}
							className="border px-3 rounded-md items-center hover:bg-white/10 disabled:opacity-50"
						>
							{fetchStatus === 'fetching' ? 'Submitting...' : 'Submit'}
						</button>
						<p className='text-center pt-2 text-sm'>Don't have an account? <Link to='/sign-up' className='hover:underline font-bold'>Sign Up</Link></p>
					</div>
				</form>

				<div id="clerk-captcha" />
			</div>
		</div>

	)
}
