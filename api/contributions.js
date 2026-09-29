// Same-origin contribution data + chart, built from the public ghchart
// SVG (no token needed). Default returns the last-90-day total as JSON;
// ?format=svg returns a theme-matched 13-week heatmap (no third party,
// no fake data).
const SRC = 'https://ghchart.rshah.org/00e8ff/ShaninX48';
const DAYS = 90;

async function loadScores() {
  const r = await fetch(SRC);
  if (!r.ok) throw new Error('upstream ' + r.status);
  const t = await r.text();
  const out = [];
  const re = /data-score="(\d+)" data-date="([\d-]+)"/g;
  let m;
  while ((m = re.exec(t))) out.push({ score: Number(m[1]), date: m[2] });
  return out;
}

const SCALE = ['#0b1526', '#0e3a4a', '#0e7d96', '#22d3ee', '#a5f3fc'];

function colorFor(score, max) {
  if (score <= 0 || max <= 0) return SCALE[0];
  const q = score / max;
  if (q <= 0.25) return SCALE[1];
  if (q <= 0.5) return SCALE[2];
  if (q <= 0.75) return SCALE[3];
  return SCALE[4];
}

function windowed(scores) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today.getTime() - (DAYS - 1) * 86400000);
  const map = new Map();
  let total = 0;
  for (const s of scores) {
    const d = new Date(s.date + 'T00:00:00');
    if (d >= cutoff && d <= today) {
      map.set(s.date, s.score);
      total += s.score;
    }
  }
  // 13 columns; last column holds the current week (Sun..today)
  const endSunday = new Date(today);
  endSunday.setDate(today.getDate() - today.getDay() - 84);
  const cells = [];
  for (let c = 0; c < 13; c++) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(endSunday.getTime() + (c * 7 + row) * 86400000);
      const key =
        d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
        '-' + String(d.getDate()).padStart(2, '0');
      const future = d > today;
      cells.push({ key, score: future ? -1 : (map.get(key) || 0) });
    }
  }
  return { cells, total };
}

function renderSvg(cells, max) {
  const S = 11, G = 3, X0 = 8, Y0 = 8;
  const W = X0 * 2 + 13 * (S + G) - G;
  const H = Y0 * 2 + 7 * (S + G) - G;
  let rects = '';
  cells.forEach((cell, i) => {
    if (cell.score < 0) return;
    const c = Math.floor(i / 7), row = i % 7;
    rects += '<rect x="' + (X0 + c * (S + G)) + '" y="' + (Y0 + row * (S + G)) +
      '" width="' + S + '" height="' + S + '" rx="2" fill="' +
      colorFor(cell.score, max) + '"><title>' + cell.score +
      ' contributions on ' + cell.key + '</title></rect>';
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' +
    H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img">' + rects + '</svg>';
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  try {
    const scores = await loadScores();
    const { cells, total } = windowed(scores);
    const format = req.query && req.query.format;
    if (format === 'svg') {
      const max = cells.reduce((m, c) => Math.max(m, c.score), 0);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(renderSvg(cells, max));
      return;
    }
    res.status(200).json({ total, days: DAYS });
  } catch {
    if (req.query && req.query.format === 'svg') {
      res.status(200).send(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>');
    } else {
      res.status(200).json({ total: null });
    }
  }
}
