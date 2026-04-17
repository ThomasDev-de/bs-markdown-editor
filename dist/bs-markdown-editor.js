(function ($) {
    const sharedConverters = {
        escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },
        sanitizeUrl(url) {
            const trimmed = String(url || '').trim();

            if (trimmed === '') {
                return '';
            }

            if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) {
                return trimmed;
            }

            return '#';
        },
        renderInline(text) {
            const codeStore = [];
            let content = sharedConverters.escapeHtml(text);

            content = content.replace(/`([^`]+)`/g, function (_, code) {
                const token = `@@CODE_${codeStore.length}@@`;
                codeStore.push(`<code>${sharedConverters.escapeHtml(code)}</code>`);
                return token;
            });

            content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, url) {
                const safeSrc = sharedConverters.escapeHtml(sharedConverters.sanitizeUrl(url));
                const safeAlt = sharedConverters.escapeHtml(alt || '');
                return `<img src="${safeSrc}" alt="${safeAlt}" class="img-fluid">`;
            });

            content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
                const safeHref = sharedConverters.escapeHtml(sharedConverters.sanitizeUrl(url));
                return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`;
            });

            content = content.replace(/&lt;sub&gt;([\s\S]*?)&lt;\/sub&gt;/gi, '<sub>$1</sub>');
            content = content.replace(/&lt;sup&gt;([\s\S]*?)&lt;\/sup&gt;/gi, '<sup>$1</sup>');
            content = content.replace(/~~([^~]+)~~/g, '<del>$1</del>');
            content = content.replace(/==([^=]+)==/g, '<u>$1</u>');
            content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            content = content.replace(/(^|[\s(])_([^_]+)_(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');
            content = content.replace(/(^|[\s(])\*([^*]+)\*(?=$|[\s).,!?:;])/g, '$1<em>$2</em>');

            codeStore.forEach(function (codeHtml, index) {
                content = content.replace(`@@CODE_${index}@@`, codeHtml);
            });

            return content;
        },
        renderMarkdown(markdown) {
            const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
            const html = [];
            let i = 0;

            function renderParagraph(rawLines) {
                const joined = rawLines.join('\n').trim();
                if (joined === '') {
                    return '';
                }
                return `<p>${sharedConverters.renderInline(joined).replace(/\n/g, '<br>')}</p>`;
            }

            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();

                if (trimmed === '') {
                    i += 1;
                    continue;
                }

                if (/^```/.test(trimmed)) {
                    const fenceLines = [];
                    i += 1;
                    while (i < lines.length && !/^```/.test(lines[i].trim())) {
                        fenceLines.push(lines[i]);
                        i += 1;
                    }
                    if (i < lines.length) {
                        i += 1;
                    }
                    html.push(`<pre><code>${sharedConverters.escapeHtml(fenceLines.join('\n'))}</code></pre>`);
                    continue;
                }

                const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*$/);
                if (headingMatch) {
                    const level = headingMatch[1].length;
                    html.push(`<h${level}>${sharedConverters.renderInline(headingMatch[2])}</h${level}>`);
                    i += 1;
                    continue;
                }

                if (/^\s{0,3}([-*_])\s*(\1\s*){2,}$/.test(line)) {
                    html.push('<hr>');
                    i += 1;
                    continue;
                }

                if (/^\s*>\s?/.test(line)) {
                    const quoteLines = [];
                    while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
                        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
                        i += 1;
                    }
                    html.push(`<blockquote>${sharedConverters.renderMarkdown(quoteLines.join('\n'))}</blockquote>`);
                    continue;
                }

                if (sharedConverters.isTableHeaderLine(line) && i + 1 < lines.length && sharedConverters.isTableSeparatorLine(lines[i + 1])) {
                    const alignments = sharedConverters.parseTableAlignments(lines[i + 1]);
                    const headerCells = sharedConverters.parseTableRow(line);
                    const bodyRows = [];
                    i += 2;

                    while (i < lines.length && sharedConverters.isTableDataLine(lines[i])) {
                        bodyRows.push(sharedConverters.parseTableRow(lines[i]));
                        i += 1;
                    }

                    const thead = '<thead><tr>' + headerCells.map(function (cell, index) {
                        const align = alignments[index] ? ` style="text-align:${alignments[index]}"` : '';
                        return `<th${align}>${sharedConverters.renderInline(cell)}</th>`;
                    }).join('') + '</tr></thead>';

                    const tbody = bodyRows.length === 0
                        ? '<tbody></tbody>'
                        : '<tbody>' + bodyRows.map(function (row) {
                            return '<tr>' + row.map(function (cell, index) {
                                const align = alignments[index] ? ` style="text-align:${alignments[index]}"` : '';
                                return `<td${align}>${sharedConverters.renderInline(cell)}</td>`;
                            }).join('') + '</tr>';
                        }).join('') + '</tbody>';

                    html.push(`<table class="table table-sm">${thead}${tbody}</table>`);
                    continue;
                }

                if (sharedConverters.isListLine(line)) {
                    const listLines = [];
                    while (i < lines.length && sharedConverters.isListLine(lines[i])) {
                        listLines.push(lines[i]);
                        i += 1;
                    }
                    html.push(sharedConverters.renderListBlock(listLines));
                    continue;
                }

                const paragraphLines = [];
                while (i < lines.length) {
                    const current = lines[i];
                    if (
                        current.trim() === '' ||
                        /^```/.test(current.trim()) ||
                        /^\s{0,3}(#{1,6})\s+/.test(current) ||
                        /^\s*>\s?/.test(current) ||
                        sharedConverters.isListLine(current) ||
                        /^\s{0,3}([-*_])\s*(\1\s*){2,}$/.test(current) ||
                        (
                            sharedConverters.isTableHeaderLine(current) &&
                            i + 1 < lines.length &&
                            sharedConverters.isTableSeparatorLine(lines[i + 1])
                        )
                    ) {
                        break;
                    }
                    paragraphLines.push(current);
                    i += 1;
                }
                html.push(renderParagraph(paragraphLines));
            }

            return html.join('\n');
        },
        escapeMarkdownText(text) {
            return String(text || '')
                .replace(/\r\n?/g, '\n')
                .replace(/[ \t]+\n/g, '\n')
                .replace(/\\/g, '\\\\')
                .replace(/([*_`\[\]])/g, '\\$1');
        },
        normalizeMarkdown(markdown) {
            return String(markdown || '')
                .replace(/\r\n?/g, '\n')
                .replace(/[ \t]+\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        },
        renderInlineNodes(nodes) {
            return Array.from(nodes || []).map(function (node) {
                return sharedConverters.renderInlineNode(node);
            }).join('').replace(/[ \t]+\n/g, '\n');
        },
        renderInlineNode(node) {
            if (!node) {
                return '';
            }

            if (node.nodeType === 3) {
                return sharedConverters.escapeMarkdownText(node.nodeValue).replace(/\s+/g, ' ');
            }

            if (node.nodeType !== 1) {
                return '';
            }

            const tagName = node.tagName.toLowerCase();

            if (tagName === 'br') {
                return '\n';
            }
            if (tagName === 'code') {
                return '`' + node.textContent.replace(/\n+/g, ' ').trim() + '`';
            }
            if (tagName === 'strong' || tagName === 'b') {
                return `**${sharedConverters.renderInlineNodes(node.childNodes).trim()}**`;
            }
            if (tagName === 'em' || tagName === 'i') {
                return `_${sharedConverters.renderInlineNodes(node.childNodes).trim()}_`;
            }
            if (tagName === 'del' || tagName === 's') {
                return `~~${sharedConverters.renderInlineNodes(node.childNodes).trim()}~~`;
            }
            if (tagName === 'u') {
                return `==${sharedConverters.renderInlineNodes(node.childNodes).trim()}==`;
            }
            if (tagName === 'sub' || tagName === 'sup') {
                return `<${tagName}>${sharedConverters.renderInlineNodes(node.childNodes).trim()}</${tagName}>`;
            }
            if (tagName === 'a') {
                const label = sharedConverters.renderInlineNodes(node.childNodes).trim() || (node.textContent || '').trim();
                return `[${label}](${node.getAttribute('href') || ''})`;
            }
            if (tagName === 'img') {
                return `![${sharedConverters.escapeMarkdownText(node.getAttribute('alt') || '')}](${node.getAttribute('src') || ''})`;
            }
            if (tagName === 'input') {
                return '';
            }

            return sharedConverters.renderInlineNodes(node.childNodes);
        },
        renderBlockNodes(nodes, depth) {
            return Array.from(nodes || []).map(function (node) {
                return sharedConverters.renderBlockNode(node, depth || 0);
            }).join('');
        },
        renderBlockNode(node, depth) {
            if (!node) {
                return '';
            }

            if (node.nodeType === 3) {
                const text = node.nodeValue.replace(/\s+/g, ' ').trim();
                return text === '' ? '' : `${sharedConverters.escapeMarkdownText(text)}\n\n`;
            }

            if (node.nodeType !== 1) {
                return '';
            }

            const tagName = node.tagName.toLowerCase();

            if (/^h[1-6]$/.test(tagName)) {
                return `${'#'.repeat(parseInt(tagName.slice(1), 10))} ${sharedConverters.renderInlineNodes(node.childNodes).trim()}\n\n`;
            }
            if (tagName === 'p') {
                return `${sharedConverters.renderInlineNodes(node.childNodes).trim()}\n\n`;
            }
            if (tagName === 'blockquote') {
                const inner = sharedConverters.normalizeMarkdown(sharedConverters.renderBlockNodes(node.childNodes, depth));
                if (inner === '') {
                    return '';
                }
                return inner.split('\n').map(function (line) {
                    return line === '' ? '>' : `> ${line}`;
                }).join('\n') + '\n\n';
            }
            if (tagName === 'pre') {
                const codeNode = node.querySelector('code');
                const code = codeNode ? codeNode.textContent : node.textContent;
                return `\`\`\`\n${String(code || '').replace(/\r\n?/g, '\n').replace(/\n$/, '')}\n\`\`\`\n\n`;
            }
            if (tagName === 'hr') {
                return '---\n\n';
            }
            if (tagName === 'ul' || tagName === 'ol') {
                return `${sharedConverters.renderListElement(node, depth)}\n`;
            }
            if (tagName === 'table') {
                const tableMarkdown = sharedConverters.renderTableElement(node);
                return tableMarkdown === '' ? '' : `${tableMarkdown}\n\n`;
            }
            if (tagName === 'div' || tagName === 'section' || tagName === 'article') {
                return sharedConverters.renderBlockNodes(node.childNodes, depth);
            }

            return `${sharedConverters.renderInlineNodes(node.childNodes).trim()}\n\n`;
        },
        getDirectCheckbox(item) {
            const directChildren = Array.from(item.children || []);

            for (let index = 0; index < directChildren.length; index += 1) {
                const child = directChildren[index];
                const tagName = child.tagName.toLowerCase();

                if (tagName === 'input' && child.type === 'checkbox') {
                    return child;
                }

                if (tagName === 'label') {
                    const labelChildren = Array.from(child.children || []);
                    for (let labelIndex = 0; labelIndex < labelChildren.length; labelIndex += 1) {
                        const labelChild = labelChildren[labelIndex];
                        if (labelChild.tagName && labelChild.tagName.toLowerCase() === 'input' && labelChild.type === 'checkbox') {
                            return labelChild;
                        }
                    }
                }
            }

            return null;
        },
        renderListElement(listNode, depth) {
            const isOrdered = listNode.tagName.toLowerCase() === 'ol';
            const indent = '  '.repeat(depth || 0);
            const items = Array.from(listNode.children).filter(function (child) {
                return child.tagName && child.tagName.toLowerCase() === 'li';
            });

            return items.map(function (item, index) {
                const childNodes = Array.from(item.childNodes);
                const nestedLists = childNodes.filter(function (child) {
                    return child.nodeType === 1 && /^(ul|ol)$/i.test(child.tagName);
                });
                const contentNodes = childNodes.filter(function (child) {
                    return !(child.nodeType === 1 && /^(ul|ol)$/i.test(child.tagName));
                });
                const checkbox = sharedConverters.getDirectCheckbox(item);
                const marker = checkbox ? `- [${checkbox.checked ? 'x' : ' '}]` : (isOrdered ? `${index + 1}.` : '-');
                const content = sharedConverters.renderInlineNodes(contentNodes).replace(/\n+/g, ' ').trim();
                let line = `${indent}${marker}`;

                if (content !== '') {
                    line += ` ${content}`;
                }

                if (nestedLists.length === 0) {
                    return line;
                }

                const nested = nestedLists.map(function (nestedList) {
                    return sharedConverters.renderListElement(nestedList, (depth || 0) + 1);
                }).join('\n');

                return `${line}\n${nested}`;
            }).join('\n');
        },
        renderTableElement(tableNode) {
            const rows = [];
            const alignments = [];

            if (tableNode.tHead && tableNode.tHead.rows.length > 0) {
                rows.push(Array.from(tableNode.tHead.rows[0].cells));
            }

            Array.from(tableNode.tBodies || []).forEach(function (tbody) {
                Array.from(tbody.rows).forEach(function (row) {
                    rows.push(Array.from(row.cells));
                });
            });

            if (rows.length === 0) {
                Array.from(tableNode.rows || []).forEach(function (row) {
                    rows.push(Array.from(row.cells));
                });
            }

            if (rows.length === 0) {
                return '';
            }

            const markdownRows = rows.map(function (row) {
                return row.map(function (cell, index) {
                    const styleAlign = (cell.style && cell.style.textAlign ? cell.style.textAlign : '').trim().toLowerCase();
                    if (!alignments[index] && styleAlign !== '') {
                        alignments[index] = styleAlign;
                    }
                    return sharedConverters.renderInlineNodes(cell.childNodes).replace(/\n+/g, ' ').trim();
                });
            });
            const columnCount = markdownRows.reduce(function (max, row) {
                return Math.max(max, row.length);
            }, 0);

            markdownRows.forEach(function (row) {
                while (row.length < columnCount) {
                    row.push('');
                }
            });

            while (alignments.length < columnCount) {
                alignments.push('');
            }

            const header = markdownRows.shift() || [];
            const separator = alignments.map(function (alignment) {
                if (alignment === 'center') {
                    return ':---:';
                }
                if (alignment === 'right') {
                    return '---:';
                }
                if (alignment === 'left') {
                    return ':---';
                }
                return '---';
            });
            const lines = [`| ${header.join(' | ')} |`, `| ${separator.join(' | ')} |`];

            markdownRows.forEach(function (row) {
                lines.push(`| ${row.join(' | ')} |`);
            });

            return lines.join('\n');
        },
        htmlToMarkdown(html) {
            const source = String(html == null ? '' : html);

            if (source.trim() === '') {
                return '';
            }

            const parser = new window.DOMParser();
            const doc = parser.parseFromString(`<div>${source}</div>`, 'text/html');
            const root = doc.body.firstElementChild;

            return sharedConverters.normalizeMarkdown(sharedConverters.renderBlockNodes(root.childNodes, 0));
        },
        parseTableRow(line) {
            const normalized = String(line || '').trim().replace(/^\|/, '').replace(/\|$/, '');
            return normalized.split('|').map(function (cell) {
                return cell.trim();
            });
        },
        isTableHeaderLine(line) {
            const cells = sharedConverters.parseTableRow(line);
            return cells.length > 0 && cells.some(function (cell) {
                return cell !== '';
            });
        },
        isTableSeparatorLine(line) {
            return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(String(line || ''));
        },
        isTableDataLine(line) {
            if (String(line || '').trim() === '') {
                return false;
            }

            return String(line).indexOf('|') !== -1;
        },
        parseTableAlignments(line) {
            return sharedConverters.parseTableRow(line).map(function (cell) {
                const trimmed = cell.trim();

                if (/^:-+:$/.test(trimmed)) {
                    return 'center';
                }
                if (/^:-+$/.test(trimmed)) {
                    return 'left';
                }
                if (/^-+:$/.test(trimmed)) {
                    return 'right';
                }

                return '';
            });
        },
        getListItemData(line) {
            const match = String(line).match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
            if (!match) {
                return null;
            }

            const indent = match[1].replace(/\t/g, '    ').length;
            const marker = match[2];

            return {
                indent: indent,
                type: /^\d+\.$/.test(marker) ? 'ol' : 'ul',
                content: match[3]
            };
        },
        isListLine(line) {
            return sharedConverters.getListItemData(line) !== null;
        },
        renderListBlock(lines) {
            const items = lines
                .map(function (line) {
                    return sharedConverters.getListItemData(line);
                })
                .filter(function (item) {
                    return item !== null;
                });

            if (items.length === 0) {
                return '';
            }

            const root = {children: []};
            const stack = [{indent: -1, node: root}];

            items.forEach(function (item) {
                while (stack.length > 1 && item.indent <= stack[stack.length - 1].indent) {
                    stack.pop();
                }

                const node = {
                    type: item.type,
                    content: item.content,
                    children: []
                };
                stack[stack.length - 1].node.children.push(node);
                stack.push({indent: item.indent, node: node});
            });

            return sharedConverters.renderListNodes(root.children);
        },
        renderListItem(item) {
            const taskMatch = String(item).match(/^\[( |x|X)\]\s+(.+)$/);

            if (!taskMatch) {
                return sharedConverters.renderInline(item);
            }

            const checked = taskMatch[1].toLowerCase() === 'x' ? ' checked' : '';
            return `<label class="form-check-label d-flex align-items-center gap-2"><input class="form-check-input mt-0" type="checkbox" disabled${checked}>${sharedConverters.renderInline(taskMatch[2])}</label>`;
        },
        isTaskListItem(item) {
            return /^\[( |x|X)\]\s+.+$/.test(String(item));
        },
        renderListNodes(nodes) {
            let index = 0;
            let html = '';

            while (index < nodes.length) {
                const groupType = nodes[index].type;
                const groupNodes = [];

                while (index < nodes.length && nodes[index].type === groupType) {
                    groupNodes.push(nodes[index]);
                    index += 1;
                }

                const isTaskList = groupType === 'ul' && groupNodes.length > 0 && groupNodes.every(function (node) {
                    return sharedConverters.isTaskListItem(node.content);
                });
                const listClass = isTaskList ? ' class="list-unstyled ps-0"' : '';
                html += `<${groupType}${listClass}>` + groupNodes.map(function (node) {
                    const nested = node.children.length > 0 ? sharedConverters.renderListNodes(node.children) : '';
                    return `<li>${sharedConverters.renderListItem(node.content)}${nested}</li>`;
                }).join('') + `</${groupType}>`;
            }

            return html;
        }
    };

    $.bsMarkdownEditor = $.extend({}, $.bsMarkdownEditor, {
        toHtml(markdown) {
            return sharedConverters.renderMarkdown(markdown);
        },
        toMarkdown(html) {
            return sharedConverters.htmlToMarkdown(html);
        }
    });

    $.fn.bsMarkdownEditor = function (options) {
        const methodArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options === 'string') {
            const methodName = options;
            const $first = this.first();
            const firstApi = $first.data('bsMarkdownEditorApi');

            if (methodName === 'val') {
                if (methodArgs.length === 0) {
                    return firstApi ? firstApi.val() : undefined;
                }
                return this.each(function () {
                    const api = $(this).data('bsMarkdownEditorApi');
                    if (api) {
                        api.val(methodArgs[0]);
                    }
                });
            }

            if (methodName === 'mode') {
                if (methodArgs.length === 0) {
                    return firstApi ? firstApi.mode() : undefined;
                }
                return this.each(function () {
                    const api = $(this).data('bsMarkdownEditorApi');
                    if (api) {
                        api.mode(methodArgs[0]);
                    }
                });
            }

            return this;
        }

        const settings = $.extend(true, {
            minHeight: 220,
            preview: true,
            mode: 'editor',
            showStats: false,
            size: null,
            btnClass: 'btn-outline-secondary',
            wrapperClass: null,
            actions: 'all',
            lang: null,
            translations: {}
        }, options);

        const defaultTranslations = {
            de: {
                actions: {
                    bold: 'Fett',
                    italic: 'Kursiv',
                    textStyles: 'Textstil',
                    clearFormatting: 'Formatierung löschen',
                    normalText: 'Normaler Text',
                    heading1: 'Überschrift 1',
                    heading2: 'Überschrift 2',
                    heading3: 'Überschrift 3',
                    heading4: 'Überschrift 4',
                    heading5: 'Überschrift 5',
                    heading6: 'Überschrift 6',
                    customTable: 'Benutzerdefiniert…',
                    strikethrough: 'Durchgestrichen',
                    underline: 'Unterstrichen',
                    subscript: 'Tiefgestellt',
                    superscript: 'Hochgestellt',
                    heading: 'Überschrift',
                    insert: 'Einfügen',
                    lists: 'Listen',
                    ul: 'Liste',
                    ol: 'Nummerierte Liste',
                    indent: 'Einrücken',
                    outdent: 'Ausrücken',
                    quote: 'Zitat',
                    link: 'Link',
                    code: 'Code',
                    codeBlock: 'Codeblock',
                    table: 'Tabelle',
                    image: 'Bild',
                    hr: 'Trennlinie',
                    taskList: 'Task-Liste',
                    undo: 'Rückgängig',
                    redo: 'Wiederholen',
                    preview: 'Vorschau'
                },
                prompts: {
                    linkUrl: 'URL eingeben',
                    codeLang: 'Sprache (optional)',
                    imageAlt: 'Alt-Text eingeben',
                    imageUrl: 'Bild-URL eingeben'
                },
                placeholders: {
                    bold: 'fett',
                    italic: 'kursiv',
                    strikethrough: 'durchgestrichen',
                    underline: 'unterstrichen',
                    subscript: 'tiefgestellt',
                    superscript: 'hochgestellt',
                    linkText: 'Linktext',
                    code: 'code',
                    defaultText: 'Text',
                    defaultItem: 'Eintrag',
                    defaultTask: 'Aufgabe',
                    imageAlt: 'Bild',
                    tableColumn: 'Spalte',
                    tableValue: 'Wert'
                },
                preview: {
                    loading: 'Rendere Vorschau...',
                    error: 'Vorschau konnte nicht gerendert werden.'
                },
                modal: {
                    tableTitle: 'Tabelle erstellen',
                    rows: 'Zeilen',
                    columns: 'Spalten',
                    cancel: 'Abbrechen',
                    insert: 'Einfügen'
                },
                stats: {
                    mode: 'Modus',
                    chars: 'Zeichen',
                    words: 'Wörter'
                }
            },
            en: {
                actions: {
                    bold: 'Bold',
                    italic: 'Italic',
                    textStyles: 'Text style',
                    clearFormatting: 'Clear formatting',
                    normalText: 'Normal text',
                    heading1: 'Heading 1',
                    heading2: 'Heading 2',
                    heading3: 'Heading 3',
                    heading4: 'Heading 4',
                    heading5: 'Heading 5',
                    heading6: 'Heading 6',
                    customTable: 'Custom…',
                    strikethrough: 'Strikethrough',
                    underline: 'Underline',
                    subscript: 'Subscript',
                    superscript: 'Superscript',
                    heading: 'Heading',
                    insert: 'Insert',
                    lists: 'Lists',
                    ul: 'List',
                    ol: 'Numbered list',
                    indent: 'Indent',
                    outdent: 'Outdent',
                    quote: 'Quote',
                    link: 'Link',
                    code: 'Code',
                    codeBlock: 'Code block',
                    table: 'Table',
                    image: 'Image',
                    hr: 'Horizontal rule',
                    taskList: 'Task list',
                    undo: 'Undo',
                    redo: 'Redo',
                    preview: 'Preview'
                },
                prompts: {
                    linkUrl: 'Enter URL',
                    codeLang: 'Language (optional)',
                    imageAlt: 'Enter alt text',
                    imageUrl: 'Enter image URL'
                },
                placeholders: {
                    bold: 'bold',
                    italic: 'italic',
                    strikethrough: 'strikethrough',
                    underline: 'underlined',
                    subscript: 'subscript',
                    superscript: 'superscript',
                    linkText: 'Link text',
                    code: 'code',
                    defaultText: 'Text',
                    defaultItem: 'Item',
                    defaultTask: 'Task',
                    imageAlt: 'Image',
                    tableColumn: 'Column',
                    tableValue: 'Value'
                },
                preview: {
                    loading: 'Rendering preview...',
                    error: 'Preview could not be rendered.'
                },
                modal: {
                    tableTitle: 'Create table',
                    rows: 'Rows',
                    columns: 'Columns',
                    cancel: 'Cancel',
                    insert: 'Insert'
                },
                stats: {
                    mode: 'Mode',
                    chars: 'chars',
                    words: 'words'
                }
            }
        };

        const normalizedLang = String(settings.lang || document.documentElement.lang || 'de').trim().toLowerCase();
        const lang = normalizedLang.split('-')[0];
        const baseTranslations = defaultTranslations[lang] || defaultTranslations.de;
        const i18n = $.extend(true, {}, baseTranslations, settings.translations || {});

        function t(key, fallback) {
            const value = key.split('.').reduce(function (current, part) {
                if (!current || typeof current !== 'object') {
                    return undefined;
                }
                return current[part];
            }, i18n);
            if (typeof value === 'string' && value !== '') {
                return value;
            }
            return fallback;
        }

        const actions = {
            bold: {
                title: t('actions.bold', 'Fett'),
                icon: 'bi-type-bold',
                run(textarea) {
                    helpers.wrapSelection(textarea, '**', '**', t('placeholders.bold', 'fett'));
                }
            },
            italic: {
                title: t('actions.italic', 'Kursiv'),
                icon: 'bi-type-italic',
                run(textarea) {
                    helpers.wrapSelection(textarea, '_', '_', t('placeholders.italic', 'kursiv'));
                }
            },
            textStyles: {
                title: t('actions.textStyles', 'Textstil'),
                icon: 'bi-type',
                items: [
                    {label: t('actions.strikethrough', 'Durchgestrichen'), icon: 'bi-type-strikethrough', before: '~~', after: '~~', placeholder: t('placeholders.strikethrough', 'durchgestrichen')},
                    {label: t('actions.underline', 'Unterstrichen'), icon: 'bi-type-underline', before: '==', after: '==', placeholder: t('placeholders.underline', 'unterstrichen')},
                    {label: t('actions.subscript', 'Tiefgestellt'), icon: 'bi-subscript', before: '<sub>', after: '</sub>', placeholder: t('placeholders.subscript', 'tiefgestellt')},
                    {label: t('actions.superscript', 'Hochgestellt'), icon: 'bi-superscript', before: '<sup>', after: '</sup>', placeholder: t('placeholders.superscript', 'hochgestellt')}
                ],
                run(textarea, item) {
                    helpers.wrapSelection(textarea, item.before, item.after, item.placeholder);
                }
            },
            heading: {
                title: t('actions.heading', 'Überschrift'),
                icon: 'bi-fonts',
                items: [
                    {label: t('actions.normalText', 'Normaler Text'), prefix: '', textStyle: 'font-size:1rem;'},
                    {label: t('actions.heading1', 'Überschrift 1'), prefix: '# ', textStyle: 'font-size:1.15rem; font-weight:600;'},
                    {label: t('actions.heading2', 'Überschrift 2'), prefix: '## ', textStyle: 'font-size:1.1rem; font-weight:600;'},
                    {label: t('actions.heading3', 'Überschrift 3'), prefix: '### ', textStyle: 'font-size:1.05rem; font-weight:600;'},
                    {label: t('actions.heading4', 'Überschrift 4'), prefix: '#### ', textStyle: 'font-size:1rem; font-weight:600;'},
                    {label: t('actions.heading5', 'Überschrift 5'), prefix: '##### ', textStyle: 'font-size:0.95rem; font-weight:600;'},
                    {label: t('actions.heading6', 'Überschrift 6'), prefix: '###### ', textStyle: 'font-size:0.9rem; font-weight:600;'}
                ],
                run(textarea, item) {
                    helpers.transformSelectedLines(textarea, function (line) {
                        if (line.trim() === '') {
                            return line;
                        }
                        const normalized = helpers.stripHeadingPrefix(line).trimStart();
                        if (!item.prefix) {
                            return normalized;
                        }
                        return item.prefix + normalized;
                    });
                }
            },
            ul: {
                title: t('actions.ul', 'Liste'),
                icon: 'bi-list-ul',
                run(textarea) {
                    helpers.prefixLines(textarea, '- ');
                }
            },
            ol: {
                title: t('actions.ol', 'Nummerierte Liste'),
                icon: 'bi-list-ol',
                run(textarea) {
                    helpers.prefixNumberedLines(textarea);
                }
            },
            indent: {
                title: t('actions.indent', 'Einrücken'),
                icon: 'bi-text-indent-left',
                run(textarea) {
                    helpers.indentLines(textarea);
                }
            },
            outdent: {
                title: t('actions.outdent', 'Ausrücken'),
                icon: 'bi-text-indent-right',
                run(textarea) {
                    helpers.outdentLines(textarea);
                }
            },
            quote: {
                title: t('actions.quote', 'Zitat'),
                icon: 'bi-blockquote-left',
                run(textarea) {
                    helpers.prefixLines(textarea, '> ');
                }
            },
            link: {
                title: t('actions.link', 'Link'),
                icon: 'bi-link-45deg',
                run(textarea) {
                    const selected = helpers.getSelection(textarea) || t('placeholders.linkText', 'Linktext');
                    const url = window.prompt(t('prompts.linkUrl', 'URL eingeben'), 'https://');
                    if (!url) {
                        return;
                    }
                    helpers.replaceSelection(textarea, `[${selected}](${url})`, selected.length + 3, selected.length + url.length + 3);
                }
            },
            code: {
                title: t('actions.code', 'Code'),
                icon: 'bi-code-slash',
                run(textarea) {
                    helpers.wrapSelection(textarea, "`", "`", t('placeholders.code', 'code'));
                }
            },
            codeBlock: {
                title: t('actions.codeBlock', 'Codeblock'),
                icon: 'bi-braces-asterisk',
                run(textarea) {
                    const selected = helpers.getSelection(textarea);
                    const language = (window.prompt(t('prompts.codeLang', 'Sprache (optional)'), '') || '').trim();
                    const placeholder = selected === '' ? t('placeholders.code', 'code') : selected;
                    helpers.replaceSelection(textarea, `\`\`\`${language}\n${placeholder}\n\`\`\``);
                }
            },
            table: {
                title: t('actions.table', 'Tabelle'),
                icon: 'bi-table',
                items: [
                    {label: '2 x 2', rows: 2, columns: 2},
                    {label: '3 x 2', rows: 3, columns: 2},
                    {label: '3 x 3', rows: 3, columns: 3},
                    {label: '4 x 3', rows: 4, columns: 3},
                    {label: '4 x 4', rows: 4, columns: 4},
                    {type: 'divider'},
                    {label: t('actions.customTable', 'Benutzerdefiniert…'), customForm: true, icon: 'bi-sliders'}
                ],
                run(textarea, item) {
                    const rows = item && item.rows ? item.rows : 2;
                    const columns = item && item.columns ? item.columns : 2;
                    helpers.insertTemplate(textarea, helpers.buildMarkdownTable(rows, columns));
                }
            },
            image: {
                title: t('actions.image', 'Bild'),
                icon: 'bi-image',
                run(textarea) {
                    const alt = window.prompt(t('prompts.imageAlt', 'Alt-Text eingeben'), t('placeholders.imageAlt', 'Bild'));
                    if (alt === null) {
                        return;
                    }
                    const url = window.prompt(t('prompts.imageUrl', 'Bild-URL eingeben'), 'https://');
                    if (!url) {
                        return;
                    }
                    helpers.replaceSelection(textarea, `![${alt}](${url})`);
                }
            },
            hr: {
                title: t('actions.hr', 'Trennlinie'),
                icon: 'bi-hr',
                run(textarea) {
                    helpers.insertBlock(textarea, '---', true);
                }
            },
            taskList: {
                title: t('actions.taskList', 'Task-Liste'),
                icon: 'bi-card-checklist',
                run(textarea) {
                    const selected = helpers.getSelection(textarea);
                    const content = selected === '' ? t('placeholders.defaultTask', 'Aufgabe') : selected;
                    const replacement = content.split('\n').map(function (line) {
                        if (line.trim() === '') {
                            return line;
                        }
                        return `- [ ] ${line}`;
                    }).join('\n');
                    helpers.replaceSelection(textarea, replacement);
                }
            },
            undo: {
                title: t('actions.undo', 'Rückgängig'),
                icon: 'bi-arrow-counterclockwise',
                run(textarea) {
                    helpers.undo(textarea);
                }
            },
            redo: {
                title: t('actions.redo', 'Wiederholen'),
                icon: 'bi-arrow-clockwise',
                run(textarea) {
                    helpers.redo(textarea);
                }
            },
            preview: {
                title: t('actions.preview', 'Vorschau'),
                icon: 'bi-eye',
                run(textarea) {
                    helpers.toggleMode(textarea, 'toolbar');
                }
            }
        };

        const helpers = {
            escapeHtml(value) {
                return sharedConverters.escapeHtml(value);
            },
            sanitizeUrl(url) {
                return sharedConverters.sanitizeUrl(url);
            },
            renderInline(text) {
                return sharedConverters.renderInline(text);
            },
            renderMarkdown(markdown) {
                return sharedConverters.renderMarkdown(markdown);
            },
            getGroupSizeClass() {
                const size = String(settings.size || '').trim().toLowerCase();
                if (size === 'sm' || size === 'lg') {
                    return `btn-group-${size}`;
                }
                return '';
            },
            getButtonClass() {
                const btnClass = String(settings.btnClass || '').trim();
                return btnClass === '' ? 'btn-outline-secondary' : btnClass;
            },
            getWrapperClass() {
                return String(settings.wrapperClass || '').trim();
            },
            getResolvedActionKeys() {
                const allKeys = Object.keys(actions);
                if (settings.actions === 'all' || settings.actions == null || !Array.isArray(settings.actions)) {
                    return allKeys;
                }
                return settings.actions.filter(function (key, index) {
                    return allKeys.indexOf(key) !== -1 && settings.actions.indexOf(key) === index;
                });
            },
            getEditableElement(textarea) {
                return $(textarea).data('bsMarkdownEditorEditable') || null;
            },
            focusEditor(textarea) {
                const editable = helpers.getEditableElement(textarea);
                if (editable) {
                    editable.focus();
                    return;
                }
                textarea.focus();
            },
            getNodeIndex(node) {
                if (!node || !node.parentNode) {
                    return 0;
                }
                return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
            },
            getEditableNodeMarkdownLength(node, root) {
                if (!node) {
                    return 0;
                }
                if (node.nodeType === Node.TEXT_NODE) {
                    return String(node.nodeValue || '').length;
                }
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = String(node.tagName || '').toLowerCase();
                    if (tag === 'br') {
                        return 1;
                    }
                    let length = 0;
                    if (tag === 'sup' || tag === 'sub') {
                        length += (`<${tag}>`).length;
                    }
                    Array.prototype.forEach.call(node.childNodes, function (child) {
                        length += helpers.getEditableNodeMarkdownLength(child, root);
                    });
                    if ((tag === 'div' || tag === 'p') && node !== root) {
                        length += 1;
                    }
                    if (tag === 'sup' || tag === 'sub') {
                        length += (`</${tag}>`).length;
                    }
                    return length;
                }
                if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                    let len = 0;
                    Array.prototype.forEach.call(node.childNodes, function (child) {
                        len += helpers.getEditableNodeMarkdownLength(child, root);
                    });
                    return len;
                }
                return 0;
            },
            serializeEditableNode(node, root) {
                if (!node) {
                    return '';
                }
                if (node.nodeType === Node.TEXT_NODE) {
                    return String(node.nodeValue || '');
                }
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = String(node.tagName || '').toLowerCase();
                    if (tag === 'br') {
                        return '\n';
                    }
                    let content = '';
                    Array.prototype.forEach.call(node.childNodes, function (child) {
                        content += helpers.serializeEditableNode(child, root);
                    });
                    if (tag === 'sup' || tag === 'sub') {
                        return `<${tag}>${content}</${tag}>`;
                    }
                    if ((tag === 'div' || tag === 'p') && node !== root) {
                        return content + '\n';
                    }
                    return content;
                }
                if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                    let fragment = '';
                    Array.prototype.forEach.call(node.childNodes, function (child) {
                        fragment += helpers.serializeEditableNode(child, root);
                    });
                    return fragment;
                }
                return '';
            },
            getEditableValue(editable) {
                if (!editable) {
                    return '';
                }
                let value = helpers.serializeEditableNode(editable, editable).replace(/\r\n?/g, '\n');
                if (value.endsWith('\n')) {
                    value = value.slice(0, -1);
                }
                return value;
            },
            getEditableSelectionOffsets(editable) {
                if (!editable) {
                    return {start: 0, end: 0};
                }
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) {
                    return {start: 0, end: 0};
                }
                const range = selection.getRangeAt(0);
                if (!editable.contains(range.startContainer) || !editable.contains(range.endContainer)) {
                    return {start: 0, end: 0};
                }
                const startRange = range.cloneRange();
                startRange.selectNodeContents(editable);
                startRange.setEnd(range.startContainer, range.startOffset);
                const endRange = range.cloneRange();
                endRange.selectNodeContents(editable);
                endRange.setEnd(range.endContainer, range.endOffset);
                return {
                    start: helpers.serializeEditableNode(startRange.cloneContents(), editable).length,
                    end: helpers.serializeEditableNode(endRange.cloneContents(), editable).length
                };
            },
            getEditableDomPointByMarkdownOffset(editable, offset) {
                const target = Math.max(0, offset);
                if (target === 0) {
                    return {container: editable, offset: 0};
                }
                let consumed = 0;
                let result = null;

                function walk(node) {
                    if (result) {
                        return;
                    }
                    if (node.nodeType === Node.TEXT_NODE) {
                        const textLength = String(node.nodeValue || '').length;
                        if (consumed + textLength >= target) {
                            result = {container: node, offset: target - consumed};
                            return;
                        }
                        consumed += textLength;
                        return;
                    }
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        return;
                    }
                    const tag = String(node.tagName || '').toLowerCase();
                    if (tag === 'br') {
                        if (consumed + 1 >= target) {
                            result = {container: node.parentNode, offset: helpers.getNodeIndex(node) + 1};
                            return;
                        }
                        consumed += 1;
                        return;
                    }
                    if (tag === 'sup' || tag === 'sub') {
                        const openLength = (`<${tag}>`).length;
                        if (consumed + openLength >= target) {
                            result = {container: node, offset: 0};
                            return;
                        }
                        consumed += openLength;
                    }
                    Array.prototype.forEach.call(node.childNodes, walk);
                    if ((tag === 'div' || tag === 'p') && node !== editable && !result) {
                        if (consumed + 1 >= target) {
                            result = {container: node.parentNode, offset: helpers.getNodeIndex(node) + 1};
                            return;
                        }
                        consumed += 1;
                    }
                    if (tag === 'sup' || tag === 'sub') {
                        const closeLength = (`</${tag}>`).length;
                        if (consumed + closeLength >= target) {
                            result = {container: node, offset: node.childNodes.length};
                            return;
                        }
                        consumed += closeLength;
                    }
                }

                walk(editable);
                return result || {container: editable, offset: editable.childNodes.length};
            },
            setEditableSelectionOffsets(editable, start, end) {
                if (!editable) {
                    return;
                }
                const textLength = helpers.getEditableNodeMarkdownLength(editable, editable);
                const safeStart = Math.max(0, Math.min(textLength, start));
                const safeEnd = Math.max(safeStart, Math.min(textLength, end));
                const startPoint = helpers.getEditableDomPointByMarkdownOffset(editable, safeStart);
                const endPoint = helpers.getEditableDomPointByMarkdownOffset(editable, safeEnd);
                const range = document.createRange();
                range.setStart(startPoint.container, startPoint.offset);
                range.setEnd(endPoint.container, endPoint.offset);
                const selection = window.getSelection();
                if (!selection) {
                    return;
                }
                selection.removeAllRanges();
                selection.addRange(range);
            },
            renderEditableHtml(markdown) {
                return helpers.escapeHtml(markdown == null ? '' : String(markdown))
                    .replace(/&lt;sub&gt;([\s\S]*?)&lt;\/sub&gt;/gi, '<sub>$1</sub>')
                    .replace(/&lt;sup&gt;([\s\S]*?)&lt;\/sup&gt;/gi, '<sup>$1</sup>')
                    .replace(/\n/g, '<br>');
            },
            syncTextareaFromEditable(textarea, source = 'editable') {
                const editable = helpers.getEditableElement(textarea);
                if (!editable) {
                    return;
                }
                const offsets = helpers.getEditableSelectionOffsets(editable);
                const value = helpers.getEditableValue(editable);
                const clampedStart = Math.max(0, Math.min(value.length, offsets.start));
                const clampedEnd = Math.max(clampedStart, Math.min(value.length, offsets.end));
                helpers.withInternalChange(textarea, source, function () {
                    textarea.value = value;
                    textarea.setSelectionRange(clampedStart, clampedEnd);
                    $(textarea).trigger('input');
                });
            },
            syncEditableFromTextarea(textarea, preserveSelection = true) {
                const editable = helpers.getEditableElement(textarea);
                if (!editable) {
                    return;
                }
                const offsets = {start: textarea.selectionStart || 0, end: textarea.selectionEnd || 0};
                editable.innerHTML = helpers.renderEditableHtml(textarea.value);
                if (preserveSelection) {
                    helpers.setEditableSelectionOffsets(editable, offsets.start, offsets.end);
                }
            },
            getTextareaPreviewSpacing(textarea) {
                const surface = helpers.getEditableElement(textarea) || textarea;
                const styles = window.getComputedStyle(surface);
                return {
                    paddingTop: styles.paddingTop,
                    paddingRight: styles.paddingRight,
                    paddingBottom: styles.paddingBottom,
                    paddingLeft: styles.paddingLeft
                };
            },
            withInternalChange(textarea, source, callback) {
                const $textarea = $(textarea);
                $textarea.data('bsMarkdownEditorInternalChange', true);
                $textarea.data('bsMarkdownEditorChangeSource', source || 'api');
                try {
                    callback();
                } finally {
                    $textarea.data('bsMarkdownEditorInternalChange', false);
                    $textarea.removeData('bsMarkdownEditorChangeSource');
                }
            },
            emitPluginEvent(textarea, eventName, payload) {
                const $textarea = $(textarea);
                const eventPayload = payload || {};
                $textarea.trigger(eventName, [eventPayload]);
                if (eventName !== 'any.bs.markdown-editor') {
                    $textarea.trigger('any.bs.markdown-editor', [{eventName: eventName, payload: eventPayload}]);
                }
            },
            updateStats(textarea) {
                const $stats = $(textarea).data('bsMarkdownEditorStatsEl');
                if (!$stats || $stats.length === 0) {
                    return;
                }
                const value = helpers.getValue(textarea) || '';
                const words = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
                const mode = helpers.getMode(textarea);
                $stats.text(`${t('stats.mode', 'Mode')}: ${mode} | ${value.length} ${t('stats.chars', 'chars')} / ${words} ${t('stats.words', 'words')}`);
            },
            getMode(textarea) {
                const $preview = $(textarea).closest('.bs-parsedown-wrapper').find('.js-bs-parsedown-preview');
                return $preview.is(':visible') ? 'preview' : 'editor';
            },
            setMode(textarea, mode, source = 'api') {
                const targetMode = String(mode || '').trim().toLowerCase();
                if (targetMode !== 'editor' && targetMode !== 'preview') {
                    return helpers.getMode(textarea);
                }
                const $textarea = $(textarea);
                const $wrapper = $textarea.closest('.bs-parsedown-wrapper');
                const $preview = $wrapper.find('.js-bs-parsedown-preview');
                const $button = $wrapper.find('.js-bs-parsedown-preview-toggle');
                const $editor = $wrapper.find('.js-bs-parsedown-editor');
                const $actionButtons = $wrapper.find('.js-bs-parsedown-action');
                const currentMode = helpers.getMode(textarea);
                if (currentMode === targetMode) {
                    return currentMode;
                }
                if (targetMode === 'editor') {
                    $preview.addClass('d-none').hide().html('').css({height: '', overflowY: ''});
                    $editor.removeClass('d-none').show();
                    $actionButtons.prop('disabled', false).removeClass('disabled');
                    $button.removeClass('active btn-primary').addClass(helpers.getButtonClass());
                } else {
                    const previewSpacing = helpers.getTextareaPreviewSpacing(textarea);
                    const editable = helpers.getEditableElement(textarea);
                    const editorHeight = Math.max(settings.minHeight, Math.ceil($editor.outerHeight() || 0), Math.ceil((editable ? $(editable).outerHeight() : $textarea.outerHeight()) || 0));
                    $button.removeClass(helpers.getButtonClass()).addClass('active btn-primary');
                    $actionButtons.prop('disabled', true).addClass('disabled');
                    $editor.addClass('d-none').hide();
                    $preview.removeClass('d-none').show().css({
                        boxSizing: 'border-box',
                        height: editorHeight + 'px',
                        overflowY: 'auto',
                        paddingTop: previewSpacing.paddingTop,
                        paddingRight: previewSpacing.paddingRight,
                        paddingBottom: previewSpacing.paddingBottom,
                        paddingLeft: previewSpacing.paddingLeft
                    }).html(`<div class="text-body-secondary">${helpers.escapeHtml(t('preview.loading', 'Rendere Vorschau...'))}</div>`);
                    try {
                        $preview.html(`<div class="markdown">${helpers.renderMarkdown($textarea.val())}</div>`);
                    } catch (error) {
                        $preview.html(`<div class="text-danger">${helpers.escapeHtml(t('preview.error', 'Vorschau konnte nicht gerendert werden.'))}</div>`);
                    }
                }
                helpers.updateStats(textarea);
                helpers.emitPluginEvent(textarea, 'modeChange.bs.markdown-editor', {
                    mode: targetMode,
                    previousMode: currentMode,
                    source: source
                });
                return targetMode;
            },
            toggleMode(textarea, source = 'toolbar') {
                const nextMode = helpers.getMode(textarea) === 'preview' ? 'editor' : 'preview';
                return helpers.setMode(textarea, nextMode, source);
            },
            getValue(textarea) {
                return textarea.value;
            },
            setValue(textarea, value, source = 'api') {
                const nextValue = value == null ? '' : String(value);
                const selectionEnd = nextValue.length;
                helpers.withInternalChange(textarea, source, function () {
                    textarea.value = nextValue;
                    textarea.setSelectionRange(selectionEnd, selectionEnd);
                    $(textarea).trigger('input');
                    helpers.syncEditableFromTextarea(textarea, true);
                    helpers.focusEditor(textarea);
                });
            },
            getSelection(textarea) {
                return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
            },
            renderListItem(item) {
                return sharedConverters.renderListItem(item);
            },
            isListLine(line) {
                return sharedConverters.isListLine(line);
            },
            getListItemData(line) {
                return sharedConverters.getListItemData(line);
            },
            renderListBlock(lines) {
                return sharedConverters.renderListBlock(lines);
            },
            renderListNodes(nodes) {
                return sharedConverters.renderListNodes(nodes);
            },
            isTaskListItem(item) {
                return sharedConverters.isTaskListItem(item);
            },
            ensureHistory(textarea) {
                let history = $(textarea).data('bsMarkdownEditorHistory');
                if (history) {
                    return history;
                }
                history = {stack: [], index: -1, lock: false};
                $(textarea).data('bsMarkdownEditorHistory', history);
                return history;
            },
            createHistoryState(textarea) {
                return {
                    value: textarea.value,
                    selectionStart: textarea.selectionStart,
                    selectionEnd: textarea.selectionEnd
                };
            },
            pushHistoryState(textarea, state) {
                const history = helpers.ensureHistory(textarea);
                if (history.lock) {
                    return;
                }
                const current = history.stack[history.index];
                if (current && current.value === state.value && current.selectionStart === state.selectionStart && current.selectionEnd === state.selectionEnd) {
                    return;
                }
                if (history.index < history.stack.length - 1) {
                    history.stack = history.stack.slice(0, history.index + 1);
                }
                history.stack.push(state);
                if (history.stack.length > 200) {
                    history.stack.shift();
                }
                history.index = history.stack.length - 1;
            },
            applyHistoryState(textarea, state) {
                const history = helpers.ensureHistory(textarea);
                history.lock = true;
                helpers.withInternalChange(textarea, 'history', function () {
                    textarea.value = state.value;
                    textarea.setSelectionRange(state.selectionStart, state.selectionEnd);
                    $(textarea).trigger('input');
                    helpers.syncEditableFromTextarea(textarea, true);
                    helpers.focusEditor(textarea);
                });
                history.lock = false;
            },
            undo(textarea) {
                const history = helpers.ensureHistory(textarea);
                if (history.index <= 0) {
                    return;
                }
                history.index -= 1;
                helpers.applyHistoryState(textarea, history.stack[history.index]);
            },
            redo(textarea) {
                const history = helpers.ensureHistory(textarea);
                if (history.index >= history.stack.length - 1) {
                    return;
                }
                history.index += 1;
                helpers.applyHistoryState(textarea, history.stack[history.index]);
            },
            insertBlock(textarea, block, appendToSelection = false) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const value = textarea.value;
                const selected = value.substring(start, end);
                const before = value.substring(0, start);
                const after = value.substring(end);
                const needsLeadingNewline = before !== '' && !before.endsWith('\n');
                const needsTrailingNewline = after !== '' && !after.startsWith('\n');
                const prefix = needsLeadingNewline ? '\n' : '';
                const suffix = needsTrailingNewline ? '\n' : '';
                const content = appendToSelection && selected !== '' ? selected + '\n' + block : block;
                helpers.replaceSelection(textarea, prefix + content + suffix);
            },
            insertTemplate(textarea, template) {
                const selected = helpers.getSelection(textarea);
                if (selected !== '') {
                    helpers.replaceSelection(textarea, selected + '\n' + template);
                    return;
                }
                helpers.replaceSelection(textarea, template);
            },
            buildMarkdownTable(rows, columns) {
                const safeRows = Math.min(30, Math.max(1, parseInt(rows, 10) || 1));
                const safeColumns = Math.min(12, Math.max(1, parseInt(columns, 10) || 1));
                const header = [];
                const separator = [];
                const body = [];
                const tableColumnLabel = t('placeholders.tableColumn', 'Spalte');
                const tableValueLabel = t('placeholders.tableValue', 'Wert');
                for (let col = 1; col <= safeColumns; col += 1) {
                    header.push(`${tableColumnLabel} ${col}`);
                    separator.push('---');
                }
                for (let row = 1; row <= safeRows; row += 1) {
                    const cells = [];
                    for (let col = 1; col <= safeColumns; col += 1) {
                        cells.push(`${tableValueLabel} ${row}.${col}`);
                    }
                    body.push(cells);
                }
                const lines = [`| ${header.join(' | ')} |`, `| ${separator.join(' | ')} |`];
                body.forEach(function (cells) {
                    lines.push(`| ${cells.join(' | ')} |`);
                });
                return lines.join('\n');
            },
            replaceSelection(textarea, replacement, selectionStartOffset = 0, selectionEndOffset = replacement.length, source = 'toolbar') {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const value = textarea.value;
                helpers.withInternalChange(textarea, source, function () {
                    textarea.value = value.substring(0, start) + replacement + value.substring(end);
                    textarea.setSelectionRange(start + selectionStartOffset, start + selectionEndOffset);
                    $(textarea).trigger('input');
                    helpers.syncEditableFromTextarea(textarea, true);
                    helpers.focusEditor(textarea);
                });
            },
            wrapSelection(textarea, before, after, placeholder) {
                const selected = helpers.getSelection(textarea);
                const content = selected === '' ? placeholder : selected;
                const replacement = `${before}${content}${after}`;
                helpers.replaceSelection(textarea, replacement, before.length, before.length + content.length);
            },
            stripListPrefix(line) {
                const match = String(line).match(/^(\s*)(?:[-*+]\s+|\d+\.\s+)(.*)$/);
                if (!match) {
                    return line;
                }
                return `${match[1]}${match[2]}`;
            },
            stripHeadingPrefix(line) {
                const match = String(line).match(/^(\s{0,3})#{1,6}\s+(.*)$/);
                if (!match) {
                    return line;
                }
                return `${match[1]}${match[2]}`;
            },
            transformSelectedLines(textarea, transform) {
                const value = textarea.value;
                const selectionStart = textarea.selectionStart;
                const selectionEnd = textarea.selectionEnd;
                const lineStart = value.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1;
                const lineEndIndex = value.indexOf('\n', selectionEnd);
                const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
                const selectedLines = value.substring(lineStart, lineEnd).split('\n');
                const transformed = selectedLines.map(transform).join('\n');
                const startOffset = selectionStart - lineStart;
                const endOffset = startOffset + transformed.length;
                textarea.setSelectionRange(lineStart, lineEnd);
                helpers.replaceSelection(textarea, transformed, startOffset, endOffset);
            },
            indentLines(textarea) {
                helpers.transformSelectedLines(textarea, function (line) {
                    if (line.trim() === '') {
                        return line;
                    }
                    return '  ' + line;
                });
            },
            outdentLines(textarea) {
                helpers.transformSelectedLines(textarea, function (line) {
                    if (line.startsWith('\t')) {
                        return line.slice(1);
                    }
                    if (line.startsWith('  ')) {
                        return line.slice(2);
                    }
                    if (line.startsWith(' ')) {
                        return line.slice(1);
                    }
                    return line;
                });
            },
            prefixLines(textarea, prefix) {
                const selected = helpers.getSelection(textarea);
                const content = selected === '' ? t('placeholders.defaultText', 'Text') : selected;
                const replacement = content.split('\n').map(function (line) {
                    if (line.trim() === '') {
                        return line;
                    }
                    return prefix + helpers.stripListPrefix(line).trimStart();
                }).join('\n');
                helpers.replaceSelection(textarea, replacement);
            },
            prefixNumberedLines(textarea) {
                const selected = helpers.getSelection(textarea);
                const content = selected === '' ? t('placeholders.defaultItem', 'Eintrag') : selected;
                let counter = 1;
                const replacement = content.split('\n').map(function (line) {
                    if (line.trim() === '') {
                        return line;
                    }
                    const normalized = helpers.stripListPrefix(line).trimStart();
                    const value = `${counter}. ${normalized}`;
                    counter += 1;
                    return value;
                }).join('\n');
                helpers.replaceSelection(textarea, replacement);
            },
            removeInlineFormatting(text) {
                return String(text || '')
                    .replace(/<\s*\/?\s*(sup|sub)\s*>/gi, '')
                    .replace(/~~(.+?)~~/g, '$1')
                    .replace(/==(.+?)==/g, '$1')
                    .replace(/\*\*(.+?)\*\*/g, '$1')
                    .replace(/(^|[\s(])_([^_]+)_(?=$|[\s).,!?:;])/g, '$1$2')
                    .replace(/(^|[\s(])\*([^*]+)\*(?=$|[\s).,!?:;])/g, '$1$2')
                    .replace(/`([^`]+)`/g, '$1');
            }
        };

        return this.each(function () {
            const textarea = this;
            const $textarea = $(textarea);
            if ($textarea.data('bsMarkdownEditorInitialized')) {
                return;
            }
            $textarea.data('bsMarkdownEditorInitialized', true);

            const wrapperClass = helpers.getWrapperClass();
            const wrapperClasses = wrapperClass === '' ? 'bs-parsedown-wrapper' : `bs-parsedown-wrapper ${wrapperClass}`;
            $textarea.wrap($(`<div class="${wrapperClasses}"></div>`));
            const $wrapperRef = $textarea.closest('.bs-parsedown-wrapper');
            const $editor = $('<div class="js-bs-parsedown-editor"></div>');
            $textarea.wrap($editor);
            const $editorRef = $textarea.closest('.js-bs-parsedown-editor');
            const $editable = $(`<div class="js-bs-parsedown-editable form-control" contenteditable="true" spellcheck="true" aria-label="${helpers.escapeHtml(t('actions.textStyles', 'Textstil'))}"></div>`);
            $editable.css({minHeight: settings.minHeight + 'px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word'});
            $editorRef.prepend($editable);
            $textarea.addClass('visually-hidden js-bs-parsedown-source').attr('aria-hidden', 'true').css({
                position: 'absolute',
                left: '-9999px',
                top: '0',
                width: '1px',
                height: '1px',
                opacity: 0
            });
            $textarea.data('bsMarkdownEditorEditable', $editable.get(0));

            if (settings.showStats) {
                const $statsWrap = $('<div class="d-flex justify-content-end mt-2"></div>');
                const $stats = $('<span class="js-bs-parsedown-stats badge rounded-pill text-bg-light border fw-normal"></span>');
                $statsWrap.append($stats);
                $editorRef.append($statsWrap);
                $textarea.data('bsMarkdownEditorStatsEl', $stats);
            }

            helpers.syncEditableFromTextarea(textarea, false);
            helpers.updateStats(textarea);

            $editable.on('input.bsMarkdownEditorEditable', function () {
                helpers.syncTextareaFromEditable(textarea, 'editable');
                if (/<\/?(sup|sub)>/i.test(textarea.value)) {
                    helpers.syncEditableFromTextarea(textarea, true);
                }
            });

            $editable.on('paste.bsMarkdownEditorEditable', function (e) {
                e.preventDefault();
                const clipboardData = e.originalEvent && e.originalEvent.clipboardData ? e.originalEvent.clipboardData : window.clipboardData;
                const text = clipboardData ? (clipboardData.getData('text/plain') || '') : '';
                if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
                    document.execCommand('insertText', false, text);
                } else {
                    const selection = window.getSelection();
                    if (!selection || selection.rangeCount === 0) {
                        return;
                    }
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    range.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                helpers.syncTextareaFromEditable(textarea, 'editable');
                if (/<\/?(sup|sub)>/i.test(textarea.value)) {
                    helpers.syncEditableFromTextarea(textarea, true);
                }
            });

            helpers.pushHistoryState(textarea, helpers.createHistoryState(textarea));
            $textarea.on('input.bsMarkdownEditorHistory', function () {
                helpers.pushHistoryState(textarea, helpers.createHistoryState(textarea));
                const source = $textarea.data('bsMarkdownEditorChangeSource') || 'user';
                if (source !== 'editable') {
                    helpers.syncEditableFromTextarea(textarea, false);
                }
                helpers.updateStats(textarea);
                helpers.emitPluginEvent(textarea, 'change.bs.markdown-editor', {source: source, value: textarea.value});
                if (source === 'user' || source === 'editable') {
                    helpers.emitPluginEvent(textarea, 'userChange.bs.markdown-editor', {source: source, value: textarea.value});
                }
            });

            const groupSizeClass = helpers.getGroupSizeClass();
            const buttonClassBase = `btn ${helpers.getButtonClass()}`;
            const $toolbar = $('<div class="btn-toolbar mb-2 d-flex flex-wrap justify-content-between align-items-start gap-2 w-100" role="toolbar"></div>');
            const $toolbarLeft = $('<div class="d-flex flex-wrap align-items-center gap-1 flex-grow-1"></div>');
            const $toolbarRight = $('<div class="d-flex flex-wrap align-items-center gap-1"></div>');
            const resolvedActionKeys = helpers.getResolvedActionKeys();
            const groupedInlineStyleKeys = ['bold', 'italic', 'textStyles', 'code', 'codeBlock'];
            const groupedInsertKeys = ['link', 'image'];
            const groupedListKeys = ['ul', 'ol', 'taskList'];
            let inlineStylesDropdownRendered = false;
            let insertDropdownRendered = false;
            let listDropdownRendered = false;

            resolvedActionKeys.forEach(function (key) {
                const action = actions[key];
                if (key === 'preview' && !settings.preview) {
                    return;
                }

                if (groupedInlineStyleKeys.indexOf(key) !== -1) {
                    if (inlineStylesDropdownRendered) {
                        return;
                    }
                    inlineStylesDropdownRendered = true;
                    const inlineStyleItems = [];
                    if (resolvedActionKeys.indexOf('bold') !== -1 && actions.bold) {
                        inlineStyleItems.push({label: actions.bold.title, icon: actions.bold.icon, run() { actions.bold.run(textarea); }});
                    }
                    if (resolvedActionKeys.indexOf('italic') !== -1 && actions.italic) {
                        inlineStyleItems.push({label: actions.italic.title, icon: actions.italic.icon, run() { actions.italic.run(textarea); }});
                    }
                    if (resolvedActionKeys.indexOf('textStyles') !== -1 && actions.textStyles && Array.isArray(actions.textStyles.items)) {
                        actions.textStyles.items.forEach(function (item) {
                            inlineStyleItems.push({
                                label: item.label,
                                icon: item.icon || actions.textStyles.icon,
                                run() { actions.textStyles.run(textarea, item); }
                            });
                        });
                    }
                    if (resolvedActionKeys.indexOf('code') !== -1 && actions.code) {
                        inlineStyleItems.push({label: actions.code.title, icon: actions.code.icon, run() { actions.code.run(textarea); }});
                    }
                    if (resolvedActionKeys.indexOf('codeBlock') !== -1 && actions.codeBlock) {
                        inlineStyleItems.push({label: actions.codeBlock.title, icon: actions.codeBlock.icon, run() { actions.codeBlock.run(textarea); }});
                    }
                    inlineStyleItems.push({type: 'divider'});
                    inlineStyleItems.push({
                        label: t('actions.clearFormatting', 'Formatierung löschen'),
                        icon: 'bi-eraser',
                        run() {
                            const selected = helpers.getSelection(textarea);
                            if (selected === '') {
                                return;
                            }
                            const cleaned = helpers.removeInlineFormatting(selected);
                            helpers.replaceSelection(textarea, cleaned, 0, cleaned.length);
                        }
                    });

                    if (inlineStyleItems.length > 1) {
                        const dropdownId = 'bsMarkdownEditorInlineStyles' + Math.random().toString(36).slice(2, 10);
                        const $dropdown = $(`
<div class="btn-group ${groupSizeClass}" role="group">
    <button type="button"
            class="${buttonClassBase} dropdown-toggle js-bs-parsedown-action"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="${dropdownId}"
            title="${t('actions.textStyles', 'Textstil')}">
        <i class="bi bi-type-bold"></i>
    </button>
    <ul class="dropdown-menu" aria-labelledby="${dropdownId}"></ul>
</div>
`);
                        const $menu = $dropdown.find('.dropdown-menu');
                        inlineStyleItems.forEach(function (item) {
                            if (item.type === 'divider') {
                                $menu.append('<li><hr class="dropdown-divider"></li>');
                                return;
                            }
                            const $link = $(`<a href="#" class="dropdown-item"><i class="bi ${item.icon} me-2"></i>${item.label}</a>`);
                            $link.on('click', function (e) {
                                e.preventDefault();
                                helpers.syncTextareaFromEditable(textarea, 'editableSelection');
                                item.run();
                                $dropdown.find('[data-bs-toggle="dropdown"]').dropdown('hide');
                            });
                            $menu.append($('<li></li>').append($link));
                        });
                        $toolbarLeft.append($dropdown);
                        return;
                    }
                }

                if (groupedListKeys.indexOf(key) !== -1) {
                    if (listDropdownRendered) {
                        return;
                    }
                    listDropdownRendered = true;
                    const availableListKeys = groupedListKeys.filter(function (listKey) {
                        return resolvedActionKeys.indexOf(listKey) !== -1 && actions[listKey];
                    });
                    if (availableListKeys.length > 1) {
                        const dropdownId = 'bsMarkdownEditorLists' + Math.random().toString(36).slice(2, 10);
                        const $dropdown = $(`
<div class="btn-group ${groupSizeClass}" role="group">
    <button type="button"
            class="${buttonClassBase} dropdown-toggle js-bs-parsedown-action"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="${dropdownId}"
            title="${t('actions.lists', 'Listen')}">
        <i class="bi bi-list-task"></i>
    </button>
    <ul class="dropdown-menu" aria-labelledby="${dropdownId}"></ul>
</div>
`);
                        const $menu = $dropdown.find('.dropdown-menu');
                        availableListKeys.forEach(function (listKey) {
                            const listAction = actions[listKey];
                            const $link = $(`<a href="#" class="dropdown-item"><i class="bi ${listAction.icon} me-2"></i>${listAction.title}</a>`);
                            $link.on('click', function (e) {
                                e.preventDefault();
                                helpers.syncTextareaFromEditable(textarea, 'editableSelection');
                                listAction.run(textarea);
                                $dropdown.find('[data-bs-toggle="dropdown"]').dropdown('hide');
                            });
                            $menu.append($('<li></li>').append($link));
                        });
                        $toolbarLeft.append($dropdown);
                        return;
                    }
                }

                if (groupedInsertKeys.indexOf(key) !== -1) {
                    if (insertDropdownRendered) {
                        return;
                    }
                    insertDropdownRendered = true;
                    const insertItems = groupedInsertKeys.filter(function (insertKey) {
                        return resolvedActionKeys.indexOf(insertKey) !== -1 && actions[insertKey];
                    }).map(function (insertKey) {
                        return actions[insertKey];
                    });
                    if (insertItems.length > 1) {
                        const dropdownId = 'bsMarkdownEditorInsert' + Math.random().toString(36).slice(2, 10);
                        const $dropdown = $(`
<div class="btn-group ${groupSizeClass}" role="group">
    <button type="button"
            class="${buttonClassBase} dropdown-toggle js-bs-parsedown-action"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="${dropdownId}"
            title="${t('actions.insert', 'Einfügen')}">
        <i class="bi bi-plus-lg"></i>
    </button>
    <ul class="dropdown-menu" aria-labelledby="${dropdownId}"></ul>
</div>
`);
                        const $menu = $dropdown.find('.dropdown-menu');
                        insertItems.forEach(function (insertAction) {
                            const $link = $(`<a href="#" class="dropdown-item"><i class="bi ${insertAction.icon} me-2"></i>${insertAction.title}</a>`);
                            $link.on('click', function (e) {
                                e.preventDefault();
                                helpers.syncTextareaFromEditable(textarea, 'editableSelection');
                                insertAction.run(textarea);
                                $dropdown.find('[data-bs-toggle="dropdown"]').dropdown('hide');
                            });
                            $menu.append($('<li></li>').append($link));
                        });
                        $toolbarLeft.append($dropdown);
                        return;
                    }
                }

                if (Array.isArray(action.items) && action.items.length > 0) {
                    const controlClass = key === 'preview' ? '' : ' js-bs-parsedown-action';
                    const dropdownId = 'bsMarkdownEditorHeading' + Math.random().toString(36).slice(2, 10);
                    const $dropdown = $(`
<div class="btn-group ${groupSizeClass}" role="group">
    <button type="button"
            class="${buttonClassBase} dropdown-toggle${controlClass}"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="${dropdownId}"
            title="${action.title}">
        <i class="bi ${action.icon}"></i>
    </button>
    <ul class="dropdown-menu" aria-labelledby="${dropdownId}"></ul>
</div>
`);
                    const $menu = $dropdown.find('.dropdown-menu');
                    action.items.forEach(function (item) {
                        if (item.type === 'divider') {
                            $menu.append('<li><hr class="dropdown-divider"></li>');
                            return;
                        }
                        if (item.customForm) {
                            const formId = 'bsMarkdownEditorTableCustom' + Math.random().toString(36).slice(2, 10);
                            const $custom = $(`
<li class="px-3 py-2">
    <div class="small text-body-secondary mb-2">${helpers.escapeHtml(item.label)}</div>
    <div class="d-flex align-items-end gap-2">
        <div>
            <label class="form-label form-label-sm mb-1" for="${formId}Rows">${helpers.escapeHtml(t('modal.rows', 'Zeilen'))}</label>
            <input id="${formId}Rows" class="form-control form-control-sm" type="number" min="1" max="30" value="2" style="width:5rem;">
        </div>
        <div>
            <label class="form-label form-label-sm mb-1" for="${formId}Columns">${helpers.escapeHtml(t('modal.columns', 'Spalten'))}</label>
            <input id="${formId}Columns" class="form-control form-control-sm" type="number" min="1" max="12" value="2" style="width:5rem;">
        </div>
        <button type="button" class="btn btn-sm btn-primary js-bs-parsedown-table-custom-insert">${helpers.escapeHtml(t('modal.insert', 'Einfügen'))}</button>
    </div>
</li>
`);
                            $custom.on('click', function (e) {
                                e.stopPropagation();
                            });
                            $custom.find('.js-bs-parsedown-table-custom-insert').on('click', function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                helpers.syncTextareaFromEditable(textarea, 'editableSelection');
                                action.run(textarea, {
                                    rows: $custom.find(`#${formId}Rows`).val(),
                                    columns: $custom.find(`#${formId}Columns`).val()
                                });
                                $dropdown.find('[data-bs-toggle="dropdown"]').dropdown('hide');
                            });
                            $menu.append($custom);
                            return;
                        }
                        const itemIcon = item.icon || null;
                        const iconHtml = itemIcon ? `<i class="bi ${itemIcon} me-2"></i>` : '';
                        const labelStyle = item.textStyle ? ` style="${item.textStyle}"` : '';
                        const $link = $(`<a href="#" class="dropdown-item">${iconHtml}<span${labelStyle}>${item.label}</span></a>`);
                        $link.on('click', function (e) {
                            e.preventDefault();
                            helpers.syncTextareaFromEditable(textarea, 'editableSelection');
                            action.run(textarea, item);
                            $dropdown.find('[data-bs-toggle="dropdown"]').dropdown('hide');
                        });
                        $menu.append($('<li></li>').append($link));
                    });
                    if (key === 'preview') {
                        $toolbarRight.append($dropdown);
                    } else {
                        $toolbarLeft.append($dropdown);
                    }
                    return;
                }

                const buttonClass = key === 'preview' ? `${buttonClassBase} js-bs-parsedown-preview-toggle` : `${buttonClassBase} js-bs-parsedown-action`;
                const $button = $(`<button type="button" class="${buttonClass}" title="${action.title}"><i class="bi ${action.icon}"></i></button>`);
                const $buttonGroup = $(`<div class="btn-group ${groupSizeClass}" role="group"></div>`);
                $buttonGroup.append($button);
                $button.on('click', function (e) {
                    e.preventDefault();
                    helpers.syncTextareaFromEditable(textarea, 'editableSelection');
                    action.run(textarea);
                });
                if (key === 'preview') {
                    $toolbarRight.append($buttonGroup);
                } else {
                    $toolbarLeft.append($buttonGroup);
                }
            });

            $toolbar.append($toolbarLeft);
            if ($toolbarRight.children().length > 0) {
                $toolbar.append($toolbarRight);
            }
            const $preview = $('<div class="js-bs-parsedown-preview border rounded-3 d-none"></div>');
            $wrapperRef.prepend($toolbar);
            $wrapperRef.append($preview);

            const api = {
                mode(value) {
                    if (typeof value === 'undefined') {
                        return helpers.getMode(textarea);
                    }
                    return helpers.setMode(textarea, value, 'api');
                },
                val(value) {
                    if (typeof value === 'undefined') {
                        return helpers.getValue(textarea);
                    }
                    helpers.setValue(textarea, value, 'api');
                    return helpers.getValue(textarea);
                }
            };
            $textarea.data('bsMarkdownEditorApi', api);

            helpers.setMode(textarea, settings.mode, 'init');
            helpers.updateStats(textarea);
            helpers.emitPluginEvent(textarea, 'ready.bs.markdown-editor', {
                mode: helpers.getMode(textarea),
                value: helpers.getValue(textarea),
                api: api
            });
        });
    };
}(jQuery));
