import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { getPost } from "@/app/_lib/posts";
import { isAdmin } from "@/app/_lib/roles";
import { PostEditor } from "@/app/_components/PostEditor";

export default async function EditPostPage(props: PageProps<"/blog/[slug]/edit">) {
	const { slug } = await props.params;

	// The "slug" here is the numeric post id (that's what the admin links use).
	const id = Number(slug);
	if (!Number.isInteger(id)) {
		notFound();
	}

	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}

	const post = await getPost(id);
	if (!post) {
		notFound();
	}

	// Editors may only edit their own posts. Use notFound() rather than a redirect
	// so we don't confirm the post exists to someone who shouldn't see it.
	if (!isAdmin(session) && post.authorId !== session.userId) {
		notFound();
	}

	return (
		<PostEditor
			key={post.id}
			id={post.id}
			title={post.title}
			body={post.body}
			publishAt={post.publishAt}
		/>
	);
}
