import { PostCard } from "@/app/_components/PostCard";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { getRecentPosts } from "@/app/_lib/posts";
import { getSiteSettings } from "@/app/_lib/settings";
import styles from "./page.module.css";

export default async function Home() {
	const [posts, settings] = await Promise.all([
		getRecentPosts(),
		getSiteSettings(),
	]);

	return (
		<>
			<SiteHeader />
			<main className={styles.main}>
				<div className={styles.container}>
					<section className={styles.hero}>
						<p className={styles.header}>{settings.heroHeader}</p>
						<h1 className={styles.headline}>{settings.heroHeadline}</h1>
						<p className={styles.description}>{settings.heroDescription}</p>
					</section>

					<section className={styles.grid}>
						{posts.map(post => (
							<PostCard
								key={post.id}
								href={`/blog/${post.id}`}
								title={post.title}
								excerpt={post.excerpt}
								authorName={post.authorName}
								publishedAt={post.publishedAt}
								readMinutes={post.readMinutes}
							/>
						))}
						{posts.length === 0 && (
							<p className={styles.empty}>Nothing published yet.</p>
						)}
					</section>
				</div>
			</main>
		</>
	);
}
