export interface EducationalCompareInfo {
  category: string;
  definition: string;
  workingPrinciple: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  supportedOperations: string[];
  advantages: string[];
  disadvantages: string[];
  realWorldApplications: string[];
  whenToUse: string;
  whenNotToUse: string;
}

export const compareData: Record<string, EducationalCompareInfo> = {
  'Sorting': {
    category: 'Sorting',
    definition: 'An operation that arranges elements of a list in a systematic, linear order (typically numerical or lexicographical).',
    workingPrinciple: 'Based on key comparisons and swapping/shifting of adjacent or partitioned elements to satisfy a sorting relation (e.g., A[i] <= A[j] for all i < j).',
    timeComplexity: {
      best: 'O(n) - e.g., Insertion Sort / Bubble Sort on sorted arrays',
      average: 'O(n log n) - e.g., Quick Sort / Merge Sort / Heap Sort',
      worst: 'O(n²) - e.g., Bubble / Selection / Insertion Sort, and naive Quick Sort'
    },
    spaceComplexity: 'O(1) auxiliary for in-place algorithms (Quick/Heap/Bubble) or O(n) for out-of-place (Merge Sort).',
    supportedOperations: [
      'Compare elements',
      'Swap adjacent elements',
      'Shift / Insert elements',
      'Partition around pivot',
      'Merge sorted partitions'
    ],
    advantages: [
      'Enables sub-linear searching (e.g., Binary Search) on lists',
      'Improves data visualization and reporting readability',
      'Pre-processing step for many advanced computational geometry and graph algorithms'
    ],
    disadvantages: [
      'Sorting large datasets is computationally expensive',
      'Requires auxiliary memory for certain stable implementations',
      'In-place sorting can scramble original record ordering (instability)'
    ],
    realWorldApplications: [
      'Database query indexing and optimization',
      'E-commerce product ranking (price low-to-high)',
      'Operating system task scheduling'
    ],
    whenToUse: 'When you need to search elements frequently, display ordered lists, or prepare data for divide-and-conquer processing.',
    whenNotToUse: 'When the dataset changes constantly and is extremely large, making sorting overhead exceed the cost of simple sequential operations.'
  },
  'Searching': {
    category: 'Searching',
    definition: 'An algorithmic operation designed to locate a specific target value or record within a collection of elements.',
    workingPrinciple: 'Loops through elements sequentially (Linear Search) or narrows down the search space recursively/iteratively by half (Binary Search) based on comparative keys.',
    timeComplexity: {
      best: 'O(1) - when the target is at the first probed position',
      average: 'O(log n) - for Binary Search / O(√n) for Jump Search',
      worst: 'O(n) - for Linear Search / O(log n) for Binary Search'
    },
    spaceComplexity: 'O(1) auxiliary space (performed in-place without copying).',
    supportedOperations: [
      'Probe element at index',
      'Compare element with target',
      'Shift bounds pointers',
      'Interpolate position index'
    ],
    advantages: [
      'Logarithmic search allows fast item lookups on massive datasets',
      'Can run in-place without memory allocation overhead',
      'Simple to implement and verify'
    ],
    disadvantages: [
      'Efficient search (like Binary Search) strictly requires pre-sorted collections',
      'Worst-case performance degrades on highly skewed distributions (Interpolation Search)'
    ],
    realWorldApplications: [
      'Finding contacts in address books',
      'Database primary key index retrievals',
      'Autocomplete dictionary lookups'
    ],
    whenToUse: 'When retrieving, updating, or validating the presence of elements within a stored collection.',
    whenNotToUse: 'When performing a single search on an unsorted array; sorting it first is slower than running a simple O(n) linear scan.'
  },
  'Linked List': {
    category: 'Linked List',
    definition: 'A linear collection of data elements called nodes, where each node points to the next (and optionally previous) node via pointers.',
    workingPrinciple: 'Elements are not stored in contiguous memory. Nodes dynamically allocate memory and link to one another, making insertions/deletions highly efficient.',
    timeComplexity: {
      best: 'O(1) - for insertion or deletion at the head / known node pointer',
      average: 'O(n) - to find, insert, or delete an arbitrary node at index k',
      worst: 'O(n) - when traversing to the tail of the list'
    },
    spaceComplexity: 'O(n) - to store N elements, where each node has extra pointer overhead.',
    supportedOperations: [
      'Insert at Head / Tail',
      'Delete from Head / Tail',
      'Search element by value',
      'Traverse elements sequentially'
    ],
    advantages: [
      'Dynamic size allocates memory incrementally on demand',
      'O(1) node insertion and deletion without shifting elements',
      'Easy to implement stacks, queues, and graph adjacency lists'
    ],
    disadvantages: [
      'No random access (accessing index k requires O(k) pointer hops)',
      'Extra memory overhead for node pointers (next / prev)',
      'Poor CPU cache locality due to scattered non-contiguous nodes'
    ],
    realWorldApplications: [
      'Image viewer playlists (next / prev navigation)',
      'Undo/redo stacks in text editors (via doubly linked list)',
      'Hash table collision chaining'
    ],
    whenToUse: 'When you need constant-time insertion/deletion and do not require random element access by index.',
    whenNotToUse: 'When random lookup speed is critical, or memory space per element is highly constrained.'
  },
  'Stack': {
    category: 'Stack',
    definition: 'A linear data structure that follows the Last-In, First-Out (LIFO) principle, where all insertions and deletions are restricted to a single end called the top.',
    workingPrinciple: 'Elements are piled on top of each other. The last element added is the first one retrieved. Operates using restricted pointers.',
    timeComplexity: {
      best: 'O(1) - for push, pop, and peek operations',
      average: 'O(1) - constant time operations',
      worst: 'O(1) - guaranteed constant time'
    },
    spaceComplexity: 'O(n) - to store N elements inside the stack.',
    supportedOperations: [
      'Push (insert element at top)',
      'Pop (remove and return top element)',
      'Peek (inspect top element without removing)',
      'IsEmpty (check if stack has elements)'
    ],
    advantages: [
      'Extremely fast, guaranteed O(1) operations',
      'Prevents data corruption by restricting arbitrary access',
      'Ideal for parsing expressions and tracking recursive scopes'
    ],
    disadvantages: [
      'No search capability (must pop everything to find an item)',
      'Size limits can lead to Stack Overflow (in fixed-size array stacks)',
      'Strictly LIFO structure limits general data processing'
    ],
    realWorldApplications: [
      'Call stack tracking execution frames in runtimes (JVM, V8)',
      'Browser navigation history (Back button)',
      'Parentheses matching and expression evaluation (parsers)'
    ],
    whenToUse: 'When you need to backtrack, reverse items, or manage function call execution states.',
    whenNotToUse: 'When you need to search or access arbitrary elements in the middle of the collection.'
  },
  'Queue': {
    category: 'Queue',
    definition: 'A linear data structure that follows the First-In, First-Out (FIFO) principle, where elements are inserted at the rear (enqueue) and removed from the front (dequeue).',
    workingPrinciple: 'Models a real-life queue. The first element added is the first one to leave, maintaining strict chronological ordering.',
    timeComplexity: {
      best: 'O(1) - for enqueue and dequeue operations',
      average: 'O(1) - constant time operations',
      worst: 'O(1) - guaranteed constant time'
    },
    spaceComplexity: 'O(n) - to store N elements in the queue.',
    supportedOperations: [
      'Enqueue (insert element at the rear)',
      'Dequeue (remove and return element at front)',
      'Front / Peek (inspect front element)',
      'Size / IsEmpty (verify active queue count)'
    ],
    advantages: [
      'Ensures fairness by handling items in strict chronological order',
      'Constant-time O(1) operations',
      'Decouples producer and consumer processes asynchronously'
    ],
    disadvantages: [
      'No random access or search (must dequeue preceding items)',
      'Array-based queues require wrapping pointers (Circular Queue) to prevent memory waste'
    ],
    realWorldApplications: [
      'CPU task scheduling / network packet routing pipelines',
      'Printer spoolers handling document queues',
      'Breadth-First Search (BFS) frontier node queue'
    ],
    whenToUse: 'When resources are shared and must be processed in the exact order they arrive.',
    whenNotToUse: 'When priority-based execution is needed (use a Priority Queue / Heap instead).'
  },
  'Trees': {
    category: 'Trees',
    definition: 'A hierarchical, non-linear data structure consisting of nodes connected by edges, starting from a single root node where no cycles exist.',
    workingPrinciple: 'Maintains sorted structures (Binary Search Trees) where a parent node has at most two children. The left subtree contains keys < parent, and the right contains keys > parent.',
    timeComplexity: {
      best: 'O(log n) - lookup, insert, delete in balanced BSTs',
      average: 'O(log n) - average search depth',
      worst: 'O(n) - if the tree becomes highly skewed/degenerate (linked list behaviour)'
    },
    spaceComplexity: 'O(n) - node nodes stored / O(h) recursion stack space where h is tree height.',
    supportedOperations: [
      'Insert Node',
      'Delete Node',
      'Search Node Key',
      'Traverse (Pre-order, In-order, Post-order)'
    ],
    advantages: [
      'Hierarchical representation of folder structures and nested data',
      'Sub-linear searches O(log n) while maintaining sorted properties',
      'Efficient dynamic insertions/deletions compared to static sorted arrays'
    ],
    disadvantages: [
      'Rebalancing algorithms (AVL, Red-Black Trees) are complex to write',
      'Node pointers increase memory footprint',
      'Requires recursion or stack states for basic traversals'
    ],
    realWorldApplications: [
      'Domain Name System (DNS) naming hierarchies',
      'File systems (folders and files)',
      'JSON / XML DOM parsers'
    ],
    whenToUse: 'When representing hierarchical relationships, or when you need fast, ordered insertions and lookups.',
    whenNotToUse: 'When data is simple, linear, and doesn’t change, or when O(1) lookups are needed (use Hash Map).'
  },
  'Graphs': {
    category: 'Graphs',
    definition: 'A non-linear network data structure consisting of a finite set of vertices (nodes) and edges connecting pairs of vertices.',
    workingPrinciple: 'Represents arbitrary relationships (directed, undirected, weighted, or unweighted). Nodes connect freely, allowing loops and cycles.',
    timeComplexity: {
      best: 'O(V + E) - for simple traversals like BFS / DFS',
      average: 'O(E log V) - Dijkstra / Prim MST',
      worst: 'O(V²) - dense graph Dijkstra / Kruskal edge sorting'
    },
    spaceComplexity: 'O(V + E) - to store nodes and links using Adjacency List, or O(V²) for Adjacency Matrix.',
    supportedOperations: [
      'Add Vertex / Edge',
      'Remove Vertex / Edge',
      'Find adjacent neighbors',
      'Shortest Path / Minimum Spanning Tree traversal'
    ],
    advantages: [
      'Can model any complex network (social media, maps, electricity grids)',
      'Highly flexible node connections with weights',
      'Allows path-finding, cycle detection, and connectivity testing'
    ],
    disadvantages: [
      'Extremely complex algorithms with high computational overhead',
      'Difficult to store efficiently in relational database schemas',
      'Graph traversals (BFS/DFS) require visited trackers to prevent infinite loops'
    ],
    realWorldApplications: [
      'Google Maps route planning (Dijkstra shortest path)',
      'Facebook / LinkedIn friend recommendation engines',
      'P2P network torrent trackers'
    ],
    whenToUse: 'When elements have complex, multi-directional relationships and connections (e.g. networks, dependencies).',
    whenNotToUse: 'When the relationships are strictly hierarchical (use a Tree) or linear (use a List).'
  },
  'Dynamic Programming': {
    category: 'Dynamic Programming',
    definition: 'An algorithmic technique that solves complex problems by breaking them down into overlapping subproblems, solving each subproblem once, and storing their answers.',
    workingPrinciple: 'Uses memoization (top-down) or tabulation (bottom-up) to store results of solved subproblems, avoiding redundant computations.',
    timeComplexity: {
      best: 'O(N) - e.g. Fibonacci sequence with tabulation',
      average: 'Problem dependent (usually polynomial time instead of exponential)',
      worst: 'State space dependent (e.g. O(N * W) for Knapsack)'
    },
    spaceComplexity: 'O(N) to O(N * M) auxiliary state storage buffers.',
    supportedOperations: [
      'Define state variables',
      'Formulate state transition recurrence relations',
      'Lookup subproblem states (memo)',
      'Tabulate subproblems iteratively'
    ],
    advantages: [
      'Saves exponential O(2ⁿ) execution time by reducing to polynomial O(n) bounds',
      'Guarantees optimal solutions for problems with optimal substructure',
      'Very clean once the recurrence formula is established'
    ],
    disadvantages: [
      'Requires substantial auxiliary memory to store solved states',
      'Extremely hard to formulate recurrence relations for complex problems',
      'Unused memoization slots can cause memory bloat'
    ],
    realWorldApplications: [
      'Git diff (Longest Common Subsequence)',
      'Search engine spell checkers (Edit Distance)',
      'Financial portfolio asset optimization (Knapsack)'
    ],
    whenToUse: 'When a problem has overlapping subproblems and an optimal substructure (e.g., shortest paths, string edit distance, partition subsets).',
    whenNotToUse: 'When subproblems do not overlap (e.g., divide-and-conquer sorting like Merge Sort, where subproblems are completely independent).'
  }
};
