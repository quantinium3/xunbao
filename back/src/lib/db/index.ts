import 'dotenv/config';
import { Pool } from "pg"
import { drizzle } from 'drizzle-orm/node-postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
	connectionString: databaseUrl,
	max: 30
})

export const db = drizzle(pool);
