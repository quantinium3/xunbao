import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_URL,
	plugins: [inferAdditionalFields({
		user: {
			roll_number: {
				type: "string"
			},
			college: {
				type: "string",
			},
			branch: {
				type: "string",
			},
			phone_number: {
				type: "string",
			},
			is_onboarding_complete: {
				type: "boolean",
			}
		}
	})]
})
