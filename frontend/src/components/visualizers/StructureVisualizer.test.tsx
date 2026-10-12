import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { runLocalAlgorithm } from '../../services/localAlgorithmRunner';
import { StructureVisualizer } from './StructureVisualizer';

describe('linked-list fallback rendering', () => {
  it('shows all sample nodes, pointers, active highlight, and the current caption', () => {
    const trace = runLocalAlgorithm('Linked List', 'linked-list', undefined, 42, '');
    const html = renderToStaticMarkup(createElement(StructureVisualizer, { mode: 'Linked List', step: trace.steps[0] }));
    const visibleText = html.replace(/<[^>]*>/g, '');

    for (const value of [3, 7, 11, 15, 19]) expect(visibleText).toContain(String(value));
    expect(html).toContain('HEAD');
    expect(html).toContain('TAIL');
    expect(html).toContain('Traverse: visiting node 3');
    expect(html).toContain('border-cyan-300');
  });

  it('shows an explicit message for deletion on an empty list', () => {
    const trace = runLocalAlgorithm('Linked List', 'linked-list', [], 42, 'delete-head');
    const html = renderToStaticMarkup(createElement(StructureVisualizer, { mode: 'Linked List', step: trace.steps[0] }));
    expect(html).toContain('List is empty. Delete head: list is empty');
  });
});
