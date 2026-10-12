import { GraphEdge, GraphNode } from '../types/algorithm';

export function validateGraph(algorithm: string, nodes: GraphNode[], edges: GraphEdge[], directed: boolean): string | null {
  const ids = nodes.map(({ id }) => id.trim());
  if (!ids.length) return 'Add at least one node to the graph.';
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) return 'Node IDs must be non-empty and unique.';
  if (edges.some(({ source, target, weight }) => !ids.includes(source) || !ids.includes(target) || !Number.isSafeInteger(weight))) return 'Every edge must connect existing nodes and have a finite integer weight.';
  if (algorithm === 'dijkstra' && edges.some(({ weight }) => weight < 0)) return 'Dijkstra requires non-negative edge weights.';
  if ((algorithm === 'prim' || algorithm === 'kruskal') && directed) return 'Prim and Kruskal require an undirected graph.';
  if (algorithm !== 'topological-sort') return null;
  if (!directed) return 'Topological sort requires a directed graph.';
  const degree = new Map(ids.map((id) => [id, 0]));
  const outgoing = new Map(ids.map((id) => [id, [] as string[]]));
  edges.forEach(({ source, target }) => { outgoing.get(source)!.push(target); degree.set(target, degree.get(target)! + 1); });
  const ready = ids.filter((id) => degree.get(id) === 0);
  let visited = 0;
  while (ready.length) {
    const id = ready.shift()!; visited += 1;
    outgoing.get(id)!.forEach((next) => { degree.set(next, degree.get(next)! - 1); if (degree.get(next) === 0) ready.push(next); });
  }
  return visited === ids.length ? null : 'Topological sort requires an acyclic graph; remove an edge that creates a cycle.';
}
