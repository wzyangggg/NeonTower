# UI font sources

Full sources stay here and are excluded from the shipped `dist` tree.

- Glow Sans SC Normal v0.93 Medium/Bold: https://github.com/welai/glow-sans/releases/tag/v0.93
- Rajdhani SemiBold: https://github.com/google/fonts/tree/main/ofl/rajdhani
- Both use SIL OFL 1.1; copyright/license text is copied into `dist/assets/fonts` and offline packages.

Install the build dependency once: `python -m pip install "fonttools[woff]"`.
`npm run build`, `npm run dev` and `npm run package` refresh subsets automatically.
The scanner includes HTML/CSS/JS/JSON text and Unicode escapes in dist, including comments as a conservative superset. New files or copy changes require no manual character list. Runtime user/external text falls back to system fonts for missing glyphs.
Use `npm run build` before directly uploading dist. No network is needed to rebuild.
