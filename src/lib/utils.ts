import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getNextChapterUrl(inputURL: string) {
	const matches = [...inputURL.matchAll(/\d+/g)];
	const chapterNumber = matches[matches.length - 1]?.[0];

	// Change chapter number by change value
	const newChapterNumber = Number(chapterNumber) + 1;
	const formattedChapterNumber = formatChapterNumber(
		newChapterNumber,
		chapterNumber,
	);

	const newUrl = inputURL.replace(
		new RegExp(`${chapterNumber}(?=[^\\d]*$)`),
		formattedChapterNumber,
	);
	return newUrl;
}

export function getPreviousChapterUrl(inputURL: string) {
	const matches = [...inputURL.matchAll(/\d+/g)];
	const chapterNumber = matches[matches.length - 1]?.[0];

	// Change chapter number by change value
	const newChapterNumber = Number(chapterNumber) - 1;
	const formattedChapterNumber = formatChapterNumber(
		newChapterNumber,
		chapterNumber,
	);

	// Replace chapter number in url
	const newUrl = inputURL.replace(
		new RegExp(`${chapterNumber}(?=[^\\d]*$)`),
		formattedChapterNumber,
	);
	return newUrl;
}

function formatChapterNumber(
	chapterNumber: number,
	previousChapterNumber?: string,
) {
	const nextChapterNumber = chapterNumber.toString();

	if (chapterNumber < 0 || !previousChapterNumber) {
		return nextChapterNumber;
	}

	return nextChapterNumber.padStart(previousChapterNumber.length, "0");
}
