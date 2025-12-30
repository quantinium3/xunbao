import { Hono } from "hono";
import { auth } from "../lib/auth";
import { z } from "zod";

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
