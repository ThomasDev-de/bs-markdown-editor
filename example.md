# bs-markdown-editor action examples

This document demonstrates the built-in toolbar actions and preview features.

## Inline formatting

Use **bold text**, _italic text_, ~~strikethrough text~~, ==underlined text==, <sub>subscript</sub>, and <sup>superscript</sup>.

Use the clear formatting action on a selected inline fragment such as **_formatted text_**.

## Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Lists

- Unordered item
- Another unordered item
  - Nested unordered item

1. Ordered item
2. Another ordered item
   1. Nested ordered item

- [ ] Open task
- [x] Completed task

Use the toggle task action on the selected task lines above.

## Indent and outdent

- Parent item
  - Indented child item
    - Deeper child item

## Quote

> This is a regular blockquote.
> It can contain multiple lines.

## Callouts

> [!NOTE] Note
> Use notes for neutral information.

> [!TIP] Tip
> Use tips for practical suggestions.

> [!IMPORTANT] Important
> Use important callouts for high-priority information.

> [!WARNING] Warning
> Use warnings for risky situations.

> [!CAUTION] Caution
> Use cautions for destructive or irreversible actions.

## Links and images

[Project repository](https://github.com/webcito/bs-markdown-editor)

![Placeholder image](https://placehold.co/320x180){width=320 height=180 align=center}

## Code

Inline code: `const enabled = true;`

```javascript
function greet(name) {
    return `Hello, ${name}`;
}
```

```php
<?php

final class Example
{
    public function title(string $name): string
    {
        return "Hello {$name}";
    }
}
```

## Horizontal rule

---

## Table

| Feature | Action key | Status |
| --- | --- | --- |
| Bold | `bold` | Available |
| Preview | `preview` | Available |
| Toggle tasks | `toggleTask` | Available |

## Details

<details>
<summary>Read more</summary>

This section demonstrates the details action. It stays collapsible in the preview.

</details>

## Definition list

<dl>
<dt>Markdown</dt>
<dd>A lightweight markup language for structured text.</dd>
<dt>Preview</dt>
<dd>The rendered output shown by the editor.</dd>
</dl>

## Preview mode

Switch to preview mode to verify formatting, callouts, tables, code highlighting, images, and details blocks.
