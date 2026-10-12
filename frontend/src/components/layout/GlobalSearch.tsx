import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Terminal, 
  History, 
  TrendingUp, 
  Sparkles, 
  GitCompare, 
  Moon, 
  Sun, 
  Compass, 
  Play
} from 'lucide-react';
import { AlgorithmCategory } from '../../types/algorithm';
import { algorithms } from '../../data/algorithms';

// --- Type Definitions ---
export interface SearchItem {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity?: string;
  tags: string[];
  type: 'algorithm' | 'data-structure' | 'category' | 'page' | 'command';
  route: {
    view: AlgorithmCategory | 'Home' | 'Compare' | 'Favorites';
    id?: string;
    compareLeft?: string;
    compareRight?: string;
    autoPlay?: boolean;
  };
}

interface SearchAnalytics {
  recentSearches: string[];
  mostOpened: Record<string, number>;
  comparedPairs: Record<string, number>;
  searchCount: number;
}

interface GlobalSearchProps {
  dark: boolean;
  onTheme: () => void;
  setDark: (dark: boolean) => void;
  onNavigate: (
    view: AlgorithmCategory | 'Home' | 'Compare' | 'Favorites', 
    id?: string, 
    compareLeft?: string, 
    compareRight?: string,
    autoPlay?: boolean
  ) => void;
}

const defaultAnalytics: SearchAnalytics = {
  recentSearches: [],
  mostOpened: {},
  comparedPairs: {},
  searchCount: 0
};

const readSearchAnalytics = (): SearchAnalytics => {
  try {
    const parsed = JSON.parse(localStorage.getItem('search-analytics') ?? 'null') as Partial<SearchAnalytics> | null;
    return {
      recentSearches: Array.isArray(parsed?.recentSearches)
        ? parsed.recentSearches.filter((item): item is string => typeof item === 'string')
        : [],
      mostOpened: parsed?.mostOpened && typeof parsed.mostOpened === 'object' ? parsed.mostOpened : {},
      comparedPairs: parsed?.comparedPairs && typeof parsed.comparedPairs === 'object' ? parsed.comparedPairs : {},
      searchCount: typeof parsed?.searchCount === 'number' ? parsed.searchCount : 0
    };
  } catch (_) {
    return defaultAnalytics;
  }
};

// --- Levenshtein Distance for Spelling Check ---
const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
};

