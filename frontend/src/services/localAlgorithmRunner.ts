import { AlgorithmCategory, AlgorithmStats, AnimationStep, StepResponse } from '../types/algorithm';

const emptyStats = {
  comparisons: 0,
  swaps: 0,
  recursionDepth: 0,
  visitedNodes: 0,
  executionTimeMs: 0,
  memoryBytes: 0
};

const completeResponse = (steps: AnimationStep[], values: number[], stats: Partial<AlgorithmStats> = emptyStats): StepResponse => ({
  steps,
  stats: {
    ...emptyStats,
    ...stats,
    executionTimeMs: steps.length,
    memoryBytes: values.length * 8 + steps.length * 64
  }
});

const runSorting = (id: string, input: number[]): StepResponse => {
  const values = input.length ? [...input] : [42, 17, 83, 9, 31, 64, 25, 58];
  const steps: AnimationStep[] = [];
  const stats = { ...emptyStats };

  const emit = (action: AnimationStep['action'], i: number, j: number | undefined, line: number, note: string) => {
    steps.push({
      action,
      index: i,
      i,
      j,
      value: i >= 0 ? values[i] : undefined,
      line,
      note,
      snapshot: [...values]
    });
  };

  const compare = (i: number, j: number, note = 'Compare two values') => {
    stats.comparisons += 1;
    emit('compare', i, j, 3, note);
  };

  const swap = (i: number, j: number) => {
    if (i === j) {
      emit('highlight', i, j, 4, 'Value already in position');
      return;
    }
    [values[i], values[j]] = [values[j], values[i]];
    stats.swaps += 1;
    emit('swap', i, j, 4, 'Swap two values');
  };

  const overwrite = (index: number, value: number) => {
    values[index] = value;
    emit('overwrite', index, undefined, 4, 'Write merged value');
  };

  if (id === 'selection-sort') {
    for (let i = 0; i < values.length; i += 1) {
      let minIndex = i;
      for (let j = i + 1; j < values.length; j += 1) {
        compare(minIndex, j);
        if (values[j] < values[minIndex]) minIndex = j;
      }
      swap(i, minIndex);
      emit('mark-sorted', i, undefined, 7, 'Position is sorted');
    }
  } else if (id === 'insertion-sort') {
    for (let i = 1; i < values.length; i += 1) {
      let j = i;
      while (j > 0) {
        compare(j - 1, j);
        if (values[j - 1] <= values[j]) break;
        swap(j - 1, j);
        j -= 1;
      }
    }
    values.forEach((_, index) => emit('mark-sorted', index, undefined, 7, 'Position is sorted'));
  } else if (id === 'merge-sort') {
    const sort = (left: number, right: number, depth: number) => {
      stats.recursionDepth = Math.max(stats.recursionDepth, depth);
      if (left >= right) return;
      const mid = left + Math.floor((right - left) / 2);
      sort(left, mid, depth + 1);
      sort(mid + 1, right, depth + 1);
      const merged: number[] = [];
      let i = left;
      let j = mid + 1;
      while (i <= mid && j <= right) {
        compare(i, j, 'Compare merge heads');
        merged.push(values[i] <= values[j] ? values[i++] : values[j++]);
      }
      while (i <= mid) merged.push(values[i++]);
      while (j <= right) merged.push(values[j++]);
      merged.forEach((value, offset) => overwrite(left + offset, value));
    };
    sort(0, values.length - 1, 1);
  } else if (id === 'quick-sort') {
    const sort = (low: number, high: number, depth: number) => {
      stats.recursionDepth = Math.max(stats.recursionDepth, depth);
      if (low >= high) return;
      emit('pivot', high, undefined, 1, 'Choose pivot');
      const pivot = values[high];
      let store = low;
      for (let scan = low; scan < high; scan += 1) {
        compare(scan, high, 'Compare with pivot');
        if (values[scan] < pivot) {
          swap(store, scan);
          store += 1;
        }
      }
      swap(store, high);
      emit('mark-sorted', store, undefined, 7, 'Pivot is sorted');
      sort(low, store - 1, depth + 1);
      sort(store + 1, high, depth + 1);
    };
    sort(0, values.length - 1, 1);
  } else if (id === 'heap-sort') {
    const heapify = (heapSize: number, root: number) => {
      let largest = root;
      const left = root * 2 + 1;
      const right = root * 2 + 2;
      if (left < heapSize) {
        compare(largest, left, 'Compare left child');
        if (values[left] > values[largest]) largest = left;
      }
      if (right < heapSize) {
        compare(largest, right, 'Compare right child');
        if (values[right] > values[largest]) largest = right;
      }
      if (largest !== root) {
        swap(root, largest);
        heapify(heapSize, largest);
      }
    };
    for (let i = Math.floor(values.length / 2) - 1; i >= 0; i -= 1) heapify(values.length, i);
    for (let end = values.length - 1; end > 0; end -= 1) {
      swap(0, end);
      emit('mark-sorted', end, undefined, 7, 'Extract max');
      heapify(end, 0);
    }
    emit('mark-sorted', 0, undefined, 7, 'Final value is sorted');
  } else {
    for (let i = 0; i < values.length; i += 1) {
      for (let j = 0; j < values.length - i - 1; j += 1) {
        compare(j, j + 1);
        if (values[j] > values[j + 1]) swap(j, j + 1);
      }
      emit('mark-sorted', values.length - i - 1, undefined, 7, 'Tail value is sorted');
    }
  }

  emit('complete', -1, undefined, 7, 'Sorting complete');
  return completeResponse(steps, values, stats);
};

