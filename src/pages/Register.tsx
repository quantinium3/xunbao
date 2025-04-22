import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useAuth, useSignUp } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import XButton from '@/components/XButton'
import { useNavigate } from "react-router";

const formSchema = z.object({
    username: z.string().min(1, "Full name is required"),
    rollNumber: z.string().min(5, "Roll number is required and input your full roll number"),
    email: z.string().min(3, "Invalid email format"),
    branch: z.string().min(1, "Branch is required"),
    course: z.string().min(1, "Course is required"),
    phoneNumber: z.string().regex(/^\d{10}$/, "Must be 10 digit number"),
    yog: z.string().min(4, "Year of graduation must be valid"),
});

const backendUri = import.meta.env.VITE_BACKEND_URI
type ClerkError = {
    errors: { code: string; message: string }[];
};

type FormData = z.infer<typeof formSchema>;

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isLoaded, signUp, setActive } = useSignUp();
    const { isSignedIn } = useAuth();
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState("");
    const [cachedFormData, setCachedFormData] = useState<FormData | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            rollNumber: "",
            email: "",
            branch: "",
            course: "",
            phoneNumber: "",
            yog: "",
        },
    });

    useEffect(() => {
        if (isSignedIn) {
            navigate('/quiz')
        }
    })

    const onSubmit = async (data: FormData) => {
        if (!isLoaded) return;
        setIsLoading(true);
        setError("");
        setCachedFormData(data);

        try {
            const passwd = data.email.substring(0, 5).toLowerCase() + "@" + data.rollNumber.slice(-5).toLowerCase();
            await signUp.create({
                emailAddress: data.email,
                password: passwd
            });

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setVerifying(true);
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            const errorCode = (err as ClerkError).errors?.[0]?.code;
            if (errorCode === "form_identifier_exists") {
                setError("This email is already registered.");
            } else if (errorCode === "form_password_pwned") {
                setError("This password is not secure. Please choose a stronger one.");
            } else {
                setError("Signup failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || !cachedFormData) return;

        if (!/^\d{6}$/.test(code)) {
            setError("Verification code must be a 6-digit number.");
            return;
        }

        setIsLoading(true);
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

            if (signUpAttempt.status === "complete") {
                await setActive({ session: signUpAttempt.createdSessionId });

                const response = await fetch(`${backendUri}/api/user/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...cachedFormData,
                        userId: signUpAttempt.createdUserId,
                    }),
                });

                if (!response.ok) {
                    console.error("Backend registration failed:", await response.text());
                    setError("Failed to complete registration. Please try again later.");
                    return;
                }

                form.reset();
                navigate("/quiz");
            } else {
                setError("Verification incomplete. Try again.");
            }
        } catch (err) {
            console.error("Verification error:", JSON.stringify(err, null, 2));
            setError("Verification failed. Check your code.");
        } finally {
            setIsLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 space-y-8">
                <h1 className="text-2xl font-bold text-white">Verify your email</h1>
                <form onSubmit={handleVerify} className="space-y-4 w-full max-w-sm">
                    <label htmlFor="code" className="text-white">
                        Enter your verification code
                    </label>
                    <Input
                        id="code"
                        name="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="text-white"
                        aria-describedby="code-error"
                        required
                    />
                    {error && (
                        <p id="code-error" className="text-red-500 text-sm">
                            {error}
                        </p>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="absolute w-full top-1/6 z-10 flex flex-col items-center justify-center px-4 space-y-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold underline text-white text-center">
                Registration Form
            </h1>
            <div className="w-full max-w-md backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Username</FormLabel>
                                    <FormControl>
                                        <Input autoFocus className="text-white" placeholder="Name..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rollNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Roll Number</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" placeholder="Roll Number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Email</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" type="email" placeholder="example@domain.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="branch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Branch</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" placeholder="Computer Science" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="course"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Course</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" placeholder="B.TECH" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Phone Number</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" placeholder="9876543210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="yog"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Year of Graduation</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" placeholder="e.g., 2027" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" data-cl-language="es-ES" />
                        <div className="flex items-center">
                            <XButton type="submit" disabled={isLoading} className="text-white rounded-md border px-3 py-2 w-full text-lg sm:text-xl font-semibold transition-colors duration-300 shadow-[3px_4px_0_white] active:shadow-[1px_2px_0_white]">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    "Register"
                                )}
                            </XButton>
                        </div>
                    </form>
                </Form>
                <p className="text-center text-white mt-4">Already Have an Account? <a className="text-white hover:underline font-bold" href="/signin">Sign In</a></p>
                {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default Register;
