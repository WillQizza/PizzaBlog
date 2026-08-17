import { notFound, redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { getPost } from "@/app/_lib/posts";
import { isAdmin } from "@/app/_lib/roles";
import { PostEditor } from "@/app/_components/PostEditor";

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]/edit">) {
	const { id: idParam } = await props.params;

	const id = Number(idParam);
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

	// Editors may only edit their own posts.
	if (!isAdmin(session) && post.authorId !== session.userId) {
		return notFound();
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
