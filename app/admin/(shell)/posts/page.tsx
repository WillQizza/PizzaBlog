import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { getPostsForList } from "@/app/_lib/posts";
import { isAdmin } from "@/app/_lib/roles";
import { PostsView } from "./_components/PostsView";

export default async function PostsPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}

	// Editors only manage their own posts. Admins see everything.
	const admin = isAdmin(session);
	const scope = admin ? undefined : session.userId;
	const posts = await getPostsForList(scope);

	return <PostsView posts={posts} isAdmin={admin} />;
}
