"use client";

import Link from "next/link";
import { Avatar } from "@/app/_components/Avatar";
import { StatusPill } from "@/app/admin/(shell)/_components/StatusPill";
import { formatDate } from "@/app/_lib/format";
import type { PostListItem } from "@/app/_lib/posts";
import styles from "./posts.module.css";

export function PostsTable({
	posts,
	showAuthor,
	onDelete,
}: {
	posts: PostListItem[];
	showAuthor: boolean;
	onDelete: (post: PostListItem) => void;
}) {
	return (
		<div className={styles.card}>
			<div className={styles.tableWrap}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Title</th>
							{showAuthor && <th>Author</th>}
							<th>Status</th>
							<th>Updated</th>
							<th aria-label="Actions" />
						</tr>
					</thead>
					<tbody>
						{posts.map(post => (
							<tr key={post.id}>
								<td>
									<div className={styles.postTitle}>{post.title}</div>
									<div className={styles.postMeta}>{post.readMinutes} min read</div>
								</td>
								{showAuthor && (
									<td>
										<div className={styles.author}>
											<Avatar name={post.authorName} />
											<span>{post.authorName}</span>
										</div>
									</td>
								)}
								<td>
									<StatusPill state={post.state} />
								</td>
								<td className={styles.date}>{formatDate(post.updatedAt)}</td>
								<td>
									<div className={styles.rowActions}>
										<Link href={`/blog/${post.id}/edit`} className={styles.rowAction}>
											Edit
										</Link>
										<Link href={`/blog/${post.id}`} className={styles.rowAction}>
											View
										</Link>
										<button
											type="button"
											className={`${styles.rowAction} ${styles.danger}`}
											onClick={() => onDelete(post)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
