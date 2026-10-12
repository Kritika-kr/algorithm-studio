import { describe, expect, it } from 'vitest';
import fixtures from '../../../tests/fixtures/trace-cases.json';
import { runLocalAlgorithm } from './localAlgorithmRunner';

describe('shared algorithm trace fixtures', () => {
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
