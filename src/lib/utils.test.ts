import { expect, test } from "vitest";

import { getNextChapterUrl, getPreviousChapterUrl } from "./utils";

test("getNextChapterUrl should increment chapter number correctly", () => {
	const testUrls = [
		{
			input:
				"https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-309.html",
			expected:
				"https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-310.html",
		},
		{
			input: "https://www.bq01.cc/index/38697/73.html",
			expected: "https://www.bq01.cc/index/38697/74.html",
		},
		{
			input: "https://www.bq01.cc/index/38697/86.html",
			expected: "https://www.bq01.cc/index/38697/87.html",
		},
	];
	for (const { input, expected } of testUrls) {
		expect(getNextChapterUrl(input)).toBe(expected);
	}
});

test("getPreviousChapterUrl should decrement chapter number correctly", () => {
	const testUrls = [
		{
			input:
				"https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-309.html",
			expected:
				"https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-308.html",
		},
		{
			input: "https://www.bq01.cc/index/38697/73.html",
			expected: "https://www.bq01.cc/index/38697/72.html",
		},
		{
			input: "https://www.bq01.cc/index/38697/86.html",
			expected: "https://www.bq01.cc/index/38697/85.html",
		},
	];
	for (const { input, expected } of testUrls) {
		expect(getPreviousChapterUrl(input)).toBe(expected);
	}
});
