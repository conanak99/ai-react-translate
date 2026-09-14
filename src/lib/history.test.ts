import { describe, expect, it } from "vitest";
import type { Link } from "../pocket";
import { groupHistoryLinks } from "./history";

function link(id: string, url: string, created: string): Link {
	return {
		id,
		collectionId: "links",
		collectionName: "links",
		created,
		updated: created,
		link: url,
	};
}

describe("groupHistoryLinks", () => {
	it("groups links by domain and parent path in descending date order", () => {
		const groups = groupHistoryLinks([
			link("1", "https://ixdzs.tw/read/502667/p45.html", "2026-01-01"),
			link("2", "https://ixdzs.tw/read/502663/p45.html", "2026-01-03"),
			link("3", "https://ixdzs.tw/read/502667/p46.html", "2026-01-02"),
			link("4", "https://example.com/chapter/1", "2025-12-01"),
		]);

		expect(groups.map(({ label }) => label)).toEqual([
			"ixdzs.tw",
			"example.com",
		]);
		expect(groups[0].paths.map(({ label }) => label)).toEqual([
			"read/502663",
			"read/502667",
		]);
		expect(groups[0].paths[1].links.map(({ pageLabel }) => pageLabel)).toEqual([
			"p46.html",
			"p45.html",
		]);
	});

	it("keeps malformed links in a separate group", () => {
		const groups = groupHistoryLinks([link("1", "not a URL", "2026-01-01")]);

		expect(groups[0]).toMatchObject({
			label: "Invalid links",
			count: 1,
			paths: [{ label: "Other", links: [{ pageLabel: "not a URL" }] }],
		});
	});

	it("assumes HTTPS when a link has no scheme", () => {
		const groups = groupHistoryLinks([
			link("1", "jinyong.net.cn/old_liudingji/1917.html", "2026-01-01"),
		]);

		expect(groups[0]).toMatchObject({
			label: "jinyong.net.cn",
			paths: [
				{
					label: "old_liudingji",
					links: [
						{
							link: "https://jinyong.net.cn/old_liudingji/1917.html",
							pageLabel: "1917.html",
						},
					],
				},
			],
		});
	});

	it("groups HTTP and HTTPS links under the same domain", () => {
		const groups = groupHistoryLinks([
			link("1", "http://www.b111.net/book/1.html", "2026-01-02"),
			link("2", "https://www.b111.net/book/2.html", "2026-01-01"),
		]);

		expect(groups).toHaveLength(1);
		expect(groups[0]).toMatchObject({
			label: "www.b111.net",
			count: 2,
		});
	});
});
