// Dynamic blog route: /blog/<slug>
// In Next.js 16, `params` is a Promise and must be awaited.
// `PageProps<"/blog/[slug]">` is a globally generated, type-safe helper.
export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <p>
        <a href="/">Back home</a>
      </p>
      <h1>Blog post: {slug}</h1>
      <p>
        This page is identified by the <code>{slug}</code> slug. Try visiting{" "}
        <code>/blog/margherita</code> or <code>/blog/anything-you-want</code>.
      </p>
      <p>
        <a href={`/blog/${slug}/edit`}>Edit this post</a>
      </p>
    </main>
  );
}
