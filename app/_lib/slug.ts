export const SLUG_MAX_LENGTH = 80;
export const FALLBACK_SLUG = "post";

export function slugify(title: string): string {
	const folded = title
		.toLowerCase()
		.replace(/['‘’`´]/g, "")
		// NFKD doesn't do these characters
		.replace(/ß/g, "ss")
		.replace(/æ/g, "ae")
		.replace(/œ/g, "oe")
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "");

	const slug = folded
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	if (!slug) {
		return FALLBACK_SLUG;
	}

	if (slug.length <= SLUG_MAX_LENGTH) {
		return slug;
	}

	// Cut back to the last separator so a long title does not end mid-word.
	const cut = slug.slice(0, SLUG_MAX_LENGTH);
	const lastDash = cut.lastIndexOf("-");
	return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}
