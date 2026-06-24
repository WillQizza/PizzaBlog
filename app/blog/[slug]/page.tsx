export default async function ViewPostPage(props: PageProps<"/blog/[slug]/edit">) {
	const { slug } = await props.params;

	return (
		<div>
			{slug}
		</div>
	);
}
