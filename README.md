# Glonari Experiences — landing page mockup

Static single-page site. Vanilla HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

The hero video is loaded into memory with `fetch()` so it can be scrubbed by scroll.
This needs a local web server; opening `index.html` by double-click (`file://`) is not supported.

Option 1 — VS Code: install the **Live Server** extension, right-click `index.html`, choose **Open with Live Server**.

Option 2 — terminal, from this folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Structure

```
index.html
css/styles.css          All styles (tokens from GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md at the top)
js/main.js              Scroll scenes, filters, video playback
media/hero.mp4          Screen 1, scroll-scrubbed (every frame is a keyframe: -g 1, no audio)
media/gia.mp4           Screen 3, plays once when 30% visible, holds last frame (from "3 (2).mp4", 4:5 crop, 7.5 s, no audio)
media/ui.webp           Interface on the laptop, shown whole (16:10, from ui-source-3840.png, window centred vertically)
media/ui-gia.mp4        Live Gia over the interface's central window only (photo area cut from gia-window-live-source.mp4, forward + reverse loop, 13 s)
media/pause.mp4         Pause between Screens 4 and 5, looping (forward + reverse, 16 s)
media/closing.mp4       Screen 6 background, looping (forward + reverse, 16 s)
media/*-poster.jpg      First frames, shown before the videos load and under reduced motion
media/tiles/            Catalog card images (cropped from the supplied videos)
media/brand/            Logo and Gia avatar
```

## Screens

1. Introduction — scroll-scrubbed atrium video; the laptop screen lights up with the Gia interface, expands to full screen (never cropped on landscape), dims into a dark bridge with the Screen 2 heading; the Screen 2 catalog rises over the dark/light seam
2. What Experiences means — catalog with category and status filters
3. Gia's guidance — Gia video with scroll-revealed messages and option comparison
4. Choose and activate — four steps and approval card
5. Pause — clip-path reveal video, headline "Every Experience leads here."
6. Stay in control — dark example panel (pinned on desktop) and update marquee
7. Closing — full-bleed looping video and CTA

Copy in square brackets is a placeholder.

## Replacing a video for scrubbing

```bash
ffmpeg -i source.mp4 -g 1 -an -c:v libx264 -crf 27 -pix_fmt yuv420p -movflags +faststart media/hero.mp4
```
