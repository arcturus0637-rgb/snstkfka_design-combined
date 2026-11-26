# snstkfka_design-combined

A lightweight design skill pack for coding agents (Claude Code and Codex): **one owner skill per layer, chosen in a blind bake-off.**

When dozens of design skills are installed, several of them overlap, and an agent reads three or four at once for the same need. Their rules collide, and the result regresses to an average look. This pack cuts that down. Each design request reads 3 to 4 skills, each covering a different layer, and none of them doing the same job twice.

## The stack

| Layer | Owner skill | What it decides |
|---|---|---|
| Router | `ultimate-design` | How much spectacle the output gets (levels 0 to 3), which owners to call, and a render-look-fix loop with a screenshot script |
| Components and tokens | `astryx` | Components, tokens, spacing, theming, accessibility: *what the UI is built from* |
| Direction, layout, type | `design-taste-frontend-v1` | Composition, hierarchy, typography, avoiding the templated look |
| Motion (UI and scroll) | `animation-systems` | What moves and how. UI timing comes from `ultimate-design/references/motion-timing.md` |
| Data | `dataviz` (not included, see below) | Chart form, validated palettes, mark specs |
| 3D | `ultimate-design/references/scene-3d.md`, then `threejs` | Lighting, camera and tone mapping first; then the API |

## How it works

### 1. Read order: `astryx` first, then `ultimate-design`

Undoing the work costs more in one direction than the other. If components and tokens are settled first, staging simply sits on top of them. If staging is tuned first and later converted to components, every tuned value has to be redone. So any output with a UI layer reads `astryx` first. Output with no UI layer (a `.pptx`, a bare 3D scene, a rendered image) skips it.

`ultimate-design` then routes each need to exactly one owner. A second skill is never stacked on the same need.

### 2. Owners were picked blind

Fifteen overlapping skills each built the same two briefs, which made 30 pages in total. Each build loaded only its assigned skill. Every page was screenshot-checked at 1440 px and 390 px for blank renders, script errors and overflow. The pages were then shown in a gallery with the skill names hidden, and the winner of each layer was picked from the results alone.

| Layer | Won | Lost |
|---|---|---|
| Direction and layout | design-taste-frontend-v1 | design-taste-frontend (v2), gpt-taste, web-design-master, web-design-engineer, awwwards-web-ui-design |
| Motion | animation-systems | gsap-scrolltrigger-storytelling, animate (emil), cinematic-gsap-lenis-motion-system |
| Data | dataviz | funnest-charts |
| 3D | scene-3d.md + threejs | 3d-master |

The older v1 of design-taste-frontend beat the current v2, mostly on type: v1 fixes Geist and Geist Mono and sets every number in mono. Its SKILL.md still says v2 is the default. This pack uses v1 on purpose.

### 3. UI motion timing is an exact midpoint

The motion final came down to two builds of the same notification-center page, one by `animation-systems` and one by `gsap-scrolltrigger-storytelling`. The chosen speed sits exactly halfway between them. Each segment's duration was read from both builds' source and averaged. For example, list entrance 550/420 ms gives 485 ms, and modal open 380/320 ms gives 350 ms. The easing curves use the midpoint of their control points.

The character stays with `animation-systems`, so a press release does not overshoot. The full table and CSS tokens are in [`skills/ultimate-design/references/motion-timing.md`](skills/ultimate-design/references/motion-timing.md). That table overrides the skill's own numbers.

### 4. Color belongs to the right layer

The layout layer treats color as secondary, because color comes from the `astryx` theme tokens. A layout you like with a palette you don't is a token change, not a redesign. In the data layer, chart color is function. In the 3D layer, color is the result of lighting and materials. Both of those judge color first.

## Install

### Claude Code

```bash
git clone https://github.com/arcturus0637-rgb/snstkfka_design-combined.git
cp -r snstkfka_design-combined/skills/* ~/.claude/skills/
```

`dataviz` already ships with Claude Code.

### Codex

```bash
cp -r snstkfka_design-combined/skills/* ~/.codex/skills/
```

Then paste [`AGENTS.snippet.md`](AGENTS.snippet.md) into `~/.codex/AGENTS.md`.

If you already have `ultimate-design` or `astryx` installed, back them up first. The copies in this repository replace them.

### Requirements

- The Astryx CLI: `npm i -g @astryxdesign/cli`
- Node 22 or newer, for `ultimate-design/scripts/shoot.mjs`
- Chrome or Edge, which `shoot.mjs` drives to take screenshots

## Not included

- **`dataviz`** is bundled with Claude Code by Anthropic and has no open-source license, so its files are not redistributed here. Claude Code users already have it. Elsewhere, use your own chart skill in that row.
- **Style-skin skills** (dither, glass, brutalist and the like) are only for when a user names that style, so they are not part of the routing.
- **Untested emil skills** (`review-animations`, `animation-performance`, `break-ui`, `mobile-native`) were not part of the bake-off, so they were neither picked nor rejected.

## Repository layout

```
skills/
  astryx/                    components and tokens (Meta, MIT)
  ultimate-design/           router, 3D staging, motion timing, screenshot script
    references/scene-3d.md
    references/motion-timing.md
    assets/scene-starter.html
    scripts/shoot.mjs
  design-taste-frontend-v1/  layout and type (Leonxlnx, MIT)
  animation-systems/         motion (Meng To, MIT)
  threejs/                   Three.js API (Meng To, MIT)
AGENTS.snippet.md            routing note for ~/.codex/AGENTS.md
THIRD_PARTY_NOTICES.md       sources, licenses and local changes
```

## Credits

This pack only routes between skills; the depth comes from their authors.

| Skill | Source | License |
|---|---|---|
| astryx | [meta/astryx](https://github.com/meta/astryx) | MIT, © Meta Platforms, Inc. |
| design-taste-frontend-v1 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | MIT, © Leonxlnx |
| animation-systems | [MengTo/Skills](https://github.com/MengTo/Skills) (`agent-skills/web-design/animation-systems`) | MIT, © Meng To |
| threejs | [MengTo/Skills](https://github.com/MengTo/Skills) (`agent-skills/web-design/threejs`) | MIT, © Meng To |
| dataviz | Bundled with [Claude Code](https://claude.com/claude-code) by Anthropic | Not redistributed |
| ultimate-design | Original to this repository | MIT |

The skills that lost the bake-off also shaped this pack, because they set the bar the winners had to clear:
[design-taste-frontend v2 and gpt-taste](https://github.com/Leonxlnx/taste-skill),
[emilkowalski/skills](https://github.com/emilkowalski/skills) (`animate`),
[MengTo/Skills](https://github.com/MengTo/Skills) (`gsap-scrolltrigger-storytelling`),
`web-design-master`, `web-design-engineer`, `awwwards-web-ui-design`, `cinematic-gsap-lenis-motion-system`, `funnest-charts`, `3d-master`.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the exact files and the changes made to them.

## License

The original parts (`ultimate-design`, this README, `AGENTS.snippet.md`) are MIT; see [LICENSE](LICENSE). Each vendored skill keeps its own license file in its folder.