// --- Static Search Catalog ---
const STATIC_SEARCH_CATALOG: SearchItem[] = [
  // Algorithms
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    description: 'Simple comparison sort that repeatedly swaps adjacent elements.',
    complexity: 'O(n²)',
    tags: ['stable', 'in-place', 'sorting', 'adjacent', 'naive', 'quadratic'],
    type: 'algorithm',
    route: { view: 'Sorting', id: 'bubble-sort' }
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    description: 'Finds the minimum element from the unsorted part and puts it first.',
    complexity: 'O(n²)',
    tags: ['unstable', 'in-place', 'sorting', 'minimum', 'quadratic'],
    type: 'algorithm',
    route: { view: 'Sorting', id: 'selection-sort' }
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    description: 'Builds the sorted array element-by-element by shifting items.',
    complexity: 'O(n²)',
    tags: ['stable', 'in-place', 'sorting', 'adaptive', 'online', 'quadratic'],
    type: 'algorithm',
    route: { view: 'Sorting', id: 'insertion-sort' }
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    description: 'Divide-and-conquer algorithm that recursively merges sorted halves.',
    complexity: 'O(n log n)',
    tags: ['stable', 'out-of-place', 'sorting', 'recursive', 'divide and conquer', 'logarithmic'],
    type: 'algorithm',
    route: { view: 'Sorting', id: 'merge-sort' }
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    description: 'Partitions array around a pivot and recursively sorts subarrays.',
    complexity: 'O(n log n)',
    tags: ['unstable', 'in-place', 'sorting', 'recursive', 'partition', 'divide and conquer', 'logarithmic'],
    type: 'algorithm',
    route: { view: 'Sorting', id: 'quick-sort' }
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'Sorting',
    description: 'Builds a binary heap tree to extract maximum values successively.',
    complexity: 'O(n log n)',
    tags: ['unstable', 'in-place', 'sorting', 'heap', 'tree', 'logarithmic'],
    type: 'algorithm',
    route: { view: 'Sorting', id: 'heap-sort' }
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching',
    description: 'Checks elements sequentially until target matches.',
    complexity: 'O(n)',
    tags: ['unstable', 'searching', 'sequential', 'array', 'brute force'],
    type: 'algorithm',
    route: { view: 'Searching', id: 'linear-search' }
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    description: 'Divides search range in half recursively on a sorted array.',
    complexity: 'O(log n)',
    tags: ['stable', 'searching', 'sorted', 'divide and conquer', 'logarithmic'],
    type: 'algorithm',
    route: { view: 'Searching', id: 'binary-search' }
  },
  {
    id: 'jump-search',
    name: 'Jump Search',
    category: 'Searching',
    description: 'Jumps by blocks of size √n, then performs linear search.',
    complexity: 'O(√n)',
    tags: ['searching', 'block', 'jump', 'sorted'],
    type: 'algorithm',
    route: { view: 'Searching', id: 'jump-search' }
  },
  {
    id: 'interpolation-search',
    name: 'Interpolation Search',
    category: 'Searching',
    description: 'Estimates target position based on values at bounds.',
    complexity: 'O(log log n)',
    tags: ['searching', 'uniform distribution', 'sorted'],
    type: 'algorithm',
    route: { view: 'Searching', id: 'interpolation-search' }
  },
  {
    id: 'bfs',
    name: 'BFS (Breadth-First Search)',
    category: 'Graphs',
    description: 'Explores adjacent vertices first using a queue.',
    complexity: 'O(V + E)',
    tags: ['graph', 'traversal', 'queue', 'shortest path'],
    type: 'algorithm',
    route: { view: 'Graphs', id: 'bfs' }
  },
  {
    id: 'dfs',
    name: 'DFS (Depth-First Search)',
    category: 'Graphs',
    description: 'Explores deep down each path before backtracking.',
    complexity: 'O(V + E)',
    tags: ['graph', 'traversal', 'stack', 'recursive'],
    type: 'algorithm',
    route: { view: 'Graphs', id: 'dfs' }
  },
  {
    id: 'dijkstra',
    name: 'Dijkstra Shortest Path',
    category: 'Graphs',
    description: 'Finds the single-source shortest path using a min-heap.',
    complexity: 'O(E log V)',
    tags: ['graph', 'shortest path', 'greedy', 'priority queue', 'weight'],
    type: 'algorithm',
    route: { view: 'Graphs', id: 'dijkstra' }
  },
  {
    id: 'prim',
    name: 'Prim Minimum Spanning Tree',
    category: 'Graphs',
    description: 'Grows a minimum spanning tree from a starting vertex.',
    complexity: 'O(E log V)',
    tags: ['graph', 'minimum spanning tree', 'mst', 'greedy'],
    type: 'algorithm',
    route: { view: 'Graphs', id: 'prim' }
  },
  {
    id: 'kruskal',
    name: 'Kruskal Minimum Spanning Tree',
    category: 'Graphs',
    description: 'Sorts all edges and connects components without cycle loops.',
    complexity: 'O(E log E)',
    tags: ['graph', 'minimum spanning tree', 'mst', 'greedy', 'union-find', 'disjoint set'],
    type: 'algorithm',
    route: { view: 'Graphs', id: 'kruskal' }
  },
  {
    id: 'topological-sort',
    name: 'Topological Sort',
    category: 'Graphs',
    description: 'Arranges directed acyclic graph vertices in prerequisite order.',
    complexity: 'O(V + E)',
    tags: ['graph', 'ordering', 'prerequisites', 'dag'],
    type: 'algorithm',
    route: { view: 'Graphs', id: 'topological-sort' }
  },

  // Data Structures
  {
    id: 'array',
    name: 'Array Operations',
    category: 'Data Structures',
    description: 'Contiguous block of fixed size elements.',
    tags: ['data structure', 'array', 'contiguous', 'static'],
    type: 'data-structure',
    route: { view: 'Sorting' }
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    category: 'Data Structures',
    description: 'Nodes linked with next/prev pointers.',
    tags: ['data structure', 'linked list', 'pointers', 'sequential'],
    type: 'data-structure',
    route: { view: 'Linked List', id: 'linked-list' }
  },
  {
    id: 'stack',
    name: 'Stack (LIFO)',
    category: 'Data Structures',
    description: 'Last-In First-Out data stack operations.',
    tags: ['data structure', 'stack', 'lifo', 'push', 'pop'],
    type: 'data-structure',
    route: { view: 'Stack', id: 'stack' }
  },
  {
    id: 'queue',
    name: 'Queue (FIFO)',
    category: 'Data Structures',
    description: 'First-In First-Out linear line queue.',
    tags: ['data structure', 'queue', 'fifo', 'enqueue', 'dequeue'],
    type: 'data-structure',
    route: { view: 'Queue', id: 'queue' }
  },
  {
    id: 'circular-queue',
    name: 'Circular Queue',
    category: 'Data Structures',
    description: 'Ring buffer queue where tail wraps around to head.',
    tags: ['data structure', 'circular queue', 'ring buffer', 'fifo'],
    type: 'data-structure',
    route: { view: 'Queue', id: 'queue' }
  },
  {
    id: 'binary-tree',
    name: 'Binary Tree',
    category: 'Data Structures',
    description: 'Hierarchical tree node nodes with left/right children.',
    tags: ['data structure', 'tree', 'binary tree', 'traversals'],
    type: 'data-structure',
    route: { view: 'Trees', id: 'bst' }
  },
  {
    id: 'bst',
    name: 'Binary Search Tree (BST)',
    category: 'Data Structures',
    description: 'Ordered binary tree where left < node < right.',
    complexity: 'O(log n)',
    tags: ['data structure', 'tree', 'binary search tree', 'bst', 'logarithmic'],
    type: 'data-structure',
    route: { view: 'Trees', id: 'bst' }
  },
  {
    id: 'heap',
    name: 'Binary Heap',
    category: 'Data Structures',
    description: 'Complete binary tree holding the heap order property.',
    tags: ['data structure', 'tree', 'heap', 'priority queue'],
    type: 'data-structure',
    route: { view: 'Trees', id: 'bst' }
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    category: 'Data Structures',
    description: 'Fast character string key prefix retrieval tree.',
    tags: ['data structure', 'tree', 'trie', 'prefix'],
    type: 'data-structure',
    route: { view: 'Trees', id: 'bst' }
  },
  {
    id: 'graph',
    name: 'Graph Structure',
    category: 'Data Structures',
    description: 'Nodes connected by directed or undirected edges.',
    tags: ['data structure', 'graph', 'vertices', 'edges', 'adjacency list'],
    type: 'data-structure',
    route: { view: 'Graphs', id: 'bfs' }
  },

  // Categories
  {
    id: 'cat-sorting',
    name: 'Sorting Studio',
    category: 'Categories',
    description: 'Study Bubble, Insertion, Selection, Merge, Quick, and Heap Sort.',
    tags: ['sorting', 'algorithms', 'order', 'comparison'],
    type: 'category',
    route: { view: 'Sorting' }
  },
  {
    id: 'cat-searching',
    name: 'Searching Studio',
    category: 'Categories',
    description: 'Linear, Binary, Jump, and Interpolation search strategies.',
    tags: ['searching', 'algorithms', 'lookup', 'find'],
    type: 'category',
    route: { view: 'Searching' }
  },
  {
    id: 'cat-trees',
    name: 'Tree Workspaces',
    category: 'Categories',
    description: 'Learn Binary Search Tree lookups, insertions, and operations.',
    tags: ['trees', 'bst', 'avl', 'trie'],
    type: 'category',
    route: { view: 'Trees' }
  },
  {
    id: 'cat-graphs',
    name: 'Graph Workspaces',
    category: 'Categories',
    description: 'Visualize Breadth-First, Depth-First, Dijkstra, Prim, and Kruskal.',
    tags: ['graphs', 'bfs', 'dfs', 'shortest path', 'mst'],
    type: 'category',
    route: { view: 'Graphs' }
  },
  {
    id: 'cat-dp',
    name: 'Dynamic Programming',
    category: 'Categories',
    description: 'Optimize subproblems via memoization and state tabulation.',
    tags: ['dynamic programming', 'dp', 'memoization'],
    type: 'category',
    route: { view: 'Dynamic Programming' }
  }
];

