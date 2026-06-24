type User = { id: string; name: string; email: string; role: "admin" | "author" };

// Sample data, stands in for a database or CMS call.
const users: User[] = [
  { id: "1", name: "Jane Pepperoni", email: "jane@pizza.blog", role: "admin" },
  { id: "2", name: "Marco Margherita", email: "marco@pizza.blog", role: "author" },
  { id: "3", name: "Sal Funghi", email: "sal@pizza.blog", role: "author" },
];

// Users list route: /admin/users
export default function UsersPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: 640 }}>
      <p>
        <a href="/">Back home</a>
      </p>
      <h1>Users</h1>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Name</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Email</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "0.5rem" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{user.name}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{user.email}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
