// Generates every SVG in /assets. No dependencies, fully deterministic.
// Run from the repo root: node scripts/build.mjs
import fs from "node:fs";

const OUT = new URL("../assets/", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

// Design tokens. System font stacks only: GitHub serves SVGs as <img>, so web fonts never load.
const C = {
  bg: "#0B0F14", panel: "#10161D", line: "#26333E", grid: "#344450",
  fg: "#EDF2F6", dim: "#8E9DA9", mint: "#91E6CB", blue: "#86A9F8",
  amber: "#F2C48D", rose: "#E6A5C8",
};
const MONO = `ui-monospace, SFMono-Regular, 'IBM Plex Mono', Menlo, Consolas, monospace`;
const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif`;

// Seeded PRNG so rebuilds are byte-identical.
const rng = (seed) => { let s = seed >>> 0; return () => ((s = (Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9) >>> 0) / 2 ** 32); };
const f = (n) => Math.round(n * 10) / 10;
const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, t, { size = 14, fill = C.dim, font = MONO, weight = 500, ls = 0, anchor } = {}) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}"${ls ? ` letter-spacing="${ls}"` : ""}${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(t)}</text>`;
const write = (name, w, h, title, body, defs = "") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><title>${esc(title)}</title><defs>${defs}<pattern id="g" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="${C.grid}" stroke-width=".6" opacity=".2"/></pattern></defs><rect width="${w}" height="${h}" fill="${C.bg}"/><rect width="${w}" height="${h}" fill="url(#g)"/>${body}<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="6" fill="none" stroke="${C.line}"/></svg>`;
  fs.writeFileSync(OUT + name, svg);
  console.log(name.padEnd(22), (svg.length / 1024).toFixed(1) + " KB");
};

// ---------- value-noise flow field for the hero ----------
const noiseGrid = (() => { const r = rng(7), n = 64, g = Array.from({ length: n * n }, r); return { n, g }; })();
const smooth = (t) => t * t * (3 - 2 * t);
const noise = (x, y) => {
  const { n, g } = noiseGrid, xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const v = (a, b) => g[(((b % n) + n) % n) * n + (((a % n) + n) % n)];
  const u = smooth(xf), w = smooth(yf);
  return (v(xi, yi) * (1 - u) + v(xi + 1, yi) * u) * (1 - w) + (v(xi, yi + 1) * (1 - u) + v(xi + 1, yi + 1) * u) * w;
};

// ---------- 1. hero ----------
{
  const W = 1200, H = 320, r = rng(11);
  let art = "";
  const nodes = [];
  for (let i = 0; i < 70; i++) {
    let x = 560 + r() * 640, y = 70 + r() * 230, d = "M" + f(x) + " " + f(y);
    const steps = 34 + Math.floor(r() * 30);
    for (let s = 0; s < steps; s++) {
      const a = noise(x / 150, y / 150) * Math.PI * 3.2;
      x += Math.cos(a) * 7; y += Math.sin(a) * 7;
      if (x > W - 20 || y < 66 || y > H - 20) break;
      d += "L" + f(x) + " " + f(y);
    }
    if (r() < 0.16) nodes.push([x, y]);
    art += `<path d="${d}" fill="none" stroke="${r() < 0.7 ? C.mint : C.blue}" stroke-opacity="${f(0.1 + r() * 0.3)}" stroke-width="${r() < 0.2 ? 1.4 : 0.8}"/>`;
  }
  // "agent graph": a few nodes joined to their nearest neighbour
  nodes.forEach(([x, y], i) => {
    const [nx, ny] = nodes[(i + 1) % nodes.length];
    art += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(nx)}" y2="${f(ny)}" stroke="${C.fg}" stroke-opacity=".14" stroke-dasharray="2 5"/>`;
  });
  nodes.forEach(([x, y]) => (art += `<circle cx="${f(x)}" cy="${f(y)}" r="3.4" fill="${C.bg}" stroke="${C.mint}" stroke-width="1.3"/><circle cx="${f(x)}" cy="${f(y)}" r="1.2" fill="${C.mint}"/>`));
  const defs = `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/></linearGradient><mask id="m"><rect x="480" width="720" height="${H}" fill="url(#fade)"/></mask>`;
  const body =
    `<g mask="url(#m)">${art}</g>` +
    text(48, 46, "MATIAS / INDEX", { size: 14, fill: C.mint, weight: 600, ls: 1.5 }) +
    text(W - 48, 46, "SÃO PAULO, BR", { size: 14, anchor: "end" }) +
    `<line x1="48" x2="${W - 48}" y1="66" y2="66" stroke="${C.line}"/>` +
    text(44, 186, "Matias", { size: 128, fill: C.fg, font: SANS, weight: 700, ls: -5 }) +
    text(50, 236, "Software engineer building AI-powered products.", { size: 32, fill: C.fg, font: SANS, weight: 500 }) +
    `<line x1="48" x2="${W - 48}" y1="266" y2="266" stroke="${C.line}"/>` +
    text(48, 293, "AI AGENTS  ·  FULL-STACK  ·  MOBILE  ·  INDIE HACKING", { size: 14, ls: 1.2 }) +
    text(W - 48, 293, "> building_", { size: 14, fill: C.mint, anchor: "end" });
  write("hero.svg", W, H, "Matias — software engineer building AI-powered products", body, defs);
}

// ---------- 2. project cards (conceptual illustrations, not product UI) ----------
const W = 600, H = 280;
const card = (file, n, accent, meta, name, title, art) =>
  write(file, W, H, title,
    text(28, 44, n, { size: 16, fill: accent, weight: 700 }) +
    text(62, 44, meta, { size: 14, ls: 1.2 }) +
    `<line x1="28" x2="${W - 28}" y1="62" y2="62" stroke="${C.line}"/>` +
    text(28, 104, name, { size: 38, fill: C.fg, font: SANS, weight: 700, ls: -1 }) +
    `<g transform="translate(45 6) scale(.85)">${art}</g>` +
    text(W - 28, 44, "CONCEPT ART", { size: 10, anchor: "end", ls: 1.2, fill: "#5d6b77" }));

