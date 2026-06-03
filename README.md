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

| Option         | Type                              | Default      | Details                                                                                                                                                                                                     |
|----------------|-----------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `minHeight`    | `number`                          | `220`        | Minimum editor height in pixels. Applied to the textarea and used as a lower bound for preview height.                                                                                                      |
| `preview`      | `boolean`                         | `true`       | Enables the preview toggle button in the toolbar. If `false`, preview mode is not available through the toolbar.                                                                                            |
| `mode`         | `'editor' \| 'preview'`           | `'editor'`   | Initial mode after initialization. Invalid values fall back to editor mode behavior.                                                                                                                        |
| `resize`       | `boolean \| 'vertical' \| 'both'` | `false`      | Enables mouse-based resizing on the visible `contenteditable` surface. `true` maps to `'vertical'`.                                                                                                         |
| `size`         | `'sm' \| 'lg' \| null`            | `null`       | Button group size variant. Maps to Bootstrap button-group size classes (`btn-group-sm`/`btn-group-lg`).                                                                                                     |
| `btnClass`     | `string`                          | `'border-0'` | Bootstrap button style class used by toolbar buttons (example: `btn-outline-dark`, `btn-secondary`).                                                                                                        |
| `wrapperClass` | `string \| null`                  | `null`       | Additional class name(s) applied to the editor wrapper. The plugin always keeps its internal wrapper class `.bs-markdown-editor` and appends your classes on top.                                           |
| `actions`      | `'all' \| string[]`               | `'all'`      | Toolbar action filter. `'all'` renders all actions. Array mode renders only matching action keys and keeps array order. Unknown keys are ignored.                                                           |
| `customActions` | `object \| array`                | `{}`         | Additional toolbar actions. `run(context)` receives the editor context, including `textarea`, `editable`, and `helpers`.                                                                                   |
| `shortcuts`     | `object`                          | `{...}`      | Keyboard shortcuts mapping action keys to shortcut strings (e.g., `'bold': 'ctrl+b'`). Supports `ctrl+` and `ctrl+shift+` modifiers.                                                                          |
| `lang`         | `string`                          | `auto`       | Reserved for compatibility. Locale selection is now handled by preloaded locale files plus `translations` overrides.                                                                                        |
| `translations` | `object`                          | `{}`         | Deep-merged text overrides for labels, prompts, placeholders, modal text, and preview messages. Merge order: built-in English defaults -> `window.bsMarkdownEditorTranslations` (if loaded) -> this option. |

### Action Keys (`actions` option)

| Key          | Purpose                                    |
|--------------|--------------------------------------------|
| `bold`       | Wrap selection with `**...**`              |
| `italic`     | Wrap selection with `_..._`                |
| `textStyles` | Dropdown: strikethrough / underline        |
| `clearFormatting` | Remove inline Markdown formatting from the selection |
| `heading`    | Dropdown: H1-H6                            |
| `ul`         | Unordered list                             |
| `ol`         | Ordered list                               |
| `indent`     | Indent selected lines (sublists)           |
| `outdent`    | Outdent selected lines                     |
| `quote`      | Prefix lines with `>`                      |
| `link`       | Insert markdown link                       |
| `image`      | Open image modal and insert markdown image |
| `callout`    | Insert a Markdown callout block            |
| `details`    | Insert a collapsible details block         |
| `definitionList` | Insert an HTML definition list block    |
| `code`       | Inline code                                |
| `codeBlock`  | Fenced code block                          |
| `hr`         | Horizontal rule (`---`)                    |
| `taskList`   | Task list (`- [ ] ...`)                    |
| `toggleTask` | Toggle selected task list items            |
| `table`      | Open table modal and insert markdown table |
| `undo`       | Undo via plugin history                    |
| `redo`       | Redo via plugin history                    |
| `preview`    | Toggle preview/editor mode                 |

### Shortcuts

The editor supports keyboard shortcuts for common actions. Default shortcuts are:

