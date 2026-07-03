import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Play, RefreshCw, ArrowRight } from 'lucide-react';

interface InteractiveDemoProps {
  category: string;
}

export const InteractiveDemo = ({ category }: InteractiveDemoProps) => {
  switch (category) {
    case 'Stack':
      return <StackDemo />;
    case 'Queue':
      return <QueueDemo />;
    case 'Linked List':
      return <LinkedListDemo />;
    case 'Trees':
      return <TreeDemo />;
    case 'Graphs':
      return <GraphDemo />;
    case 'Sorting':
      return <SortingDemo />;
    case 'Searching':
      return <SearchingDemo />;
    case 'Dynamic Programming':
      return <DpDemo />;
    default:
      return (
        <div className="text-center p-4 text-xs text-slate-500">
          No live demonstration available for {category}.
        </div>
      );
  }
};

// --- 1. STACK DEMO ---
const StackDemo = () => {
  const [items, setItems] = useState<number[]>([42, 17, 88]);
  const push = () => {
    if (items.length >= 6) return;
    const val = Math.floor(Math.random() * 90) + 10;
    setItems((prev) => [...prev, val]);
  };
  const pop = () => {
    setItems((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-xs font-bold text-slate-400">Stack (LIFO) Demo</span>
        <div className="flex gap-1.5">
          <button onClick={push} disabled={items.length >= 6} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition disabled:opacity-50 flex items-center gap-1">
            <Plus size={12} /> Push
          </button>
          <button onClick={pop} disabled={items.length === 0} className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/10 transition disabled:opacity-50 flex items-center gap-1">
            <Trash size={12} /> Pop
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end w-36 border-x-2 border-b-2 border-slate-500 rounded-b-lg p-2 gap-1.5 bg-slate-950/40">
        <AnimatePresence initial={false}>
          {items.map((val, idx) => (
            <motion.div
              key={idx + '-' + val}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="h-9 w-full bg-pink-500/20 border border-pink-400/40 rounded text-pink-100 flex items-center justify-center font-mono font-bold text-xs"
            >
              {val} {idx === items.length - 1 ? '← TOP' : ''}
            </motion.div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-[10px] text-slate-600 mb-2 italic">Stack Empty</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- 2. QUEUE DEMO ---
const QueueDemo = () => {
  const [items, setItems] = useState<number[]>([12, 56, 74]);
  const enqueue = () => {
    if (items.length >= 6) return;
    const val = Math.floor(Math.random() * 90) + 10;
    setItems((prev) => [...prev, val]);
  };
  const dequeue = () => {
    setItems((prev) => prev.slice(1));
  };

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-xs font-bold text-slate-400">Queue (FIFO) Demo</span>
        <div className="flex gap-1.5">
          <button onClick={enqueue} disabled={items.length >= 6} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition disabled:opacity-50 flex items-center gap-1">
            <Plus size={12} /> Enqueue
          </button>
          <button onClick={dequeue} disabled={items.length === 0} className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/10 transition disabled:opacity-50 flex items-center gap-1">
            <Trash size={12} /> Dequeue
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full bg-slate-950/40 rounded-lg p-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 border-y-2 border-slate-500 py-4 px-2 min-w-max">
          <AnimatePresence initial={false}>
            {items.map((val, idx) => (
              <motion.div
                key={idx + '-' + val}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="h-12 w-12 bg-emerald-500/20 border border-emerald-400/40 rounded-md text-emerald-100 flex flex-col items-center justify-center font-mono font-bold text-xs"
              >
                <span>{val}</span>
                <span className="text-[8px] font-normal text-emerald-300">
                  {idx === 0 ? 'FRONT' : idx === items.length - 1 ? 'REAR' : ''}
                </span>
              </motion.div>
            ))}
            {items.length === 0 && (
              <div className="text-center text-[10px] text-slate-600 italic">Queue Empty</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- 3. LINKED LIST DEMO ---
const LinkedListDemo = () => {
  const [nodes, setNodes] = useState<number[]>([15, 30, 45]);
  const insert = () => {
    if (nodes.length >= 5) return;
    const val = Math.floor(Math.random() * 90) + 10;
    setNodes((prev) => [...prev, val]);
  };
  const removeHead = () => {
    setNodes((prev) => prev.slice(1));
  };

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-xs font-bold text-slate-400">Linked List Demo</span>
        <div className="flex gap-1.5">
          <button onClick={insert} disabled={nodes.length >= 5} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition disabled:opacity-50 flex items-center gap-1">
            <Plus size={12} /> Append
          </button>
          <button onClick={removeHead} disabled={nodes.length === 0} className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/10 transition disabled:opacity-50 flex items-center gap-1">
            <Trash size={12} /> Delete Head
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full bg-slate-950/40 rounded-lg p-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max px-4">
          <AnimatePresence initial={false}>
            {nodes.map((val, idx) => (
              <React.Fragment key={idx + '-' + val}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  className="flex rounded-md border border-cyan-400/30 bg-cyan-500/10 overflow-hidden"
                >
                  <div className="h-10 w-10 flex items-center justify-center text-xs font-mono font-bold text-white border-r border-cyan-400/20">
                    {val}
                  </div>
                  <div className="h-10 w-6 flex items-center justify-center bg-black/20 text-[9px] text-cyan-300 font-mono">
                    {idx === nodes.length - 1 ? 'NULL' : 'ptr'}
                  </div>
                </motion.div>
                {idx < nodes.length - 1 && (
                  <ArrowRight size={14} className="text-cyan-400 animate-pulse shrink-0" />
                )}
              </React.Fragment>
            ))}
            {nodes.length === 0 && (
              <div className="text-center text-[10px] text-slate-600 italic">List is Empty</div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- 4. TREE DEMO ---
const TreeDemo = () => {
  const [visited, setVisited] = useState<number>(-1);
  const triggerInorder = async () => {
    // Traverse indices in-order: N4 (3), N2 (1), N5 (4), N1 (0), N6 (5), N3 (2), N7 (6)
    const order = [3, 1, 4, 0, 5, 2, 6];
    for (const idx of order) {
      setVisited(idx);
      await new Promise((r) => setTimeout(r, 600));
    }
    setVisited(-1);
  };

  const treeNodes = [
    { label: '50', x: '50%', y: '15%' }, // 0
    { label: '30', x: '25%', y: '45%' }, // 1
    { label: '70', x: '75%', y: '45%' }, // 2
    { label: '20', x: '12%', y: '75%' }, // 3
    { label: '40', x: '38%', y: '75%' }, // 4
    { label: '60', x: '62%', y: '75%' }, // 5
    { label: '80', x: '88%', y: '75%' }  // 6
  ];

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-1">
        <span className="text-xs font-bold text-slate-400">Binary Search Tree (BST)</span>
        <button onClick={triggerInorder} disabled={visited !== -1} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition flex items-center gap-1 disabled:opacity-50">
          <Play size={12} /> In-Order Visit
        </button>
      </div>

      <div className="relative flex-1 w-full bg-slate-950/40 rounded-lg overflow-hidden border border-white/5">
        <svg className="absolute inset-0 h-full w-full text-slate-700/40 pointer-events-none">
          <line x1="50%" y1="20%" x2="25%" y2="45%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="50%" y1="20%" x2="75%" y2="45%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="25%" y1="50%" x2="12%" y2="75%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="25%" y1="50%" x2="38%" y2="75%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="75%" y1="50%" x2="62%" y2="75%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="75%" y1="50%" x2="88%" y2="75%" stroke="currentColor" strokeWidth={1.5} />
        </svg>

        {treeNodes.map((n, idx) => (
          <div
            key={idx}
            style={{ left: n.x, top: n.y, transform: 'translate(-50%, -50%)' }}
            className={`absolute h-8 w-8 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center transition-all duration-300 ${
              visited === idx 
                ? 'border-cyan-300 bg-cyan-300/30 text-cyan-100 scale-125' 
                : 'border-white/10 bg-slate-900 text-slate-300'
            }`}
          >
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 5. GRAPH DEMO ---
const GraphDemo = () => {
  const [visited, setVisited] = useState<string[]>([]);
  const triggerBfs = async () => {
    setVisited([]);
    const sequence = ['A', 'B', 'C', 'D', 'E'];
    for (const node of sequence) {
      setVisited((prev) => [...prev, node]);
      await new Promise((r) => setTimeout(r, 500));
    }
  };

  const graphNodes = [
    { id: 'A', x: '50%', y: '15%' },
    { id: 'B', x: '25%', y: '45%' },
    { id: 'C', x: '75%', y: '45%' },
    { id: 'D', x: '35%', y: '80%' },
    { id: 'E', x: '65%', y: '80%' }
  ];

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-1">
        <span className="text-xs font-bold text-slate-400">Graph Structure (BFS Traversal)</span>
        <button onClick={triggerBfs} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition flex items-center gap-1">
          <Play size={12} /> Play BFS
        </button>
      </div>

      <div className="relative flex-1 w-full bg-slate-950/40 rounded-lg overflow-hidden border border-white/5">
        <svg className="absolute inset-0 h-full w-full text-slate-700/30 pointer-events-none">
          <line x1="50%" y1="15%" x2="25%" y2="45%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="50%" y1="15%" x2="75%" y2="45%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="25%" y1="45%" x2="75%" y2="45%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="25%" y1="45%" x2="35%" y2="80%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="75%" y1="45%" x2="65%" y2="80%" stroke="currentColor" strokeWidth={1.5} />
          <line x1="35%" y1="80%" x2="65%" y2="80%" stroke="currentColor" strokeWidth={1.5} />
        </svg>

        {graphNodes.map((n) => {
          const isVisited = visited.includes(n.id);
          const isCurrent = visited[visited.length - 1] === n.id;
          return (
            <div
              key={n.id}
              style={{ left: n.x, top: n.y, transform: 'translate(-50%, -50%)' }}
              className={`absolute h-8 w-8 rounded-md border text-[10px] font-mono font-bold flex items-center justify-center transition-all duration-300 ${
                isCurrent 
                  ? 'border-pink-400 bg-pink-400/35 text-white scale-125' 
                  : isVisited 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' 
                  : 'border-white/10 bg-slate-900 text-slate-300'
              }`}
            >
              {n.id}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 6. SORTING DEMO ---
const SortingDemo = () => {
  const [array, setArray] = useState<number[]>([65, 34, 90, 12, 45, 23]);
  const [comparing, setComparing] = useState<number[]>([]);
  
  const stepBubble = async () => {
    let arr = [...array];
    let swapped = false;
    for (let i = 0; i < arr.length - 1; i++) {
      setComparing([i, i + 1]);
      await new Promise((r) => setTimeout(r, 450));
      if (arr[i] > arr[i + 1]) {
        let tmp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = tmp;
        setArray([...arr]);
        swapped = true;
      }
    }
    setComparing([]);
    if (!swapped) {
      alert("Array is fully sorted!");
    }
  };

  const shuffle = () => {
    setArray(Array.from({ length: 6 }, () => Math.floor(Math.random() * 80) + 15));
    setComparing([]);
  };

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-xs font-bold text-slate-400">Sorting Demo</span>
        <div className="flex gap-1.5">
          <button onClick={stepBubble} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition flex items-center gap-1">
            <Play size={11} /> Bubble Pass
          </button>
          <button onClick={shuffle} className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/10 transition flex items-center gap-1">
            <RefreshCw size={11} /> Shuffle
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950/40 rounded-lg p-3 flex items-end justify-around gap-2.5">
        {array.map((val, idx) => {
          const isComp = comparing.includes(idx);
          return (
            <div key={idx} className="flex flex-col items-center gap-1 w-full">
              <span className="text-[9px] font-mono text-slate-400 font-bold">{val}</span>
              <motion.div
                layout
                style={{ height: `${val * 1.5}px` }}
                className={`w-full rounded-t-sm transition-colors duration-300 ${
                  isComp ? 'bg-pink-400' : 'bg-cyan-300/60 border-t-2 border-cyan-400'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- 7. SEARCHING DEMO ---
const SearchingDemo = () => {
  const sortedArray = [11, 23, 35, 48, 62, 75, 89];
  const [target, setTarget] = useState(48);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [found, setFound] = useState(false);

  const startSearch = async () => {
    setActiveIdx(-1);
    setFound(false);
    // Linear search simulation
    for (let i = 0; i < sortedArray.length; i++) {
      setActiveIdx(i);
      await new Promise((r) => setTimeout(r, 550));
      if (sortedArray[i] === target) {
        setFound(true);
        break;
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-xs font-bold text-slate-400">Searching Demo</span>
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-slate-400">Target:</label>
          <select 
            value={target} 
            onChange={(e) => { setTarget(Number(e.target.value)); setActiveIdx(-1); setFound(false); }}
            className="bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white"
          >
            {sortedArray.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <button onClick={startSearch} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition flex items-center gap-1">
            <Play size={11} /> Find
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950/40 rounded-lg p-2 flex items-center justify-center gap-1.5 flex-wrap">
        {sortedArray.map((val, idx) => {
          const isActive = activeIdx === idx;
          const isMatched = val === target && found && activeIdx === idx;
          return (
            <div
              key={idx}
              className={`h-11 w-11 rounded-md border flex flex-col items-center justify-center transition-all duration-300 ${
                isMatched 
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100 font-bold scale-110' 
                  : isActive 
                  ? 'border-pink-400 bg-pink-500/20 text-pink-100 font-bold scale-105' 
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              <span className="text-xs font-mono">{val}</span>
              <span className="text-[8px] font-sans text-slate-500">[{idx}]</span>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-slate-400 text-center min-h-[1rem]">
        {activeIdx !== -1 ? (found ? `Match found at index ${activeIdx}!` : `Checking index ${activeIdx}...`) : 'Choose a target key and press Find'}
      </div>
    </div>
  );
};

// --- 8. DYNAMIC PROGRAMMING DEMO ---
const DpDemo = () => {
  const [steps, setSteps] = useState<number[]>([0, 1]);
  
  const stepDp = () => {
    if (steps.length >= 8) return;
    setSteps((prev) => {
      const nextVal = prev[prev.length - 1] + prev[prev.length - 2];
      return [...prev, nextVal];
    });
  };

  const reset = () => {
    setSteps([0, 1]);
  };

  return (
    <div className="flex flex-col items-center justify-between h-[280px] p-4 bg-slate-900/60 rounded-xl border border-white/5">
      <div className="flex justify-between w-full items-center mb-2">
        <span className="text-xs font-bold text-slate-400">Fibonacci DP Tabulation</span>
        <div className="flex gap-1.5">
          <button onClick={stepDp} disabled={steps.length >= 8} className="px-2 py-1 bg-cyan-400 text-slate-950 text-xs font-bold rounded-md hover:bg-cyan-300 transition flex items-center gap-1 disabled:opacity-50">
            <Plus size={11} /> Next State
          </button>
          <button onClick={reset} className="px-2 py-1 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/10 transition flex items-center gap-1">
            <RefreshCw size={11} /> Reset
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950/40 rounded-lg p-3 flex flex-wrap gap-2 items-center justify-center overflow-y-auto">
        <AnimatePresence initial={false}>
          {steps.map((val, idx) => (
            <motion.div
              key={idx + '-' + val}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center border border-cyan-400/20 bg-cyan-300/5 rounded p-1.5 min-w-[50px]"
            >
              <span className="text-[8px] text-slate-500 font-mono">F({idx})</span>
              <span className="text-xs font-mono font-bold text-cyan-200">{val}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-[10px] text-slate-400 text-center leading-4 max-w-[240px]">
        F(N) = F(N-1) + F(N-2). DP avoids recalculation by looking up computed indices.
      </div>
    </div>
  );
};
