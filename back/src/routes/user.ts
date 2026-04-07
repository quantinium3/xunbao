import { Hono } from "hono";
import { auth } from "../lib/auth";
import { z } from "zod";
import { db } from "../lib/db";
import { user } from "../lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";

export const userRouter = new Hono();

const setPasswordSchema = z.object({
	password: z.string()
		.min(8, "password is too short")
		.max(32, "password is too long")
		.regex(
			/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
			"password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		),
});

const completeProfileSchema = z.object({
	roll_number: z.string().min(1, "Roll number is required"),
	college: z.string().min(1, "College is required"),
	branch: z.string().min(1, "Branch is required"),
	phone_number: z.string().min(1, "Phone number is required"),
	onboarding_status: z.boolean()
});

userRouter.post("/set-password", async (c) => {
	const body = await c.req.json<z.infer<typeof setPasswordSchema>>();
	const parseResult = setPasswordSchema.safeParse(body);
	if (!parseResult.success) {
		return c.json({
			error: "Invalid request body",
			success: false,
		}, 400);
	}
	const { password } = parseResult.data;

	const res = await auth.api.setPassword({
		body: {
			newPassword: password,
		},
		headers: c.req.raw.headers,
	});

	if (!res.status) {
		return c.json({
			error: "Failed to set password",
			success: false,
		}, 400);
	}

	return c.json({
		success: true,
	})
})

userRouter.post("/complete-profile", async (c) => {
	const body = await c.req.json<z.infer<typeof completeProfileSchema>>();
	const parseResult = completeProfileSchema.safeParse(body);
	if (!parseResult.success) {
		return c.json({
			error: "Invalid request body",
			success: false,
		}, 400);
	}

	const { roll_number, college, branch, phone_number, onboarding_status } = parseResult.data;

	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session) {
		return c.json({
			error: "Unauthorized",
			success: false,
		}, 401);
	}

	await db.update(user)
		.set({ roll_number, college, branch, phone_number, is_onboarding_complete: onboarding_status })
		.where(eq(user.id, session.user.id));

	return c.json({
		success: true,
	})
})
