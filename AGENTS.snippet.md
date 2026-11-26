## Design routing

For any request about UI, components, layout, style, theme, or how a page, dashboard or deck looks:

1. Read `astryx` first. Skip it when the output has no UI layer (a pptx, a bare 3D scene, a rendered image).
2. Then read `ultimate-design`. It picks the level of spectacle and calls only the owners below that the request needs.
3. Read one skill per need. Never stack a second skill on the same need.
   - Direction, layout, type: `design-taste-frontend-v1`. Do not use the v2 `design-taste-frontend`.
   - Motion, UI and scroll: `animation-systems`. Take UI motion durations and easing from `ultimate-design/references/motion-timing.md`.
   - Charts and dashboards: `dataviz` if installed, otherwise your own chart skill.
   - 3D: `ultimate-design/references/scene-3d.md`, then `threejs`.
4. Read a style-skin skill (dither, glass, brutalist and so on) only when the user names that style.
5. Before finishing, screenshot desktop and phone widths with `ultimate-design/scripts/shoot.mjs` and look at them.
