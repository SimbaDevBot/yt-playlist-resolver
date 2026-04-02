#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { resolveRow } from './resolver.mjs'

function arg(name, def = null) {
  const i = process.argv.indexOf(name)
  if (i === -1) return def
  return process.argv[i + 1] ?? def
}

if (process.argv.includes('--help') || process.argv.length <= 2) {
  console.log(`yt-playlist-resolver\n\nUsage:\n  node src/cli.mjs --in <input.csv> --out <resolved.csv> [--m3u <playlist.m3u>] [--json <playlist.json>]\n\nEnv:\n  YT_API_KEY   Optional. If set, resolves YouTube search URLs via YouTube Data API v3.\n`)
  process.exit(0)
}

const inPath = arg('--in')
const outPath = arg('--out')
const m3uPath = arg('--m3u', null)
const jsonPath = arg('--json', null)

if (!inPath || !outPath) {
  console.error('Missing --in or --out')
  process.exit(1)
}

const input = fs.readFileSync(inPath, 'utf8')
const rows = parse(input, { columns: true, skip_empty_lines: true })

const resolved = []
for (const row of rows) {
  // eslint-disable-next-line no-await-in-loop
  const r = await resolveRow(row)
  resolved.push(r)
}

// By default, output only the essential columns + the resolved URL.
const minimal = resolved.map((r) => ({
  Izvodjac: r.Izvodjac,
  Pjesma: r.Pjesma,
  resolved_watch_url: r.resolved_watch_url || '',
}))

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, stringify(minimal, { header: true }))

if (m3uPath) {
  fs.mkdirSync(path.dirname(m3uPath), { recursive: true })
  const lines = ['#EXTM3U']
  for (const r of resolved) {
    const url = r.resolved_watch_url || r['YouTube Link'] || ''
    if (!url) continue
    const title = `${r.Izvodjac ?? ''} - ${r.Pjesma ?? ''}`.trim()
    lines.push(`#EXTINF:-1,${title}`)
    lines.push(url)
  }
  fs.writeFileSync(m3uPath, lines.join('\n') + '\n')
}

if (jsonPath) {
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true })
  fs.writeFileSync(jsonPath, JSON.stringify(resolved, null, 2) + '\n')
}

console.log(`Resolved ${resolved.length} rows -> ${outPath}`)
