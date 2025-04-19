import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpaceElements from "./bgElements";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { useState } from "react";

const formSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    rollNumber: z.string().min(1, "Roll number is required"),
    email: z.string().email("Invalid email format"),
    branch: z.string().min(1, "Branch is required"),
    course: z.string().min(1, "Course is required"),
    phoneNumber: z.string().regex(/^\d{10}$/, "Must be 10 digit number"),
    yog: z.string().min(4, "Year of graduation must be valid"),
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterForm() {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            rollNumber: "",
            email: "",
            branch: "",
            course: "",
            phoneNumber: "",
            yog: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setMessage("");
        try {
            const res = await fetch("https://xunback.manantechnosurge.tech/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (res.ok) {
                form.reset();
                setMessage("Registration successful!");
            } else {
                setMessage(result.message || result.error || "Something went wrong");
            }
        } catch (err) {
            setMessage("Network error. Please try again.");
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <SpaceElements className="absolute inset-0 z-0" />

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 space-y-8">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold underline text-white text-center">
                    Registration Form
                </h1>

                <div className="w-full max-w-md bg-black/70 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Full Name</FormLabel>
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

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? "Registering..." : "Register"}
                            </Button>
                        </form>
                    </Form>
                    {message && (
                        <p className="mt-4 text-sm text-white text-center">{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
