import { Hono } from 'hono'
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { userRouter } from "./routes/user";

const app = new Hono()

app
	.use('/api/*', cors({
		origin: ['http://localhost:5173'],
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	}))
	.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
	.get('/', (c) => {
		return c.text('Hello Hono!')
	})
	.route("/api/v1/user", userRouter)

export default app
