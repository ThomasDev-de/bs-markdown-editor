# bs-markdown-editor

`bs-markdown-editor` is a lightweight jQuery Markdown editor plugin that integrates seamlessly with Bootstrap 5. It not only uses Bootstrap for its UI but also leverages Bootstrap utility classes for features like text alignment and responsive images within the Markdown content.

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

Or use a GitHub CDN (replace `VERSION` with a release tag):

```html

<script src="https://cdn.jsdelivr.net/gh/webcito/bs-markdown-editor@VERSION/dist/bs-markdown-editor.min.js"></script>
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
        modes: ['editor', 'preview'],
        resize: 'vertical',
        size: 'sm',
        btnClass: 'border-0',
        wrapperClass: null,
        actions: 'all',
        lang: 'en'
    });
</script>
```

For a complete Markdown sample covering all standard toolbar actions, see [example.md](example.md).

## Options

| Option          | Type                              | Default      | Details                                                                                                                                                                                                                            |
|-----------------|-----------------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `minHeight`     | `number`                          | `220`        | Minimum editor height in pixels. Applied to all surfaces and used as a lower bound for `height`.                                                                                                                                   |
| `height`        | `number \| null`                  | `500`        | Initial editor height in pixels. If `null`, the editor follows the content.                                                                                                                                                        |
| `preview`       | `boolean`                         | `true`       | Legacy preview availability flag. If `false`, `preview` is removed from the resolved `modes` list.                                                                                                                                 |
| `mode`          | `'editor' \| 'html' \| 'preview'` | `'editor'`   | Initial mode after initialization. Invalid values fall back to the first allowed `modes` entry.                                                                                                                                    |
| `modes`         | `string \| string[]`              | `['editor', 'preview']` | Allowed modes and dropdown order. Supported values are `editor`, `html`, and `preview`. A string may be a single mode or comma-separated list. If only one mode is allowed, no mode dropdown is rendered.                 |
| `resize`        | `boolean \| 'vertical' \| 'both'` | `false`      | Enables mouse-based resizing on the visible `contenteditable` surface. `true` maps to `'vertical'`.                                                                                                                                |
| `size`          | `'sm' \| 'lg' \| null`            | `null`       | Button group size variant. Maps to Bootstrap button-group size classes (`btn-group-sm`/`btn-group-lg`).                                                                                                                            |
| `btnClass`      | `string`                          | `'border-0'` | Bootstrap button style class used by toolbar buttons (example: `btn-outline-dark`, `btn-secondary`).                                                                                                                               |
| `wrapperClass`  | `string \| null`                  | `null`       | Additional class name(s) applied to the editor wrapper. The plugin always keeps its internal wrapper class `.bs-markdown-editor` and appends your classes on top.                                                                  |
| `actions`       | `'all' \| string[]`               | `'all'`      | Toolbar action filter. `'all'` renders all actions. Array mode renders only matching action keys and keeps array order. Unknown keys are ignored.                                                                                  |
| `customActions` | `object \| array`                 | `{}`         | Additional toolbar actions. `run(context)` receives the editor context, including `textarea`, `editable`, and `helpers`.                                                                                                           |
| `emojiPickerAutoLoad` | `boolean`                   | `false`      | Automatically loads the `bs-emoji-picker` script (via GitHub CDN as fallback) when the emoji action is rendered and the picker plugin is not already loaded. |
| `emojiPickerSrc` | `string \| string[] \| null`      | `null`       | Optional custom script URL(s) for `bs-emoji-picker`. When omitted, the editor tries the GitHub CDN automatically. |
| `shortcuts`     | `object`                          | `{...}`      | Keyboard shortcuts mapping action keys to shortcut strings (e.g., `'bold': 'ctrl+b'`). Supports `ctrl+` and `ctrl+shift+` modifiers.                                                                                               |
| `lang`          | `string`                          | `auto`       | Reserved for compatibility. Locale selection is now handled by preloaded locale files plus `translations` overrides.                                                                                                               |
| `translations`  | `object`                          | `{}`         | Deep-merged text overrides for labels, prompts, placeholders, callout labels/titles, modal text, and preview messages. Merge order: built-in English defaults -> `window.bsMarkdownEditorTranslations` (if loaded) -> this option. |

