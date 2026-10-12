import { afterEach, describe, expect, it, vi } from 'vitest';
import fixtures from '../../../tests/fixtures/trace-cases.json';
import { requestAnimationSteps } from './algorithmApi';

describe('API-down visualization fallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const makeApiUnavailable = () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Backend unavailable'));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  };

  it('renders the default linked list from the same six-step fixture when array is omitted', async () => {
    makeApiUnavailable();
    const result = await requestAnimationSteps({
      id: 'linked-list',
      category: 'Linked List',
      target: 42,
      operation: ''
    });
    const expectedSteps = (fixtures.linkedListCases[0] as (typeof fixtures.linkedListCases)[number] & {
      expectedSteps: Array<{ action: string; index: number; note: string; snapshot: number[] }>;
    }).expectedSteps;
    const sentBody = JSON.parse(vi.mocked(fetch).mock.calls[0]?.[1]?.body as string) as Record<string, unknown>;

    expect(result.steps).toHaveLength(6);
    expect(sentBody).not.toHaveProperty('array');
    expect(result.steps.map(({ action, index, i, note, snapshot }) => ({ action, index, i, note, snapshot }))).toEqual(expectedSteps.map((step) => ({ ...step, i: step.index })));
    expect(result.steps.every((step) => step.snapshot?.length === 5 && step.note !== 'linked-list operation step')).toBe(true);
  });

  it('falls back to the sample list when the configured API address is unreachable', async () => {
    vi.stubEnv('VITE_API_URL', 'http://127.0.0.1:1');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await requestAnimationSteps({ id: 'linked-list', category: 'Linked List', target: 42, operation: '' });

    expect(result.steps).toHaveLength(6);
    expect(result.steps[0]?.snapshot).toEqual([3, 7, 11, 15, 19]);
    expect(result.steps[0]?.note).toBe('Traverse: visiting node 3');
  });

  it.each([
    { id: 'stack', category: 'Stack' as const, operation: 'push', expected: [18, 31, 44, 42] },
    { id: 'queue', category: 'Queue' as const, operation: 'enqueue', expected: [7, 14, 21, 42] }
  ])('$category keeps its built-in sample when the API is unavailable', async ({ id, category, operation, expected }) => {
    makeApiUnavailable();
    const result = await requestAnimationSteps({ id, category, operation, target: 42 });
    expect(result.steps[result.steps.length - 1]?.snapshot).toEqual(expected);
    expect(result.steps[0]?.note).toBeTruthy();
  });

  it('keeps BST traversal nodes and captions when the API is unavailable', async () => {
    makeApiUnavailable();
    const result = await requestAnimationSteps({ id: 'bst', category: 'Trees', operation: 'inorder', target: 42 });
    expect(result.steps.filter((step) => step.action === 'visit').map((step) => step.node)).toEqual(['N4', 'N2', 'N5', 'N1', 'N6', 'N3', 'N7']);
    expect(result.steps.filter((step) => step.action === 'visit').every((step) => Boolean(step.note))).toBe(true);
  });

  it('uses the built-in graph and visits its nodes when the API is unavailable', async () => {
    makeApiUnavailable();
    const result = await requestAnimationSteps({ id: 'bfs', category: 'Graphs', target: 42 });
    expect(result.steps.filter((step) => step.action === 'visit')).toHaveLength(6);
    expect(result.steps.filter((step) => step.action === 'visit').every((step) => Boolean(step.node && step.note))).toBe(true);
  });
});
