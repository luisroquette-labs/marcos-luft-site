import Link from "next/link";
import type { Post } from "../app/posts";
import styles from "./EditorialPostCard.module.css";

/**
 * Minimal, text-only editorial post preview ("Blog Cards" by sumonadotwork,
 * 21st #9321). Replaces `BlogCard`'s cover-image layout with a dashed rule
 * between title and date, and a short excerpt — no imagery, subtle hover.
 */
export default function EditorialPostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      <div className={styles.row}>
        <h3 className={styles.title}>{post.title}</h3>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.date}>{formattedDate}</span>
      </div>
      <p className={styles.excerpt}>{post.excerpt}</p>
    </Link>
  );
}
