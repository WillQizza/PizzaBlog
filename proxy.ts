import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/app/lib/session";

const LOGIN_PATH = "/admin/login";

export default async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const isLoginRoute = pathname.toLocaleLowerCase() === LOGIN_PATH;

	const session = await decrypt(req.cookies.get("session")?.value);
	const isAuthed = !!session?.userId;

	// Unauthenticated visitor on a protected admin route -> login.
	if (!isLoginRoute && !isAuthed) {
		return NextResponse.redirect(new URL(LOGIN_PATH, req.nextUrl));
	}

	// Already-authenticated admin landing on the login page -> dashboard.
	if (isLoginRoute && isAuthed) {
		return NextResponse.redirect(new URL("/admin", req.nextUrl));
	}

	return NextResponse.next();
}

export const config = {
	// Run on the admin section plus the login page; everything else is public.
	matcher: ["/admin", "/admin/:path*"],
};