### Action Keys (`actions` option)

| Key               | Purpose                                                    |
|-------------------|------------------------------------------------------------|
| `bold`            | Wrap selection with `**...**`                              |
| `italic`          | Wrap selection with `_..._`                                |
| `textStyles`      | Dropdown: strikethrough / underline                        |
| `clearFormatting` | Remove inline Markdown formatting from the selection       |
| `heading`         | Dropdown: H1-H6                                            |
| `ul`              | Unordered list                                             |
| `ol`              | Ordered list                                               |
| `indent`          | Indent selected lines (sublists)                           |
| `outdent`         | Outdent selected lines                                     |
| `quote`           | Prefix lines with `>`                                      |
| `link`            | Insert markdown link                                       |
| `image`           | Open image modal and insert markdown image                 |
| `callout`         | Open the callout modal and insert a Markdown callout block |
| `details`         | Insert a collapsible details block                         |
| `definitionList`  | Insert an HTML definition list block                       |
| `code`            | Inline code                                                |
| `codeBlock`       | Fenced code block                                          |
| `hr`              | Horizontal rule (`---`)                                    |
| `taskList`        | Task list (`- [ ] ...`)                                    |
| `toggleTask`      | Toggle selected task list items                            |
| `table`           | Open table modal and insert markdown table                 |
| `emoji`           | Open emoji picker                                          |
| `undo`            | Undo via plugin history                                    |
| `redo`            | Redo via plugin history                                    |
| `alignment`       | Insert alignment HTML tags using Bootstrap utility classes (`text-start`, `text-center`, `text-end` or inline style for justify) |
| `preview`         | Legacy preview toggle action. Mode switching is rendered as a dropdown when `modes` allows more than one mode. |

### Shortcuts

The editor supports keyboard shortcuts for common actions. Default shortcuts are:

| Action          | Shortcut             |
|-----------------|----------------------|
| Bold            | `Ctrl + B`           |
| Italic          | `Ctrl + I`           |
| List            | `Ctrl + L`           |
| Num list        | `Ctrl + Shift + O`   |
| Quote           | `Ctrl + Q`           |
| Code            | `Ctrl + K`           |
| Link            | `Ctrl + Shift + L`   |
| Image           | `Ctrl + Shift + I`   |
| Undo            | `Ctrl + Z`           |
| Redo            | `Ctrl + Y`           |
| Preview         | `Ctrl + P`           |
| Horizontal rule | `Ctrl + H`           |
| Task list       | `Ctrl + Shift + T`   |
| Toggle task     | `Ctrl + Shift + M`   |
| Strikethrough   | `Ctrl + Shift + S`   |
| Underline       | `Ctrl + Alt + U`     |
| Callout         | `Ctrl + Shift + C`   |
| Details         | `Ctrl + Shift + D`   |
| Definition list | `Ctrl + Shift + U`   |
| Subscript       | `Ctrl + Shift + B`   |
| Superscript     | `Ctrl + Shift + P`   |
| Code block      | `Ctrl + Shift + K`   |
| Emoji           | `Ctrl + E`           |
| Heading 1-6     | `Ctrl + Shift + 1-6` |
| Align Left      | `Ctrl + Alt + L`     |
| Align Center    | `Ctrl + Alt + C`     |
| Align Right     | `Ctrl + Alt + R`     |
| Align Justify   | `Ctrl + Alt + J`     |

Shortcuts can be customized or disabled via the `shortcuts` option. On macOS, `Cmd` is used instead of `Ctrl`.

```js
$('#editor').bsMarkdownEditor({
    shortcuts: {
        'bold': 'ctrl+b',
        'italic': 'ctrl+i'
    }
});
```

### Custom Actions

`customActions` adds project-specific controls to the toolbar. It accepts either an object keyed by action name or an array of action
objects.