// Aether: the rule that shapes it, "the model proposes, code acts"
{
  const steps = ["ASK", "PROPOSE", "CONFIRM", "ACT"], y = 238;
  let a = "";
  steps.forEach((s, i) => {
    const x = 78 + i * 148, gate = s === "CONFIRM";
    if (i) a += `<line x1="${x - 148 + 26}" y1="${y}" x2="${x - 26}" y2="${y}" stroke="${C.mint}" stroke-opacity=".5" stroke-dasharray="3 5"/>`;
    a += `<circle cx="${x}" cy="${y}" r="26" fill="${gate ? C.mint : C.panel}" stroke="${C.mint}" stroke-width="1.4"/>` +
      (gate ? `<path d="M${x - 10} ${y}l7 7 13-14" fill="none" stroke="${C.bg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : text(x, y + 5, String(i + 1), { size: 14, fill: C.mint, weight: 700, anchor: "middle" })) +
      text(x, y + 54, s, { size: 13, fill: gate ? C.mint : C.dim, anchor: "middle", ls: 1, weight: gate ? 700 : 500 });
  });
  card("card-aether.svg", "01", C.mint, "AI  /  AGENTS  /  WEB", "AETHER", "Aether: concept diagram of ask, propose, confirm and act, where a human confirmation gate precedes every action", a);
}

// Learn Skill: spaced review as widening intervals
{
  const r = rng(3);
  let a = `<line x1="40" x2="560" y1="248" y2="248" stroke="${C.line}"/>`;
  let x = 52, gap = 16, i = 0;
  while (x < 556) {
    const h = 20 + Math.min(i, 8) * 7;
    a += `<line x1="${x}" x2="${x}" y1="248" y2="${248 - h}" stroke="${C.blue}" stroke-opacity="${f(0.35 + 0.6 * Math.min(1, i / 8))}" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${248 - h - 8}" r="${f(3 + Math.min(i, 8) * 0.55)}" fill="${C.blue}" fill-opacity="${f(0.3 + 0.7 * Math.min(1, i / 8))}"/>`;
    x += gap; gap *= 1.42; i++;
  }
  a += text(40, 280, "FIRST PRINCIPLES", { size: 12, ls: 1 }) + text(560, 280, "SPACED REVIEW", { size: 12, ls: 1, anchor: "end" });
  card("card-learn-skill.svg", "02", C.blue, "AI  /  AGENTS  /  OPEN SOURCE", "LEARN SKILL", "Learn Skill: concept illustration of review intervals widening over time", a);
}

// Aura Farm Royale: two tracked hands joined by a socket line (MediaPipe-style landmarks)
{
  const hand = (cx, cy, flip, k) => {
    const fingers = [[-70, 40, 4], [-30, 14, 4], [0, 8, 4], [30, 14, 4], [62, 40, 4]]; // [dx tip, base dy, joints]
    let g = "";
    const wrist = [cx, cy + 56];
    fingers.forEach(([dx, , n], fi) => {
      const pts = [wrist];
      const bx = cx + (dx * 0.45) * flip, by = cy + 10 + Math.abs(dx) * 0.12;
      for (let j = 0; j < n; j++) {
        const t = (j + 1) / n, wob = Math.sin(k + fi + j) * 2.5;
        pts.push([f(bx + dx * flip * 0.55 * t + wob), f(by - 78 * t * (fi === 0 || fi === 4 ? 0.62 : 1))]);
      }
      g += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${C.amber}" stroke-opacity=".55" stroke-width="1.4"/>`;
      pts.forEach((p, i) => (g += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === 0 ? 4 : 2.8}" fill="${C.amber}"/>`));
    });
    return g;
  };
  let a = hand(150, 214, 1, 1) + hand(450, 214, -1, 4) +
    `<line x1="214" y1="226" x2="386" y2="226" stroke="${C.amber}" stroke-opacity=".6" stroke-dasharray="3 5"/>` +
    text(300, 232, "WS", { size: 13, fill: C.amber, weight: 700, anchor: "middle", ls: 1 }) +
    text(150, 296, "P1", { size: 12, anchor: "middle", ls: 1 }) + text(450, 296, "P2", { size: 12, anchor: "middle", ls: 1 });
  card("card-aura-farm-royale.svg", "03", C.amber, "GAMES  /  AI  /  WEB", "AURA FARM ROYALE", "Aura Farm Royale: concept illustration of two hand-tracking skeletons linked over a WebSocket connection", a);
}

// Vestes Novas: people converging on one shared platform
{
  const cx = 300, cy = 226, r = rng(5);
  let a = "";
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2 + 0.2, d = 96 + (i % 3) * 14, x = cx + Math.cos(ang) * d * 1.9, y = cy + Math.sin(ang) * d * 0.62;
    a += `<line x1="${f(x)}" y1="${f(y)}" x2="${cx}" y2="${cy}" stroke="${C.rose}" stroke-opacity=".28"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 2.5)}" fill="${C.bg}" stroke="${C.rose}" stroke-width="1.3"/>`;
  }
  a += `<circle cx="${cx}" cy="${cy}" r="30" fill="${C.panel}" stroke="${C.rose}" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="10" fill="${C.rose}"/>`;
  card("card-vestes-novas.svg", "04", C.rose, "WEB  /  SOCIAL IMPACT", "VESTES NOVAS", "Vestes Novas: concept illustration of volunteers and supporters connected to one shared platform", a);
}
