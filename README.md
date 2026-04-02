# yt-playlist-resolver

Resolves rows in a CSV where the `YouTube Link` column is a **YouTube search URL** (e.g. `https://www.youtube.com/results?search_query=...`) into a canonical **watch URL**.

This repo intentionally **does not** download audio/video.

## Models used
- Planning: Sonnet (anthropic/claude-sonnet-4-6)
- Coding/execution: Codex (openai-codex/gpt-5.2)

## Input CSV format
Expected headers (as in your file):

- `Izvodjac`
- `Pjesma`
- `YouTube Link`

## Output
- `resolved.csv` — same rows + new columns:
  - `resolved_watch_url`
  - `resolved_title`
  - `resolved_channel`
  - `resolved_video_id`
- `playlist.m3u` — M3U playlist with watch URLs
- `playlist.json` — JSON array for programmatic use

## How resolution works

### Option 1 (recommended): YouTube Data API
Provide an API key:

```bash
export YT_API_KEY="..."
node src/cli.mjs --in examples/playlist.csv --out out/resolved.csv
```

### Option 2: No API key (fallback)
If no `YT_API_KEY` is provided, the tool will keep existing `watch?v=` URLs and **leave search rows unresolved** (with a note), so you can still clean/normalize the file without scraping.

## Run

```bash
npm install
npm run resolve
```

## CLI

```bash
node src/cli.mjs --in <input.csv> --out <resolved.csv> [--m3u playlist.m3u] [--json playlist.json]
```
