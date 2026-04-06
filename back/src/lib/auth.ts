import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index";
import * as schema from "./db/schema/auth-schema";

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim()) ?? ['http://localhost:5173'];

export const auth = betterAuth({
	trustedOrigins,
	baseURL: process.env.BETTER_AUTH_URL,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	user: {
		additionalFields: {
			roll_number: {
				type: "string",
				required: false,
			},
			college: {
				type: "string",
				required: false,
			},
			branch: {
				type: "string",
				required: false,
			},
			phone_number: {
				type: "string",
				required: false,
			}
		}
	},
});
