import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/app/_components/Avatar";
import {
	getMonthlyPublishedPoints,
	getDashboardStats,
} from "@/app/_lib/dashboard";
import { getRecentPosts } from "@/app/_lib/posts";
import { getCurrentUser, getTeamMembers } from "@/app/_lib/users";
import { Sparkline } from "./_components/Sparkline";
import { StatTile } from "./_components/StatTile";
import { StatusPill } from "./_components/StatusPill";
import styles from "./page.module.css";

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default async function AdminDashboardPage() {
	const user = await getCurrentUser();
	if (!user) {
		return redirect("/admin/login");
	}

	const isAdmin = user.role === "admin";
	const scope = isAdmin ? undefined : user.id;

	const [stats, monthly, recent, team] = await Promise.all([
		getDashboardStats(scope),
		getMonthlyPublishedPoints(scope),
		getRecentPosts({ limit: 6, authorId: scope }),
		isAdmin ? getTeamMembers() : null,
	]);

	const publishedTotal = monthly.reduce((sum, point) => sum + point.count, 0);

	return (
		<div className={styles.page}>
			<header className={styles.topbar}>
				<div>
					<h1 className={styles.title}>Dashboard</h1>
					<p className={styles.subtitle}>
						{isAdmin
							? `Welcome back, ${user.name || user.email} - here's what's happening.`
							: "Your posts at a glance."}
					</p>
				</div>
				<Link href="/admin/posts/new" className={styles.newPost}>
					New post
				</Link>
			</header>

			<section className={styles.stats}>
				<StatTile
					label="Total posts"
					value={stats.total}
					delta={stats.createdThisMonth > 0 ? `+${stats.createdThisMonth} this month` : "No new posts this month"}
					deltaTone={stats.createdThisMonth > 0 ? "good" : "muted"}
				/>
				<StatTile
					label="Published"
					value={stats.published}
					delta={stats.publishedThisMonth > 0 ? `+${stats.publishedThisMonth} live this month` : "None went live this month"}
					deltaTone={stats.publishedThisMonth > 0 ? "good" : "muted"}
				/>
				<StatTile label="Drafts" value={stats.drafts} delta="Not yet scheduled" />
				{isAdmin ? (
					<StatTile
						label="Authors"
						value={stats.admins + stats.editors}
						delta={`${stats.admins} admin · ${stats.editors} editor${stats.editors === 1 ? "" : "s"}`}
					/>
				) : (
					<StatTile label="Scheduled" value={stats.scheduled} delta="Going live later" />
				)}
			</section>

			<section className={styles.split}>
				<div className={styles.block}>
					<div className={styles.blockHead}>
						<h2 className={styles.blockTitle}>Recent posts</h2>
						<Link href="/admin/posts" className={styles.blockLink}>
							View all
						</Link>
					</div>
					{recent.length === 0 ? (
						<p className={styles.empty}>
							No posts yet. <Link href="/admin/posts/new">Write the first one</Link>.
						</p>
					) : (
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>Title</th>
										<th>Author</th>
										<th>Status</th>
										<th>Updated</th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{recent.map(post => (
										<tr key={post.id}>
											<td>
												<div className={styles.postTitle}>{post.title}</div>
												<div className={styles.postMeta}>{post.readMinutes} min read</div>
											</td>
											<td>
												<div className={styles.author}>
													<Avatar name={post.authorName} />
													<span>{post.authorName}</span>
												</div>
											</td>
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
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<div className={styles.side}>
					<div className={`${styles.block} ${styles.chartBlock}`}>
						<div className={styles.chartHead}>
							<div>
								<div className={styles.chartNum}>{publishedTotal}</div>
								<div className={styles.chartCap}>Posts published · last 6 months</div>
							</div>
						</div>
						<Sparkline points={monthly} />
					</div>

					{team && (
						<div className={styles.block}>
							<div className={styles.blockHead}>
								<h2 className={styles.blockTitle}>Your team</h2>
								<Link href="/admin/authors" className={styles.blockLink}>
									Manage
								</Link>
							</div>
							<div className={styles.teamList}>
								{team.map(member => (
									<div key={member.id} className={styles.teamRow}>
										<Avatar name={member.name || member.email} />
										<div>
											<div className={styles.teamName}>{member.name || member.email}</div>
											<div className={styles.teamPosts}>
												{member.postCount} post{member.postCount === 1 ? "" : "s"}
											</div>
										</div>
										<span
											className={
												member.role === "admin"
													? `${styles.role} ${styles.roleAdmin}`
													: styles.role
											}
										>
											{member.role}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
