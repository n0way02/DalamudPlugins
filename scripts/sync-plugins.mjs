import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const sourcesPath = resolve(rootDir, 'sources.json');
const outputPath = resolve(rootDir, 'pluginmaster.json');

const FIELD_ORDER = [
  'Author',
  'Name',
  'InternalName',
  'AssemblyVersion',
  'Punchline',
  'Description',
  'ApplicableVersion',
  'DalamudApiLevel',
  'RepoUrl',
  'DownloadLinkInstall',
  'DownloadLinkTesting',
  'DownloadLinkUpdate',
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

async function main() {
  const sources = JSON.parse(await readFile(sourcesPath, 'utf8'));
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

      if (!entry.DownloadLinkTesting && entry.DownloadLinkInstall) {
        entry.DownloadLinkTesting = entry.DownloadLinkInstall;
      }
      if (!entry.DownloadLinkUpdate && entry.DownloadLinkInstall) {
        entry.DownloadLinkUpdate = entry.DownloadLinkInstall;
      }

      if (!entry.InternalName || !entry.Name || !entry.DownloadLinkInstall) {
        throw new Error(`Invalid plugin entry from ${source.url}: missing required fields.`);
      }

      if (seenInternalNames.has(entry.InternalName)) {
        throw new Error(`Duplicate InternalName detected: ${entry.InternalName}`);
      }
      seenInternalNames.add(entry.InternalName);

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
