import { AlgorithmCategory, AlgorithmStats, AnimationStep, StepResponse } from '../types/algorithm';
import { defaultGraphEdges } from '../data/algorithms';

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
  } else if (id === 'shell-sort') {
    for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < values.length; i += 1) {
        const value = values[i];
        let j = i;
        while (j >= gap) {
          compare(j - gap, j, `Compare elements ${gap} apart`);
          if (values[j - gap] <= value) break;
          values[j] = values[j - gap]; emit('overwrite', j, undefined, 4, `Shift by gap ${gap}`);
          j -= gap;
        }
        values[j] = value; emit('overwrite', j, undefined, 4, 'Insert gapped value');
      }
    }
  } else if (id === 'cocktail-sort') {
    let start = 0;
    let end = values.length - 1;
    while (start < end) {
      let changed = false;
      for (let i = start; i < end; i += 1) { compare(i, i + 1); if (values[i] > values[i + 1]) { swap(i, i + 1); changed = true; } }
      end -= 1;
      for (let i = end; i > start; i -= 1) { compare(i - 1, i); if (values[i - 1] > values[i]) { swap(i - 1, i); changed = true; } }
      start += 1;
      if (!changed) break;
    }
  } else if (id === 'counting-sort') {
    if (values.length) {
      const min = Math.min(...values); const max = Math.max(...values);
      if (max - min <= 10000) {
        const counts = Array(max - min + 1).fill(0) as number[];
        values.forEach((value, index) => { counts[value - min] += 1; stats.comparisons += 1; emit('visit', index, undefined, 2, `Count ${value}`); });
        let write = 0;
        counts.forEach((count, offset) => { for (let n = 0; n < count; n += 1) overwrite(write++, offset + min); });
      } else {
        const sorted = [...values].sort((a, b) => a - b);
        sorted.forEach((value, index) => overwrite(index, value));
      }
    }
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
  } else if (id === 'exponential-search') {
    if (values[0] === target) probe(0, 'Check first element');
    else {
      let bound = 1;
      while (bound < values.length && values[bound] < target) { probe(bound, 'Expand search range'); bound *= 2; }
      let low = Math.floor(bound / 2); let high = Math.min(bound, values.length - 1);
      while (low <= high && !found) { const mid = low + Math.floor((high - low) / 2); probe(mid, 'Binary search in range'); if (values[mid] < target) low = mid + 1; else high = mid - 1; }
    }
  } else if (id === 'ternary-search') {
    let left = 0; let right = values.length - 1;
    while (left <= right && !found) {
      const third = Math.floor((right - left) / 3); const m1 = left + third; const m2 = right - third;
      probe(m1, 'Probe first third'); if (!found && m2 !== m1) probe(m2, 'Probe second third');
      if (target < values[m1]) right = m1 - 1; else if (target > values[m2]) left = m2 + 1; else { left = m1 + 1; right = m2 - 1; }
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

const runStructure = (category: AlgorithmCategory, id: string, operation?: string, target = 42, input: number[] = []): StepResponse => {
  const values = input.length ? [...input] : category === 'Stack' ? [18, 31, 44] : category === 'Queue' ? [7, 14, 21] : [12, 24, 36, 48];
  const steps: AnimationStep[] = [];
  const command = operation?.replace(/-\d+$/, '') ?? '';
  const selected = command.split('-')[0] as AnimationStep['action'] | undefined;
  const emit = (action: AnimationStep['action'], index: number, note: string) => steps.push({
    action, index, i: index, value: values[index], snapshot: [...values],
    node: category === 'Trees' ? `N${Math.max(1, index + 1)}` : undefined,
    line: Math.max(1, Math.min(6, steps.length + 1)), note
  });

  if (category === 'Trees') {
    const traversals: Record<string, string[]> = {
      inorder: ['N4', 'N2', 'N5', 'N1', 'N6', 'N3', 'N7'],
      preorder: ['N1', 'N2', 'N4', 'N5', 'N3', 'N6', 'N7'],
      postorder: ['N4', 'N5', 'N2', 'N6', 'N7', 'N3', 'N1'],
      levelorder: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7']
    };
    const order = traversals[command] ?? ['N1', 'N2', 'N4', 'N5', 'N3', 'N6', 'N7'];
    order.forEach((node, index) => steps.push({ action: 'visit', node, index, i: Number(node.slice(1)) - 1, line: 3, note: `${command || 'traversal'}: visit ${node}` }));
  } else if (selected === 'push' || selected === 'enqueue' || selected === 'insert') {
    const atHead = command.endsWith('-head');
    if (atHead) values.unshift(target);
    else values.push(target);
    emit(selected, atHead ? 0 : values.length - 1, `${selected} ${target} ${atHead ? 'at head' : 'at tail'}`);
  } else if (selected === 'pop' || selected === 'dequeue' || selected === 'delete') {
    const index = category === 'Stack' || command.endsWith('-tail') ? values.length - 1 : 0;
    if (values.length) {
      const removed = values.splice(index, 1)[0];
      emit(selected, Math.max(0, index), `${selected} ${removed}`);
    } else emit('failed', -1, 'Structure is empty');
  } else if (selected === 'peek') {
    const index = category === 'Stack' ? values.length - 1 : 0;
    if (values.length) emit('peek', index, `Peek ${values[index]}`);
    else emit('failed', -1, 'Structure is empty');
  } else if (selected === 'search' || selected === 'visit') {
    const index = values.indexOf(target);
    if (index >= 0) emit('found', index, `Found ${target}`);
    else emit('failed', -1, `${target} is not present`);
  } else if (selected === 'reverse') {
    values.reverse(); emit('reverse', 0, 'Reverse list');
  } else if (selected === 'clear') {
    values.splice(0); emit('clear', -1, 'Clear structure');
  } else if (command === 'is-empty') {
    emit('is-empty', -1, values.length ? 'Structure is not empty' : 'Structure is empty');
  } else {
    values.forEach((_, index) => emit('visit', index, `Visit ${values[index]}`));
  }
  steps.push({ action: 'complete', index: -1, i: -1, snapshot: [...values], line: 6, note: 'Operation complete' });
  return completeResponse(steps, values, { ...emptyStats, visitedNodes: steps.filter((step) => step.node).length, recursionDepth: category === 'Trees' ? 3 : 0 });
};

const runGraph = (id: string): StepResponse => {
  const steps: AnimationStep[] = [];
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
  const adjacency = new Map(nodes.map((node) => [node, [] as Array<{ node: string; weight: number }> ]));
  defaultGraphEdges.forEach(({ source, target, weight }) => {
    adjacency.get(source)?.push({ node: target, weight });
    adjacency.get(target)?.push({ node: source, weight });
  });
  const visit = (node: string, note = `Visit ${node}`) => steps.push({ action: 'visit', node, line: 4, note });
  const edgeStep = (a: string, b: string, weight: number, note: string, action: AnimationStep['action'] = 'edge') => steps.push({ action, edge: [a, b], cost: weight, line: 5, note });
  const visited = new Set<string>();
  let totalCost = 0;

  if (id === 'bfs' || id === 'dfs') {
    const walk = (start: string) => {
      if (visited.has(start)) return;
      const frontier = [start];
      visited.add(start);
      while (frontier.length) {
        const node = id === 'bfs' ? frontier.shift()! : frontier.pop()!;
        visit(node, `${id.toUpperCase()} visits ${node}`);
        const neighbors = [...(adjacency.get(node) ?? [])];
        if (id === 'dfs') neighbors.reverse();
        neighbors.forEach(({ node: next, weight }) => {
          edgeStep(node, next, weight, `Inspect ${node}–${next}`);
          if (!visited.has(next)) { visited.add(next); frontier.push(next); }
        });
      }
    };
    walk('A');
  } else if (id === 'dijkstra') {
    const distance = Object.fromEntries(nodes.map((node) => [node, Infinity])) as Record<string, number>;
    distance.A = 0;
    const done = new Set<string>();
    while (done.size < nodes.length) {
      const current = nodes.filter((node) => !done.has(node)).sort((a, b) => distance[a] - distance[b])[0];
      if (!current || distance[current] === Infinity) break;
      done.add(current); visit(current, `Settle ${current} at distance ${distance[current]}`);
      (adjacency.get(current) ?? []).forEach(({ node: next, weight }) => {
        if (done.has(next)) return;
        const candidate = distance[current] + weight;
        edgeStep(current, next, candidate, `Try distance ${candidate} to ${next}`, 'relax');
        if (candidate < distance[next]) distance[next] = candidate;
      });
    }
  } else if (id === 'prim') {
    const inTree = new Set(['A']); visit('A', 'Start spanning tree at A');
    while (inTree.size < nodes.length) {
      const candidates = defaultGraphEdges.filter((edge) => inTree.has(edge.source) !== inTree.has(edge.target)).sort((a, b) => a.weight - b.weight);
      const edge = candidates[0]; if (!edge) break;
      edgeStep(edge.source, edge.target, edge.weight, `Add minimum crossing edge (${edge.weight})`, 'relax');
      totalCost += edge.weight;
      const next = inTree.has(edge.source) ? edge.target : edge.source; inTree.add(next); visit(next, `Add ${next} to the spanning tree`);
    }
  } else if (id === 'kruskal') {
    const parent = Object.fromEntries(nodes.map((node) => [node, node])) as Record<string, string>;
    const find = (node: string): string => parent[node] === node ? node : (parent[node] = find(parent[node]));
    [...defaultGraphEdges].sort((a, b) => a.weight - b.weight).forEach((edge) => {
      const a = find(edge.source); const b = find(edge.target);
      edgeStep(edge.source, edge.target, edge.weight, a !== b ? `Accept edge (${edge.weight})` : 'Reject cycle edge');
      if (a !== b) { parent[a] = b; totalCost += edge.weight; visited.add(edge.source); visited.add(edge.target); }
    });
    visited.forEach((node) => visit(node, `Node ${node} belongs to the minimum spanning forest`));
  } else if (id === 'topological-sort') {
    const indegree = Object.fromEntries(nodes.map((node) => [node, 0])) as Record<string, number>;
    defaultGraphEdges.forEach(({ target }) => { indegree[target] += 1; });
    const ready = nodes.filter((node) => indegree[node] === 0);
    while (ready.length) {
      const node = ready.shift()!; visit(node, `Emit ${node} in topological order`);
      defaultGraphEdges.filter((edge) => edge.source === node).forEach((edge) => {
        edgeStep(edge.source, edge.target, edge.weight, `Remove dependency ${edge.source} → ${edge.target}`);
        indegree[edge.target] -= 1; if (indegree[edge.target] === 0) ready.push(edge.target);
      });
    }
    if (steps.filter((step) => step.action === 'visit').length < nodes.length) steps.push({ action: 'failed', line: 6, note: 'Directed graph contains a cycle' });
  }
  steps.push({ action: 'complete', line: 6, note: 'Graph algorithm complete' });

  return completeResponse(steps, [], {
    ...emptyStats,
    visitedNodes: steps.filter((step) => step.action === 'visit').length,
    edgesTraversed: steps.filter((step) => step.action === 'edge' || step.action === 'relax').length,
    totalCost
  });
};

export const runLocalAlgorithm = (category: AlgorithmCategory, id: string, array: number[], target: number, operation?: string): StepResponse => {
  if (category === 'Sorting') return runSorting(id, array);
  if (category === 'Searching') return runSearching(id, array, target);
  if (category === 'Graphs') return runGraph(id);
  if (category === 'Linked List' || category === 'Stack' || category === 'Queue' || category === 'Trees') return runStructure(category, id, operation, target, array);
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
