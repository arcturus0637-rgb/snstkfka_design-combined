# The 3D scene

Read this when the level is 2 or 3 (see `SKILL.md`). Start from `assets/scene-starter.html`; this file explains the choices in it and what to change.

Values marked **measured** were set by rendering and looking, or by timing frames, on the starter and on two product pages built with it (three.js 0.187, an integrated GPU, shots at 1440×900, 1024×700 and 390×844). Everything else is a starting point: set it, shoot, look, adjust.

## Contents

1. [Order of work](#order-of-work)
2. [The subject](#the-subject)
3. [Environment and tone mapping](#environment-and-tone-mapping)
4. [Lights](#lights)
5. [Materials](#materials)
6. [Separating parts](#separating-parts)
7. [Surface detail without modelling](#surface-detail-without-modelling)
8. [Camera and shots](#camera-and-shots)
9. [Atmosphere](#atmosphere)
10. [Post-processing](#post-processing)
11. [The scene on a page](#the-scene-on-a-page)
12. [Judging a 3D frame](#judging-a-3d-frame)
13. [Performance](#performance)
14. [Pitfalls that cost a round](#pitfalls-that-cost-a-round)
15. [Where to get assets](#where-to-get-assets)

## Order of work

Each step is judged against the one before it, so skipping ahead means tuning values against a broken base.

1. Look direction (decide it from the subject; `webgl-landing-steering` is not in this pack)
2. The subject
3. Environment and tone mapping
4. Lights
5. Materials, then separation between parts
6. Camera framing, then camera movement
7. Post-processing, one pass at a time
8. Frame pacing

## The subject

The starter's blob is a placeholder. A page looks designed when the subject is the thing the page is about, so replace `createSubject()` first and tune the look second.

Three ways to get a real subject, cheapest first:

- **Build it from parts.** A real object is layers of simple shapes, each with its own material and one believable detail. A processor is a board, a metal lid, a die, a row of capacitors and a grid of pads: five boxes and two instanced meshes. What sells it is the detail on each layer, not the geometry.
- **Generate it from data.** Points, instanced bars, a terrain mesh, a graph. The form then says something true about the content.
- **Load a model.** `GLTFLoader` with `DRACOLoader`; see [Where to get assets](#where-to-get-assets). Scale it so its radius matches `SUBJECT_RADIUS`, or the camera fit is wrong.

Use `InstancedMesh` for anything repeated more than about twenty times. When the page quotes a figure the model also shows (a pad count, a number of cores), take the figure from the model so the two cannot disagree.

For an object that turns and tilts, set `rotation.order = 'XYZ'`: `rotation.y` then turns it about its own normal and `rotation.x` tilts the result toward the camera.

## Environment and tone mapping

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;   // built in code; see the starter
scene.environmentIntensity = 0.3;
```

Without `scene.environment` a PBR material has nothing to reflect: metal goes black, glass disappears, everything looks like painted clay. This is the most common reason a correct scene looks dead.

### The environment is a studio you build

A `metalness: 1` surface has no diffuse term. A light gives it a hotspot and nothing else: every bit of shading across the body of a metal is a reflection of the environment. **Measured**: on a brushed metal lid, taking the key light from 2.0 to 3.4 while dropping the environment from 1.15 to 0.32 changed the overall brightness and left the face exactly as flat. So the environment is where metal gets lit, and it deserves the same care as the lights.

The starter builds its environment in code: a dim room and four panels (an overhead softbox, a cool wall, a thin liner, a warm kicker), baked once through `PMREMGenerator` before the first frame. The panels are in `LOOK.studio`. What was **measured** while arriving at it:

- **Each panel fades toward its edges, like a real softbox.** An evenly bright panel reflects as an evenly bright face. With the falloff, a flat lid picked up a gradient, and the light rolls across it as it turns.
- **Broad and moderate beats narrow and hot for a subject that turns.** Panels at 22–26×, tuned for one camera angle, gave a beautifully graded face in a close-up and a completely clipped one at the hero angle of the same page. Panels at 2–9× with `environmentIntensity` 0.3 held at all four angles of a scroll path.
- **The room is never black.** Angles that miss every panel still need something to reflect.
- **The liner**, a long thin panel behind the subject, is what draws a bright line along every chamfer.
- Polished metal mirrors this studio sharply. In a dim room it becomes dark chrome with bright shapes in it; for bright chrome, raise `room` and widen the panels.

To put a warm/cool split on metal, tint the panels, not the lights. Powers above 1 are real: the environment is baked to a float target. Expect two or three renders to land the panel powers for a new subject, and check every shot, not only the hero.

### Or an HDRI

A photographed studio HDRI gives natural, consistent reflections with no tuning. It costs three things, all **measured** on one page:

- Applying it stalled one frame for 50–117ms on every load, in the middle of the intro. Precompiling the shader did not help.
- Holding the scene back until it arrived left the canvas empty for more than five seconds on one load in five.
- Showing the scene first with a stand-in environment made the look depend on network speed: the same page rendered with visibly different metal on a slow load.

Use an HDRI when the page already waits behind a loader, and apply it before anything is shown. Load it with `HDRLoader` (`RGBELoader` is deprecated since r180).

### Tone mapping and colour space

**Measured** on a dark page: ACES kept the blacks black. AgX lifted the dark backdrop into a grey haze and lowered contrast. Use ACES for dark, moody frames, AgX for bright scenes with saturated emissive colour, and `NeutralToneMapping` when a brand colour has to stay exact.

`scene.environment` and `scene.background` do not have to match. Reflections from a studio over a designed backdrop is the usual premium look.

Colour and emissive textures need `texture.colorSpace = THREE.SRGBColorSpace`. Roughness, metalness and normal maps stay at the default. Getting this backwards survives code review and ruins the image.

## Lights

| Role | Type | Measured value | Placement |
|---|---|---|---|
| Key | `DirectionalLight` | 1.5–1.8 | 35–50° above, 30–45° off the camera axis |
| Rim | `DirectionalLight` | 1.7–2.2 | Behind the subject, opposite the key |
| Fill | — | none | The environment is the fill |

The rim light draws the silhouette. Without it the subject merges into a dark backdrop no matter how good the materials are. A rim at 5 clipped the whole edge to white; at 1.7 the edge stayed defined.

Add a fill light only when there is no environment, or when shadows are still too dark after tuning it. A fill on top of an environment mostly flattens the image.

**Warm key against cool rim** is the cheapest way to look expensive: about `#ffc48a` and `#8fb8ff`. Match the saturation to the material, though. A saturated warm key on brushed nickel turned it into brass, then wood; `#ffe6cc` at 1.5 kept it nickel.

Shadows are optional for a floating subject. If the subject sits on a surface: `PCFSoftShadowMap`, key light only, `mapSize` 2048, `normalBias` 0.02, and a shadow camera frustum fitted tightly around the subject. A loose frustum is the usual cause of blocky shadow edges. Shadow maps have a frame cost; see [Performance](#performance).

## Materials

`roughness` tells the viewer what a thing is made of.

| Roughness | Reads as |
|---|---|
| 0.0–0.15 | Mirror, polished chrome, still water |
| 0.2–0.4 | Satin metal, glossy plastic, car paint |
| 0.5–0.7 | Matte plastic, circuit board, painted wood |
| 0.8–1.0 | Chalk, concrete, fabric |

`metalness` is 0 or 1. Values in between are for worn or partly painted metal only. `metalness: 0.5` on plastic gives a muddy surface that no lighting fixes.

`MeshPhysicalMaterial` adds what makes products look manufactured: `clearcoat` (lacquer, car paint), `transmission` with `ior` and `thickness` (glass; needs an environment to be visible), `iridescence` with `iridescenceThicknessMinimum` / `Maximum` (thin film: silicon, soap, anodised metal).

To displace or reshape a mesh and keep PBR lighting, extend a built-in material with `onBeforeCompile` instead of writing a `ShaderMaterial`. The starter's subject shows the pattern, including the part most people skip: after moving vertices, rebuild the normal from two displaced neighbours, or the new shape keeps the lighting of the old one.

## Separating parts

When stacked or stepped parts blur into one lump, fix it in this order. All three were **measured** on product builds with a lid on a flange on a board.

1. **Different materials on adjacent parts.** Two metal pieces sharing a colour and a roughness read as one piece however they are stepped, because the only thing between them is a shadow line a few pixels wide. Give them distinct `color`, `roughness` and `envMapIntensity`. A flange at `0x8f98a5`, roughness 0.5, `envMapIntensity` 0.7 against a brighter, smoother lid turned a thin bright line into a visible step. This one is free, so do it first.
2. **A structured environment.** A uniform environment lights every face of a metal equally. The panels and liner in the starter's studio put a gradient on each face and a line on each chamfer. See [The environment is a studio you build](#the-environment-is-a-studio-you-build).
3. **Ambient occlusion.** An environment lights a crevice as brightly as the face beside it, and a key light cannot reach into a small step. Add `SSAOPass` straight after the render pass: `kernelRadius` about 1/30 of the subject's width (0.09 for a 3-unit subject), `minDistance` 0.0012, `maxDistance` a little deeper than the deepest step (0.055). Overdone, it leaves dirty smudges in every corner. It is the most effective of the three on deep steps and by far the most expensive: check the frame pacing after adding it.

## Surface detail without modelling

Draw the detail on a canvas and use it as a texture. This is where a procedural object stops looking procedural.

- **Brushed metal**: a roughness map whose value changes row by row and is constant along the row. Keep the range narrow. **Measured**: roughness 0.27–0.52 read as wood grain; 0.29–0.39 with the texture repeated three times across the grain read as brushed nickel.
- **Etching, print, labels**: draw on a transparent canvas and lay it on a plane a hair above the surface with `transparent: true`, `depthWrite: false`, `polygonOffset: true`. Darker and rougher than the metal reads as laser etching.
- **Glowing regions**: draw one layout twice, once as the colour map and once as the emissive map, so lit areas line up with what is underneath. Emissive above 1.0 feeds the bloom. **Measured**: intensity 2.3 flattened the detail into pastel tiles; 1.5 glowed and kept the fine lines.
- **Seed the random numbers** so the object looks the same on every load.
- **Canvas text and web fonts**: text drawn before the font arrives uses a fallback. Redraw inside `document.fonts.ready.then(...)` and set `texture.needsUpdate = true`.

Set `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()` on anything seen at a grazing angle, or fine lines turn to mush.

## Camera and shots

**Focal length sets the feeling, distance sets the framing.** FOV 20–30 is telephoto: compressed, flattering, product-like. 45–60 is neutral. 70+ is wide and dramatic and distorts at the edges. To change the feeling without changing the composition, narrow the FOV and move back.

Fit the camera by the limiting dimension so framing survives any aspect ratio: the subject fills about 60% of the height on a wide frame and about 80% of the width on a tall one. The starter's `resize()` does this from `SUBJECT_RADIUS`.

What each move says:

- **Dolly in** (along the view axis): attention, arrival. The strongest single hero move
- **Orbit** (around the target): reveals three-dimensional form
- **Crane** (vertical): scale, grandeur
- **Truck** (lateral): parallax, depth layers

`SHOTS` holds one entry per page section: where the subject sits in the frame, how close the camera is, and the subject's own state (turn, tilt, how far it is opened, how much it glows). Scroll scrubs between entries. Rules that held up:

- **One move per section.** Dolly in, or turn, or open. Two at once reads as noise.
- **The camera dollies and drifts; the subject turns.** Moving both the same way cancels out.
- **Put the subject on the side opposite the copy**, and switch sides between sections so the page has rhythm.
- **Keep turning the same way.** To come back to the starting pose, go on to a full turn (`rx + 2π`) instead of reversing.
- **An opened or exploded view has to clear from the camera's point of view.** Lifting a lid straight up left it between the camera and what it covered. It had to rise, slide back and tip. This is visible in a screenshot and not in the code.

Easing: `power2.inOut` between shots, `power3.out` for an intro that lands and settles, 2–3s for the intro. Linear motion is the tell of an untuned scene. Add a slow idle drift so nothing is ever perfectly still, and damp pointer parallax with `1 - Math.exp(-dt * k)` so it is frame-rate independent.

Keep depth of field restrained on a page people read. Heavy bokeh over text reads as a rendering mistake.

## Atmosphere

- **Backdrop**: a screen-space gradient with its glow centred behind wherever the subject currently is, so the silhouette always has something to read against. Keep its values below 1.0 so the bloom ignores it. A faint pattern that exists only inside the glow (a dot grid for technical subjects) gives the empty space a character.
- **Dust**: points drawn larger and fainter the further they are from the focal plane. It reads as depth of field without a DOF pass. Three things are required. Size in world units converted to pixels (`size * viewportHeight / (2 * tan(fov / 2)) / depth`) and alpha that falls as the mote grows: **measured**, without them 420 motes whited out the whole frame. And a cap on sprite size, with motes right in front of the lens dropped: large additive discs are pure fill cost, and uncapped they took a dense screen from 60fps to 45.
- **Fog** only when the scene has real depth to hide.

## Post-processing

The chain in the starter, in order:

1. `RenderPass` into a multisampled half-float target
2. `UnrealBloomPass`
3. `OutputPass` (tone mapping and sRGB)
4. A finish pass in display space: chromatic aberration, vignette, grain

If the scene needs them, ambient occlusion goes straight after the render pass and depth of field before the bloom: both read depth.

| Effect | Measured value | When overdone |
|---|---|---|
| Bloom | strength 0.15–0.22, radius 0.6–0.7, threshold 1.0 | Below threshold 0.9 whole surfaces glow and lose their form |
| Vignette | 0.42–0.45 | Reads as a cheap photo filter |
| Chromatic aberration | 0.3–0.35 in the starter's units, edges only | At 0.6 small bright points near the edges split into coloured dots |
| Grain | 0.035–0.04 | Hides banding in dark gradients; visible noise above 0.06 |

**Antialiasing comes from the render target**: pass `new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })` to `EffectComposer`, with 2 samples on phones and dense screens. The canvas `antialias` flag does nothing once rendering goes through a composer. **Measured**: 0 samples left stepped silhouettes even on a phone-sized frame.

Aberration belongs to the edges of a lens: scale it by distance from the centre so the middle of the frame stays sharp. Grain goes after tone mapping so it is even across dark and bright areas.

Tune bloom last. Set strength to 0, confirm nothing is clipping, then raise it until only the rim edge, the key highlight and emissive parts glow. Add one pass at a time and shoot between each: every pass looks like an improvement on its own, and the damage only shows in comparison.

## The scene on a page

- The canvas is `position: fixed` behind the content and fades in on its first frame, so the page never flashes an empty box. Without WebGL a CSS gradient stands in and the page still reads.
- **Text never sits on a bright surface.** On a wide screen the subject and the copy take opposite sides. On a tall one the subject owns the top of the screen, the camera's dolly-in is capped, and a fixed scrim covers the lower part.
- **One condition decides the stacked layout, the same in CSS and in script**: `@media (max-aspect-ratio: 1/1)` and `width / height < 1`. With a pixel breakpoint in one and an aspect test in the other, a tablet-sized window gets the wide layout with no room for it.
- **Copy width is a share of the viewport on a wide layout** (`min(520px, 42vw)`), so it cannot reach the subject on a narrower desktop window.
- **One palette.** Take the page's accent from the key light or from the subject's own material (the gold of contact pads, for instance), and the secondary from the rim light.
- **Labels pinned to the model**: project each anchor to screen coordinates every frame and move a DOM label there. Two per side at most, with enough vertical distance that they cannot touch. Show them only while their target is exposed. Below about 1150px wide there is no room beside the model: hide them and list the same information in the copy.
- **No `backdrop-filter` on anything above the canvas.** See [Performance](#performance).

## Judging a 3D frame

Check in this order, because each has a different fix:

1. **Silhouette.** Would the subject read as a flat black cutout? If not, the rim light is missing or weak.
2. **Three brightness zones.** A clear highlight, midtone and shadow. If everything sits in one band the lighting is flat, and effects will not fix it. On a metal, look at the environment before the lights.
3. **Clipping.** Large areas of pure white have lost their form. Lower the panel powers or `environmentIntensity`, then the rim, then the bloom. Check every shot: a face can be fine at one angle and clipped at another.
4. **Material legibility.** Does the metal look like metal and not wood or plastic? Does it reflect something?
5. **Light direction.** Highlights and shadows agree on where the light is.
6. **Occlusion.** Is the thing the copy is talking about actually visible in this frame?
7. **Part separation.** Can you tell where one component ends and the next begins? See [Separating parts](#separating-parts).

## Performance

Smoothness is part of the look. A page that stutters reads as cheap however good a still frame is, and stutter is invisible in a screenshot. Measure it.

```
node scripts/shoot.mjs page.html --fps 4000 --dpr 2
node scripts/shoot.mjs page.html --wait 0 --when "document.querySelector('#scene.ready')" --fps 4000 --dpr 2
```

The first reports frame pacing with the page idle and during a top-to-bottom scroll, and where in the scroll any long frames fell. The second starts the moment the scene appears, which is where load-time stalls show. Run each three times, because single runs vary. The `gpu` line says what rendered it; on a software renderer the absolute numbers mean nothing. Always measure at `--dpr 2` as well as 1: a page that holds 60fps at DPR 1 can be well under it on a dense screen.

**Measured** on one product page (integrated GPU, 1440×900):

| Cause | Effect |
|---|---|
| `backdrop-filter` on one button above the canvas | A 67ms stall at the start of every scroll, 5 runs of 5; none in 4 runs once removed. On a dense screen it also cost about 15fps while idle |
| Resolution | 5.2M pixels (DPR 2) ran at 43–46fps with uneven frames. 2.9M ran at 60 |
| A pipeline sitting just over one frame of work | Turning off any one of MSAA, bloom, the finish pass or the dust brought it back to 58–60fps |
| Large defocused sprites near the camera | The dust alone was the difference between 45 and 60fps until its size was capped |
| SSAO, shadow maps and SMAA together at DPR 2 | 25–35fps on the same GPU, on another page |
| An HDRI applied during the intro | One frame of 50–117ms on every load |

After the changes below, the same page held 60fps with no frame over 33ms, idle, scrolling and from the first frame, in every run.

What the starter does about it:

- **A pixel budget.** Cost follows the number of pixels rendered, not the device pixel ratio. `LOOK.pixelBudget` (2.6M) sets the starting resolution, so a dense laptop screen and a 4K monitor both land on something a modest GPU can hold.
- **A governor.** When frames stay long it drops the resolution in one step sized to how slow they are. It only steps down, so the image never pumps. This covers the GPUs the budget was not tuned on.
- **No `backdrop-filter` above the canvas.** The compositor has to re-blur a moving scene every frame.
- **Sprite size capped**, and motes right in front of the lens dropped.
- **Fewer MSAA samples on a dense screen**, where each pixel is already small.
- **The environment is built before the first frame**, so nothing stalls later.

Ambient occlusion or shadow maps take this pipeline over budget at DPR 2. If the subject needs them, lower `pixelBudget` or run the AO pass at half resolution, and measure again.

Pause the loop when the tab is hidden. With `prefers-reduced-motion`, stop the clock and the intro but keep scroll positions working, so the page holds a composed frame in every section.

A headless run on a development machine is not a phone. Say in the report which GPU the numbers came from.

## Pitfalls that cost a round

- `ShaderPass` clones the uniforms it is given. A shared `{ value }` clock stops being shared: set `pass.uniforms.uTime.value` each frame. This froze the grain without any error.
- Checking motion by comparing image hashes proves nothing when grain is animated. Compare two frames taken a few seconds apart, and compare a region that should move against a region that should not.
- Two layout defects existed only between the widths being checked: a headline that ran into the subject at 1200px and labels that collided with the copy at 960px. Shoot an in-between width.
- A headline needs a `max-width` in `em` so it breaks the same way at every size. Left to the column width, it wrapped at 1440px and ran on one line into the subject at 1200px.
- `RGBELoader` and `iridescenceThicknessRange` are gone or deprecated in current three.js. `shoot.mjs` reports the console warning.
- `text-transform: uppercase` on a row of figures turns `GHz` into `GHZ` and `nm` into `NM`. Units keep their case.

## Where to get assets

Qualify every source the same way (see `SKILL.md`): no key is best, a free key is acceptable, anything asking for a card is out and the user is told. Check the current terms; they change.

- **HDRIs, textures, models**: Poly Haven, CC0. HDRIs load directly from `https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/<slug>_1k.hdr` with CORS (checked). ambientCG, CC0.
- **Models**: Khronos glTF Sample Assets (licence per model), Quaternius and Kenney (CC0).
- **Map tiles and imagery**: MapLibre with OpenStreetMap tiles, NASA GIBS.
- **Look references**, for what to aim at and not for technique: Awwwards (`/websites/three-js/`, `/websites/webgl/`; technique tags are on each site's own page, never the listing), SiteInspire, recent.design, CSS Design Awards. None of them publish numbers.

Record each asset's source and licence in a comment at the top of the HTML.