// Keep search in sync with the actual algorithm catalog so newly added algorithms
// are immediately discoverable without maintaining a second list by hand.
const staticSearchIds = new Set(STATIC_SEARCH_CATALOG.map((item) => item.id));
const SEARCH_CATALOG: SearchItem[] = [
  ...STATIC_SEARCH_CATALOG,
  ...algorithms.filter((algorithm) => !staticSearchIds.has(algorithm.id)).map((algorithm): SearchItem => ({
    id: algorithm.id,
    name: algorithm.name,
    category: algorithm.category,
    description: algorithm.description,
    complexity: algorithm.complexity.average,
    tags: [algorithm.category.toLowerCase(), algorithm.id.replace(/-/g, ' ')],
    type: 'algorithm',
    route: { view: algorithm.category, id: algorithm.id }
  }))
];

export const GlobalSearch = ({ dark, onTheme, setDark, onNavigate }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [paletteQuery, setPaletteQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  
  // Highlight indexing position
  const [selectedIndex, setSelectedIndex] = useState(0);

  // References
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // --- Search Analytics State ---
  const [analytics, setAnalytics] = useState<SearchAnalytics>(readSearchAnalytics);

  // Sync analytics to localStorage
  const updateAnalytics = (next: Partial<SearchAnalytics>) => {
    setAnalytics((prev) => {
      const updated = { ...prev, ...next };
      localStorage.setItem('search-analytics', JSON.stringify(updated));
      return updated;
    });
  };

  // Close dropdown or palette on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (paletteOpen && modalContainerRef.current && !modalContainerRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [paletteOpen]);

  // Ctrl/Cmd+K focuses the navbar search; Ctrl+P keeps the command palette shortcut.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(false);
        setDropdownOpen(true);
        searchInputRef.current?.focus();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus palette input when opened and close navbar dropdown
  useEffect(() => {
    if (paletteOpen) {
      setDropdownOpen(false);
      setPaletteQuery('');
      setTimeout(() => paletteInputRef.current?.focus(), 80);
      setSelectedIndex(0);
    }
  }, [paletteOpen]);

  // --- Popular List ---
  const popularItems = useMemo(() => {
    const ids = ['quick-sort', 'merge-sort', 'binary-search', 'bfs', 'dfs'];
    return SEARCH_CATALOG.filter(item => ids.includes(item.id));
  }, []);

  // --- Search Index & Filter ---
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    // Filter items based on matches
    const results = SEARCH_CATALOG.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(trimmed);
      const descMatch = item.description.toLowerCase().includes(trimmed);
      const categoryMatch = item.category.toLowerCase().includes(trimmed);
      const complexityMatch = item.complexity?.toLowerCase().includes(trimmed);
      const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(trimmed));

      return nameMatch || descMatch || categoryMatch || complexityMatch || tagsMatch;
    });

    return results;
  }, [query]);

  // --- Typo Suggestion Helper ---
  const typoSuggestion = useMemo(() => {
    if (query.trim().length < 3 || filteredResults.length > 0) return null;
    const trimmed = query.trim().toLowerCase();
    
    let bestMatch: SearchItem | null = null;
    let lowestDistance = 999;

    for (const item of SEARCH_CATALOG) {
      const distance = getLevenshteinDistance(trimmed, item.name);
      if (distance < lowestDistance && distance <= 3) {
        lowestDistance = distance;
        bestMatch = item;
      }
    }
    return bestMatch;
  }, [query, filteredResults]);

  // --- AI Smart Suggestions Helper ---
  const aiSuggestions = useMemo((): SearchItem[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || filteredResults.length === 0) return [];
    
    // Pick the top matched item and generate synthetic suggestions
    const primary = filteredResults[0];
    if (primary.type !== 'algorithm') return [];

    return [
      {
        id: `ai-comp-${primary.id}`,
        name: `Compare ${primary.name} vs Merge Sort`,
        category: 'AI Suggestion',
        description: `Perform side-by-side run stats comparison.`,
        tags: [],
        type: 'command' as const,
        route: { view: 'Compare' as const, compareLeft: primary.id, compareRight: 'merge-sort' }
      },
      {
        id: `ai-code-${primary.id}`,
        name: `View ${primary.name} Code`,
        category: 'AI Suggestion',
        description: `Check C++, Python, Java & JS blocks.`,
        tags: [],
        type: 'command' as const,
        route: { ...primary.route, autoPlay: false }
      },
      {
        id: `ai-complexity-${primary.id}`,
        name: `Check ${primary.name} Complexity`,
        category: 'AI Suggestion',
        description: `Analyze asymptotic bounds: ${primary.complexity || 'O(n)'}.`,
        tags: [],
        type: 'command' as const,
        route: { ...primary.route, autoPlay: false }
      }
    ];
  }, [query, filteredResults]);

  // Combine results + AI suggestions
  const allSearchResults = useMemo(() => {
    return [...filteredResults, ...aiSuggestions];
  }, [filteredResults, aiSuggestions]);

  // Reset index whenever search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [paletteQuery]);

  // Handle selection of a search item
  const handleItemSelect = (item: SearchItem) => {
    // Record analytics
    const recent = [item.name, ...analytics.recentSearches.filter(s => s !== item.name)].slice(0, 10);
    const mostOpened = { ...analytics.mostOpened };
    mostOpened[item.id] = (mostOpened[item.id] || 0) + 1;

    updateAnalytics({
      recentSearches: recent,
      mostOpened,
      searchCount: analytics.searchCount + 1
    });

    setQuery('');
    setPaletteQuery('');
    setDropdownOpen(false);
    setPaletteOpen(false);
    
    // Perform navigation
    onNavigate(
      item.route.view, 
      item.route.id, 
      item.route.compareLeft, 
      item.route.compareRight,
      item.route.autoPlay ?? false
    );
  };

  // Keyboard navigation within suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
      setPaletteOpen(false);
      return;
    }
    const list = query.trim() ? allSearchResults : popularItems;
    if (list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % list.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + list.length) % list.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = list[Math.min(selectedIndex, list.length - 1)];
      if (selected) handleItemSelect(selected);
    }
  };

  // --- Command Palette Items ---
  const paletteItems = useMemo(() => {
    const trimmed = paletteQuery.trim().toLowerCase();
    
    const baseCommands: SearchItem[] = [
      // Navigation
      { id: 'cmd-dash', name: 'Open Dashboard', category: 'Navigation', description: 'Go to landing screen', tags: ['home', 'dashboard'], type: 'command', route: { view: 'Home' } },
      { id: 'cmd-comp', name: 'Open Comparison Lab', category: 'Navigation', description: 'Compare two visualizers', tags: ['compare', 'lab'], type: 'command', route: { view: 'Compare' } },
      { id: 'cmd-sort', name: 'Open Sorting Module', category: 'Navigation', description: 'Bubble, quick, merge sorts', tags: ['sorting'], type: 'command', route: { view: 'Sorting' } },
      { id: 'cmd-search', name: 'Open Searching Module', category: 'Navigation', description: 'Binary, linear search, etc.', tags: ['searching'], type: 'command', route: { view: 'Searching' } },
      { id: 'cmd-trees', name: 'Open Trees Module', category: 'Navigation', description: 'Tree structures and BST', tags: ['trees', 'bst'], type: 'command', route: { view: 'Trees' } },
      { id: 'cmd-graphs', name: 'Open Graphs Module', category: 'Navigation', description: 'BFS, DFS, Dijkstra', tags: ['graphs'], type: 'command', route: { view: 'Graphs' } },
      
      // Theme switching
      { 
        id: 'cmd-theme-dark', 
        name: 'Switch to Dark Mode', 
        category: 'Theme', 
        description: 'Activate dark theme layout', 
        tags: ['theme', 'dark', 'black'], 
        type: 'command', 
        route: { view: 'Home', autoPlay: false }
      },
      { 
        id: 'cmd-theme-light', 
        name: 'Switch to Light Mode', 
        category: 'Theme', 
        description: 'Activate light theme layout', 
        tags: ['theme', 'light', 'white'], 
        type: 'command', 
        route: { view: 'Home', autoPlay: false }
      },

      // Run commands
      { id: 'cmd-run-bubble', name: 'Run Bubble Sort', category: 'Run Algorithm', description: 'Load & auto-start Bubble Sort', tags: ['run', 'bubble'], type: 'command', route: { view: 'Sorting', id: 'bubble-sort', autoPlay: true } },
      { id: 'cmd-run-quick', name: 'Run Quick Sort', category: 'Run Algorithm', description: 'Load & auto-start Quick Sort', tags: ['run', 'quick'], type: 'command', route: { view: 'Sorting', id: 'quick-sort', autoPlay: true } },
      { id: 'cmd-run-merge', name: 'Run Merge Sort', category: 'Run Algorithm', description: 'Load & auto-start Merge Sort', tags: ['run', 'merge'], type: 'command', route: { view: 'Sorting', id: 'merge-sort', autoPlay: true } },
      { id: 'cmd-run-binary', name: 'Run Binary Search', category: 'Run Algorithm', description: 'Load & auto-start Binary Search', tags: ['run', 'binary'], type: 'command', route: { view: 'Searching', id: 'binary-search', autoPlay: true } },
      { id: 'cmd-run-bfs', name: 'Run BFS Graph Search', category: 'Run Algorithm', description: 'Load & auto-start BFS', tags: ['run', 'bfs'], type: 'command', route: { view: 'Graphs', id: 'bfs', autoPlay: true } },
      { id: 'cmd-run-dfs', name: 'Run DFS Graph Search', category: 'Run Algorithm', description: 'Load & auto-start DFS', tags: ['run', 'dfs', 'depth'], type: 'command', route: { view: 'Graphs', id: 'dfs', autoPlay: true } },

      // Comparison shortcuts
      { id: 'cmd-comp-bq', name: 'Compare Bubble vs Quick', category: 'Comparison Lab', description: 'Compare Bubble Sort and Quick Sort', tags: ['compare', 'bubble', 'quick'], type: 'command', route: { view: 'Compare', compareLeft: 'bubble-sort', compareRight: 'quick-sort' } },
      { id: 'cmd-comp-mh', name: 'Compare Merge vs Heap', category: 'Comparison Lab', description: 'Compare Merge Sort and Heap Sort', tags: ['compare', 'merge', 'heap'], type: 'command', route: { view: 'Compare', compareLeft: 'merge-sort', compareRight: 'heap-sort' } },
      { id: 'cmd-comp-bd', name: 'Compare BFS vs DFS', category: 'Comparison Lab', description: 'Compare BFS and DFS Graph searches', tags: ['compare', 'bfs', 'dfs'], type: 'command', route: { view: 'Compare', compareLeft: 'bfs', compareRight: 'dfs' } },
      { id: 'cmd-comp-bl', name: 'Compare Binary vs Linear Search', category: 'Comparison Lab', description: 'Compare Binary and Linear search', tags: ['compare', 'binary', 'linear'], type: 'command', route: { view: 'Compare', compareLeft: 'binary-search', compareRight: 'linear-search' } }
    ];

    if (!trimmed) return baseCommands;

    return baseCommands.filter(c => 
      c.name.toLowerCase().includes(trimmed) || 
      c.category.toLowerCase().includes(trimmed) || 
      c.tags.some(tag => tag.toLowerCase().includes(trimmed))
    );
  }, [paletteQuery]);

  // Execute palette command
  const handlePaletteSelect = (item: SearchItem) => {
    if (item.id === 'cmd-theme-dark') {
      setDark(true);
      setPaletteOpen(false);
      setPaletteQuery('');
      return;
    }
    if (item.id === 'cmd-theme-light') {
      setDark(false);
      setPaletteOpen(false);
      setPaletteQuery('');
      return;
    }

    handleItemSelect(item);
  };

  return (
    <>
      {/* 1. Global Navbar Search Box */}
      <div ref={searchContainerRef} className="relative flex min-w-0 flex-1">
        <div
          className="search-shell flex w-full min-w-0 max-w-[18rem] items-center gap-2 rounded-lg border px-3 py-2 text-slate-100 shadow-lg shadow-black/10 transition focus-within:border-cyan-300 sm:max-w-sm md:max-w-md"
          style={{ backgroundColor: dark ? '#0f172a' : '#ffffff' }}
        >
          <Search size={15} className="shrink-0 text-cyan-300" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onFocus={() => setDropdownOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search algorithms and data structures"
            aria-expanded={dropdownOpen}
            aria-controls="global-search-results"
            role="combobox"
            aria-autocomplete="list"
            placeholder="Search algorithms, operations, tags..."
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-400 md:text-sm"
          />
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[9px] font-medium text-slate-400">
            Ctrl K
          </kbd>
        </div>

        {/* 2. Global Dropdown Results */}
        {dropdownOpen && (
          <div
            id="global-search-results"
            role="listbox"
            className="search-dropdown absolute left-0 top-full z-[100] mt-2 max-h-[min(70vh,32rem)] w-[min(28rem,calc(100vw-5rem))] max-w-[calc(100vw-5rem)] overflow-y-auto overscroll-contain rounded-xl border p-3.5 shadow-2xl shadow-black/40 animate-fade-in-down"
            style={{ backgroundColor: dark ? '#020617' : '#ffffff' }}
          >
            {/* Empty Search - Display Recent and Popular */}
            {!query.trim() && (
              <div className="space-y-4">
                {analytics.recentSearches.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <History size={12} />
                      Recent Searches
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analytics.recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="rounded bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <TrendingUp size={12} />
                    Popular Algorithms
                  </h4>
                  <div className="space-y-1">
                    {popularItems.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 transition ${
                          selectedIndex === idx ? 'bg-cyan-300/10 border border-cyan-400/20' : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">⚡ {item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                        {item.complexity && (
                          <span className="rounded bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-200 uppercase">
                            {item.complexity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {query.trim() && allSearchResults.length > 0 && (
              <div className="space-y-1">
                {allSearchResults.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isAi = item.category === 'AI Suggestion';
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 border transition ${
                        isSelected 
                          ? 'bg-cyan-300/10 border-cyan-400/20' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="flex min-w-0 gap-2.5">
                        <span className="mt-0.5 text-cyan-200">
                          {isAi ? <Sparkles size={14} className="text-amber-400" /> : '⚡'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            {item.name}
                            <span className="shrink-0 whitespace-nowrap rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-normal uppercase tracking-wider text-slate-400">{item.category}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                      </div>
                      {item.complexity && (
                        <span className="rounded bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-200 uppercase">
                          {item.complexity}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Typo Auto-Suggestion */}
            {query.trim() && allSearchResults.length === 0 && (
              <div className="p-3 text-center">
                <div className="text-xs text-slate-400">No algorithms found.</div>
                {typoSuggestion && (
                  <div className="mt-2.5 text-xs text-slate-300">
                    Did you mean{' '}
                    <button
                      onClick={() => handleItemSelect(typoSuggestion!)}
                      className="text-cyan-300 underline font-semibold hover:text-cyan-200"
                    >
                      {typoSuggestion.name}
                    </button>
                    ?
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Global Command Palette Modal Dialog */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[12vh] md:pt-[15vh] transition-opacity duration-200"
          style={{ backgroundColor: dark ? 'rgba(2, 6, 23, 0.98)' : 'rgba(255, 255, 255, 0.98)' }}
        >
          <div 
            ref={modalContainerRef}
            className="w-full max-w-xl rounded-xl border border-white/10 p-4 shadow-2xl scale-100 transform transition-all duration-200 animate-fade-in focus:outline-none"
            style={{ backgroundColor: dark ? '#0f172a' : '#ffffff' }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setPaletteOpen(false);
            }}
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Terminal size={16} className="text-cyan-300" />
              <input
                ref={paletteInputRef}
                type="text"
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                onKeyDown={(e) => {
                  const list = paletteItems;
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setPaletteOpen(false);
                    return;
                  }
                  if (list.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % list.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + list.length) % list.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePaletteSelect(list[Math.min(selectedIndex, list.length - 1)]);
                  }
                }}
                placeholder="Command Palette: Search commands, modules, settings..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-500"
              />
              <button 
                onClick={() => setPaletteOpen(false)}
                className="rounded bg-white/5 px-2 py-1 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Quick Access Stats & Analytics inside Palette */}
            {!paletteQuery.trim() && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-b border-white/5 pb-3.5 text-[10px] text-slate-400">
                <div className="rounded-lg bg-white/5 p-2.5">
                  <h5 className="font-bold text-slate-300">Quick Access Statistics</h5>
                  <div className="mt-1 space-y-0.5">
                    <div>Searches Executed: <span className="font-bold text-white">{analytics.searchCount}</span></div>
                    <div>Most Opened Algorithm: <span className="font-bold text-white">
                      {Object.entries(analytics.mostOpened).length > 0 
                        ? (algorithms.find(a => a.id === Object.entries(analytics.mostOpened).sort((a,b)=>b[1]-a[1])[0][0])?.name || 'None')
                        : 'None'}
                    </span></div>
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 p-2.5">
                  <h5 className="font-bold text-slate-300">Supported Shortcuts</h5>
                  <div className="mt-1 space-y-0.5">
                    <div>Search: <kbd className="text-cyan-200">Ctrl K</kbd> · Palette: <kbd className="text-cyan-200">Ctrl P</kbd></div>
                    <div>Select & Launch: <kbd className="text-cyan-200">Enter</kbd></div>
                  </div>
                </div>
              </div>
            )}

            {/* Result list */}
            <div className="mt-2.5 max-h-[320px] overflow-y-auto space-y-1">
              {paletteItems.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = item.category === 'Navigation' ? Compass 
                           : item.category === 'Theme' ? (dark ? Sun : Moon)
                           : item.category === 'Run Algorithm' ? Play
                           : GitCompare;
                return (
                  <div
                    key={item.id}
                    onClick={() => handlePaletteSelect(item)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 border transition ${
                      isSelected 
                        ? 'bg-cyan-300/10 border-cyan-400/20' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-cyan-300" />
                      <div>
                        <div className="text-xs font-semibold text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.description}</div>
                      </div>
                    </div>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] text-slate-500 font-bold uppercase">
                      {item.category}
                    </span>
                  </div>
                );
              })}
              {paletteItems.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No commands matching "{paletteQuery}" found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
