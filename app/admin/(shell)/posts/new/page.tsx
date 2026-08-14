import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { PostEditor } from "@/app/_components/PostEditor";

export default async function NewPostPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}

	return <PostEditor />;
}
