import 'dotenv/config';
import { Hono } from 'hono'
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { userRouter } from "./routes/user";
import { quizRouter } from "./routes/quiz";
import { runMigrations } from "./lib/db/migrate";

await runMigrations();

const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) ?? ['http://localhost:5173'];

const app = new Hono()

app
	.use('/api/*', cors({
		origin: corsOrigins,
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	}))
	.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
	.get('/', (c) => {
		return c.text('Hello Hono!')
	})
	.route("/api/v1/user", userRouter)
	.route("/api/v1/quiz", quizRouter)

export default app
