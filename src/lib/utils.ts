import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getNextChapterUrl(inputURL: string) {
	const matches = [...inputURL.matchAll(/\d+/g)];
	const chapterNumber = matches[matches.length - 1]?.[0];

	// Change chapter number by change value
	const newChapterNumber = Number(chapterNumber) + 1;

	const newUrl = inputURL.replace(
		new RegExp(`${chapterNumber}(?=[^\\d]*$)`),
		newChapterNumber.toString(),
	);
	return newUrl;
}

export function getPreviousChapterUrl(inputURL: string) {
	const matches = [...inputURL.matchAll(/\d+/g)];
	const chapterNumber = matches[matches.length - 1]?.[0];

	// Change chapter number by change value
	const newChapterNumber = Number(chapterNumber) - 1;

	// Replace chapter number in url
	const newUrl = inputURL.replace(
		new RegExp(`${chapterNumber}(?=[^\\d]*$)`),
		newChapterNumber.toString(),
	);
	return newUrl;
}