# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added a copy-code button next to fenced code block language labels, copying only the raw `<code>` content without labels or line numbers.
- Added the `actions.copyCode` translation key to default translations and all locale files.

### Changed

- Fenced code blocks with any valid language hint now show the language label and copy action, even when the language is not supported by the built-in highlighter.
- Known highlighted code blocks now use subtle striped line backgrounds alongside line numbers.

## [1.0.6] - 2026-06-02

### Added

- Added built-in syntax highlighting for fenced code blocks with a language hint such as `php`, including preserved `language-*` classes in preview output.
- Added a small hoverable language badge to fenced code blocks with a language hint.
- Added optional image dimensions via the Markdown extension syntax `![Alt](image.jpg){width=320 height=180}`, rendered as attributes plus matching pixel styles for Bootstrap `.img-fluid` compatibility. Dimension values may be numeric pixels or `auto`.
- Added a Bootstrap image insertion modal for URL, alt text, and optional width/height values.

### Changed

- Image and code block toolbar insertions now preserve block boundaries by adding line breaks when inserted next to existing content.
- Package version bumped from `1.0.5` to `1.0.6`.

## [1.0.5] - 2026-05-29

### Added

- Added locale distribution files in `dist/locale/` for `en-US` and multiple European locales (with matching minified variants).

### Changed

- i18n bootstrap was simplified to a single built-in English default translation.
- If present, preloaded `window.bsMarkdownEditorTranslations` now overrides built-in defaults.
- `settings.translations` remains the final override layer after preloaded locale data.
- Wrapper handling was hardened: plugin internals now always rely on `.bs-markdown-editor`, while `wrapperClass` is appended as additional class(es).
- Markdown table rendering now uses Bootstrap class `table` (without `table-sm`).

## [1.0.4] - 2026-04-27

### Changed

- Markdown preview line break behavior is now CommonMark-style in paragraphs: hard breaks are rendered only for lines ending with two trailing spaces or a trailing backslash. Plain single newlines no longer render as `<br>`.

## [1.0.3] - 2026-04-17

### Added

- New option `resize` (`boolean | 'vertical' | 'both'`) to enable mouse-based resizing on the editor surface.
- New option `btnClass` (defaults to `'border-0'`) to customize the Bootstrap button style class used in the toolbar.
- Value property bridge for the underlying textarea: changes made via `.val()`, `.value = ...`, or `.setRangeText()` are now automatically detected and mirrored into the editor.
- Form reset support: the editor now automatically resets its content when the parent form is reset.

### Changed

- Stats counter UI updated to use Bootstrap 5 theme-aware utility classes (badge with pill shape and subtle borders).
- Improved event handling: `userChange` event is now strictly emitted only for user-initiated actions (typing, toolbar, history).
- Enhanced Bootstrap 5 dark mode compatibility using standard utility classes.

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
