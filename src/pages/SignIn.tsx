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
import XButton from '@/components/XButton'
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
    }, [isSignedIn, navigate]);

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
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
            const message = "Sign-in failed. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute w-full h-screen z-10 flex flex-col items-center justify-center px-4 text-white">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold underline text-white text-center mb-5">
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
                                    <FormLabel className="text-white flex flex-col items-start">
                                        Password
                                        <span className="text-xs">
                                            first 5 letters of email + @ + last 5 letter of rollnumber
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input className="text-white" type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" />

                        <div className="flex items-center">
                            <XButton type="submit" disabled={isLoading} className="text-white rounded-md border px-3 py-2 w-full text-lg sm:text-xl font-semibold transition-colors duration-300 shadow-[3px_4px_0_white] active:shadow-[1px_2px_0_white]">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </XButton>
                        </div>
                    </form>
                </Form>
                <p className="text-center text-white mt-4">
                    Don't have an account?{" "}
                    <a className="text-blue-500 hover:underline font-bold" href="/register">Register</a>
                </p>
                {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
            </div>
        </div>
    );
};
