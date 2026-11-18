// Generates the dark dot-matrix SVGs used by README.md. Run: node scripts/build.mjs <contrib.json>
import fs from "node:fs";
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const cal = data.data.user.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap(w => w.contributionDays);
const FONT = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const BG = "#0a0c10", LINE = "#1f242c", DIM = "#6b7380", FG = "#e6edf3", ACC = "#6aa6f8";
const seed = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0) / 2 ** 32); };

// dot-matrix area chart: values[] -> columns, rows of dots, bright = filled
function dots(values, x0, y0, w, h, gap = 5, color = "#e6edf3") {
  const cols = Math.floor(w / gap), rows = Math.floor(h / gap), max = Math.max(...values, 1);
  const rnd = seed("d" + values.length + max);
  let out = "";
  for (let c = 0; c < cols; c++) {
    const v = values[Math.min(values.length - 1, Math.floor((c / cols) * values.length))];
    const filled = Math.round((v / max) * (rows - 1)) + 1;
    for (let r = 0; r < rows; r++) {
      const fromBottom = r, on = fromBottom < filled;
      const op = on ? (0.35 + 0.65 * (1 - fromBottom / Math.max(filled, 1)) * (0.6 + 0.4 * rnd())) : 0.07 + 0.05 * rnd();
      const rad = on ? 1.5 : 0.9;
      out += `<circle cx="${x0 + c * gap + gap / 2}" cy="${y0 + h - r * gap - gap / 2}" r="${rad}" fill="${on ? color : "#8b949e"}" opacity="${op.toFixed(2)}"/>`;
    }
  }
  return out;
}
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}"><rect width="${w}" height="${h}" fill="${BG}"/><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${LINE}"/>${body}</svg>`;
const T = (x, y, t, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || DIM}" font-size="${o.size || 11}" ${o.weight ? `font-weight="${o.weight}"` : ""} ${o.anchor ? `text-anchor="${o.anchor}"` : ""}>${t.replace(/&/g, "&amp;")}</text>`;

// 1. hero: contribution banner + name block
const counts = days.map(d => d.contributionCount);
const smooth = counts.map((_, i) => { let s = 0, n = 0; for (let k = -2; k <= 2; k++) if (counts[i + k] !== undefined) { s += counts[i + k]; n++; } return s / n; });
const last = days[days.length - 1];
const todayDone = last.contributionCount > 0;
let hero = dots(smooth, 12, 14, 776, 100, 5);
hero += T(14, 130, `${cal.totalContributions.toLocaleString("en")} contributions in the last year`, { size: 10 });
hero += T(786, 130, todayDone ? "contributed today" : "last 365 days", { size: 10, anchor: "end" });
hero += `<line x1="0" x2="800" y1="144" y2="144" stroke="${LINE}"/>`;
hero += T(24, 205, "João Pedro Matias", { fill: FG, size: 44, weight: 300 });
hero += T(26, 232, "@jpmmatias", { size: 12 });
hero += T(26, 262, "Software engineer. Building with TypeScript, agents and a lot of terminal.", { fill: "#c9d1d9", size: 14 });
hero += T(26, 284, "pt_BR · en_US  —  thanks for dropping by.", { size: 12 });
fs.writeFileSync("assets/hero.svg", svg(800, 304, hero));

// 2. stat cells
const cell = (w, label, value) => svg(w, 64, T(16, 24, label.toUpperCase(), { size: 10 }) + T(16, 48, value, { fill: FG, size: 15, weight: 600 }));
fs.writeFileSync("assets/stat-role.svg", cell(400, "Role", "Software Engineer"));
fs.writeFileSync("assets/stat-focus.svg", cell(400, "Focus", "agents · tooling · web"));

// 3. project cards
const repos = [
  ["herdr-violet-ember", "Python", "Dark violet theme + layout for Herdr desktop", "pushed Nov 17"],
  ["herdr-ember-companion", "JavaScript", "Floating companion that watches your agents", "pushed Nov 17"],
  ["local-scribe", "Rust", "", "pushed Nov 4"],
  ["skills", "JavaScript", "", "pushed Oct 26"],
];
for (const [name, lang, desc, pushed] of repos) {
  const r = seed(name), vals = Array.from({ length: 60 }, (_, i) => Math.max(0.05, 0.5 + 0.4 * Math.sin(i / (4 + r() * 4) + r() * 6) * Math.exp(-i / 90) + 0.3 * r()));
  let b = `<rect width="400" height="30" fill="#0f1217"/><line x1="0" x2="400" y1="30" y2="30" stroke="${LINE}"/>`;
  b += T(14, 20, name, { fill: FG, size: 12, weight: 600 }) + T(386, 20, "jpmmatias", { anchor: "end", size: 11 });
  b += dots(vals, 8, 40, 384, 110, 5, ACC);
  b += `<line x1="0" x2="400" y1="162" y2="162" stroke="${LINE}"/>`;
  b += T(14, 186, desc.length > 46 ? desc.slice(0, 45) + "…" : (desc || "No description yet"), { fill: "#c9d1d9", size: 12 });
  b += T(14, 214, lang, { size: 11 }) + T(386, 214, pushed, { size: 11, anchor: "end" });
  fs.writeFileSync(`assets/repo-${name}.svg`, svg(400, 232, b));
}

// 4. link pills
const pill = (file, label, w) => fs.writeFileSync(`assets/${file}.svg`, svg(w, 40, T(16, 25, label, { fill: FG, size: 12 }) + T(w - 16, 25, "↗", { anchor: "end", size: 13 })));
pill("link-github", "github.com/jpmmatias", 230);
pill("link-x", "@joaopdmatias", 190);
