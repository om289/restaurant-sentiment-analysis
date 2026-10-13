/**
 * Lightweight inline markdown renderer — converts Gemini markdown responses
 * into clean React elements without any external library.
 *
 * Supports:
 *  - **bold** → <strong>
 *  - *italic* / _italic_ → <em>
 *  - `code` → <code>
 *  - ### / ## / # headings
 *  - Numbered lists (1. 2. 3.)
 *  - Bullet lists (* or -)
 *  - Blank lines → paragraph spacing
 */

import React from 'react';

// Render inline formatting within a line of text
function renderInline(text: string, key: string | number): React.ReactNode {
  // Process: bold (**text**), italic (*text* / _text_), inline code (`code`)
  const parts: React.ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`(.+?)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[2]) {
      // **bold**
      parts.push(<strong key={`b-${match.index}`} style={{ color: '#e2e8f0', fontWeight: 700 }}>{match[2]}</strong>);
    } else if (match[3] || match[4]) {
      // *italic* or _italic_
      parts.push(<em key={`i-${match.index}`} style={{ color: '#cbd5e1' }}>{match[3] || match[4]}</em>);
    } else if (match[5]) {
      // `code`
      parts.push(
        <code key={`c-${match.index}`} style={{
          background: 'rgba(99,102,241,0.15)', color: '#818cf8',
          padding: '1px 5px', borderRadius: '4px', fontSize: '0.82em', fontFamily: 'monospace'
        }}>{match[5]}</code>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <React.Fragment key={key}>{parts}</React.Fragment>;
}

export function renderMarkdown(markdown: string): React.ReactNode {
  if (!markdown) return null;
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines (just add spacing via margin)
    if (!trimmed) {
      elements.push(<div key={`gap-${i}`} style={{ height: '8px' }} />);
      i++;
      continue;
    }

    // ### / ## / # Headings
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = ['1.1rem', '1rem', '0.95rem'];
      elements.push(
        <div key={`h-${i}`} style={{
          fontSize: sizes[level - 1] || '0.95rem',
          fontWeight: 700, color: '#e2e8f0',
          marginTop: '12px', marginBottom: '4px',
          borderBottom: level === 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          paddingBottom: level === 1 ? '6px' : '0',
        }}>
          {renderInline(headingMatch[2], `h-inner-${i}`)}
        </div>
      );
      i++;
      continue;
    }

    // Numbered list item: "1. text" or "1.  text"
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} style={{ display: 'flex', gap: '10px', marginBottom: '5px', lineHeight: 1.55 }}>
          <span style={{
            color: '#6366f1', fontWeight: 700, minWidth: '20px',
            fontSize: '0.85rem', paddingTop: '1px', flexShrink: 0
          }}>
            {numMatch[1]}.
          </span>
          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            {renderInline(numMatch[2], `num-inner-${i}`)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Bullet list item: "* text" or "- text"
    const bulletMatch = trimmed.match(/^[\*\-]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={`b-${i}`} style={{ display: 'flex', gap: '10px', marginBottom: '4px', lineHeight: 1.55 }}>
          <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, marginTop: '1px' }}>•</span>
          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            {renderInline(bulletMatch[1], `b-inner-${i}`)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={`p-${i}`} style={{
        margin: '0 0 4px 0', color: '#94a3b8',
        fontSize: '0.85rem', lineHeight: 1.65
      }}>
        {renderInline(trimmed, `p-inner-${i}`)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}
