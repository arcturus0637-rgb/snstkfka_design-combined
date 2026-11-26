---
name: ultimate-design
description: Director for visually high-end HTML outputs (portfolios, product and project intro pages, landing pages, dashboards, slide decks) and the cinematography layer for web 3D (lighting, camera, materials, post-processing, scroll-driven shots). Use whenever the user wants an output to look premium, polished, cinematic, Awwwards-level or properly designed (고급스럽게, 시네마틱, 수준 높게, 퀄리티 높게, 디자인 잘, 포트폴리오, 소개 페이지, 랜딩 페이지, 대시보드, 발표자료); whenever a result looks flat, generic, templated, AI-made or 밋밋하다, or an animation stutters (끊김, 버벅임); and whenever the work involves a Three.js or WebGL scene, a 3D model, 조명, 카메라 무빙, tone mapping, bloom, or parts that blur together (분리도). It decides how much spectacle the output should carry (none for a dashboard, a full scene for a showcase), names the specialist skills to read, ships a verified scene starter and a script that takes screenshots and times frames, and enforces a render-look-fix loop. Use it even when the user only says "make it look better".
---

# Ultimate Design

This skill directs. It decides what kind of quality an output needs, points to the skills that go deep on that kind, supplies the 3D pipeline when a scene is called for, and makes you look at what you built before calling it done.

It exists because of failures that code review does not catch. One is the wrong kind of quality: a camera move on a dashboard, or a spreadsheet's restraint on a launch page. The other is unverified output. In the builds this skill was developed on, the first render of one was a white-out, the first render of another hid its own subject, and a page that looked finished in every screenshot stuttered when it was scrolled. None of that was visible in the source.

## 1. Say what the output is for, then pick a level

Write one sentence: what is this, and what should someone feel or do in the first three seconds. Then pick the lowest level that carries that sentence.

| Level | What carries the quality | 3D and motion |
|---|---|---|
| 0 Quiet | Type, spacing, alignment, clarity of the data | None. State changes under 200ms |
| 1 Accent | The same, plus depth and light in 2D: gradient, grain, soft shadow, one ambient motion | No scene. A shader backdrop at most |
| 2 Feature | One directed 3D moment, usually the hero | The starter, one to three shots |
| 3 Immersive | The scene leads and scroll drives the camera | The starter, one shot per section |

Defaults by output:

| Output | Level | What "high quality" means here |
|---|---|---|
| Dashboard, internal tool | 0 | The most important number is found first. Nothing decorative competes with data |
| Report, document, long read | 0–1 | Comfortable reading, clear structure |
| Slide deck | 1, with 2 for a title slide | One idea per slide, one visual per idea |
| Intro or landing page | 1–2 | The first screen says what this is |
| Portfolio | 2 | The work is the visual; the frame around it stays quiet |
| Product or launch showcase | 2–3 | One object, shown from the angles that explain it |

Each step up costs load time, legibility and robustness, so take the lowest level that works. Two things override the table: a user who asks for 3D or "cinematic" by name, and the user's own stated preferences for a kind of output, in memory or earlier in the conversation.

## 2. Read the skill that owns the output type

Say which of these you are reading before you start. A skill that is not named is a skill that gets skipped.

**`astryx` comes before this skill on any design request.** It owns the component layer — components, tokens, spacing, theming, accessibility — and this skill owns the layer above it: direction, hierarchy, staging, verification. Read `astryx` first and let it settle what the UI is built from, because staging laid over hand-made markup has to be redone once it becomes components, while the reverse costs nothing. If the output has no UI layer at all (a `.pptx`, a bare 3D scene, a rendered image), `astryx` has nothing to own and you can say so and move on.

| Need | Read |
|---|---|
| UI components, tokens, spacing, theming, accessibility | `astryx` — first, before anything in this table |
| Page layout, type, avoiding the templated look | `design-taste-frontend-v1` (not the v2 `design-taste-frontend`) |
| Motion, UI and scroll | `animation-systems`. For UI motion (press, hover, tabs, toasts, modals) take durations and curves from `references/motion-timing.md`, which overrides the skill's own numbers |
| Charts, dashboards, any data graphic | `dataviz` (bundled with Claude Code; not included in this repository) |
| A `.pptx` file | the pptx skill this agent has, if any (not in this pack). An HTML deck is built here at level 1 |
| A 3D scene | `references/scene-3d.md` in this skill, then `threejs` for the API |

These owners were picked by the user in a blind bake-off on 2026-11-23 (two briefs per skill). The skills they beat (design-taste-frontend v2, gpt-taste, web-design-master, web-design-engineer, awwwards-web-ui-design, `animate`, cinematic-gsap-lenis, funnest-charts, 3d-master) are not part of this pack. Neither is `gsap-scrolltrigger-storytelling`: only its UI timing survives, averaged into `references/motion-timing.md`. Read one owner per need; do not stack a second skill on the same need.

Those skills go deep on one thing. What stays here is the level, the bar below, and the loop.

## 3. The bar every output has to clear

These hold at every level. Each was a real defect in a build behind this skill.

