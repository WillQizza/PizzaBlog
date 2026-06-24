// New post route: /admin/posts/new
export default function NewPostPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 560 }}>
      <p>
        <a href="/">Back home</a>
      </p>
      <h1>New post</h1>

      {/* Posts to a (not-yet-implemented) API route. */}
      <form
        action="/api/posts"
        method="post"
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Title
          <input type="text" name="title" required placeholder="The perfect Margherita" />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Slug
          <input type="text" name="slug" required placeholder="perfect-margherita" />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Content
          <textarea name="content" rows={10} required />
        </label>
        <button type="submit">Publish</button>
      </form>
    </main>
  );
}
