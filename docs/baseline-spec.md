# Earth 3D Dashboard Baseline Specification

## Purpose

This document captures baseline behavior before modernization so all later stages can be validated without regressions.

## Page Acceptance Criteria

### Home (`src/index.html` + `src/index.js`)

- The page renders a Babylon.js Earth scene in the main canvas.
- Population button toggles between base Earth and population map globe.
- Day vs Night button toggles between base Earth and night map globe.
- Resizing the browser keeps the scene responsive and render loop active.
- Navigation links route to Home and Blog pages.

### Blog (`src/blog.html` + `src/blog.js`)

- Article cards are generated from in-repo article data.
- Typing in search filters cards by article category.
- Each card links to article details page using query-string title.
- Home/Blog nav is visible and reachable.

### Article Detail (`src/article.html` + `src/article.js`)

- The page reads `title` from the query string.
- Matching article content renders image, title, category, and body content.
- Missing title shows a not-found message instead of crashing.
- Back to Blog control returns to the blog list.

## Asset Inventory

### 3D Map Textures (`src/assets/maps`)

- `earth_daymap.jpg`
- `earth_normal_map.jpeg`
- `pop_density_map.jpg`
- `earth_nightmap.jpg`

### Article Images (`src/assets/articleImages`)

- One image per article object defined in blog data.

## Behavioral Guardrails

- Do not break static site workflow (`npm start` with lite-server).
- Preserve no-build vanilla JS compatibility unless explicitly upgraded in tooling stage.
- Keep page load functional even if some assets fail.

## Manual Regression Checklist

- Home loads with visible globe and no blocking error.
- Both toggle buttons work repeatedly and independently.
- Blog renders all expected cards on first load.
- Search returns filtered results as input changes.
- Article link opens correct article content.
- Invalid article query returns graceful feedback.
