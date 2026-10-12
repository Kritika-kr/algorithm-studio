import { FastForward, Pause, Play, RotateCcw, SkipBack, SkipForward, Shuffle, RefreshCw } from 'lucide-react';
import { AlgorithmInfo } from '../../types/algorithm';

interface ControlsPanelProps {
  algorithm: AlgorithmInfo;
  algorithms: AlgorithmInfo[];
  onAlgorithm: (id: string) => void;
  size: number;
  speed: number;
  target: number;
  customArray: string;
  playing: boolean;
  datasetType: string;
  onDatasetType: (type: string) => void;
  onSize: (value: number) => void;
  onSpeed: (value: number) => void;
  onTarget: (value: number) => void;
  onCustomArray: (value: string) => void;
  onApplyArray: () => void;
  onShuffle: () => void;
  onReverse: () => void;
  onOperation: (operation: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
}

const datasetTypes = [
  { value: 'random', label: '🎲 Random' },
  { value: 'sorted', label: '📈 Sorted' },
  { value: 'reverse-sorted', label: '📉 Reverse Sorted' },
  { value: 'nearly-sorted', label: '📊 Nearly Sorted' },
  { value: 'few-unique', label: '🧬 Few Unique Values' },
  { value: 'large-numbers', label: '⛰️ Large Numbers' }
];

export const ControlsPanel = ({
  algorithm,
  algorithms,
  onAlgorithm,
  size,
  speed,
  target,
  customArray,
  playing,
  datasetType,
  onDatasetType,
  onSize,
  onSpeed,
  onTarget,
  onCustomArray,
  onApplyArray,
  onShuffle,
  onReverse,
  onOperation,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset
}: ControlsPanelProps) => (
  <section className="glass-panel border border-white/10 bg-slate-950/70 p-4 shadow-xl backdrop-blur-md">
    <h2 className="panel-title flex items-center gap-2">
      <RefreshCw size={18} className="text-cyan-300 animate-spin-slow" />
      Control Studio
    </h2>
    
    <div className="mt-4 space-y-4">
      {/* Algorithm selector */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Select Algorithm
        <select 
          value={algorithm.id} 
          onChange={(event) => onAlgorithm(event.target.value)} 
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white focus:border-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-300"
        >
          {algorithms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>

      {/* Dataset Generator Type */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Dataset Distribution
        <select 
          value={datasetType} 
          onChange={(event) => onDatasetType(event.target.value)} 
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white focus:border-cyan-300 focus:outline-none"
        >
          {datasetTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>

      {/* Sliders Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Range label="Array Size" value={size} min={6} max={64} onChange={onSize} />
        <Range label="Delay (Speed)" value={speed} min={40} max={700} onChange={onSpeed} reverse />
      </div>

      {/* Shuffle & Reverse Actions */}
      {algorithm.category === 'Sorting' || algorithm.category === 'Searching' ? (
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onShuffle} 
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <Shuffle size={14} />
            Shuffle
          </button>
          <button 
            onClick={onReverse} 
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <SkipBack size={14} className="rotate-90" />
            Reverse
          </button>
        </div>
      ) : algorithm.category !== 'Graphs' && algorithm.category !== 'Dynamic Programming' ? (
        <OperationButtons category={algorithm.category} onOperation={onOperation} />
      ) : null}

      {/* Target Input (e.g. for searching) */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Target Search Value
        <input 
          value={target} 
          onChange={(event) => onTarget(Number(event.target.value))} 
          type="number" 
          className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white focus:border-cyan-300 focus:outline-none"
        />
      </label>

      {/* Custom Input Array */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Custom CSV Input
        <div className="mt-2 flex gap-2">
          <input 
            value={customArray} 
            onChange={(event) => onCustomArray(event.target.value)} 
            placeholder="e.g. 42, 17, 88, 9, 31" 
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/80 px-3.5 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
          />
          <button 
            onClick={onApplyArray} 
            className="rounded-lg bg-cyan-400/25 px-4 text-xs font-bold text-cyan-200 border border-cyan-400/30 hover:bg-cyan-400/35 transition"
          >
            Apply
          </button>
        </div>
      </label>

      {/* Playback controls */}
      <div className="pt-2">
        <div className="grid grid-cols-5 gap-1.5">
          <button className="icon-button h-10 hover:text-white" title="Step backward" onClick={onStepBack}><SkipBack size={15} /></button>
          <button className="icon-button h-10 hover:text-white" title="Reset" onClick={onReset}><RotateCcw size={15} /></button>
          <button 
            className="flex items-center justify-center rounded-lg bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md shadow-cyan-400/10 h-10 font-bold transition" 
            title={playing ? 'Pause' : 'Play'} 
            onClick={playing ? onPause : onPlay}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="icon-button h-10 hover:text-white" title="Step forward" onClick={onStepForward}><SkipForward size={15} /></button>
          <button className="icon-button h-10 hover:text-white" title="Fast forward / Resume" onClick={onPlay}><FastForward size={15} /></button>
        </div>
      </div>
    </div>
  </section>
);

const Range = ({ label, value, min, max, reverse, onChange }: { label: string; value: number; min: number; max: number; reverse?: boolean; onChange: (value: number) => void }) => (
  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
    {label}
    <input 
      value={value} 
      min={min} 
      max={max} 
      onChange={(event) => onChange(Number(event.target.value))} 
      type="range" 
      className="mt-3.5 w-full accent-cyan-300" 
    />
    <span className="mt-1 block text-right text-[10px] text-slate-500 font-bold">
      {reverse ? `${Math.round(740 - value)}ms` : `${value} items`}
    </span>
  </label>
);

const operationSets: Record<string, Array<{ label: string; value: string }>> = {
  'Linked List': [
    { label: 'Insert tail', value: 'insert-tail' },
    { label: 'Insert head', value: 'insert-head' },
    { label: 'Search', value: 'search' },
    { label: 'Delete head', value: 'delete-head' },
    { label: 'Delete tail', value: 'delete-tail' },
    { label: 'Reverse', value: 'reverse' },
    { label: 'Traverse', value: 'visit' }
  ],
  Stack: [
    { label: 'Push', value: 'push' },
    { label: 'Peek', value: 'peek' },
    { label: 'Pop', value: 'pop' },
    { label: 'Is empty?', value: 'is-empty' },
    { label: 'Clear', value: 'clear' }
  ],
  Queue: [
    { label: 'Enqueue', value: 'enqueue' },
    { label: 'Peek', value: 'peek' },
    { label: 'Dequeue', value: 'dequeue' },
    { label: 'Is empty?', value: 'is-empty' },
    { label: 'Clear', value: 'clear' }
  ],
  Trees: [
    { label: 'Insert', value: 'insert' },
    { label: 'Search', value: 'search' },
    { label: 'Delete', value: 'delete' },
    { label: 'Inorder', value: 'inorder' },
    { label: 'Preorder', value: 'preorder' },
    { label: 'Postorder', value: 'postorder' },
    { label: 'Level order', value: 'levelorder' }
  ],
};

const OperationButtons = ({ category, onOperation }: { category: string; onOperation: (operation: string) => void }) => {
  const operations = operationSets[category] ?? [];
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Operations</div>
      <div className="grid grid-cols-3 gap-2">
        {operations.map((operation) => (
          <button
            key={operation.value}
            onClick={() => onOperation(operation.value)}
            className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-2 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            {operation.label}
          </button>
        ))}
      </div>
    </div>
  );
};
