"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/app/_lib/session";

export async function logout(): Promise<void> {
	await deleteSession();
	redirect("/");
}
