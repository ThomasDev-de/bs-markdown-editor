# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2026-04-17

### Changed

- Word counter in editor stats now uses dedicated Markdown-aware counting via `helpers.countWords(value)` instead of simple whitespace splitting.
- Word counting now derives plain text from rendered Markdown HTML (`sharedConverters.renderMarkdown(...)` + jQuery `.text()`), so Markdown syntax is no longer counted as words.
- Line breaks are now explicitly respected in word counting by converting `<br>` nodes to spaces before text extraction.
- Improved consistency of multi-line counting behavior when typing in editor mode (e.g. pressing `Enter` no longer merges words across lines).

## [1.0.1] - 2026-04-15

### Added

- Added public static helpers `$.bsMarkdownEditor.toHtml(markdown)` and `$.bsMarkdownEditor.toMarkdown(html)` for conversions without binding to an element.
- README updated with documentation for the new static conversion API.

### Changed

- Package version bumped from `1.0.0` to `1.0.1`.

## [1.0.0] - 2026-04-15

### Added

- Initial public release of `bs-markdown-editor`.
- Bootstrap-styled Markdown toolbar with configurable actions.
- Built-in preview renderer (headings, lists, task lists, code blocks, tables, links, images, quote, hr).
- Configurable options including button styling, initial mode, language, and action filtering.
- Plugin methods: `mode()` / `mode(value)` and `val()` / `val(value)`.
- Event system: `ready`, `change`, `userChange`, `modeChange`, and `any`.
- Table insertion modal and responsive toolbar behavior for small screens.
- Documentation updates and demo page for API/event testing.
