import { defaultGraphEdges, defaultGraphNodes } from '../data/algorithms';
import { AlgorithmCategory, StepResponse } from '../types/algorithm';
import { runLocalAlgorithm } from './localAlgorithmRunner';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export interface AlgorithmRequest {
  id: string;
  category: AlgorithmCategory;
  array: number[];
  target: number;
  operation?: string;
}

export const requestAnimationSteps = async (request: AlgorithmRequest): Promise<StepResponse> => {
  if (request.category !== 'Sorting' && request.category !== 'Searching') {
    return runLocalAlgorithm(request.category, request.id, request.array, request.target, request.operation);
  }

  const endpoint = `${API_URL}/api/algorithms/${request.category.toLowerCase().replace(/\s+/g, '-')}/${request.id}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: request.array, target: request.target, nodes: defaultGraphNodes, edges: defaultGraphEdges })
    });
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    return (await response.json()) as StepResponse;
  } catch (error) {
    console.warn('Using local animation fallback because the backend request failed.', error);
    return runLocalAlgorithm(request.category, request.id, request.array, request.target, request.operation);
  }
};
