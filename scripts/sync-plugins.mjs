import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const sourcesPath = resolve(rootDir, 'sources.json');
const outputPath = resolve(rootDir, 'pluginmaster.json');

const DOWNLOAD_PROXY_BASE = 'https://n0wayplugins.discloud.app/download';
const DOWNLOAD_STATS_URL = 'https://n0wayplugins.discloud.app/api/downloads';

const FIELD_ORDER = [
  'Author',
  'Name',
  'InternalName',
  'AssemblyVersion',
  'TestingAssemblyVersion',
  'Punchline',
  'Description',
  'ApplicableVersion',
  'DalamudApiLevel',
  'TestingDalamudApiLevel',
  'RepoUrl',
  'DownloadLinkInstall',
  'DownloadLinkTesting',
  'DownloadLinkUpdate',
  'DownloadCount',
  'IconUrl',
  'Tags',
];

function orderFields(entry) {
  const ordered = {};
  for (const key of FIELD_ORDER) {
    if (entry[key] !== undefined) {
      ordered[key] = entry[key];
    }
  }
  for (const [key, value] of Object.entries(entry)) {
    if (!(key in ordered) && value !== undefined) {
      ordered[key] = value;
    }
  }
  return ordered;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'n0way02-DalamudPlugins-Sync/1.0' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function loadExistingCounts() {
  const map = new Map();
  try {
    const existing = JSON.parse(await readFile(outputPath, 'utf8'));
    if (Array.isArray(existing)) {
      for (const item of existing) {
        if (item?.InternalName && Number.isFinite(Number(item.DownloadCount))) {
          map.set(item.InternalName, Math.max(0, Math.floor(Number(item.DownloadCount))));
        }
      }
    }
  } catch {
    // Ignore if pluginmaster.json does not exist yet
  }
  return map;
}

async function fetchLiveDownloadCounts(fallbackMap) {
  const map = new Map(fallbackMap);
  try {
    const data = await fetchJson(DOWNLOAD_STATS_URL);
    const downloads = data?.downloads || {};
    for (const [internalName, rawCount] of Object.entries(downloads)) {
      const n = Number(rawCount);
      if (Number.isFinite(n) && n >= 0) {
        map.set(internalName, Math.floor(n));
      }
    }
    console.log(`Fetched live download counts for ${Object.keys(downloads).length} plugin(s).`);
  } catch (err) {
    console.warn(`Warning: could not fetch live download counts (${err.message}); preserving existing counts.`);
  }
  return map;
}

async function main() {
  const sources = JSON.parse(await readFile(sourcesPath, 'utf8'));
  const existingCounts = await loadExistingCounts();
  const downloadCounts = await fetchLiveDownloadCounts(existingCounts);

  const merged = [];
  const seenInternalNames = new Set();

  for (const source of sources) {
    console.log(`Fetching ${source.name} from ${source.url}...`);
    const data = await fetchJson(source.url);
    const entries = Array.isArray(data) ? data : [data];

    for (const rawEntry of entries) {
      const entry = {
        ...(source.defaults ?? {}),
        ...rawEntry,
      };

      if (!entry.InternalName || !entry.Name || !entry.DownloadLinkInstall) {
        throw new Error(`Invalid plugin entry from ${source.url}: missing required fields.`);
      }

      if (seenInternalNames.has(entry.InternalName)) {
        throw new Error(`Duplicate InternalName detected: ${entry.InternalName}`);
      }
      seenInternalNames.add(entry.InternalName);

      // Route downloads through n0wayplugins.discloud.app to count real installs/updates, then 302 redirect to GitHub zip
      const trackedUrl = `${DOWNLOAD_PROXY_BASE}/${encodeURIComponent(entry.InternalName)}`;
      entry.DownloadLinkInstall = trackedUrl;
      entry.DownloadLinkTesting = entry.TestingAssemblyVersion
        ? `${trackedUrl}?channel=testing`
        : trackedUrl;
      entry.DownloadLinkUpdate = trackedUrl;
      entry.DownloadCount = downloadCounts.get(entry.InternalName) ?? 0;

      merged.push(orderFields(entry));
    }
  }

  const formatted = `${JSON.stringify(merged, null, 2)}\n`;
  await writeFile(outputPath, formatted, 'utf8');
  console.log(`Synced ${merged.length} plugin(s) into pluginmaster.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
