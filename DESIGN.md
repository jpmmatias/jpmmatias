# Design notes

A dark, editorial profile for Matias, kept compact: a short hero, one intro paragraph, a 2x2 focus grid, four project cards and a stack table.

## Decisions

- **Real text, SVG art.** Only the hero and the four project cards are images. The intro, focus grid, stack and links are Markdown/HTML text, so they stay readable on mobile, work with screen readers and follow the viewer's GitHub theme. Every image has descriptive alt text.
- **Self-contained SVGs.** GitHub serves SVGs as `<img>`, which blocks scripts, external CSS and web fonts. The assets use system font stacks, no external requests, and sit at 3–30 KB each. No third-party badge or stats services.
- **Palette.** Near-black `#0B0F14` ground, off-white type, mint `#91E6CB` as the brand accent. Each project gets one restrained accent (blue, amber, rose). Faint grid and mono labels give the terminal/blueprint feel.
- **Generative hero.** A seeded flow field with a few joined nodes, evoking agent graphs. Fully deterministic, so rebuilding produces identical files.
- **Honest cards, kept short (600x280).** Projects are shown as conceptual diagrams of their core idea, labelled "Concept illustration". None imitates a real UI or claims to be a screenshot.
- **Sourced content.** Project names, descriptions, stacks and URLs come from the portfolio at joaopedromatias.com. The stack list combines portfolio-stated tools with the technologies you named (React Native, Node.js). No metrics, years of experience or employers are claimed.

## Deliberate omissions

- Email and phone appear on the portfolio contact page but are left out of this public README.
- No contribution graphs or stats cards, which depend on third-party services.
- "Mobile" and React Native are listed because your brief names them. None of the four portfolio projects is a mobile app, so consider adding one if you have it.

## Editing

All SVGs come from `scripts/build.mjs` (no dependencies): `node scripts/build.mjs`.
The previous "dot-matrix" design is preserved in git history (commit `102f494`).
