export default async function EditPostPage(props: PageProps<"/blog/[slug]/edit">) {
	const { slug } = await props.params;

	return (
		<div>
			Edit {slug}
		</div>
	);
}
