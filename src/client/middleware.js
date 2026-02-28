import { NextResponse } from "next/server"
import { auth0 } from "./lib/auth0"

export async function middleware(request) {
	// Public routes - no authentication required
	const publicPaths = ["/investor"]
	const isPublicPath = publicPaths.some(path =>
		request.nextUrl.pathname.startsWith(path)
	)

	if (isPublicPath) {
		return NextResponse.next()
	}

	// Redirect the root path to the investor page (public demo)
	if (request.nextUrl.pathname === "/") {
		const { origin } = new URL(request.url)
		return NextResponse.redirect(`${origin}/investor`)
	}

	if (process.env.NEXT_PUBLIC_ENVIRONMENT === "selfhost") {
		return NextResponse.next()
	}
	const authRes = await auth0.middleware(request)

	if (request.nextUrl.pathname.startsWith("/auth")) {
		return authRes
	}

	const { origin } = new URL(request.url)
	const session = await auth0.getSession()

	if (!session) {
		return NextResponse.redirect(`${origin}/auth/login`)
	}

	return authRes
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|manifest.json|manifest.webmanifest|sw.js|workbox-.*\\.js$|.*\\.png$|.*\\.svg$).*)"
	]
}