```js
$('#editor').bsMarkdownEditor({
    customActions: {
        spoiler: {
            title: 'Spoiler',
            icon: 'bi-eye-slash',
            run(context) {
                const selected = context.helpers.getSelection(context.textarea);
                const content = selected || 'spoiler text';
                context.helpers.replaceSelection(
                    context.textarea,
                    `>! ${content} !<`,
                    3,
                    3 + content.length,
                    'customAction'
                );
            }
        }
    }
});
```

Use `context.helpers.replaceSelection(...)` when a custom action should insert text at the cursor or replace selected text. Directly
appending to `textarea.value` always writes at the end and bypasses the current selection.

#### Custom Action Options

| Property      | Type       | Details                                                                                                                 |
|---------------|------------|-------------------------------------------------------------------------------------------------------------------------|
| `title`       | `string`   | Button title/tooltip. Also used as fallback button text when no icon is set.                                            |
| `icon`        | `string`   | Bootstrap Icons class, for example `bi-eye-slash`.                                                                      |
| `run`         | `function` | Called as `run(context)` for default button actions.                                                                    |
| `render`      | `function` | Called as `render(context)` when the action renders its own toolbar UI. Must return an element, jQuery object, or HTML. |
| `position`    | `string`   | Use `'right'` to append the action to the right toolbar group. Defaults to the left toolbar group.                      |
| `buttonClass` | `string`   | Optional Bootstrap class override for the generated `run` button.                                                       |
| `enabled`     | `boolean`  | Set to `false` to skip rendering the custom action.                                                                     |

#### Custom Action Context

| Property                                                             | Details                                                                                          |
|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| `key`                                                                | Custom action key.                                                                               |
| `textarea` / `editable`                                              | Underlying textarea and visible `contenteditable` editor elements.                               |
| `$editable`, `$wrapper`, `$toolbar`, `$toolbarLeft`, `$toolbarRight` | jQuery references for editor UI integration.                                                     |
| `helpers`                                                            | Editor helper API, including `getSelection`, `replaceSelection`, and `syncTextareaFromEditable`. |
| `settings`                                                           | Resolved editor settings.                                                                        |
| `buttonClassBase` / `toolbarButtonClass` / `navButtonClass` / `groupSizeClass` | Toolbar classes matching the current editor configuration. `toolbarButtonClass` and `navButtonClass` include the plugin's toolbar padding class for the Bootstrap `md` breakpoint only. |

For default `run(context)` buttons, the editor synchronizes the visible selection before calling `run`. If you render custom interactive UI
with `render(context)`, capture the editor selection before your UI steals focus.

#### Advanced: Emoji Picker

The editor uses the dependency `thomasdev-de/bs-emoji-picker` for the emoji toolbar action.
To use the emoji picker, you must manually include the script on your page:

```html
<script src="path/to/bs-emoji-picker.min.js"></script>
```

When the script is present, the emoji action is automatically added to the toolbar (if enabled in `actions`).
If the script is not loaded, the emoji button will not be rendered by default.

If you want the editor to attempt to load the script automatically when needed, set the `emojiPickerAutoLoad` option to `true`.
When enabled, it attempts to load the script from the following sources (in order):
1.  Any URLs provided via the `emojiPickerSrc` option.
2.  GitHub CDN: `https://cdn.jsdelivr.net/gh/ThomasDev-de/bs-emoji-picker@main/dist/bs-emoji-picker.min.js`

If you want to exclude the emoji action from the toolbar entirely, use the `actions` filter.

## Methods

| Method | Signature                               | Returns                           | Description                                                |
|--------|-----------------------------------------|-----------------------------------|------------------------------------------------------------|
| `mode` | `mode()`                                | `'editor' \| 'html' \| 'preview'` | Get current mode.                                          |
| `mode` | `mode('editor' \| 'html' \| 'preview')` | jQuery collection                 | Set mode for all matched editors.                          |
| `val`  | `val()`                                 | `string`                          | Get current textarea value.                                |
| `val`  | `val(string)`                           | jQuery collection                 | Set value for all matched editors. Triggers change events. |

Examples:

