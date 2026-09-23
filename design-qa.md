# Design QA — Brightest Tonight

## Comparison target

- Source visual truth: `/Users/huangyurui02/Documents/找工/今夜最亮星_assets/GPS自动识别后_产品结果页_v1.png`
- Source pixels: `941 × 1671`.
- Rendered implementation: `http://127.0.0.1:4173/?demo=1`.
- Combined comparison surface: `http://127.0.0.1:4173/qa.html`.
- Browser-rendered evidence: Codex in-app browser capture of the combined comparison page and the 1:1 mobile preview.
- Browser viewport for 1:1 check: `1400 × 1200`.
- App screen CSS size: `393 × 852`.
- Device pixel ratio: `1` during the 1:1 check.
- State: iPhone, dark mode, Los Angeles demo GPS recognized, local date/time, results screen.
- Density normalization: the source has a non-standard `0.563` aspect ratio, while the protected iPhone runtime is `393 × 852`; the combined QA surface used equal-height visual normalization, followed by a separate 1:1 app-screen inspection.

## Full-view comparison evidence

The combined `qa.html` surface displayed the source and live implementation side by side. The implementation preserves the source hierarchy: privacy-safe location and GPS state, centered title/time, observation-condition pill, semicircular sky panel, ranked glass cards, and fixed bottom controls. The protected phone frame is template-owned infrastructure and is excluded from fidelity findings.

## Focused-region evidence

- Header: location, GPS badge, title, time, and observation conditions remain legible and aligned at 1:1.
- Sky panel: star points, highlighted primary star, zenith guide, east/west labels, mountains, palms, and city horizon are visible.
- Results: rank, bilingual star name, direction, altitude, visibility, magnitude, and the primary-star message are readable.
- Personal fortune sheet: dark visual treatment, month/day input, locally computed zodiac, primary-star link, disclaimer, and reset action were browser-tested.

## Required fidelity surfaces

- Fonts and typography: passed. System Chinese sans-serif matches the reference's clean consumer-product style; hierarchy and small-label optical weights remain readable.
- Spacing and layout rhythm: passed. Major section order, centered hero, rounded condition pill, sky arc, card spacing, and fixed controls match the selected design. The protected mobile runtime makes the visible list slightly denser than the source, classified as P3.
- Colors and visual tokens: passed. Near-black navy, deep blue glass surfaces, icy blue utility text, green success states, and warm gold star accents match the source direction.
- Image quality and asset fidelity: passed. The generated Los Angeles night-sky asset is sharp, correctly cropped, and reused in the sky panel. Radix icons replace UI glyphs; no placeholder imagery remains.
- Copy and content: passed. Core Chinese copy matches the selected design, with intentional additions for real-time data, scientific caveats, and the user-requested entertainment layer.

## Comparison history

### Iteration 1

- Finding: `[P2]` The initial implementation used the night-sky asset only as a full-screen background, so the semicircular sky panel lacked the source's mountain and city horizon.
- Fix: added the real night-sky asset as a layered background inside `.sky-panel`, aligned to the lower horizon.
- Post-fix evidence: the repeated side-by-side comparison shows the city lights, palms, and ridge inside the sky panel, restoring the source composition.

### Interaction and runtime verification

- Time control: selecting `+2h` changed the displayed time from the evening start to two hours later and recomputed the sky.
- Manual location: selecting Beijing changed the location badge, local date/time, weather state, and stellar positions.
- Birthday flow: selecting September 23 produced Libra after the boundary mapping fix.
- Browser console: no errors or warnings in the final checked state.
- Runtime integrity: `npm run check:runtime` passed.
- Production build: `npm run build` passed.

## Follow-up polish

- `[P3]` The protected device frame and standard iPhone aspect ratio show fewer cards above the fold than the taller source mock. Scrolling remains obvious and the primary task is unaffected.

## Final result

final result: passed
