"use client";

import type { Author } from "@/app/_lib/users";
import { isAdmin } from "@/app/_lib/roles";
import { fullName, initialsOf } from "./helpers";
import styles from "./authors.module.css";

export function AuthorsTable({
	authors,
	currentUserId,
	onEdit,
	onDelete,
}: {
	authors: Author[];
	currentUserId: number;
	onEdit: (author: Author) => void;
	onDelete: (author: Author) => void;
}) {
	return (
		<div className={styles.card}>
			<div className={styles.tableWrap}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Author</th>
							<th>Role</th>
							<th className={styles.numCol}>Posts</th>
							<th aria-label="Actions" />
						</tr>
					</thead>
					<tbody>
						{authors.map(author => {
							const isSelf = author.id === currentUserId;
							return (
								<tr key={author.id}>
									<td>
										<div className={styles.author}>
											<span className={styles.avatar}>
												{initialsOf(author)}
											</span>
											<div>
												<div className={styles.authorName}>
													{fullName(author)}
													{isSelf && (
														<span className={styles.youTag}>You</span>
													)}
												</div>
												<div className={styles.authorEmail}>
													{author.email}
												</div>
											</div>
										</div>
									</td>
									<td>
										<span
											className={
												isAdmin(author)
													? `${styles.role} ${styles.roleAdmin}`
													: styles.role
											}
										>
											{author.role}
										</span>
									</td>
									<td className={`${styles.numCol} ${styles.posts}`}>
										{author.postCount}
									</td>
									<td>
										<div className={styles.rowActions}>
											<button
												type="button"
												className={styles.rowAction}
												onClick={() => onEdit(author)}
												disabled={isSelf}
												title={
													isSelf
														? "Edit your own account from Account settings"
														: undefined
												}
											>
												Edit
											</button>
											<button
												type="button"
												className={`${styles.rowAction} ${styles.danger}`}
												onClick={() => onDelete(author)}
												disabled={isSelf}
												title={
													isSelf
														? "You can't delete your own account"
														: undefined
												}
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
