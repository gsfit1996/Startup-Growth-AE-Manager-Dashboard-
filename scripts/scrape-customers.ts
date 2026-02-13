import fs from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import pLimit from "p-limit";
import robotsParser from "robots-parser";

type ScrapeConfig = {
  maxDepth: number;
  maxPages: number;
  concurrency: number;
  timeoutMs: number;
  seeds: string[];
};

type SnapshotRow = {
  companyName: string;
  sourceUrl: string;
  industryHint: string;
  aiUseCase: string;
  evidenceSnippet: string;
  segmentHint: "Seed" | "Series A" | "Series B+";
  lastSeenAt: string;
};

type QueueNode = {
  url: string;
  depth: number;
};

const USER_AGENT = "Mozilla/5.0 (portfolio-demo-crawler/1.0)";

const dataDir = path.join(process.cwd(), "data");
const sourcesPath = path.join(dataDir, "scrape-sources.json");
const snapshotPath = path.join(dataDir, "customer_snapshot.json");

const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

async function readConfig(): Promise<ScrapeConfig> {
  const raw = await fs.readFile(sourcesPath, "utf8");
  return JSON.parse(raw) as ScrapeConfig;
}

async function getRobots(url: URL, timeoutMs: number) {
  if (robotsCache.has(url.origin)) {
    return robotsCache.get(url.origin)!;
  }

  const robotsUrl = `${url.origin}/robots.txt`;

  try {
    const response = await fetch(robotsUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    });

    const body = response.ok ? await response.text() : "";
    const parser = robotsParser(robotsUrl, body);
    robotsCache.set(url.origin, parser);
    return parser;
  } catch {
    const parser = robotsParser(robotsUrl, "");
    robotsCache.set(url.origin, parser);
    return parser;
  }
}

async function fetchHtml(url: string, timeoutMs: number) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return null;
  }

  const html = await response.text();
  return {
    html,
    finalUrl: response.url,
  };
}

function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      const normalized = new URL(href, baseUrl);
      if (!["http:", "https:"].includes(normalized.protocol)) return;

      normalized.hash = "";
      links.add(normalized.toString());
    } catch {
      // Ignore malformed links.
    }
  });

  return [...links];
}

function normalizeCompanyName(title: string, url: URL): string {
  const cleaned = title
    .replace(/\|.*/g, "")
    .replace(/-.*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > 1) {
    return cleaned;
  }

  const host = url.hostname.replace("www.", "").split(".")[0];
  return host.charAt(0).toUpperCase() + host.slice(1);
}

function inferIndustry(text: string, hostname: string): string {
  const probe = `${hostname} ${text}`.toLowerCase();

  if (probe.includes("fintech") || probe.includes("payment")) return "Fintech";
  if (probe.includes("developer") || probe.includes("api") || probe.includes("code")) return "Developer Tools";
  if (probe.includes("support") || probe.includes("service")) return "Customer Support SaaS";
  if (probe.includes("security") || probe.includes("compliance")) return "Security";
  if (probe.includes("design")) return "Design Collaboration";
  if (probe.includes("automation")) return "Workflow Automation";

  return "B2B Software";
}

function inferSegment(text: string): "Seed" | "Series A" | "Series B+" {
  const probe = text.toLowerCase();

  if (probe.includes("enterprise") || probe.includes("global") || probe.includes("fortune")) return "Series B+";
  if (probe.includes("startup") || probe.includes("early stage") || probe.includes("founder")) return "Seed";
  return "Series A";
}

function inferUseCase(text: string): string {
  const chunks = text
    .replace(/\s+/g, " ")
    .split(".")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const sentence =
    chunks.find((chunk) => /(ai|llm|model|assistant|automation|agent|machine learning)/i.test(chunk)) ??
    "AI-enabled productivity and workflow acceleration.";

  return sentence.slice(0, 180);
}

function inferEvidence(text: string): string {
  const chunks = text
    .replace(/\s+/g, " ")
    .split(".")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const sentence = chunks.find((chunk) => chunk.length >= 40) ?? "Public product content references AI workflow value.";
  return sentence.slice(0, 180);
}

function extractSnapshotRow(html: string, finalUrl: string): SnapshotRow {
  const $ = cheerio.load(html);
  const pageTitle =
    $("meta[property='og:site_name']").attr("content") ??
    $("meta[property='og:title']").attr("content") ??
    $("title").text() ??
    "Unknown";

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const url = new URL(finalUrl);

  return {
    companyName: normalizeCompanyName(pageTitle, url),
    sourceUrl: finalUrl,
    industryHint: inferIndustry(bodyText.slice(0, 5000), url.hostname),
    aiUseCase: inferUseCase(bodyText.slice(0, 10000)),
    evidenceSnippet: inferEvidence(bodyText.slice(0, 12000)),
    segmentHint: inferSegment(bodyText.slice(0, 6000)),
    lastSeenAt: new Date().toISOString(),
  };
}

async function crawl() {
  const config = await readConfig();
  const limit = pLimit(config.concurrency);

  const queue: QueueNode[] = config.seeds.map((seed) => ({ url: seed, depth: 0 }));
  const visited = new Set<string>();
  const rowsByKey = new Map<string, SnapshotRow>();

  while (queue.length > 0 && visited.size < config.maxPages) {
    const batch = queue.splice(0, config.concurrency);

    await Promise.all(
      batch.map((node) =>
        limit(async () => {
          if (visited.has(node.url) || visited.size >= config.maxPages) return;

          let parsed: URL;
          try {
            parsed = new URL(node.url);
          } catch {
            return;
          }

          const robots = await getRobots(parsed, config.timeoutMs);
          const allowed = robots.isAllowed(node.url, USER_AGENT);
          if (allowed === false) {
            return;
          }

          visited.add(node.url);

          try {
            const response = await fetchHtml(node.url, config.timeoutMs);
            if (!response) {
              return;
            }

            const row = extractSnapshotRow(response.html, response.finalUrl);
            rowsByKey.set(`${row.companyName}-${row.sourceUrl}`, row);

            if (node.depth < config.maxDepth) {
              for (const link of extractLinks(response.html, response.finalUrl)) {
                if (!visited.has(link) && queue.length + visited.size < config.maxPages * 2) {
                  queue.push({ url: link, depth: node.depth + 1 });
                }
              }
            }
          } catch {
            // Keep crawl resilient across mixed source quality.
          }
        }),
      ),
    );
  }

  const rows = [...rowsByKey.values()]
    .filter((row) => row.companyName.length >= 2)
    .sort((a, b) => a.companyName.localeCompare(b.companyName));

  if (!rows.length) {
    throw new Error("Scrape completed with zero extracted rows.");
  }

  await fs.writeFile(snapshotPath, JSON.stringify(rows, null, 2), "utf8");
  console.log(`Wrote ${rows.length} rows to ${snapshotPath}`);
}

crawl().catch(async (error) => {
  console.error("Scrape failed:", error instanceof Error ? error.message : error);

  try {
    await fs.access(snapshotPath);
    console.error("Existing cached snapshot retained.");
  } catch {
    process.exitCode = 1;
  }
});
