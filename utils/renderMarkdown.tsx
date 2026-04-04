/**
 * Shared inline markdown renderer.
 *
 * Converts a subset of markdown (bold-italic, bold, italic) into React nodes
 * so AI-generated text displays correctly throughout the game.
 */

import React from 'react';

/** Render inline markdown (***bold italic***, **bold**, *italic*) */
export function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
      return <strong key={i} className="text-green-400 font-semibold italic">{part.slice(3, -3)}</strong>;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="text-green-400 font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} className="text-slate-400 italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
