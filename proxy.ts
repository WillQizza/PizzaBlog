import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/app/_lib/session";

const LOGIN_PATH = "/admin/login";

const ADMIN_ONLY_PREFIXES = ["/admin/users"];

export default async function proxy(req: NextRequest) {
	const pathname = req.nextUrl.pathname.toLocaleLowerCase();
	const isLoginRoute = pathname === LOGIN_PATH;

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

	// Authenticated non-admins on admin-only routes -> dashboard.
	const isAdminOnly = ADMIN_ONLY_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
	if (isAdminOnly && session?.role !== "admin") {
		return NextResponse.redirect(new URL("/admin", req.nextUrl));
	}

	return NextResponse.next();
}

export const config = {
	// Run on the admin section plus the login page; everything else is public.
	matcher: ["/admin", "/admin/:path*"],
};
