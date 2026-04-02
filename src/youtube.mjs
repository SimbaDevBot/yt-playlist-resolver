const API_KEY = process.env.YT_API_KEY

/**
 * Resolve a query to a single YouTube video via YouTube Data API v3.
 * Returns null if no API key.
 */
export async function resolveYoutube(query) {
  if (!API_KEY) return null

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('q', query)
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)
  const json = await res.json()
  const item = json.items?.[0]
  if (!item) return null

  return {
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
  }
}