| Action    | Shortcut           |
|-----------|--------------------|
| Bold | `Ctrl + B` |
| Italic | `Ctrl + I` |
| List | `Ctrl + L` |
| Num list | `Ctrl + Shift + O` |
| Quote | `Ctrl + Q` |
| Code | `Ctrl + K` |
| Link | `Ctrl + Shift + L` |
| Image | `Ctrl + Shift + I` |
| Undo | `Ctrl + Z` |
| Redo | `Ctrl + Y` |
| Preview | `Ctrl + P` |
| Horizontal rule | `Ctrl + H` |
| Task list | `Ctrl + Shift + T` |
| Toggle task | `Ctrl + Shift + M` |
| Strikethrough | `Ctrl + Shift + S` |
| Underline | `Ctrl + Alt + U` |
| Callout | `Ctrl + Shift + C` |
| Details | `Ctrl + Shift + D` |
| Definition list | `Ctrl + Shift + U` |
| Subscript | `Ctrl + Shift + B` |
| Superscript | `Ctrl + Shift + P` |
| Code block | `Ctrl + Shift + K` |
| Heading 1-6 | `Ctrl + Shift + 1-6` |

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

`customActions` adds project-specific controls to the toolbar. It accepts either an object keyed by action name or an array of action objects.

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

Use `context.helpers.replaceSelection(...)` when a custom action should insert text at the cursor or replace selected text. Directly appending to `textarea.value` always writes at the end and bypasses the current selection.

#### Custom Action Options

| Property      | Type       | Details                                                                 |
|---------------|------------|-------------------------------------------------------------------------|
| `title`       | `string`   | Button title/tooltip. Also used as fallback button text when no icon is set. |
| `icon`        | `string`   | Bootstrap Icons class, for example `bi-eye-slash`.                      |
| `run`         | `function` | Called as `run(context)` for default button actions.                    |
| `render`      | `function` | Called as `render(context)` when the action renders its own toolbar UI. Must return an element, jQuery object, or HTML. |
| `position`    | `string`   | Use `'right'` to append the action to the right toolbar group. Defaults to the left toolbar group. |
| `buttonClass` | `string`   | Optional Bootstrap class override for the generated `run` button.       |
| `enabled`     | `boolean`  | Set to `false` to skip rendering the custom action.                     |

#### Custom Action Context

| Property | Details |
|----------|---------|
| `key` | Custom action key. |
| `textarea` / `editable` | Underlying textarea and visible `contenteditable` editor elements. |
| `$editable`, `$wrapper`, `$toolbar`, `$toolbarLeft`, `$toolbarRight` | jQuery references for editor UI integration. |
| `helpers` | Editor helper API, including `getSelection`, `replaceSelection`, and `syncTextareaFromEditable`. |
| `settings` | Resolved editor settings. |
| `buttonClassBase` / `groupSizeClass` | Toolbar classes matching the current editor configuration. |

For default `run(context)` buttons, the editor synchronizes the visible selection before calling `run`. If you render custom interactive UI with `render(context)`, capture the editor selection before your UI steals focus.

#### Advanced: Emoji Picker

The example below renders `bs-emoji-picker` as a toolbar custom action. The picker itself is initialized without `targetInput`, so the Markdown editor keeps control over selection, history, preview refreshes, and events.

