import type { ScraperProvider } from "@/lib/models";

async function fetchWithJina(url: string): Promise<string> {
	console.log(`Fetching content from Jina: https://r.jina.ai/${url}`);
	const jinaApiKey = import.meta.env.JINA_API_KEY;

	const response = await fetch(`https://r.jina.ai/${url}`, {
		headers: jinaApiKey
			? { Authorization: `Bearer ${jinaApiKey}` }
			: undefined,
	});

	return response.text();
}

async function fetchWithFirecrawl(url: string): Promise<string> {
	console.log(`Fetching content from Firecrawl: ${url}`);
	const firecrawlApiKey = import.meta.env.FIRECRAWL_API_KEY;

	if (!firecrawlApiKey) {
		throw new Error("FIRECRAWL_API_KEY environment variable is not set");
	}

	const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${firecrawlApiKey}`,
		},
		body: JSON.stringify({
			url,
			formats: ["markdown"],
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Firecrawl API error (${response.status}): ${errorText}`);
	}

	const json = await response.json();

	if (!json.success) {
		throw new Error(`Firecrawl scrape failed: ${JSON.stringify(json)}`);
	}

	return json.data?.markdown ?? "";
}

export async function crawl(
	url: string,
	provider: ScraperProvider = "jina",
): Promise<string> {
	const content =
		provider === "firecrawl"
			? await fetchWithFirecrawl(url)
			: await fetchWithJina(url);
	console.log("Content fetched successfully");
	return content;
}
