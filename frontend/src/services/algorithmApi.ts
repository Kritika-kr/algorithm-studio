import { defaultGraphEdges, defaultGraphNodes } from '../data/algorithms';
import { AlgorithmCategory, GraphEdge, GraphNode, StepResponse } from '../types/algorithm';
import { runLocalAlgorithm } from './localAlgorithmRunner';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export interface AlgorithmRequest {
  id: string;
  category: AlgorithmCategory;
  array: number[];
  target: number;
  operation?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  directed?: boolean;
}

export const requestAnimationSteps = async (request: AlgorithmRequest): Promise<StepResponse> => {
  const routeCategory = request.category === 'Graphs' ? 'graphs' : request.category.toLowerCase().replace(/\s+/g, '-');
  const endpoint = `${API_URL}/api/algorithms/${routeCategory}/${request.id}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        array: request.array,
        target: request.target,
        operation: request.operation,
        nodes: request.nodes ?? defaultGraphNodes,
        edges: request.edges ?? defaultGraphEdges,
        directed: request.directed ?? false
      })
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    return (await response.json()) as StepResponse;
  } catch (error) {
    console.warn('Using local animation fallback because the backend request failed.', error);
    return runLocalAlgorithm(request.category, request.id, request.array, request.target, request.operation, request.nodes, request.edges, request.directed);
  }
};