const runSearching = (id: string, input: number[], target: number): StepResponse => {
  const values = input.length ? [...input] : [12, 19, 24, 31, 42, 55, 71, 88];
  if (id !== 'linear-search') values.sort((a, b) => a - b);
  const steps: AnimationStep[] = [];
  const stats = { ...emptyStats };
  const visited: number[] = [];
  let found = false;

  const emit = (action: AnimationStep['action'], index: number, line: number, note: string) => {
    steps.push({
      action,
      index,
      i: index,
      value: index >= 0 ? values[index] : undefined,
      visited: [...visited],
      found: action === 'found',
      line,
      note,
      snapshot: [...values]
    });
  };

  const probe = (index: number, note: string) => {
    if (index < 0 || index >= values.length || found) return;
    stats.comparisons += 1;
    visited.push(index);
    emit('compare', index, 3, note);
    if (values[index] === target) {
      found = true;
      emit('found', index, 4, 'Target found');
    } else {
      emit('highlight', index, 5, 'Mark index as visited');
    }
  };

  if (id === 'binary-search') {
    let left = 0;
    let right = values.length - 1;
    while (left <= right && !found) {
      const mid = left + Math.floor((right - left) / 2);
      probe(mid, 'Probe midpoint');
      if (values[mid] < target) left = mid + 1;
      else right = mid - 1;
    }
  } else if (id === 'jump-search') {
    const jump = Math.max(1, Math.floor(Math.sqrt(values.length)));
    let prev = 0;
    let next = jump;
    while (prev < values.length && values[Math.min(next, values.length) - 1] < target) {
      probe(Math.min(next, values.length) - 1, 'Jump to next block');
      prev = next;
      next += jump;
    }
    for (let i = prev; i < Math.min(next, values.length) && !found; i += 1) {
      probe(i, 'Linear scan inside block');
    }
  } else if (id === 'interpolation-search') {
    let low = 0;
    let high = values.length - 1;
    while (low <= high && target >= values[low] && target <= values[high] && !found) {
      const denominator = values[high] - values[low];
      const pos = denominator === 0 ? low : low + Math.floor(((target - values[low]) * (high - low)) / denominator);
      probe(pos, 'Interpolated probe');
      if (values[pos] < target) low = pos + 1;
      else high = pos - 1;
    }
  } else {
    for (let i = 0; i < values.length && !found; i += 1) {
      probe(i, 'Linear comparison');
    }
  }

  if (!found) emit('failed', visited.length ? visited[visited.length - 1] : -1, 7, 'Target was not found');
  emit('complete', -1, 7, 'Search complete');
  return completeResponse(steps, values, { ...stats, visitedNodes: visited.length });
};

