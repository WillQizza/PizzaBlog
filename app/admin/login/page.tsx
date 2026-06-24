"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
	const [state, action, pending] = useActionState(login, undefined);

	return (
		<div>
			<form action={action}>
				<label>
					Email
					<input
						type="email"
						name="email"
						required
						placeholder="admin@pizza.blog"
					/>
				</label>
				<label>
					Password
					<input type="password" name="password" required />
				</label>

				{state?.error && (
					<p role="alert" style={{ color: "crimson", margin: 0 }}>
						{state.error}
					</p>
				)}

				<button type="submit" disabled={pending}>
					{pending ? "Signing in..." : "Sign in"}
				</button>
			</form>
		</div>
	);
}
