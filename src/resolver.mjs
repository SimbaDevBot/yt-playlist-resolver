import { resolveYoutube } from './youtube.mjs'

function isWatchUrl(url = '') {
  return /youtube\.com\/watch\?v=/.test(url) || /youtu\.be\//.test(url)
}

function isSearchUrl(url = '') {
  return /youtube\.com\/results\?/.test(url) && /search_query=/.test(url)
}

export async function resolveRow(row) {
  const url = row['YouTube Link'] || ''

  // Already resolved
  if (isWatchUrl(url)) {
    return {
      ...row,
      resolved_watch_url: url,
      resolved_video_id: extractVideoId(url) || '',
      resolved_title: '',
      resolved_channel: '',
      resolution_status: 'already_watch_url',
    }
  }

  // Search URL
  if (isSearchUrl(url)) {
    const q = decodeURIComponent((url.match(/search_query=([^&]+)/)?.[1] ?? '').replace(/\+/g, ' '))
    const query = q || `${row.Izvodjac ?? ''} ${row.Pjesma ?? ''}`.trim()

    const yt = await resolveYoutube(query)
    if (!yt) {
      return {
        ...row,
        resolved_watch_url: '',
        resolved_video_id: '',
        resolved_title: '',
        resolved_channel: '',
        resolution_status: 'unresolved_no_api_key_or_no_results',
        resolution_query: query,
      }
    }

    return {
      ...row,
      resolved_watch_url: `https://www.youtube.com/watch?v=${yt.videoId}`,
      resolved_video_id: yt.videoId,
      resolved_title: yt.title,
      resolved_channel: yt.channelTitle,
      resolution_status: 'resolved',
      resolution_query: query,
    }
  }

  // Unknown
  return {
    ...row,
    resolved_watch_url: '',
    resolved_video_id: '',
    resolved_title: '',
    resolved_channel: '',
    resolution_status: url ? 'unsupported_url' : 'missing_url',
  }
}

function extractVideoId(url) {
  const m1 = url.match(/[?&]v=([^&]+)/)
  if (m1) return m1[1]
  const m2 = url.match(/youtu\.be\/([^?]+)/)
  if (m2) return m2[1]
  return null
}