const runStructure = (category: AlgorithmCategory, id: string, operation?: string): StepResponse => {
  const steps: AnimationStep[] = [];
  const nodes = category === 'Trees' ? ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7'] : ['N1', 'N2', 'N3', 'N4', 'N5'];
  const selectedAction = operation?.split('-')[0] as AnimationStep['action'] | undefined;
  const actions: AnimationStep['action'][] = selectedAction
    ? ['pointer', selectedAction, 'visit']
    : category === 'Stack'
      ? ['push', 'push', 'peek', 'pop', 'push']
      : category === 'Queue'
        ? ['enqueue', 'enqueue', 'dequeue', 'enqueue', 'peek']
        : category === 'Trees'
          ? ['visit', 'pointer', 'visit', 'insert', 'visit', 'delete', 'complete']
          : ['insert', 'pointer', 'visit', 'insert', 'delete'];

  actions.forEach((action, index) => {
    steps.push({
      action,
      index: Math.min(index, nodes.length - 1),
      i: Math.min(index, nodes.length - 1),
      node: nodes[Math.min(index, nodes.length - 1)],
      line: Math.min(index + 1, 5),
      note: `${id} ${action} operation`
    });
  });

  if (steps[steps.length - 1]?.action !== 'complete') {
    steps.push({ action: 'complete', index: -1, i: -1, line: 6, note: 'Structure operation complete' });
  }

  return completeResponse(steps, [], {
    ...emptyStats,
    visitedNodes: steps.filter((step) => step.node).length,
    recursionDepth: category === 'Trees' ? 3 : 0
  });
};

const runGraph = (id: string): StepResponse => {
  const visitOrder = id === 'dfs' ? ['A', 'D', 'E', 'F', 'B', 'C'] : ['A', 'B', 'D', 'C', 'E', 'F'];
  const edgeOrder: Array<[string, string]> =
    id === 'dfs'
      ? [['A', 'D'], ['D', 'E'], ['E', 'F'], ['A', 'B'], ['B', 'C'], ['B', 'E']]
      : [['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'E'], ['D', 'E'], ['E', 'F']];
  const steps: AnimationStep[] = [];

  visitOrder.forEach((node, index) => {
    steps.push({
      action: 'visit',
      node,
      line: 4,
      note: `${id} visits node ${node}`
    });
    steps.push({
      action: id === 'dijkstra' || id === 'prim' ? 'relax' : 'edge',
      edge: edgeOrder[index % edgeOrder.length],
      cost: index + 1,
      line: 5,
      note: id === 'kruskal' ? 'Choose safe edge' : 'Inspect graph edge'
    });
  });
  steps.push({ action: 'complete', line: 6, note: 'Graph algorithm complete' });

  return completeResponse(steps, [], {
    ...emptyStats,
    visitedNodes: visitOrder.length,
    edgesTraversed: edgeOrder.length,
    totalCost: edgeOrder.length
  });
};

export const runLocalAlgorithm = (category: AlgorithmCategory, id: string, array: number[], target: number, operation?: string): StepResponse => {
  if (category === 'Sorting') return runSorting(id, array);
  if (category === 'Searching') return runSearching(id, array, target);
  if (category === 'Graphs') return runGraph(id);
  if (category === 'Linked List' || category === 'Stack' || category === 'Queue' || category === 'Trees') return runStructure(category, id, operation);
  if (category === 'Dynamic Programming') {
    const values = [1, 1, 2, 3, 5, 8, 13, 21];
    const steps = values.map((value, index): AnimationStep => ({
      action: 'overwrite',
      index,
      i: index,
      value,
      line: Math.min(index + 1, 5),
      note: `Fill DP state ${index}`,
      snapshot: values.slice(0, index + 1)
    }));
    steps.push({ action: 'complete', index: -1, i: -1, line: 6, note: 'Dynamic programming trace complete', snapshot: values });
    return completeResponse(steps, values, { ...emptyStats, recursionDepth: 1 });
  }
  return completeResponse(
    [{ action: 'complete', index: -1, i: -1, note: 'Backend connection is required for this visualization.', snapshot: [...array] }],
    array
  );
};