- **Two typefaces at most, and a real scale.** Display type set tight (`letter-spacing` −0.02em to −0.04em), body at 1.6–1.7 line height, lines under about 34em.
- **Korean text.** Name a Korean face (Pretendard, Noto Serif KR): a Latin-only font falls back silently, and the fallback then decides the look. Put `word-break: keep-all` on headings and short paragraphs. Never italicise Hangul; emphasise with colour or weight. Tracked uppercase monospace labels are a Latin convention. Hangul set that way falls back to a system mono face and comes out gappy, so Korean labels use the sans at normal tracking.
- **Figures.** `font-variant-numeric: tabular-nums`, and units keep their case. `text-transform: uppercase` on a row of specs turns GHz into GHZ.
- **One palette.** One background family, one accent, neutrals tinted toward the background. On a dark page the background is near-black and the text off-white, not `#000` and `#fff`. With a 3D scene, take the accent from the key light or the subject's own material.
- **Text never sits on a bright or busy area** without a scrim, and nothing touches something it was not meant to touch.
- **Real or generated content, never placeholders.** With no images to hand, draw something in code. When a number on the page describes the thing shown, take it from the thing shown.
- **Motion has easing and a reason.** Entrances 0.4–1.1s with an ease-out, stagger 60–90ms, nothing linear, and a `prefers-reduced-motion` path.
- **It is smooth.** Stutter does not show in a screenshot, so time the frames (step 5). Nothing above a live canvas uses `backdrop-filter`: one blurred button caused a stall at the start of every scroll.
- **It is laid out for a phone**, not shrunk to fit one, and it holds at the widths in between. Two collisions in one build existed only at 960–1200px, between the two sizes that were being checked.

## 4. Build

The default output is a single standalone HTML file that loads its libraries from a CDN. It becomes a website when uploaded to any static host, so there is no size limit to design around. If the user wants an Artifact instead, the libraries have to be inlined, because Artifacts block most CDNs.

- **Level 0–1**: build with the skills from step 2. Do not open the 3D reference.
- **Level 2–3**: copy `assets/scene-starter.html` and read `references/scene-3d.md`. The starter has the whole pipeline wired and verified: a studio environment built in code (nothing to download), key and rim lights, a backdrop that keeps a glow behind the subject, dust that reads as depth of field, bloom, tone mapping, a finish pass, camera fitting for any aspect ratio, a scroll-scrubbed shot list, pointer parallax, a pixel budget and a resolution governor that keep it at 60fps, and fallbacks for reduced motion and missing WebGL. Every look value is in `LOOK` and `SHOTS` at the top. Its subject is a placeholder. Replace `createSubject()` with the thing the page is about before tuning anything else.

When the output needs something it does not have (an HDRI, a model, map tiles, imagery, a typeface, real data), go and find it. Qualify the source in this order: no key at all is best; a free key or free tier with only an account is acceptable; anything that asks for a card or a billing account is out, and the user is told plainly instead of getting a quiet substitute. Do not rely on a remembered list of services. Check the current terms, because free tiers change. Record each asset's source and licence in a comment at the top of the file.

## 5. Look at it

```
node scripts/shoot.mjs page.html --viewports 1440x900,390x844 --scroll 0,0.5,1
```

The script serves the page, drives headless Chrome or Edge, writes PNGs, and prints `PROBLEMS: n` with every console error and warning. It needs Node 22 or later and no installation. Give `--scroll` one value per section. `--at 0,2500` shoots one frame at two moments. `--eval "..."` changes values at runtime, which is the fast way to compare variants without editing the file. In the first and last rounds add an in-between width (`1024x700`).

Read the PNGs. For each frame, name the weakest thing in it as a juror who has never seen the code would. Fix the top one to three. Shoot again. Do at least two rounds after the first render, and stop when a round turns up only nitpicks. `PROBLEMS` has to be 0: it has caught deprecated APIs and failed downloads that rendered without any visible error.

Check in this order:

1. Does the first screen say what this is within three seconds?
2. Is there one dominant thing on each screen, or is everything competing?
3. Can every piece of text be read where it sits?
4. Is anything colliding: copy with the visual, a label with the navigation?
5. Do the details hold: unit case, label fonts, line breaks, alignment, spacing rhythm?
6. Does the phone frame pass the same five?
7. If it moves, does it? Shoot `--at 0,2500` and compare a region that should move with one that should not. Comparing image hashes proves nothing when grain is animated.
8. If it moves, is it smooth? Time the frames, three runs each, at `--dpr 1` and `--dpr 2`:

```
node scripts/shoot.mjs page.html --fps 4000 --dpr 2
```

It reports frames per second idle and during a scroll, the worst frame, and where in the scroll the long frames fell. The target is 60fps with no frame over 33ms. When it misses, switch one thing off at a time with `--eval` and measure again. Guessing the cause was wrong more often than right in the build this was learned on.

A 3D frame has its own checks on top of these (silhouette, brightness zones, clipping, material, occlusion, part separation). They are in `references/scene-3d.md`.

Do not fix a composition problem by adding an effect. If the frame is weak with bloom, grain and vignette turned off, it is weak.

## 6. Report

Say what was built, the method, and why that method. Then say what the final screenshots and frame timings show, including anything that still looks wrong, and name what was not checked. Two things this loop never covers: a real phone, and browsers other than Chromium. Say which GPU the timings came from, and point the user at the final screenshots.

## Files

| File | Use |
|---|---|
| `assets/scene-starter.html` | Starting point for any level 2–3 page |
| `scripts/shoot.mjs` | Screenshots, console problems and frame pacing, for every level |
| `references/scene-3d.md` | Subject, studio environment, lights, materials, part separation, surface detail, shots, atmosphere, post-processing, fitting the scene to a page, performance, asset sources |
