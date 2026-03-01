import { NextResponse } from "next/server"

export async function middleware(request) {
	// All routes are public since Auth0 has been removed
	// Redirect root to investor page
	if (request.nextUrl.pathname === "/") {
		const { origin } = new URL(request.url)
		return NextResponse.redirect(`${origin}/investor`)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|manifest.json|manifest.webmanifest|sw.js|workbox-.*\\.js$|.*\\.png$|.*\\.svg$).*)"
	]
}
