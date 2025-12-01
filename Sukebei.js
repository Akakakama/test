export default new class SukebeiNyaa extends AbstractSource {
  // API endpoint for JSON results
  base = atob('aHR0cHM6Ly9ueWFhLmlzcy5vbmUvc3VrZWJlaT9xPQ==')
  // decodes to: https://nyaa.iss.one/sukebei?q=

  /** @type {import('./').SearchFunction} */
  async single({ titles, episode }) {
    if (!titles?.length) return []

    const query = this.buildQuery(titles[0], episode)
    const url = this.base + encodeURIComponent(query)

    const res = await fetch(url)
    if (!res.ok) return []

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return this.map(data)
  }

  batch = this.single
  movie = this.single

  buildQuery(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`
    return query
  }

  map(data) {
    return data.map(item => {
      const magnet = item.magnet || ''
      const hash = magnet.match(/btih:([a-fA-F0-9]+)/)?.[1] || ''

      return {
        title: item.title ?? '',
        link: magnet,
        hash,
        seeders: Number(item.seeders ?? 0),
        leechers: Number(item.leechers ?? 0),
        downloads: Number(item.downloads ?? 0),
        size: this.parseSize(item.size ?? ''),
        date: new Date(item.date ?? Date.now()),
        verified: false,
        type: 'alt',
        accuracy: 'medium'
      }
    })
  }

  parseSize(sizeStr) {
    const match = String(sizeStr).match(/([\d.]+)\s*(KiB|MiB|GiB|KB|MB|GB)/i)
    if (!match) return 0

    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()

    switch (unit) {
      case 'KIB':
      case 'KB': return value * 1024
      case 'MIB':
      case 'MB': return value * 1024 * 1024
      case 'GIB':
      case 'GB': return value * 1024 * 1024 * 1024
      default: return 0
    }
  }

  async test() {
    try {
      const res = await fetch(this.base + 'test')
      return res.ok
    } catch {
      return false
    }
  }
}()
