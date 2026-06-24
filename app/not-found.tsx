// Root 404 page. Rendered for any unmatched route, or when notFound() is called.
export default function NotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 560 }}>
      <h1>404 - Page not found</h1>
      <p>That slice does not exist. It may have been eaten or moved.</p>
      <p>
        <a href="/">Back home</a>
      </p>
    </main>
  );
}
