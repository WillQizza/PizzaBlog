import styles from "./Avatar.module.css";

function initialsOf(name: string): string {
	return name
		.split(/\s+/)
		.filter(v => !!v)
		.slice(0, 2)
		.map(part => part[0].toUpperCase())
		.join("");
}

export function Avatar({ name }: { name: string }) {
	return (
		<span className={styles.avatar}>
			{initialsOf(name)}
		</span>
	);
}
