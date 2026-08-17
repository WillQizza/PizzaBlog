import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/app/_components/Avatar";
import { PostCard } from "@/app/_components/PostCard";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { getPostBySlug, getPostState, getRecentPosts } from "@/app/_lib/posts";
import { canAuthorManagePosts, isAdmin } from "@/app/_lib/roles";
import { getSession } from "@/app/_lib/session";
import { PostBody } from "./_components/PostBody";
import styles from "./page.module.css";

const MORE_POSTS_COUNT = 2;

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export async function generateMetadata(
	props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
	const { slug } = await props.params;
	const post = await getPostBySlug(slug);
	// A draft or a scheduled post is not public yet, so its title and excerpt
	// stay out of the metadata just as they stay out of the page below.
	if (!post || getPostState(post.publishAt) !== "published") {
		return {};
	}

	return {
		title: post.title,
		description: post.excerpt,
	};
}

export default async function ViewPostPage(props: PageProps<"/blog/[slug]">) {
	const { slug } = await props.params;

	const post = await getPostBySlug(slug);
	// The public page only serves live posts: a draft has no publishAt and a
	// scheduled one has it in the future, so neither resolves to anything here.
	const publishedAt = post?.publishAt;
	if (!post || !publishedAt || getPostState(publishedAt) !== "published") {
		return notFound();
	}

	const [session, recent] = await Promise.all([
		getSession(),
		// One more than needed, so dropping the post being read still leaves two.
		getRecentPosts({ limit: MORE_POSTS_COUNT + 1, liveOnly: true }),
	]);

	const more = recent.filter(item => item.id !== post.id).slice(0, MORE_POSTS_COUNT);

	const canEdit =
		!!session
		&& canAuthorManagePosts(session)
		&& (isAdmin(session) || session.userId === post.authorId);

	return (
		<>
			<SiteHeader />
			<main className={styles.main}>
				<article className={styles.sheet}>
					<Link href="/" className={styles.backLink}>
						&#8592; All posts
					</Link>

					<h1 className={styles.title}>{post.title}</h1>

					<div className={styles.byline}>
						<Avatar name={post.authorName} size="large" />
						<div>
							<p className={styles.bylineName}>{post.authorName}</p>
							<p className={styles.bylineDetails}>
								{formatDate(publishedAt)} · {post.readMinutes} min read
								{canEdit && (
									<>
										{" · "}
										<Link href={`/admin/posts/${post.id}/edit`} className={styles.editLink}>
											Edit
										</Link>
									</>
								)}
							</p>
						</div>
					</div>

					<div className={styles.body}>
						<PostBody markdown={post.body} />
					</div>

					<footer className={styles.postFooter}>
						<Avatar name={post.authorName} size="large" />
						<p className={styles.postFooterText}>
							Written by <strong>{post.authorName}</strong>
							<br />
							Published {formatDate(publishedAt)}
						</p>
					</footer>
				</article>

				{more.length > 0 && (
					<section className={styles.more}>
						<p className={styles.moreLabel}>More posts</p>
						<div className={styles.moreGrid}>
							{more.map(item => (
								<PostCard
									key={item.id}
									href={`/blog/${item.slug}`}
									title={item.title}
									excerpt={item.excerpt}
									authorName={item.authorName}
									publishedAt={item.publishedAt}
									readMinutes={item.readMinutes}
								/>
							))}
						</div>
					</section>
				)}
			</main>
		</>
	);
}
