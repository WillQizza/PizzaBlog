import { headers } from "next/headers";

type Pizza = { slug: string; name: string; topping: string };

// Fetch our own API route. Calling a route handler over HTTP needs an absolute
// URL, so we build the origin from the incoming request headers. Reading
// headers() opts this page into dynamic rendering.
async function getPizzas(): Promise<Pizza[]> {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/pizzas`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load pizzas");

  const data: { pizzas: Pizza[] } = await res.json();
  return data.pizzas;
}

export default async function Home() {
  const pizzas = await getPizzas();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Pizza Blog</h1>
      <p>
        The list below is fetched from the <code>/api/pizzas</code> route
        handler on the server.
      </p>

      <ul>
        {pizzas.map((pizza) => (
          <li key={pizza.slug}>
            <a href={`/blog/${pizza.slug}`}>{pizza.name}</a> - {pizza.topping}
          </li>
        ))}
      </ul>
    </main>
  );
}
