import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from "react"
import { z } from "zod";
import { useAuth, useSignUp } from '@clerk/react'
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';


export const Route = createFileRoute('/sign-up')({
  component: RouteComponent,
})

const signUpSchema = z.object({
  firstName: z.string().min(2, { error: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { error: "Last name must be at least 2 characters" }),
  username: z.string().min(3, { error: "username must be at least 3 characters" }).max(20, { error: "username must be atmost 20 characters" }),
  emailAddress: z.email({ error: "Invalid email" }),
  rollNumber: z.string().min(1, "Required"),
  university: z.string().min(1, "Required"),
  branch: z.string().min(1, "Required"),
  phoneNumber: z.string().min(10, "Phone number must be 10 number")
})

type signUpType = z.infer<typeof signUpSchema>

function RouteComponent() {
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema)
  })
  const nav = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    nav({ to: "/play" })
  }

  const onSubmit: SubmitHandler<signUpType> = async (data) => {
    try {
      const { error } = await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        emailAddress: data.emailAddress,
        unsafeMetadata: {
          rollNumber: data.rollNumber,
          university: data.university,
          branch: data.branch,
          phoneNumber: data.phoneNumber,
        },
      })

      if (error) {
        console.error(JSON.stringify(error, null, 2))
        toast.error(error.message || "Failed to initiate sign up")
        return
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        console.error(JSON.stringify(sendError, null, 2))
        toast.error(sendError.message || "Failed to send verification code")
        return
      }

      setVerifying(true)
    } catch (err) {
      console.error(err)
      toast.error("An unexpected error occurred during sign up")
    }
  }

  const handleVerify = async (data: FormData) => {
    try {
      const code = data.get('code') as string
      const result = await signUp.verifications.verifyEmailCode({ code })

      if (result.error) {
        console.error(JSON.stringify(result.error, null, 2))
        toast.error(result.error.message || "Invalid verification code")
        return
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
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
        console.error('Sign-up attempt not complete.', {
          status: signUp.status,
          missingFields: signUp.missingFields,
          unverifiedFields: signUp.unverifiedFields,
          signUp
        })
        const missing = signUp.missingFields.length > 0 ? ` Missing: ${signUp.missingFields.join(', ')}` : ''
        const unverified = signUp.unverifiedFields.length > 0 ? ` Unverified: ${signUp.unverifiedFields.join(', ')}` : ''
        toast.error(`Sign-up incomplete: ${signUp.status}.${missing}${unverified}`)
      }
    } catch (err) {
      console.error('Verification failed', err)
      toast.error("Failed to verify email")
    }
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    verifying
  ) {
    return (
      <div key="verify-form" className="font-sans text-white flex justify-center items-center mx-auto min-h-screen">
        <div className="border backdrop-blur-xl p-3 rounded-md">
          <h1 className="font-bold font-enchanted-land text-center text-4xl underline underline-offset-4 my-3">Verify Email</h1>
          <form action={handleVerify} className="space-y-4">
            <div className='flex flex-col space-y-1'>
              <label htmlFor="code" className='font-bold text-sm'>Verification Code: </label>
              <input
                id="code"
                type="text"
                name="code"
                className='border rounded-md px-2 py-1 bg-transparent'
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                required
              />
              {clerkErrors.fields.code && <p className='text-red-600 text-xs'>{clerkErrors.fields.code.message}</p>}
            </div>

            <div className='flex justify-center py-3 flex-col gap-2'>
              <button
                type="submit"
                disabled={fetchStatus === 'fetching'}
                className="border px-3 py-1 rounded-md items-center hover:bg-white/10 disabled:opacity-50"
              >
                {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => signUp.verifications.sendEmailCode()}
                className="text-xs hover:underline opacity-80"
              >
                I need a new code
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans text-white flex justify-center items-center mx-auto min-h-screen">
      <div className="border backdrop-blur-xl p-3 rounded-md">
        <h1 className="font-bold font-enchanted-land text-center text-4xl underline underline-offset-4 my-3">Sign Up</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className='flex flex-col space-y-1'>
            <label htmlFor="firstName" className='font-bold'>First Name: </label>
            <input
              id="firstName"
              type="text"
              placeholder='john'
              className='border rounded-md px-2'
              {...register("firstName")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.firstName?.message}</p>

          <div className='flex flex-col'>
            <label htmlFor="lastName" className='font-bold'>Last Name:</label>
            <input
              id="lastName"
              type="text"
              placeholder='doe'
              className='border rounded-md px-2'
              {...register("lastName")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.lastName?.message}</p>

          <div className='flex flex-col mx-auto'>
            <label htmlFor="username" className='font-bold'>Username: </label>
            <input
              id="username"
              type="text"
              placeholder='johndoe'
              className='border rounded-md px-2'
              {...register("username")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.username?.message}</p>

          <div className='flex flex-col mx-auto'>
            <label htmlFor="emailAddress" className='font-bold'>Email: </label>
            <input
              id="emailAddress"
              type="email"
              placeholder='johndoe@example.com'
              className='border rounded-md px-2'
              {...register("emailAddress")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.emailAddress?.message}</p>

          <div className='flex flex-col mx-auto'>
            <label htmlFor="rollNumber">Roll Number: </label>
            <input
              id="rollNumber"
              type="text"
              placeholder='26001011034'
              className='border rounded-md px-2'
              {...register("rollNumber")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.rollNumber?.message}</p>

          <div className='flex flex-col mx-auto'>
            <label htmlFor="university">University: </label>
            <input
              id="university"
              type="text"
              placeholder='university'
              className='border rounded-md px-2'
              {...register("university")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.university?.message}</p>

          <div className='flex flex-col mx-auto'>
            <label htmlFor="branch">Branch: </label>
            <input
              id="branch"
              type="text"
              placeholder="Computer Engineering"
              className='border rounded-md px-2'
              {...register("branch")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.branch?.message}</p>

          <div className='flex flex-col mx-auto'>
            <label htmlFor="phoneNumber">Phone Number: </label>
            <input
              id="phoneNumber"
              type="text"
              placeholder='1234567890'
              className='border rounded-md px-2'
              {...register("phoneNumber")}
            />
          </div>
          <p className='text-red-600 text-xs'>{errors.phoneNumber?.message}</p>

          <div className='flex justify-center py-3 flex-col'>
            <button
              type="submit"
              disabled={fetchStatus === 'fetching'}
              className="border px-3 rounded-md items-center hover:bg-white/10 disabled:opacity-50"
            >
              {fetchStatus === 'fetching' ? 'Submitting...' : 'Submit'}
            </button>
            <p className='text-center pt-2 text-sm'>Already have an account? <Link to='/sign-in' className='hover:underline font-bold'>Sign In</Link></p>
          </div>
        </form>

        <div id="clerk-captcha" />
      </div>
    </div>
  )
}
