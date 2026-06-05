# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Prüfung hinzugefügt, ob der Emoji-Picker bereits durch ein manuell eingebundenes `<script>`-Tag geladen wird, um doppelte Injektionen zu vermeiden.
- Die Injektion des Emoji-Picker Scripts erfolgt nun am Ende des `<body>` statt im `<head>`.
- Vereinfachte Ladestrategie für den Emoji-Picker: Es wird nur noch der GitHub CDN Link verwendet, Fallbacks auf lokale Vendor-Pfade wurden entfernt.
- Repository-Besitz und Paketname für Emoji-Picker auf `thomasdev-de/bs-emoji-picker` korrigiert.
- Fixed a `TypeError: action.run is not a function` when opening the emoji picker. Standard actions now support custom `render` functions.
- Fixed emoji picker not loading in demo by adding missing `bs-emoji-picker.js` dependency.
- Fixed automatic list continuation in contenteditable mode by ensuring the `input` event is triggered after insertion.
- Fixed empty list item behavior to remove the marker while keeping the cursor on the same visible line.

### Added

- Added automatic list continuation when pressing `Enter` in ordered and unordered lists.
- Empty list items are now automatically removed when pressing `Enter`.
- Added keyboard indentation for list items: `Tab` creates a nested sublist item and `Shift + Tab` outdents it.
- Automatische Lazy-Loading Unterstützung für `bs-emoji-picker` via GitHub CDN (@main) und Script-Injektion hinzugefügt.
- Improved list marker detection regex to be more robust with different spacing.
- Fixed rendering of trailing empty editor lines so the caret no longer jumps to the previous line after breaking out of a list.

- Placeholder for upcoming changes.

## [1.2.0] - 2026-06-05

### Added

- Added native support for the `emoji` toolbar action, which integrates with `bs-emoji-picker`.
- Added `emoji` translation keys to all locale files.
- Added `Ctrl + E` as a default keyboard shortcut for the emoji picker.

### Changed

- Updated `README.md` and `demo/index.html` to reflect the new built-in emoji support.
- Package version bumped from `1.1.0` to `1.2.0`.

## [1.1.0] - 2026-06-05

### Added

- Added the `modes` option (`string | string[]`) to configure allowed modes and their dropdown order.
- Added support for single-mode configurations such as `modes: 'preview'`, rendering the selected surface directly without a mode dropdown.
- Added localized mode dropdown labels via `actions.editor`, `actions.html`, and `actions.mode` across all locale files.
- Added `toolbarButtonClass` and `navButtonClass` to custom action render contexts for toolbar-specific button styling.

### Changed

- Mode switching now uses a dropdown instead of individual toolbar buttons.
- The mode dropdown button now displays only the current mode icon (`bi-pen`, `bi-code-slash`, or `bi-eye`) while keeping accessible labels.
- Toolbar padding is no longer applied globally to every `.btn` inside the toolbar; only plugin-generated nav buttons receive the scoped padding class.
- Custom action internals are no longer affected by plugin toolbar padding unless they explicitly use `navButtonClass`.
- Demo updated to use `modes: ['editor', 'html', 'preview']` and the new custom action button context.
- Package version bumped from `1.0.9` to `1.1.0`.

## [1.0.9] - 2026-06-04
- **Fix**: Custom Actions übernehmen nun korrekt die globale `size` Option (z.B. `sm` oder `lg`).

- Fixed: `ReferenceError: $preview is not defined` in several helper functions and event handlers.

- Fixed: Live-Preview Scroll-Synchronisation when switching modes or refreshing content.
- Fixed: Optimized `scroll.bs.markdown-editor` event performance with throttling and removed circular event references in payload.
### Added
- New event `scroll.bs.markdown-editor` triggered when the editor or HTML source is scrolled.
- Synchronized scrolling between editor/HTML source and live preview.
- Added new `height` option to set an initial editor height (default: 500px).
- Added `alignment` toolbar action.
- Added a custom `.text-justify` class to internal styles (missing in Bootstrap 5).
- Added keyboard shortcuts for text alignment: `Ctrl+Alt+L`, `Ctrl+Alt+C`, `Ctrl+Alt+R`, `Ctrl+Alt+J`.
- Added specific Bootstrap Icons for heading levels (H1-H6).
- Added a new `editor` toolbar action.

### Changed
- Improved visual feedback for mode switcher buttons (Editor, HTML, Preview) using text-primary highlighting instead of background colors.
- Mode switching (Editor, HTML, Preview) now uses a consistent Button Group.
- Height management: switching modes preserves manual resizes.

## [1.0.8] - 2026-06-04

### Added

- Added a third `html` mode that exposes rendered preview HTML as editable source and converts it back to Markdown when leaving the mode.
- Added a Bootstrap callout insertion modal with localized type, title, and text fields.
- Added localized `callouts.*` labels and titles plus callout modal text to all locale files.

### Changed

- Toolbar buttons, including generated custom action buttons, now receive Bootstrap `p-1` spacing.
- Dropdown shortcut hints are now rendered with a smaller, less dominant style.
- PHP opening/closing tags such as `<?php`, `<?=`, and `?>` are highlighted with Bootstrap danger styling.
- Package version bumped from `1.0.7` to `1.0.8`.

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
