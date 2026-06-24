// Edit post route: /blog/<slug>/edit
// `params` is a Promise in Next.js 16, typed via the generated PageProps helper.
export default async function EditPostPage(
  props: PageProps<"/blog/[slug]/edit">,
) {
  const { slug } = await props.params;

  // Dummy "loaded" post - in a real app you'd fetch this by slug.
  const post = {
    title: `Editing ${slug}`,
    slug,
    content: "Existing post content would be loaded here...",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 560 }}>
      <p>
        <a href={`/blog/${slug}`}>Back to post</a>
      </p>
      <h1>Edit post: {slug}</h1>

      {/* Pre-filled with the post being edited. */}
      <form
        action={`/api/posts/${slug}`}
        method="post"
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Title
          <input type="text" name="title" defaultValue={post.title} required />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Slug
          <input type="text" name="slug" defaultValue={post.slug} required />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Content
          <textarea name="content" rows={10} defaultValue={post.content} required />
        </label>
        <button type="submit">Save changes</button>
      </form>
    </main>
  );
}
