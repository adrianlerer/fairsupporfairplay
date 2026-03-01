// Stub auth0 module - Auth0 has been removed from this project.
// All exports are no-ops to prevent build errors from files that still reference them.
import { NextResponse } from "next/server"

export const auth0 = {
	middleware() {
		return NextResponse.next()
	},
	async getSession() {
		return null
	},
	async getAccessToken() {
		return { accessToken: null }
	}
}

export async function getBackendAuthHeader() {
	const staticToken = process.env.SELF_HOST_AUTH_TOKEN
	if (staticToken) {
		return { Authorization: `Bearer ${staticToken}` }
	}
	return null
}
