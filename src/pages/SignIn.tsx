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
import { useAuth, useSignIn } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router";

const formSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

export const SignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (isSignedIn) {
            navigate("/quiz");
        }
    }, [isSignedIn, navigate]); // ✅ Added dependency array

    const onSubmit = async (data: FormData) => {
        if (!isLoaded) return;
        setIsLoading(true);
        setError("");

        try {
            const signInAttempt = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });
                navigate("/quiz");
            } else {
                setError("Incomplete sign-in. Please try again.");
                console.error("Sign-in not complete:", signInAttempt);
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            const message = err?.errors?.[0]?.message || "Sign-in failed. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute w-full top-1/6 z-10 flex flex-col items-center justify-center px-4 space-y-8 min-h-screen ">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold underline text-white text-center">
                Sign In
            </h1>
            <div className="w-full max-w-md backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Password</FormLabel>
                                    <FormControl>
                                        <Input className="text-white" type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Optional CAPTCHA container (only functional if enabled in Clerk dashboard) */}
                        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" />

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Form>
                <p className="text-center text-white mt-4">
                    Don't have an account?{" "}
                    <a className="text-white hover:underline font-bold" href="/register">Register</a>
                </p>
                {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
};
