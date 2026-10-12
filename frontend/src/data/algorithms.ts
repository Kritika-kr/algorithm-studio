import { AlgorithmCategory, AlgorithmInfo, GraphEdge, GraphNode } from '../types/algorithm';

const sortingCode = {
  cpp: ['for (int i = 0; i < n; ++i) {', '  for (int j = 0; j < n - i - 1; ++j) {', '    if (a[j] > a[j + 1]) {', '      swap(a[j], a[j + 1]);', '    }', '  }', '}'],
  java: ['for (int i = 0; i < n; i++) {', '  for (int j = 0; j < n - i - 1; j++) {', '    if (a[j] > a[j + 1]) {', '      int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;', '    }', '  }', '}'],
  python: ['for i in range(n):', '    for j in range(0, n - i - 1):', '        if a[j] > a[j + 1]:', '            a[j], a[j + 1] = a[j + 1], a[j]'],
  javascript: ['for (let i = 0; i < n; i++) {', '  for (let j = 0; j < n - i - 1; j++) {', '    if (a[j] > a[j + 1]) {', '      [a[j], a[j + 1]] = [a[j + 1], a[j]];', '    }', '  }', '}']
};

const searchCode = {
  cpp: ['int left = 0, right = n - 1;', 'while (left <= right) {', '  int mid = left + (right - left) / 2;', '  if (a[mid] == target) return mid;', '  if (a[mid] < target) left = mid + 1;', '  else right = mid - 1;', '}'],
  java: ['int left = 0, right = a.length - 1;', 'while (left <= right) {', '  int mid = left + (right - left) / 2;', '  if (a[mid] == target) return mid;', '  if (a[mid] < target) left = mid + 1;', '  else right = mid - 1;', '}'],
  python: ['left, right = 0, len(a) - 1', 'while left <= right:', '    mid = left + (right - left) // 2', '    if a[mid] == target: return mid', '    if a[mid] < target: left = mid + 1', '    else: right = mid - 1'],
  javascript: ['let left = 0, right = a.length - 1;', 'while (left <= right) {', '  const mid = left + Math.floor((right - left) / 2);', '  if (a[mid] === target) return mid;', '  if (a[mid] < target) left = mid + 1;', '  else right = mid - 1;', '}']
};

const structureCode = {
  cpp: ['Node* cur = head;', 'while (cur != nullptr) {', '  visit(cur);', '  cur = cur->next;', '}'],
  java: ['Node cur = head;', 'while (cur != null) {', '  visit(cur);', '  cur = cur.next;', '}'],
  python: ['cur = head', 'while cur:', '    visit(cur)', '    cur = cur.next'],
  javascript: ['let cur = head;', 'while (cur) {', '  visit(cur);', '  cur = cur.next;', '}']
};

const graphCode = {
  cpp: ['queue<int> q;', 'q.push(start);', 'while (!q.empty()) {', '  int u = q.front(); q.pop();', '  for (int v : adj[u]) visit(v);', '}'],
  java: ['Queue<Integer> q = new ArrayDeque<>();', 'q.add(start);', 'while (!q.isEmpty()) {', '  int u = q.remove();', '  for (int v : adj.get(u)) visit(v);', '}'],
  python: ['queue = deque([start])', 'while queue:', '    u = queue.popleft()', '    for v in graph[u]:', '        visit(v)'],
  javascript: ['const queue = [start];', 'while (queue.length) {', '  const u = queue.shift();', '  graph[u].forEach(visit);', '}']
};

