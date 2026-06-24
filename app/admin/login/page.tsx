// Administrator login route: /admin/login
export default function AdminLoginPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 360 }}>
      <p>
        <a href="/">Back home</a>
      </p>
      <h1>Admin login</h1>

      {/* No real auth wired up yet. */}
      <form
        action="/api/admin/login"
        method="post"
        style={{ display: "grid", gap: "0.75rem" }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Email
          <input type="email" name="email" required placeholder="admin@pizza.blog" />
        </label>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Password
          <input type="password" name="password" required />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
