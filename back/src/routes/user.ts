import { Hono } from "hono";
import { auth } from "../lib/auth";

export const userRouter = new Hono();

userRouter.post("/set-password", async (c) => {
	const { password } = await c.req.json();
	const res = await auth.api.setPassword({
		body: {
			newPassword: password,
		},
		headers: c.req.raw.headers,
	});

	if (res.status === false) {
		return c.json({
			error: "Failed to set password",
			success: false,
		}, 400);
	}

	return c.json({
		success: true,
	})
})
