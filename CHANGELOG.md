# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Package version bumped from `1.0.6` to `1.0.7`.

## [1.0.7] - 2026-06-03

### Added

- Added default keyboard shortcuts for `callout` (`Ctrl+Shift+C`), `details` (`Ctrl+Shift+D`), and `definitionList` (`Ctrl+Shift+U`).
- Keyboard shortcuts expanded to cover all standard actions (e.g., `Ctrl+Z` for undo, `Ctrl+Shift+1-6` for headings).
- Display of keyboard shortcuts in toolbar button tooltips and dropdown menus.
- Added configurable keyboard shortcuts (default: `Ctrl+B` for bold, `Ctrl+I` for italic, etc.).
- Added a copy-code button next to fenced code block language labels, copying only the raw `<code>` content without labels or line numbers.
- Added the `actions.copyCode` translation key to default translations and all locale files.
- Added the `toggleTask` toolbar action for toggling Markdown task list items between unchecked and checked states.
- Added the `actions.toggleTask` translation key to default translations and all locale files.
- Added `clearFormatting`, `callout`, `details`, and `definitionList` as configurable standard toolbar actions.
- Added translation and placeholder keys for callout, details, and definition list insertions to all locale files.
- Added `example.md` with Markdown samples covering all standard toolbar actions.
- Added a demo button that loads `example.md` into the editor.

### Changed

- Updated keyboard shortcuts to avoid conflicts with browser standard commands: `toggleTask` is now `Ctrl+Shift+M`, `underline` is `Ctrl+Alt+U`, and `ol` (numbered list) is `Ctrl+Shift+O`. Improved shortcut detection logic to correctly handle combinations with the `Shift` key, `Alt` key, and sub-item actions like headings across different keyboard layouts.
- Added a shortcut info button in the stats bar that opens a modal with a table of all available keyboard shortcuts.
- Fixed an issue where `Ctrl+Shift+U` (Definition List) was not correctly recognized on some keyboard layouts.
- Locale source files now use a consistent object structure and generated `*.min.js` files; duplicate `*.min.min.js` artifacts were removed.
- Fenced code blocks with any valid language hint now show the language label and copy action, even when the language is not supported by the built-in highlighter.
- Known highlighted code blocks now use subtle striped line backgrounds alongside line numbers.
- Markdown table parsing now preserves escaped pipes and pipes inside inline code, preventing README option tables from splitting into extra columns.
- Inline code rendering no longer double-escapes already escaped Markdown content inside table cells.
- Markdown rendering no longer stalls on partially typed or invalid fenced code block markers such as extra backticks.
- Empty highlighted code blocks no longer render line numbers or striped line backgrounds.
- Code block insertion now uses a Bootstrap modal for optional language input instead of the browser prompt when Bootstrap Modal is available.
- Task list insertion now preserves block boundaries by placing inserted task lists on their own lines.
- Markdown callouts such as `> [!NOTE] Note` now render as Bootstrap alert blocks.
- Raw `<details>` and `<dl>` blocks are now preserved as block-level preview HTML instead of being wrapped in paragraphs.
- Custom actions with `position: 'right'` now render before the preview button in the right toolbar group.
- Pressing `Tab` inside the editor now inserts spaces up to the next four-column tab stop instead of moving focus away.
- PHP union and intersection return types now highlight all type names consistently without mis-highlighting `return $variable` as a type.
- PHP casts such as `(float)` now highlight the cast type as a type, and trailing-dot float literals such as `1.` are highlighted as complete numbers.
- Toolbar actions and custom actions now preserve the editor cursor or selection before opening modals, so inserted content lands at the previous position.
- Empty placeholder lines in the editable source now serialize as a single newline, preventing one `Enter` at the end of a code block from rendering two blank code lines.
- Package version bumped from `1.0.6` to `1.0.7`.

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
