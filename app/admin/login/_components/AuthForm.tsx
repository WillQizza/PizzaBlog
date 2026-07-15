"use client";

import { useActionState } from "react";
import { login, register } from "../actions";
import styles from "./AuthForm.module.css";

type Mode = "login" | "register";

const MODE_TEXT = {
	login: {
		eyebrow: "Welcome back",
		heading: "Sign in",
		subheading: "Enter your credentials to reach the dashboard.",
		submit: "Sign in",
		pending: "Signing in",
	},
	register: {
		eyebrow: "Welcome",
		heading: "Create your account",
		subheading: "No accounts exist yet! Setup the administrator.",
		submit: "Create account",
		pending: "Creating account",
	},
} as const;

export default function AuthForm({ mode }: { mode: Mode }) {
	const isRegister = mode === "register";
	const text = MODE_TEXT[mode];
	const [state, action, pending] = useActionState(
		isRegister ? register : login,
		undefined,
	);

	return (
		<main className={styles.screen}>
			<section className={styles.card}>
				<header className={styles.header}>
					<span className={styles.eyebrow}>{text.eyebrow}</span>
					<h1 className={styles.heading}>{text.heading}</h1>
					<p className={styles.subheading}>{text.subheading}</p>
				</header>

				<form action={action} className={styles.form} noValidate>
					<div className={styles.field}>
						<input
							id="email"
							className={styles.input}
							type="email"
							name="email"
							required
							autoComplete="email"
							placeholder=" "
						/>
						<label htmlFor="email" className={styles.label}>
							Email
						</label>
					</div>

					<div className={styles.field}>
						<input
							id="password"
							className={styles.input}
							type="password"
							name="password"
							required
							minLength={isRegister ? 8 : undefined}
							autoComplete={isRegister ? "new-password" : "current-password"}
							placeholder=" "
						/>
						<label htmlFor="password" className={styles.label}>
							Password
						</label>
					</div>

					{state?.error && (
						<p role="alert" className={styles.error}>
							{state.error}
						</p>
					)}

					<button
						type="submit"
						className={styles.submit}
						disabled={pending}
					>
						<span className={styles.submitLabel}>
							{pending ? text.pending : text.submit}
						</span>
						{pending && <span className={styles.spinner} aria-hidden />}
					</button>
				</form>
			</section>
		</main>
	);
}
