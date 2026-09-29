// Same-origin proxy: sums this profile's contribution scores from the
// public ghchart SVG (no token needed) so the homepage can show a real
// 12-month total. Cached at the edge for an hour.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  try {
    const r = await fetch('https://ghchart.rshah.org/00e8ff/ShaninX48');
    if (!r.ok) throw new Error('upstream ' + r.status);
    const t = await r.text();
    let total = 0;
    const re = /data-score="(\d+)"/g;
    let m;
    while ((m = re.exec(t))) total += Number(m[1]);
    res.status(200).json({ total });
  } catch {
    res.status(200).json({ total: null });
  }
}