const codeById: Record<string, AlgorithmInfo['code']> = {
  'shell-sort': {
    cpp: ['for (int gap = n / 2; gap > 0; gap /= 2)', '  for (int i = gap; i < n; ++i) {', '    int value = a[i], j = i;', '    while (j >= gap && a[j - gap] > value) { a[j] = a[j - gap]; j -= gap; }', '    a[j] = value;', '  }'],
    java: ['for (int gap = n / 2; gap > 0; gap /= 2)', '  for (int i = gap; i < n; i++) {', '    int value = a[i], j = i;', '    while (j >= gap && a[j - gap] > value) { a[j] = a[j - gap]; j -= gap; }', '    a[j] = value;', '  }'],
    python: ['gap = len(a) // 2', 'while gap > 0:', '    for i in range(gap, len(a)):', '        value, j = a[i], i', '        while j >= gap and a[j-gap] > value: a[j] = a[j-gap]; j -= gap', '        a[j] = value', '    gap //= 2'],
    javascript: ['for (let gap = Math.floor(a.length / 2); gap > 0; gap = Math.floor(gap / 2))', '  for (let i = gap; i < a.length; i++) {', '    const value = a[i]; let j = i;', '    while (j >= gap && a[j - gap] > value) { a[j] = a[j - gap]; j -= gap; }', '    a[j] = value;', '  }']
  },
  'cocktail-sort': {
    cpp: ['int start = 0, end = n - 1;', 'while (start < end) {', '  for (int i = start; i < end; ++i) if (a[i] > a[i+1]) swap(a[i], a[i+1]);', '  --end;', '  for (int i = end; i > start; --i) if (a[i-1] > a[i]) swap(a[i-1], a[i]);', '  ++start;', '}'],
    java: ['int start = 0, end = a.length - 1;', 'while (start < end) {', '  for (int i = start; i < end; i++) if (a[i] > a[i+1]) swap(a, i, i+1);', '  end--;', '  for (int i = end; i > start; i--) if (a[i-1] > a[i]) swap(a, i-1, i);', '  start++;', '}'],
    python: ['start, end = 0, len(a) - 1', 'while start < end:', '    for i in range(start, end):', '        if a[i] > a[i+1]: a[i], a[i+1] = a[i+1], a[i]', '    end -= 1', '    for i in range(end, start, -1):', '        if a[i-1] > a[i]: a[i-1], a[i] = a[i], a[i-1]', '    start += 1'],
    javascript: ['let start = 0, end = a.length - 1;', 'while (start < end) {', '  for (let i = start; i < end; i++) if (a[i] > a[i+1]) [a[i], a[i+1]] = [a[i+1], a[i]];', '  end--;', '  for (let i = end; i > start; i--) if (a[i-1] > a[i]) [a[i-1], a[i]] = [a[i], a[i-1]];', '  start++;', '}']
  },
  'counting-sort': {
    cpp: ['int offset = -minValue;', 'vector<int> count(maxValue - minValue + 1);', 'for (int value : a) ++count[value + offset];', 'int out = 0;', 'for (int i = 0; i < count.size(); ++i)', '  while (count[i]--) a[out++] = i - offset;'],
    java: ['int offset = -minValue;', 'int[] count = new int[maxValue - minValue + 1];', 'for (int value : a) count[value + offset]++;', 'int out = 0;', 'for (int i = 0; i < count.length; i++)', '  while (count[i]-- > 0) a[out++] = i - offset;'],
    python: ['offset = -min(a)', 'count = [0] * (max(a) - min(a) + 1)', 'for value in a: count[value + offset] += 1', 'out = 0', 'for i, amount in enumerate(count):', '    for _ in range(amount): a[out] = i - offset; out += 1'],
    javascript: ['const offset = -Math.min(...a);', 'const count = Array(Math.max(...a) + offset + 1).fill(0);', 'for (const value of a) count[value + offset]++;', 'let out = 0;', 'for (let i = 0; i < count.length; i++)', '  while (count[i]--) a[out++] = i - offset;']
  },
  'exponential-search': {
    cpp: ['if (a[0] == target) return 0;', 'int bound = 1;', 'while (bound < n && a[bound] < target) bound *= 2;', 'return binarySearch(a, bound / 2, min(bound, n - 1), target);'],
    java: ['if (a[0] == target) return 0;', 'int bound = 1;', 'while (bound < a.length && a[bound] < target) bound *= 2;', 'return binarySearch(a, bound / 2, Math.min(bound, a.length - 1), target);'],
    python: ['if a[0] == target: return 0', 'bound = 1', 'while bound < len(a) and a[bound] < target: bound *= 2', 'return binary_search(a, bound // 2, min(bound, len(a)-1), target)'],
    javascript: ['if (a[0] === target) return 0;', 'let bound = 1;', 'while (bound < a.length && a[bound] < target) bound *= 2;', 'return binarySearch(a, Math.floor(bound / 2), Math.min(bound, a.length - 1), target);']
  },
  'ternary-search': {
    cpp: ['while (left <= right) {', '  int third = (right - left) / 3;', '  int m1 = left + third, m2 = right - third;', '  if (a[m1] == target) return m1;', '  if (a[m2] == target) return m2;', '  if (target < a[m1]) right = m1 - 1;', '  else if (target > a[m2]) left = m2 + 1;', '  else { left = m1 + 1; right = m2 - 1; }', '}'],
    java: ['while (left <= right) {', '  int third = (right - left) / 3;', '  int m1 = left + third, m2 = right - third;', '  if (a[m1] == target) return m1;', '  if (a[m2] == target) return m2;', '  if (target < a[m1]) right = m1 - 1;', '  else if (target > a[m2]) left = m2 + 1;', '  else { left = m1 + 1; right = m2 - 1; }', '}'],
    python: ['while left <= right:', '    third = (right - left) // 3', '    m1, m2 = left + third, right - third', '    if a[m1] == target: return m1', '    if a[m2] == target: return m2', '    if target < a[m1]: right = m1 - 1', '    elif target > a[m2]: left = m2 + 1', '    else: left, right = m1 + 1, m2 - 1'],
    javascript: ['while (left <= right) {', '  const third = Math.floor((right - left) / 3);', '  const m1 = left + third, m2 = right - third;', '  if (a[m1] === target) return m1;', '  if (a[m2] === target) return m2;', '  if (target < a[m1]) right = m1 - 1;', '  else if (target > a[m2]) left = m2 + 1;', '  else { left = m1 + 1; right = m2 - 1; }', '}']
  },
  'selection-sort': {
    cpp: ['for (int i = 0; i < n - 1; ++i) {', '  int minIndex = i;', '  for (int j = i + 1; j < n; ++j)', '    if (a[j] < a[minIndex]) minIndex = j;', '  swap(a[i], a[minIndex]);', '}'],
    java: ['for (int i = 0; i < n - 1; i++) {', '  int minIndex = i;', '  for (int j = i + 1; j < n; j++)', '    if (a[j] < a[minIndex]) minIndex = j;', '  swap(a, i, minIndex);', '}'],
    python: ['for i in range(n - 1):', '    min_index = i', '    for j in range(i + 1, n):', '        if a[j] < a[min_index]: min_index = j', '    a[i], a[min_index] = a[min_index], a[i]'],
    javascript: ['for (let i = 0; i < n - 1; i++) {', '  let minIndex = i;', '  for (let j = i + 1; j < n; j++)', '    if (a[j] < a[minIndex]) minIndex = j;', '  [a[i], a[minIndex]] = [a[minIndex], a[i]];', '}']
  },
  'insertion-sort': {
    cpp: ['for (int i = 1; i < n; ++i) {', '  int key = a[i], j = i - 1;', '  while (j >= 0 && a[j] > key) {', '    a[j + 1] = a[j]; --j;', '  }', '  a[j + 1] = key;', '}'],
    java: ['for (int i = 1; i < n; i++) {', '  int key = a[i], j = i - 1;', '  while (j >= 0 && a[j] > key) {', '    a[j + 1] = a[j]; j--;', '  }', '  a[j + 1] = key;', '}'],
    python: ['for i in range(1, len(a)):', '    key = a[i]', '    j = i - 1', '    while j >= 0 and a[j] > key:', '        a[j + 1] = a[j]; j -= 1', '    a[j + 1] = key'],
    javascript: ['for (let i = 1; i < a.length; i++) {', '  const key = a[i]; let j = i - 1;', '  while (j >= 0 && a[j] > key) {', '    a[j + 1] = a[j]; j--;', '  }', '  a[j + 1] = key;', '}']
  },
  'merge-sort': {
    cpp: ['void sort(int l, int r) {', '  if (l >= r) return;', '  int m = (l + r) / 2;', '  sort(l, m); sort(m + 1, r);', '  merge(a, l, m, r);', '}'],
    java: ['void sort(int l, int r) {', '  if (l >= r) return;', '  int m = (l + r) / 2;', '  sort(l, m); sort(m + 1, r);', '  merge(a, l, m, r);', '}'],
    python: ['def sort(a):', '    if len(a) <= 1: return a', '    mid = len(a) // 2', '    left = sort(a[:mid])', '    right = sort(a[mid:])', '    return merge(left, right)'],
    javascript: ['function sort(a) {', '  if (a.length <= 1) return a;', '  const mid = Math.floor(a.length / 2);', '  const left = sort(a.slice(0, mid));', '  const right = sort(a.slice(mid));', '  return merge(left, right);', '}']
  },
  'quick-sort': {
    cpp: ['void quick(int low, int high) {', '  if (low >= high) return;', '  int pivot = partition(a, low, high);', '  quick(low, pivot - 1);', '  quick(pivot + 1, high);', '}'],
    java: ['void quick(int low, int high) {', '  if (low >= high) return;', '  int pivot = partition(a, low, high);', '  quick(low, pivot - 1);', '  quick(pivot + 1, high);', '}'],
    python: ['def quick(low, high):', '    if low >= high: return', '    pivot = partition(a, low, high)', '    quick(low, pivot - 1)', '    quick(pivot + 1, high)'],
    javascript: ['function quick(low, high) {', '  if (low >= high) return;', '  const pivot = partition(a, low, high);', '  quick(low, pivot - 1);', '  quick(pivot + 1, high);', '}']
  },
  'heap-sort': {
    cpp: ['buildMaxHeap(a);', 'for (int end = n - 1; end > 0; --end) {', '  swap(a[0], a[end]);', '  heapify(a, end, 0);', '}'],
    java: ['buildMaxHeap(a);', 'for (int end = n - 1; end > 0; end--) {', '  swap(a, 0, end);', '  heapify(a, end, 0);', '}'],
    python: ['build_max_heap(a)', 'for end in range(len(a) - 1, 0, -1):', '    a[0], a[end] = a[end], a[0]', '    heapify(a, end, 0)'],
    javascript: ['buildMaxHeap(a);', 'for (let end = a.length - 1; end > 0; end--) {', '  [a[0], a[end]] = [a[end], a[0]];', '  heapify(a, end, 0);', '}']
  },
  'linear-search': {
    cpp: ['for (int i = 0; i < n; ++i)', '  if (a[i] == target) return i;', 'return -1;'],
    java: ['for (int i = 0; i < a.length; i++)', '  if (a[i] == target) return i;', 'return -1;'],
    python: ['for i, value in enumerate(a):', '    if value == target:', '        return i', 'return -1'],
    javascript: ['for (let i = 0; i < a.length; i++)', '  if (a[i] === target) return i;', 'return -1;']
  },
  'jump-search': {
    cpp: ['int step = sqrt(n), prev = 0;', 'while (a[min(step, n) - 1] < target) {', '  prev = step; step += sqrt(n);', '}', 'for (int i = prev; i < min(step, n); ++i)', '  if (a[i] == target) return i;'],
    java: ['int step = (int)Math.sqrt(n), prev = 0;', 'while (a[Math.min(step, n) - 1] < target) {', '  prev = step; step += (int)Math.sqrt(n);', '}', 'for (int i = prev; i < Math.min(step, n); i++)', '  if (a[i] == target) return i;'],
    python: ['step = int(len(a) ** 0.5)', 'prev = 0', 'while a[min(step, len(a)) - 1] < target:', '    prev = step; step += int(len(a) ** 0.5)', 'for i in range(prev, min(step, len(a))):', '    if a[i] == target: return i'],
    javascript: ['let step = Math.floor(Math.sqrt(a.length));', 'let prev = 0;', 'while (a[Math.min(step, a.length) - 1] < target) {', '  prev = step; step += Math.floor(Math.sqrt(a.length));', '}', 'for (let i = prev; i < Math.min(step, a.length); i++)', '  if (a[i] === target) return i;']
  },
  'interpolation-search': {
    cpp: ['while (low <= high && target >= a[low] && target <= a[high]) {', '  int pos = low + (target - a[low]) * (high - low) / (a[high] - a[low]);', '  if (a[pos] == target) return pos;', '  if (a[pos] < target) low = pos + 1;', '  else high = pos - 1;', '}'],
    java: ['while (low <= high && target >= a[low] && target <= a[high]) {', '  int pos = low + (target - a[low]) * (high - low) / (a[high] - a[low]);', '  if (a[pos] == target) return pos;', '  if (a[pos] < target) low = pos + 1;', '  else high = pos - 1;', '}'],
    python: ['while low <= high and a[low] <= target <= a[high]:', '    pos = low + (target - a[low]) * (high - low) // (a[high] - a[low])', '    if a[pos] == target: return pos', '    if a[pos] < target: low = pos + 1', '    else: high = pos - 1'],
    javascript: ['while (low <= high && target >= a[low] && target <= a[high]) {', '  const pos = low + Math.floor((target - a[low]) * (high - low) / (a[high] - a[low]));', '  if (a[pos] === target) return pos;', '  if (a[pos] < target) low = pos + 1;', '  else high = pos - 1;', '}']
  },
  dfs: {
    cpp: ['void dfs(int u) {', '  visited[u] = true;', '  for (int v : adj[u])', '    if (!visited[v]) dfs(v);', '}'],
    java: ['void dfs(int u) {', '  visited[u] = true;', '  for (int v : adj.get(u))', '    if (!visited[v]) dfs(v);', '}'],
    python: ['def dfs(u):', '    visited.add(u)', '    for v in graph[u]:', '        if v not in visited:', '            dfs(v)'],
    javascript: ['function dfs(u) {', '  visited.add(u);', '  for (const v of graph[u])', '    if (!visited.has(v)) dfs(v);', '}']
  },
  dijkstra: {
    cpp: ['priority_queue<Node> pq;', 'dist[start] = 0; pq.push({0, start});', 'while (!pq.empty()) {', '  auto [d, u] = pq.top(); pq.pop();', '  for (auto [v, w] : adj[u]) relax(u, v, w);', '}'],
    java: ['PriorityQueue<Node> pq = new PriorityQueue<>();', 'dist[start] = 0; pq.add(new Node(start, 0));', 'while (!pq.isEmpty()) {', '  Node u = pq.remove();', '  for (Edge e : adj.get(u.id)) relax(e);', '}'],
    python: ['heap = [(0, start)]', 'dist[start] = 0', 'while heap:', '    d, u = heappop(heap)', '    for v, w in graph[u]:', '        relax(u, v, w)'],
    javascript: ['const pq = new PriorityQueue();', 'dist[start] = 0; pq.push(start, 0);', 'while (!pq.isEmpty()) {', '  const u = pq.pop();', '  for (const [v, w] of graph[u]) relax(u, v, w);', '}']
  },
  prim: {
    cpp: ['priority_queue<Edge> pq;', 'pq.push({0, start});', 'while (!pq.empty()) {', '  auto edge = pq.top(); pq.pop();', '  if (used[edge.to]) continue;', '  addToMst(edge);', '}'],
    java: ['PriorityQueue<Edge> pq = new PriorityQueue<>();', 'pq.add(new Edge(start, 0));', 'while (!pq.isEmpty()) {', '  Edge edge = pq.remove();', '  if (used[edge.to]) continue;', '  addToMst(edge);', '}'],
    python: ['heap = [(0, start)]', 'while heap:', '    weight, u = heappop(heap)', '    if u in used: continue', '    add_to_mst(u, weight)'],
    javascript: ['const pq = new PriorityQueue();', 'pq.push(start, 0);', 'while (!pq.isEmpty()) {', '  const edge = pq.pop();', '  if (used.has(edge.to)) continue;', '  addToMst(edge);', '}']
  },
  kruskal: {
    cpp: ['sort(edges.begin(), edges.end());', 'for (Edge e : edges) {', '  if (find(e.u) != find(e.v)) {', '    unite(e.u, e.v);', '    mst.push_back(e);', '  }', '}'],
    java: ['Collections.sort(edges);', 'for (Edge e : edges) {', '  if (find(e.u) != find(e.v)) {', '    union(e.u, e.v);', '    mst.add(e);', '  }', '}'],
    python: ['edges.sort(key=lambda e: e.weight)', 'for edge in edges:', '    if find(edge.u) != find(edge.v):', '        union(edge.u, edge.v)', '        mst.append(edge)'],
    javascript: ['edges.sort((a, b) => a.weight - b.weight);', 'for (const edge of edges) {', '  if (find(edge.u) !== find(edge.v)) {', '    union(edge.u, edge.v);', '    mst.push(edge);', '  }', '}']
  },
  'topological-sort': {
    cpp: ['queue<int> q = allZeroIndegreeNodes();', 'while (!q.empty()) {', '  int u = q.front(); q.pop();', '  order.push_back(u);', '  for (int v : adj[u]) if (--indegree[v] == 0) q.push(v);', '}'],
    java: ['Queue<Integer> q = allZeroIndegreeNodes();', 'while (!q.isEmpty()) {', '  int u = q.remove();', '  order.add(u);', '  for (int v : adj.get(u)) if (--indegree[v] == 0) q.add(v);', '}'],
    python: ['queue = deque(zero_indegree_nodes)', 'while queue:', '    u = queue.popleft()', '    order.append(u)', '    for v in graph[u]:', '        indegree[v] -= 1', '        if indegree[v] == 0: queue.append(v)'],
    javascript: ['const queue = zeroIndegreeNodes();', 'while (queue.length) {', '  const u = queue.shift();', '  order.push(u);', '  for (const v of graph[u]) if (--indegree[v] === 0) queue.push(v);', '}']
  },
  stack: {
    cpp: ['stack<int> s;', 's.push(value);', 'int top = s.top();', 's.pop();'],
    java: ['Deque<Integer> stack = new ArrayDeque<>();', 'stack.push(value);', 'int top = stack.peek();', 'stack.pop();'],
    python: ['stack = []', 'stack.append(value)', 'top = stack[-1]', 'stack.pop()'],
    javascript: ['const stack = [];', 'stack.push(value);', 'const top = stack.at(-1);', 'stack.pop();']
  },
  queue: {
    cpp: ['queue<int> q;', 'q.push(value);', 'int front = q.front();', 'q.pop();'],
    java: ['Queue<Integer> q = new ArrayDeque<>();', 'q.add(value);', 'int front = q.peek();', 'q.remove();'],
    python: ['queue = deque()', 'queue.append(value)', 'front = queue[0]', 'queue.popleft()'],
    javascript: ['const queue = [];', 'queue.push(value);', 'const front = queue[0];', 'queue.shift();']
  },
  bst: {
    cpp: ['Node* insert(Node* root, int key) {', '  if (!root) return new Node(key);', '  if (key < root->key) root->left = insert(root->left, key);', '  else root->right = insert(root->right, key);', '  return root;', '}'],
    java: ['Node insert(Node root, int key) {', '  if (root == null) return new Node(key);', '  if (key < root.key) root.left = insert(root.left, key);', '  else root.right = insert(root.right, key);', '  return root;', '}'],
    python: ['def insert(root, key):', '    if not root: return Node(key)', '    if key < root.key: root.left = insert(root.left, key)', '    else: root.right = insert(root.right, key)', '    return root'],
    javascript: ['function insert(root, key) {', '  if (!root) return new Node(key);', '  if (key < root.key) root.left = insert(root.left, key);', '  else root.right = insert(root.right, key);', '  return root;', '}']
  },
  'dynamic-programming': {
    cpp: ['vector<int> dp(n + 1);', 'dp[0] = 0; dp[1] = 1;', 'for (int i = 2; i <= n; ++i)', '  dp[i] = dp[i - 1] + dp[i - 2];'],
    java: ['int[] dp = new int[n + 1];', 'dp[0] = 0; dp[1] = 1;', 'for (int i = 2; i <= n; i++)', '  dp[i] = dp[i - 1] + dp[i - 2];'],
    python: ['dp = [0] * (n + 1)', 'dp[0], dp[1] = 0, 1', 'for i in range(2, n + 1):', '    dp[i] = dp[i - 1] + dp[i - 2]'],
    javascript: ['const dp = Array(n + 1).fill(0);', 'dp[1] = 1;', 'for (let i = 2; i <= n; i++)', '  dp[i] = dp[i - 1] + dp[i - 2];']
  }
};

