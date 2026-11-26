# Third-party notices

This repository vendors the skills below. Each one keeps its upstream license text in its own folder.

## astryx

- Source: https://github.com/meta/astryx/tree/main/plugins/astryx/skills/astryx
- License: MIT, Copyright (c) 2026 Meta Platforms, Inc. Full text: `skills/astryx/LICENSE`
- Local changes:
  - Added a "Pack integration" section after the upstream-managed `ASTRYX` block. It sets the read order with `ultimate-design`.
  - The `ASTRYX` block was not edited by hand. It is the version the Astryx CLI installed locally, and it may lag the current upstream. Installing the CLI refreshes it.
  - Added `agents/openai.yaml`, which gives Codex a display name and a default prompt.

## design-taste-frontend-v1

- Source: https://github.com/Leonxlnx/taste-skill (the v1 taste skill)
- License: MIT, Copyright (c) 2026 Leonxlnx. Full text: `skills/design-taste-frontend-v1/LICENSE`
- Local changes: none

## animation-systems

- Source: https://github.com/MengTo/Skills/tree/main/agent-skills/web-design/animation-systems
- License: MIT, Copyright (c) 2026 Meng To. Full text: `skills/animation-systems/LICENSE`
- Local changes: none. Byte-identical to upstream at the time of packing.
- `ultimate-design/references/motion-timing.md` overrides this skill's UI durations; the skill file itself is untouched.

## threejs

- Source: https://github.com/MengTo/Skills/tree/main/agent-skills/web-design/threejs
- License: MIT, Copyright (c) 2026 Meng To. Full text: `skills/threejs/LICENSE`
- Local changes: none. Byte-identical to upstream at the time of packing.

## Assets inside ultimate-design

`ultimate-design/assets/scene-starter.html` loads or embeds the following, with credits kept in its header comment:
- Simplex noise by Ian McEwan and Ashima Arts, MIT: https://github.com/ashima/webgl-noise
- three.js (MIT) and GSAP (standard no-charge license), loaded from a CDN, not vendored
- Fonts under the SIL OFL (Geist, Instrument Serif, Pretendard), loaded from a CDN, not vendored

## Not included

`dataviz` is bundled with Claude Code by Anthropic and is not under an open-source license. It is referenced by name only, and none of its files are in this repository.
