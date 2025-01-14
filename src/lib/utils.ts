import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getNextChapterUrl(inputURL: string) {
	// Example input `https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-309.html`
  // https://www.bq01.cc/index/38697/73.html
	// Get chapter number from url using regex

	const matches = [...inputURL.matchAll(/\d+/g)];
	const chapterNumber = matches[matches.length - 1]?.[0];

	// Change chapter number by change value
	const newChapterNumber = Number(chapterNumber) + 1;

	// Replace chapter number in url
	const newUrl = inputURL.replace(
		String(chapterNumber),
		newChapterNumber.toString(),
	);
	return newUrl;
}

export function getPreviousChapterUrl(inputURL: string) {
	// Example input `https://truyenyy.vip/truyen/thinh-cong-tu-tram-yeu/chuong-309.html`
  // https://www.bq01.cc/index/38697/73.html
	// Get chapter number from url using regex

	const matches = [...inputURL.matchAll(/\d+/g)];
	const chapterNumber = matches[matches.length - 1]?.[0];

	// Change chapter number by change value
	const newChapterNumber = Number(chapterNumber) - 1;

	// Replace chapter number in url
	const newUrl = inputURL.replace(
		String(chapterNumber),
		newChapterNumber.toString(),
	);
	return newUrl;
}