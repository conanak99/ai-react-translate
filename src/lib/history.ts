import type { Link } from "../pocket";

export type HistoryLink = Link & {
	pageLabel: string;
};

export type HistoryPathGroup = {
	path: string;
	label: string;
	links: HistoryLink[];
};

export type HistoryDomainGroup = {
	origin: string;
	label: string;
	paths: HistoryPathGroup[];
	count: number;
};

function getPathDetails(url: URL) {
	const segments = url.pathname.split("/").filter(Boolean);
	const page = segments.pop();

	return {
		path: segments.length > 0 ? `/${segments.join("/")}` : "/",
		label: segments.length > 0 ? segments.join("/") : "Root",
		pageLabel: `${page ?? url.hostname}${url.search}${url.hash}`,
	};
}

function parseLinkUrl(link: string) {
	const trimmedLink = link.trim();

	for (const candidate of [trimmedLink, `https://${trimmedLink}`]) {
		try {
			const url = new URL(candidate);
			if (url.protocol === "http:" || url.protocol === "https:") return url;
		} catch {
			// Try again with an assumed HTTPS scheme.
		}
	}

	return undefined;
}

export function groupHistoryLinks(links: Link[]): HistoryDomainGroup[] {
	const domains = new Map<string, HistoryDomainGroup>();
	const sortedLinks = [...links].sort(
		(a, b) => Date.parse(b.created) - Date.parse(a.created),
	);

	for (const link of sortedLinks) {
		const url = parseLinkUrl(link.link);
		const origin = url?.origin ?? "invalid";
		const domain =
			domains.get(origin) ??
			({
				origin,
				label: url ? `${url.origin}/` : "Invalid links",
				paths: [],
				count: 0,
			} satisfies HistoryDomainGroup);
		const pathDetails = url
			? getPathDetails(url)
			: { path: "/", label: "Other", pageLabel: link.link };
		let pathGroup = domain.paths.find(({ path }) => path === pathDetails.path);

		if (!pathGroup) {
			pathGroup = {
				path: pathDetails.path,
				label: pathDetails.label,
				links: [],
			};
			domain.paths.push(pathGroup);
		}

		pathGroup.links.push({
			...link,
			link: url?.href ?? link.link,
			pageLabel: pathDetails.pageLabel,
		});
		domain.count += 1;
		domains.set(origin, domain);
	}

	return [...domains.values()];
}
