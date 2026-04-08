import 'dotenv/config';
import { Hono } from 'hono'
import { cors } from "hono/cors";
import { quizRouter } from "./routes/quiz";
import { runMigrations } from "./lib/db/migrate";
import { clerkMiddleware } from '@clerk/hono';
import webhookRouter from './routes/webhook';

const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) ?? ['http://localhost:5173'];

const app = new Hono()

app
	.use('/api/*', cors({
		origin: corsOrigins,
		allowHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	}))

	.use('*', clerkMiddleware())
	.get('/', (c) => {
		return c.text('Hello Hono!')
	})
	.route("/api/v1/quiz", quizRouter)
	.route("/api/v1/webhook", webhookRouter)

export default app