const buildInfo = (
  id: string,
  name: string,
  category: AlgorithmCategory,
  code: AlgorithmInfo['code'],
  complexity: AlgorithmInfo['complexity']
): AlgorithmInfo => ({
  id,
  name,
  category,
  description: `${name} visualized as backend-generated execution steps with line highlighting and state transitions.`,
  howItWorks: [
    'The backend produces a timeline of primitive actions instead of only a final answer.',
    'The workspace replays each action, updates statistics, and highlights the active code line.',
    'Every comparison, pointer move, visit, edge relaxation, or write is represented explicitly.'
  ],
  applications: ['Interview preparation', 'Classroom demonstrations', 'Algorithm tracing', 'Performance intuition'],
  advantages: ['Transparent step-by-step execution', 'Good for debugging mental models', 'Works with pause, resume, and stepping'],
  disadvantages: ['Animation traces can be large', 'Some advanced variants need richer input models'],
  complexity,
  pseudocode: code.cpp.map((line) => line.replace(/int /g, '').replace(/;/g, '')),
  code
});

export const algorithms: AlgorithmInfo[] = [
  ...['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'heap-sort', 'shell-sort', 'cocktail-sort', 'counting-sort'].map((id) =>
    buildInfo(id, id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' '), 'Sorting', codeById[id] ?? sortingCode, {
      best: id === 'bubble-sort' || id === 'insertion-sort' || id === 'cocktail-sort' ? 'O(n)' : id === 'counting-sort' ? 'O(n + k)' : 'O(n log n)',
      average: id === 'counting-sort' ? 'O(n + k)' : ['merge-sort', 'quick-sort', 'heap-sort'].includes(id) ? 'O(n log n)' : 'O(n^2)',
      worst: id === 'quick-sort' ? 'O(n^2)' : id === 'counting-sort' ? 'O(n + k)' : ['merge-sort', 'heap-sort'].includes(id) ? 'O(n log n)' : 'O(n^2)',
      space: id === 'merge-sort' ? 'O(n)' : id === 'counting-sort' ? 'O(k)' : 'O(1)'
    })
  ),
  ...['linear-search', 'binary-search', 'jump-search', 'interpolation-search', 'exponential-search', 'ternary-search'].map((id) =>
    buildInfo(id, id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' '), 'Searching', codeById[id] ?? searchCode, {
      best: 'O(1)',
      average: id === 'linear-search' ? 'O(n)' : id === 'jump-search' ? 'O(sqrt n)' : 'O(log n)',
      worst: id === 'linear-search' ? 'O(n)' : id === 'jump-search' ? 'O(sqrt n)' : 'O(log n)',
      space: 'O(1)'
    })
  ),
  buildInfo('linked-list', 'Linked List Operations', 'Linked List', structureCode, { best: 'O(1)', average: 'O(n)', worst: 'O(n)', space: 'O(1)' }),
  buildInfo('stack', 'Stack Operations', 'Stack', codeById.stack, { best: 'O(1)', average: 'O(1)', worst: 'O(1)', space: 'O(n)' }),
  buildInfo('queue', 'Queue Operations', 'Queue', codeById.queue, { best: 'O(1)', average: 'O(1)', worst: 'O(1)', space: 'O(n)' }),
  buildInfo('bst', 'Binary Search Tree', 'Trees', codeById.bst, { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)', space: 'O(h)' }),
  ...['bfs', 'dfs', 'dijkstra', 'prim', 'kruskal', 'topological-sort'].map((id) =>
    buildInfo(id, id.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' '), 'Graphs', graphCode, {
      best: 'O(V + E)',
      average: id === 'dijkstra' || id === 'prim' ? 'O(E log V)' : 'O(V + E)',
      worst: id === 'kruskal' ? 'O(E log E)' : id === 'dijkstra' || id === 'prim' ? 'O(E log V)' : 'O(V + E)',
      space: 'O(V + E)'
    })
  ),
  buildInfo('dynamic-programming', 'Dynamic Programming Patterns', 'Dynamic Programming', codeById['dynamic-programming'], { best: 'Problem dependent', average: 'State dependent', worst: 'State dependent', space: 'State dependent' })
];

export const categories: AlgorithmCategory[] = ['Sorting', 'Searching', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs', 'Dynamic Programming'];

export const DEFAULT_LINKED_LIST_VALUES = [3, 7, 11, 15, 19] as const;

export const defaultGraphNodes: GraphNode[] = [
  { id: 'A', x: 12, y: 22 },
  { id: 'B', x: 36, y: 14 },
  { id: 'C', x: 68, y: 22 },
  { id: 'D', x: 24, y: 66 },
  { id: 'E', x: 54, y: 58 },
  { id: 'F', x: 82, y: 70 }
];

export const defaultGraphEdges: GraphEdge[] = [
  { source: 'A', target: 'B', weight: 4 },
  { source: 'A', target: 'D', weight: 2 },
  { source: 'B', target: 'C', weight: 5 },
  { source: 'B', target: 'E', weight: 1 },
  { source: 'D', target: 'E', weight: 3 },
  { source: 'E', target: 'F', weight: 7 },
  { source: 'C', target: 'F', weight: 2 }
];