```js
const value = $('#editor').bsMarkdownEditor('val');
$('#editor').bsMarkdownEditor('val', '# Hello');
$('#editor').bsMarkdownEditor('mode', 'html');
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

| Method       | Signature          | Returns  | Description                                                                                                                                |
|--------------|--------------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `toHtml`     | `toHtml(markdown)` | `string` | Converts Markdown to the same HTML used by the built-in preview renderer.                                                                  |
| `toMarkdown` | `toMarkdown(html)` | `string` | Converts HTML back to Markdown for common editor output such as headings, lists, links, images, tables, blockquotes, code, and task lists. |

Example:

```js
const html = $.bsMarkdownEditor.toHtml('# Hello');
const markdown = $.bsMarkdownEditor.toMarkdown('<h1>Hello</h1>');
```

## Events

| Event                           | Fired When                                                                                  | Payload                          |
|---------------------------------|---------------------------------------------------------------------------------------------|----------------------------------|
| `ready.bs.markdown-editor`      | Plugin finished initialization                                                              | `{ mode, value, api }`           |
| `change.bs.markdown-editor`     | Any content change (user, toolbar, API, history, external sync)                             | `{ source, value }`              |
| `userChange.bs.markdown-editor` | User-initiated content change inside the editor (typing, paste, toolbar actions, undo/redo) | `{ source, value }`              |
| `modeChange.bs.markdown-editor` | Mode changed between editor/html/preview                                                    | `{ mode, previousMode, source }` |
| `scroll.bs.markdown-editor`     | Editor or HTML source was scrolled (throttled)                             | `{ scrollTop, scrollLeft, scrollHeight, clientHeight, mode }` |
| `any.bs.markdown-editor`        | Any plugin event above fired                                                                | `{ eventName, payload }`         |

## Notes

- The mode dropdown is rendered only when more than one mode is allowed via `modes`; otherwise the single allowed mode is shown directly.
- The toolbar includes bold, italic, text styles (`~~strikethrough~~`, `==underline==`), clear formatting, headings,
  unordered/ordered/task lists, task toggling, indent/outdent, quote, link, image, callout, details, definition list,
  inline code, code block, horizontal rule, table, undo/redo, and preview actions.
- The table action opens a Bootstrap modal where users can choose row/column count; the modal is removed from the DOM when closed.
- The image action opens a Bootstrap modal where users can enter URL, alt text, and optional width/height values.
- The callout action opens a Bootstrap modal where users can choose the callout type and enter a title and text.
- The HTML mode exposes the rendered preview HTML as editable source. When leaving HTML mode or reading `val()`, the edited HTML is
  converted back to Markdown with the built-in converter.
- Live preview synchronizes its scroll position with the editor when visible.
- Preview rendering is built in and does not require an external Markdown package.
- Preview supports inline image syntax (`![alt](url)`), task list checkboxes, nested lists (including sublists), fenced code blocks, and
  basic Markdown tables.
- Image syntax supports optional dimensions as a plugin extension: `![Alt text](image.jpg){width=320 height=180}` renders
  `width` and `height` attributes plus matching pixel styles on the generated `<img>` tag so values also apply with Bootstrap `.img-fluid`.
  Numeric values are treated as pixels; `auto` is also allowed, for example `{height=30 width=auto}`.
- Fenced code blocks with a language hint (for example `php`, `javascript`, `typescript`, `css`, `json`, `sql`, `bash`, or `python`) are
  rendered with
  `language-*` classes, a small language badge, and built-in Bootstrap-based syntax highlighting.
- PHP code highlighting marks PHP tags such as `<?php`, `<?=`, and `?>` with Bootstrap danger styling.
- The generated UI uses Bootstrap 5 theme-aware utility classes and is compatible with `data-bs-theme="dark"` without requiring separate
  dark-mode markup.

## Locales

By default, the plugin ships with English UI text.  
To use another language, load one of the files from `dist/locale/` before `bs-markdown-editor.js`.

```html

<script src="dist/locale/de-DE.min.js"></script>
<script src="dist/bs-markdown-editor.min.js"></script>
```

Locale files set `window.bsMarkdownEditorTranslations`, which is deep-merged into the built-in English defaults.
They include action labels, placeholders, modal text, and callout type labels/titles.

## Support this project

If this project helps you, feel free to support its development:

[☕ Buy me a coffee via PayPal](https://paypal.me/thomaskirsch1529)
