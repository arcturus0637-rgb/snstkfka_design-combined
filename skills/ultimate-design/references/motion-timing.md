# UI motion timing

These durations override the numbers in `animation-systems` for UI motion: press, hover, tabs, toasts and modals.
`animation-systems` still decides what to animate, which properties to use and how an animation is interrupted.
This file only sets how fast each animation runs.

## Where the numbers come from

On 2026-11-23 the user compared two blind bake-off builds of the same notification-center page:
- one built with `gsap-scrolltrigger-storytelling`
- one built with `animation-systems`

The bake-off builds themselves are not part of this repository.

The user asked for speed exactly halfway between the two.
Each value below is the arithmetic mean of the two builds, rounded to 5 ms.
Character stays with `animation-systems`, so a press release does not overshoot.
The gsap build's `back.out` bounce is not carried over.

## Durations (ms)

| Moment | gsap build | animation-systems build | Use |
|---|---|---|---|
| List entrance, per item | 550 | 420 | **485** |
| List stagger (desktop / phone) | 60 | 60 / 40 | **60 / 40** |
| Hover in (lift) | 250 | 160 | **205** |
| Hover out | 300 | 160 | **230** |
| Press down | 100 | 90 | **95** |
| Press release | 350 | 160 | **255** |
| Tab indicator slide | 380 | 280 | **330** |
| Tab swap: old list out | 140 | 120 | **130** |
| Tab swap: new list in, per item | 320 | 420 | **370** |
| Tab swap: new list stagger | 40 | 30 | **35** |
| Toast in | 350 | 280 | **315** |
| Toast out | 240 | 180 | **210** |
| Modal backdrop in | 250 | 220 | **235** |
| Modal panel in | 380 | 320 | **350** |
| Modal backdrop out | 155 | 180 | **170** |
| Modal panel out | 240 | 160 | **200** |

The gsap modal closes by reversing the open timeline at 1.6x.
So its exit values are the entry values divided by 1.6.

## Easing

The midpoint of each curve's control points:
- Enter and settle: `cubic-bezier(.22,.8,.36,1)`. This sits between GSAP `power3.out` ≈ `(.215,.61,.355,1)` and `(.22,1,.36,1)`.
- Exit: `cubic-bezier(.55,.04,.72,.3)`. This sits between `power1.in` ≈ `(.55,.085,.68,.53)` and `(.55,0,.75,.06)`.
- State change (color, background): `cubic-bezier(.4,0,.2,1)`, unchanged from `animation-systems`.

## CSS tokens

```css
:root{
  --d-press:95ms; --d-hover-in:205ms; --d-hover-out:230ms; --d-release:255ms;
  --d-tab:330ms; --d-swap-out:130ms; --d-swap-in:370ms;
  --d-enter:485ms; --d-toast-in:315ms; --d-toast-out:210ms;
  --d-modal-in:350ms; --d-modal-out:200ms; --d-backdrop-in:235ms; --d-backdrop-out:170ms;
  --stagger:60ms; --stagger-phone:40ms; --stagger-swap:35ms;
  --e-out:cubic-bezier(.22,.8,.36,1); --e-in:cubic-bezier(.55,.04,.72,.3); --e-std:cubic-bezier(.4,0,.2,1);
}
```

These values apply to UI motion only.
Scroll motion follows `animation-systems` with its own numbers.
Under `prefers-reduced-motion`, use opacity only, at most 120 ms.
