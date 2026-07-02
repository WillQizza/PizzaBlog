import Link from "next/link";
import { Avatar } from "./Avatar";
import styles from "./PostCard.module.css";

type PostCardProps = {
	href: string;
	title: string;
	excerpt: string;
	authorName: string;
	publishedAt: Date;
	readMinutes: number;
};

export function PostCard({
	href,
	title,
	excerpt,
	authorName,
	publishedAt,
	readMinutes,
}: PostCardProps) {
	return (
		<article className={styles.card}>
			<Link href={href} className={styles.link}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.excerpt}>{excerpt}</p>

				<footer className={styles.meta}>
					<Avatar name={authorName} />
					<div>
						<p className={styles.author}>{authorName}</p>
						<p className={styles.details}>
							{publishedAt.toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}{" "}
							· {readMinutes} min read
						</p>
					</div>
				</footer>
			</Link>
		</article>
	);
}
