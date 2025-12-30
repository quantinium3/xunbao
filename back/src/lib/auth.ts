import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index";
import { emailOTP } from "better-auth/plugins"
import { Resend } from "resend";
import * as schema from "./db/schema/auth-schema";

const resend = new Resend(process.env.RESEND_APIKEY)

const trustedOrigins = process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim()) ?? ['http://localhost:5173'];

export const auth = betterAuth({
	trustedOrigins,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	plugins: [
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				let subject = "Email Verification";
				let text = `Your verification code is: ${otp}`;

				if (type === "email-verification") {
					subject = "Email Verification";
					text = `Your email verification code is: ${otp}`;
				} else if (type === "sign-in") {
					subject = "Sign In Verification";
					text = `Your sign-in code is: ${otp}`;
				} else {
					subject = "Password Reset";
					text = `Your password reset code is: ${otp}`;
				}

				try {
					const { error } = await resend.emails.send({
						from: 'mail@mail.quantinium.dev',
						to: email,
						subject: subject,
						text: text,
					});

					if (error) {
						console.error(`Resend API error:`, error);
						throw new Error(`Failed to send email: ${error.message}`);
					}

				} catch (err) {
					console.error("Exception in sendVerificationOTP:", err);
					throw err;
				}
			},
			otpLength: 6,
			expiresIn: 600,
		})
	],
});