```js
// Load bs-emoji-picker after jQuery and Bootstrap.
// <script src="https://cdn.jsdelivr.net/gh/ThomasDev-de/bs-emoji-picker@main/dist/bs-emoji-picker.min.js"></script>

$('#editor').bsMarkdownEditor({
    customActions: {
        emoji: {
            position: 'right',
            render(context) {
                const $picker = $('<div class="btn-group"></div>');
                let lastSelection = {
                    start: context.textarea.selectionStart || 0,
                    end: context.textarea.selectionEnd || 0
                };

                function captureEditorSelection() {
                    const selection = window.getSelection();
                    if (!selection || selection.rangeCount === 0) {
                        return;
                    }
                    const range = selection.getRangeAt(0);
                    if (!context.editable.contains(range.startContainer) || !context.editable.contains(range.endContainer)) {
                        return;
                    }
                    const offsets = context.helpers.getEditableSelectionOffsets(context.editable);
                    lastSelection = {
                        start: offsets.start,
                        end: offsets.end
                    };
                    context.textarea.setSelectionRange(lastSelection.start, lastSelection.end);
                }

                function rememberSelection() {
                    captureEditorSelection();
                    $picker.data('bsMarkdownEditorEmojiSelection', lastSelection);
                }

                context.$editable.on('keyup.bsMarkdownEditorEmoji mouseup.bsMarkdownEditorEmoji touchend.bsMarkdownEditorEmoji input.bsMarkdownEditorEmoji', captureEditorSelection);
                $(document).on('selectionchange.bsMarkdownEditorEmoji', captureEditorSelection);
                captureEditorSelection();

                $picker.bsEmojiPicker({
                    btnClass: context.buttonClassBase,
                    btnText: '<i class="bi bi-emoji-smile"></i>',
                    targetInput: null,
                    onClickEmoji(emoji) {
                        const selection = $picker.data('bsMarkdownEditorEmojiSelection') || lastSelection || {
                            start: context.textarea.selectionStart,
                            end: context.textarea.selectionEnd
                        };
                        context.textarea.setSelectionRange(selection.start, selection.end);
                        context.helpers.replaceSelection(
                            context.textarea,
                            emoji,
                            emoji.length,
                            emoji.length,
                            'customAction'
                        );
                    }
                });

                $picker.on('mousedown', '[data-bs-toggle="dropdown"]', rememberSelection);
                $picker.on('show.bs.dropdown', '.dropdown-emoji', rememberSelection);

                return $picker;
            }
        }
    }
});
```

## Methods

| Method | Signature                     | Returns                 | Description                                                |
|--------|-------------------------------|-------------------------|------------------------------------------------------------|
| `mode` | `mode()`                      | `'editor' \| 'preview'` | Get current mode.                                          |
| `mode` | `mode('editor' \| 'preview')` | jQuery collection       | Set mode for all matched editors.                          |
| `val`  | `val()`                       | `string`                | Get current textarea value.                                |
| `val`  | `val(string)`                 | jQuery collection       | Set value for all matched editors. Triggers change events. |

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
| `modeChange.bs.markdown-editor` | Mode changed between editor/preview                                                         | `{ mode, previousMode, source }` |
| `any.bs.markdown-editor`        | Any plugin event above fired                                                                | `{ eventName, payload }`         |

## Notes

- The toolbar includes bold, italic, text styles (`~~strikethrough~~`, `==underline==`), clear formatting, headings,
  unordered/ordered/task lists, task toggling, indent/outdent, quote, link, image, callout, details, definition list,
  inline code, code block, horizontal rule, table, undo/redo, and preview actions.
- The table action opens a Bootstrap modal where users can choose row/column count; the modal is removed from the DOM when closed.
- The image action opens a Bootstrap modal where users can enter URL, alt text, and optional width/height values.
- Preview rendering is built in and does not require an external Markdown package.
- Preview supports inline image syntax (`![alt](url)`), task list checkboxes, nested lists (including sublists), fenced code blocks, and
  basic Markdown tables.
- Image syntax supports optional dimensions as a plugin extension: `![Alt text](image.jpg){width=320 height=180}` renders
  `width` and `height` attributes plus matching pixel styles on the generated `<img>` tag so values also apply with Bootstrap `.img-fluid`.
  Numeric values are treated as pixels; `auto` is also allowed, for example `{height=30 width=auto}`.
- Fenced code blocks with a language hint (for example `php`, `javascript`, `typescript`, `css`, `json`, `sql`, `bash`, or `python`) are
  rendered with
  `language-*` classes, a small language badge, and built-in Bootstrap-based syntax highlighting.
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

## Support this project

If this project helps you, feel free to support its development:

[☕ Buy me a coffee via PayPal](https://paypal.me/thomaskirsch1529)
