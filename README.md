# bs-markdown-editor

`bs-markdown-editor` is a lightweight jQuery Markdown editor plugin styled with Bootstrap 5 and Bootstrap Icons.

## Requirements

- jQuery 3+
- Bootstrap 5 (CSS + JS bundle)
- Bootstrap Icons

## Installation

With Composer:

```bash
composer require webcito/bs-markdown-editor
```

Or include the files manually from `dist/`.

Or use a GitHub CDN (replace `x.y.z` with a release tag):

```html
<script src="https://cdn.jsdelivr.net/gh/webcito/bs-markdown-editor@x.y.z/dist/bs-markdown-editor.min.js"></script>
```

## Usage

```html
<link rel="stylesheet" href="vendor/twbs/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="vendor/twbs/bootstrap-icons/font/bootstrap-icons.min.css">

<textarea id="editor" class="form-control"></textarea>

<script src="vendor/components/jquery/jquery.min.js"></script>
<script src="vendor/twbs/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
<script src="dist/bs-markdown-editor.min.js"></script>
<script>
  $('#editor').bsMarkdownEditor({
    minHeight: 240,
    preview: true,
    mode: 'editor',
    resize: 'vertical',
    size: 'sm',
    btnClass: 'border-0',
    wrapperClass: null,
    actions: 'all',
    lang: 'en'
  });
</script>
```

## Options

| Option | Type | Default                        | Details |
|---|---|--------------------------------|---|
| `minHeight` | `number` | `220`                          | Minimum editor height in pixels. Applied to the textarea and used as a lower bound for preview height. |
| `preview` | `boolean` | `true`                         | Enables the preview toggle button in the toolbar. If `false`, preview mode is not available through the toolbar. |
| `mode` | `'editor' \| 'preview'` | `'editor'`                     | Initial mode after initialization. Invalid values fall back to editor mode behavior. |
| `resize` | `boolean \| 'vertical' \| 'both'` | `false`                        | Enables mouse-based resizing on the visible `contenteditable` surface. `true` maps to `'vertical'`. |
| `size` | `'sm' \| 'lg' \| null` | `null`                         | Button group size variant. Maps to Bootstrap button-group size classes (`btn-group-sm`/`btn-group-lg`). |
| `btnClass` | `string` | `'border-0'`                   | Bootstrap button style class used by toolbar buttons (example: `btn-outline-dark`, `btn-secondary`). |
| `wrapperClass` | `string \| null` | `null`                         | Additional class name(s) applied to the editor wrapper (`.bs-parsedown-wrapper`). Use this for spacing, borders, themes, or per-instance styling hooks. |
| `actions` | `'all' \| string[]` | `'all'`                        | Toolbar action filter. `'all'` renders all actions. Array mode renders only matching action keys and keeps array order. Unknown keys are ignored. |
| `lang` | `string` | `auto` (`<html lang>` -> `de`) | Built-in UI language key. Currently bundled: `de`, `en`. Locale values like `en-US` resolve to `en`. |
| `translations` | `object` | `{}`                           | Deep-merged text overrides for labels, prompts, placeholders, modal text, and preview messages. Useful for custom wording or additional locales without extra setup. |

### Action Keys (`actions` option)

| Key | Purpose |
|---|---|
| `bold` | Wrap selection with `**...**` |
| `italic` | Wrap selection with `_..._` |
| `textStyles` | Dropdown: strikethrough / underline |
| `heading` | Dropdown: H1-H6 |
| `ul` | Unordered list |
| `ol` | Ordered list |
| `indent` | Indent selected lines (sublists) |
| `outdent` | Outdent selected lines |
| `quote` | Prefix lines with `>` |
| `link` | Insert markdown link |
| `image` | Insert markdown image |
| `code` | Inline code |
| `codeBlock` | Fenced code block |
| `hr` | Horizontal rule (`---`) |
| `taskList` | Task list (`- [ ] ...`) |
| `table` | Open table modal and insert markdown table |
| `undo` | Undo via plugin history |
| `redo` | Redo via plugin history |
| `preview` | Toggle preview/editor mode |

## Methods

| Method | Signature | Returns | Description |
|---|---|---|---|
| `mode` | `mode()` | `'editor' \| 'preview'` | Get current mode. |
| `mode` | `mode('editor' \| 'preview')` | jQuery collection | Set mode for all matched editors. |
| `val` | `val()` | `string` | Get current textarea value. |
| `val` | `val(string)` | jQuery collection | Set value for all matched editors. Triggers change events. |

Examples:

```js
const value = $('#editor').bsMarkdownEditor('val');
$('#editor').bsMarkdownEditor('val', '# Hello');
$('#editor').bsMarkdownEditor('mode', 'preview');
```

Direct updates on the underlying textarea are mirrored into the visible editor as well:

```js
$('#editor').val('# Hello from jQuery');
document.getElementById('editor').value = '# Hello from DOM';
document.getElementById('editor').setRangeText('updated');
document.querySelector('form').reset();
```

## Static Methods

These helpers are available directly on `$.bsMarkdownEditor` and are not bound to a specific editor instance.

| Method | Signature | Returns | Description |
|---|---|---|---|
| `toHtml` | `toHtml(markdown)` | `string` | Converts Markdown to the same HTML used by the built-in preview renderer. |
| `toMarkdown` | `toMarkdown(html)` | `string` | Converts HTML back to Markdown for common editor output such as headings, lists, links, tables, blockquotes, code, and task lists. |

Example:

```js
const html = $.bsMarkdownEditor.toHtml('# Hello');
const markdown = $.bsMarkdownEditor.toMarkdown('<h1>Hello</h1>');
```

## Events

| Event | Fired When | Payload |
|---|---|---|
| `ready.bs.markdown-editor` | Plugin finished initialization | `{ mode, value, api }` |
| `change.bs.markdown-editor` | Any content change (user, toolbar, API, history, external sync) | `{ source, value }` |
| `userChange.bs.markdown-editor` | User-initiated content change inside the editor (typing, paste, toolbar actions, undo/redo) | `{ source, value }` |
| `modeChange.bs.markdown-editor` | Mode changed between editor/preview | `{ mode, previousMode, source }` |
| `any.bs.markdown-editor` | Any plugin event above fired | `{ eventName, payload }` |

## Notes

- The toolbar includes bold, italic, text styles (`~~strikethrough~~`, `==underline==`), headings, unordered/ordered/task lists, indent/outdent, quote, link, image, inline code, code block, horizontal rule, table, undo/redo, and preview actions.
- The table action opens a Bootstrap modal where users can choose row/column count; the modal is removed from the DOM when closed.
- Preview rendering is built in and does not require an external Markdown package.
- Preview supports inline image syntax (`![alt](url)`), task list checkboxes, nested lists (including sublists), fenced code blocks, and basic Markdown tables.
- The generated UI uses Bootstrap 5 theme-aware utility classes and is compatible with `data-bs-theme="dark"` without requiring separate dark-mode markup.

## Support this project

If this project helps you, feel free to support its development:

[☕ Buy me a coffee via PayPal](https://paypal.me/thomaskirsch1529)