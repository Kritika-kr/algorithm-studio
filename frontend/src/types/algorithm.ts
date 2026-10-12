export type AlgorithmCategory =
  | 'Sorting'
  | 'Searching'
  | 'Linked List'
  | 'Stack'
  | 'Queue'
  | 'Trees'
  | 'Graphs'
  | 'Dynamic Programming';

export type StepAction =
  | 'compare'
  | 'highlight'
  | 'found'
  | 'failed'
  | 'swap'
  | 'overwrite'
  | 'mark-sorted'
  | 'pivot'
  | 'visit'
  | 'insert'
  | 'delete'
  | 'search'
  | 'reverse'
  | 'clear'
  | 'is-empty'
  | 'push'
  | 'pop'
  | 'peek'
  | 'enqueue'
  | 'dequeue'
  | 'pointer'
  | 'edge'
  | 'relax'
  | 'complete';

export interface AnimationStep {
  action: StepAction;
  index?: number;
  i?: number;
  j?: number;
  value?: number;
  values?: number[];
  visited?: number[];
  found?: boolean;
  node?: string;
  target?: string;
  edge?: [string, string];
  cost?: number;
  line?: number;
  note: string;
  snapshot?: number[];
}

export interface AlgorithmStats {
  comparisons: number;
  swaps: number;
  reads?: number;
  writes?: number;
  recursionDepth: number;
  visitedNodes: number;
  edgesTraversed?: number;
  totalCost?: number;
  height?: number;
  currentIndex?: number;
  traversalOrder?: string[];
  executionTimeMs: number;
  memoryBytes: number;
}

export interface StepResponse {
  steps: AnimationStep[];
  stats: AlgorithmStats;
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  howItWorks: string[];
  applications: string[];
  advantages: string[];
  disadvantages: string[];
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  pseudocode: string[];
  code: Record<'cpp' | 'java' | 'python' | 'javascript', string[]>;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}
