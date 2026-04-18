# Earth 3D Dashboard

Earth 3D Dashboard is a polished static front-end project featuring an interactive 3D globe experience and an Earth-science content hub.

## Highlights

- Interactive 3D Earth canvas powered by Babylon.js
- Toggleable map overlays: Population Density and Day vs Night
- Searchable article hub with quick category filter chips
- Article detail pages with improved formatting and safer rendering
- Shared design system for cohesive visual language and responsive behavior
- Accessibility-focused semantic structure and keyboard-visible focus states
- Quality pipeline with linting, formatting, tests, and CI workflow

## Project Structure

- src/index.html: Home page with 3D scene
- src/blog.html: Blog listing with filtering controls
- src/article.html: Article detail renderer
- src/base.css: Shared design tokens and global component styles
- src/styles.css: Home page styles
- src/blog.css: Blog page styles
- src/article.css: Article page styles
- src/data/articles.js: Centralized article data module
- src/utils/sanitize.js: Query/value sanitization helpers
- src/utils/articles.js: Category filter utility

## Local Development

1. Install dependencies:
   npm install
2. Start local server:
   npm start

## Quality Commands

- npm run lint
- npm run format:check
- npm run test
- npm run verify

## Stage Commits Implemented

- Phase 1: Baseline behavior and regression specification
- Phase 2: Semantic HTML, metadata, and accessibility hooks
- Phase 3: Shared design system and responsive styling refactor
- Phase 4: Modular data flow and safe article rendering
- Phase 5: 3D startup hardening and stable mode toggles
- Phase 6: Search/content UX polish
- Phase 7: Linting, formatting, testing, and CI setup
- Phase 8: Verification docs and repository hygiene

## Notes

This project is optimized as a portfolio showcase and local static project.
