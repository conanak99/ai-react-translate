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

export function groupHistoryLinks(links: Link[]): HistoryDomainGroup[] {
	const domains = new Map<string, HistoryDomainGroup>();
	const sortedLinks = [...links].sort(
		(a, b) => Date.parse(b.created) - Date.parse(a.created),
	);

	for (const link of sortedLinks) {
		let url: URL;

		try {
			url = new URL(link.link);
		} catch {
			url = new URL(`https://invalid.local/${encodeURIComponent(link.link)}`);
		}

		const isInvalid = url.hostname === "invalid.local";
		const origin = isInvalid ? "invalid" : url.origin;
		const domain =
			domains.get(origin) ??
			({
				origin,
				label: isInvalid ? "Invalid links" : `${url.origin}/`,
				paths: [],
				count: 0,
			} satisfies HistoryDomainGroup);
		const pathDetails = isInvalid
			? { path: "/", label: "Other", pageLabel: link.link }
			: getPathDetails(url);
		let pathGroup = domain.paths.find(({ path }) => path === pathDetails.path);

		if (!pathGroup) {
			pathGroup = {
				path: pathDetails.path,
				label: pathDetails.label,
				links: [],
			};
			domain.paths.push(pathGroup);
		}

		pathGroup.links.push({ ...link, pageLabel: pathDetails.pageLabel });
		domain.count += 1;
		domains.set(origin, domain);
	}

	return [...domains.values()];
}
