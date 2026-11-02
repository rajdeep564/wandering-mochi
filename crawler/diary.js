const MAX_STOPS = 100;

export function emptyDiary() {
  return { updatedAt: null, sites: {}, stops: [] };
}

export function recordStop(diary, stop) {
  const site = diary.sites[stop.host];
  diary.sites[stop.host] = {
    visits: (site?.visits ?? 0) + 1,
    firstVisit: site?.firstVisit ?? stop.at,
    lastVisit: stop.at,
    foundVia: site?.foundVia ?? stop.foundVia ?? null,
    paws: stop.paws,
    review: stop.review,
    souvenir: stop.souvenir,
  };
  diary.stops = [
    { host: stop.host, at: stop.at, paws: stop.paws, review: stop.review, souvenir: stop.souvenir },
    ...diary.stops,
  ].slice(0, MAX_STOPS);
  diary.updatedAt = stop.at;
}

export function forgetHost(diary, host) {
  delete diary.sites[host];
  diary.stops = diary.stops.filter((stop) => stop.host !== host);
}

export function nextGuests(guests, diary, count) {
  return [...guests]
    .sort((a, b) => {
      const lastA = diary.sites[a]?.lastVisit ?? "";
      const lastB = diary.sites[b]?.lastVisit ?? "";
      return lastA.localeCompare(lastB) || a.localeCompare(b);
    })
    .slice(0, count);
}

function escapeXml(text) {
  return String(text).replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function shorten(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

export function badgeSvg(host, site) {
  const paws = "🐾".repeat(site.paws);
  const visits = `${site.visits} ${site.visits === 1 ? "visit" : "visits"}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="84" viewBox="0 0 360 84" role="img" aria-label="${escapeXml(`Mochi visited ${host}: ${visits}`)}">
<style>text{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}</style>
<rect x="0.5" y="0.5" width="359" height="83" rx="12" fill="#fffaf2" stroke="#e8dcc8"/>
<text x="16" y="28" font-size="14" font-weight="700" fill="#2b2118">Mochi visited ${escapeXml(shorten(host, 26))}</text>
<text x="16" y="48" font-size="12" fill="#0f766e">${visits} · brought back ${escapeXml(site.souvenir.emoji)} ${escapeXml(site.souvenir.name)}</text>
<text x="16" y="68" font-size="11" fill="#6b5d4d">${paws} ${escapeXml(shorten(site.review, 46))}</text>
</svg>
`;
}
