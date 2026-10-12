import { describe, expect, it } from 'vitest';
import fixtures from '../../../tests/fixtures/trace-cases.json';
import { runLocalAlgorithm } from './localAlgorithmRunner';

describe('shared algorithm trace fixtures', () => {
  it.each(fixtures.linkedListCases)('linked-list $operation keeps a descriptive trace for every node state', ({ operation, input, target, expected, firstNote, expectedActions }) => {
    const response = runLocalAlgorithm('Linked List', 'linked-list', input, target, operation || undefined);
    expect(response.steps[0]?.note).toBe(firstNote);
    expect(response.steps.map((step) => step.action)).toEqual(expectedActions);
    expect(response.steps.every((step) => Array.isArray(step.snapshot) && step.note.trim().length > 0)).toBe(true);
    expect(response.steps.filter((step) => step.action === 'pointer').every((step) => step.pointerChange !== undefined)).toBe(true);
    expect(response.steps[response.steps.length - 1]?.snapshot).toEqual(expected);
    if (!operation) expect(response.steps[0]?.snapshot).toEqual(input);
  });

  it.each(fixtures.sortCases)('$algorithm sorts its input', ({ algorithm, input, expected }) => {
    const response = runLocalAlgorithm('Sorting', algorithm, input, 0);
    expect(response.steps[response.steps.length - 1]?.snapshot).toEqual(expected);
  });

  it.each(fixtures.searchCases)('$algorithm returns expected index for $target', ({ algorithm, input, target, expectedIndex }) => {
    const response = runLocalAlgorithm('Searching', algorithm, input, target);
    const found = response.steps.find((step) => step.action === 'found');
    expect(found?.index ?? -1).toBe(expectedIndex);
  });

  it.each(fixtures.structureCases)('$category $operation gives expected final state', ({ category, operation, input, target, expected }) => {
    const response = runLocalAlgorithm(category as 'Stack' | 'Queue' | 'Linked List', category.toLowerCase(), input, target, operation);
    expect(response.steps[response.steps.length - 1]?.snapshot).toEqual(expected);
  });
});
