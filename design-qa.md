# Design QA — The Brightest Stars Above You

## Comparison target

- Source visual truth: `/Users/huangyurui02/Documents/找工/今夜最亮星_assets/GPS自动识别后_产品结果页_v1.png`
- Source pixels: `941 × 1671`.
- Rendered implementation: `http://127.0.0.1:4173/?demo=1`.
- Combined comparison surface: `http://127.0.0.1:4173/qa.html`.
- Browser-rendered evidence: Codex in-app browser captures of the source comparison, the full-screen mobile implementation, and the desktop implementation.
- Mobile viewport: `393 × 852`.
- Desktop viewport: `1440 × 1000`.
- Device pixel ratio: `1` during the 1:1 check.
- State: responsive web, dark mode, Los Angeles sample location, local date/time, results screen.
- Responsive normalization: the source establishes the mobile visual language. The implementation keeps that hierarchy at `393 × 852`, then expands it into a true two-column desktop canvas at `1440 × 1000`.

## Full-view comparison evidence

The combined `qa.html` surface displayed the source and live implementation side by side. The implementation preserves the source hierarchy: privacy-safe location, poetic title/time, observation-condition pill, semicircular sky panel, and ranked glass cards. Place and time now sit together as two compact top-left controls. The public experience no longer exposes device chrome: the browser viewport is the product canvas on both mobile and desktop.

## Focused-region evidence

- Header: the location and time controls, English title, poetic supporting line, and observation conditions remain legible and aligned.
- Sky panel: star points, highlighted primary star, zenith guide, east/west labels, mountains, palms, and city horizon are visible.
- Results: rank, bilingual star name, direction, altitude, visibility, magnitude, and the primary-star message are readable.
- Personal fortune sheet: dark visual treatment, month/day input, locally computed zodiac, primary-star link, disclaimer, and reset action were browser-tested.

## Required fidelity surfaces

- Fonts and typography: passed. A high-contrast serif gives the English product name a more poetic voice; Chinese utility and astronomy content stays in a clear system sans-serif.
- Spacing and layout rhythm: passed. Mobile uses a centered single-column flow. Desktop uses a `517.8px / 607.8px` two-column grid with the title and sky on the left and ranked results on the right.
- Colors and visual tokens: passed. Near-black navy, deep blue glass surfaces, icy blue utility text, green success states, and warm gold star accents match the source direction.
- Image quality and asset fidelity: passed. The generated Los Angeles night-sky asset is sharp, correctly cropped, and reused in the sky panel. Radix icons replace UI glyphs; no placeholder imagery remains.
- Copy and content: passed. The main title is `The Brightest Stars Above You`; the supporting line is `Tonight, the sky meets you where you are.` Core Chinese astronomy content and entertainment disclaimers remain intact.

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
- Mobile responsive check: the app canvas measured exactly `393 × 852`; device bezel display was `none`; no horizontal overflow.
- Desktop responsive check: the app canvas measured exactly `1440 × 1000`; the experience resolved to two columns; no horizontal overflow.
- Runtime integrity: `npm run check:runtime` passed.
- Production build: `npm run build` passed.

### Iteration 2

- Finding: `[P1]` The prior public desktop experience displayed the product inside a centered phone frame rather than using the web canvas.
- Fix: hid device bezel, camera, status chrome, model picker, and simulated keyboard; expanded the app surface to the full viewport; added responsive single-column and two-column layouts.
- Post-fix evidence: `393 × 852` and `1440 × 1000` browser captures both show full-viewport product UI without phone chrome.

### Iteration 3

- Finding: users could only inspect the ranked stars and a fixed city list; there was no direct way to ask about a named star or another city.
- Fix: added a top-level bilingual star search, current-location brightness sheet, four quick cities, and global city-name search with coordinates and time zone.
- Post-fix evidence: `Sirius` returned `天狼星`, then showed its below-horizon state at the active place and time; `Paris` returned multiple country-qualified city matches and selecting `巴黎 · 法兰西岛 · 法国` updated the page to Paris local time.

### Iteration 4

- Finding: the mobile bottom time/location dock appeared as an oversized floating pill on desktop, duplicated the top location entry and the results-section “换时间” action, and visually competed with the content.
- Fix: hid the bottom dock at desktop widths (`≥ 900px`) and reduced obsolete desktop bottom padding; preserved the dock on mobile.
- Post-fix evidence: the `1440 × 1000` capture has no bottom floating pill and keeps both desktop actions accessible elsewhere; the `393 × 852` capture still shows the compact mobile dock.

### Iteration 5

- Finding: the star-detail hero used a generic glowing star icon, so it did not help users recognize the selected star's constellation.
- Fix: replaced the generic orb with the matching official IAU constellation chart, a bilingual constellation caption, visible source and license attribution, and an orb fallback for network failures.
- Post-fix evidence: Vega rendered the Lyra chart; searching Sirius switched the chart source to `CMA.gif` and captioned it `大犬座 / Canis Major`.

### Iteration 6

- Finding: location and time actions were split between a top-left place label and a large floating bottom dock, while the location-source pill and search hint repeated already-visible context.
- Fix: consolidated place and observation time into two compact upper-left buttons; removed the bottom dock, location-source pill, and `当前位置 · 当前时间` search hint. GPS remains available inside the place sheet.
- Post-fix evidence: mobile and desktop checks show the two top-left controls, an uncluttered search field, and no floating dock.

### Iteration 7

- Finding: the sky diagram plotted all five ranked stars but only named the brightest one, leaving the other four points ambiguous.
- Fix: added rank-and-name labels to all five plotted stars, with automatic left/right and above/below placement near panel edges.
- Post-fix evidence: mobile and desktop checks show five readable labels while every star point remains clickable.

## Final result

final result: passed
