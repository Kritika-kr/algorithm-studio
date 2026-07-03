import { useEffect, useMemo, useState } from 'react';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  SkipForward, 
  Trophy, 
  TrendingUp, 
  Check, 
  Zap, 
  Clock, 
  Lock, 
  Unlock,
  AlertTriangle,
  Lightbulb,
  XCircle,
  Plus
} from 'lucide-react';
import { algorithms, categories } from '../../data/algorithms';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import { requestAnimationSteps } from '../../services/algorithmApi';
import { AlgorithmCategory, AlgorithmInfo, StepResponse } from '../../types/algorithm';
import { WorkspaceVisualizer } from '../visualizers/WorkspaceVisualizer';
import { StatisticsPanel } from '../panels/StatisticsPanel';
import { CodePanel } from '../panels/CodePanel';
import { compareData } from '../../data/compareData';
import { InteractiveDemo } from './InteractiveDemo';

const emptyResponse: StepResponse = {
  steps: [],
  stats: { comparisons: 0, swaps: 0, recursionDepth: 0, visitedNodes: 0, executionTimeMs: 0, memoryBytes: 0 }
};

const makeArray = (size = 18) => Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);

const firstPair = (category: AlgorithmCategory): [AlgorithmInfo, AlgorithmInfo] => {
  const scoped = algorithms.filter((item) => item.category === category);
  return [scoped[0] ?? algorithms[0], scoped[1] ?? scoped[0] ?? algorithms[0]];
};

interface CompareModeProps {
  initialLeftId?: string | null;
  initialRightId?: string | null;
}

const algoPropsMap: Record<string, { stable: boolean; adaptive: boolean; inPlace: boolean; recursive: boolean }> = {
  'bubble-sort': { stable: true, adaptive: true, inPlace: true, recursive: false },
  'selection-sort': { stable: false, adaptive: false, inPlace: true, recursive: false },
  'insertion-sort': { stable: true, adaptive: true, inPlace: true, recursive: false },
  'merge-sort': { stable: true, adaptive: false, inPlace: false, recursive: true },
  'quick-sort': { stable: false, adaptive: false, inPlace: true, recursive: true },
  'heap-sort': { stable: false, adaptive: false, inPlace: true, recursive: false },
  'linear-search': { stable: true, adaptive: true, inPlace: true, recursive: false },
  'binary-search': { stable: true, adaptive: false, inPlace: true, recursive: false },
  'jump-search': { stable: true, adaptive: false, inPlace: true, recursive: false },
  'interpolation-search': { stable: true, adaptive: false, inPlace: true, recursive: false },
  'bfs': { stable: true, adaptive: false, inPlace: true, recursive: false },
  'dfs': { stable: true, adaptive: false, inPlace: true, recursive: true },
  'dijkstra': { stable: false, adaptive: false, inPlace: true, recursive: false },
  'prim': { stable: false, adaptive: false, inPlace: true, recursive: false },
  'kruskal': { stable: false, adaptive: false, inPlace: true, recursive: false },
  'topological-sort': { stable: false, adaptive: false, inPlace: true, recursive: true }
};

export const CompareMode = ({ initialLeftId, initialRightId }: CompareModeProps) => {
  const [leftCategory, setLeftCategory] = useState<AlgorithmCategory>(() => {
    if (initialLeftId) {
      const leftAlgo = algorithms.find((a) => a.id === initialLeftId);
      if (leftAlgo) return leftAlgo.category;
    }
    return 'Sorting';
  });

  const [rightCategory, setRightCategory] = useState<AlgorithmCategory>(() => {
    if (initialRightId) {
      const rightAlgo = algorithms.find((a) => a.id === initialRightId);
      if (rightAlgo) return rightAlgo.category;
    }
    return 'Sorting';
  });

  const [leftAlgorithm, setLeftAlgorithm] = useState(() => initialLeftId || firstPair('Sorting')[0].id);
  const [rightAlgorithm, setRightAlgorithm] = useState(() => initialRightId || firstPair('Sorting')[1].id);

  const [array, setArray] = useState(() => makeArray());
  const [target, setTarget] = useState(42);
  const [leftSpeed, setLeftSpeed] = useState(260);
  const [rightSpeed, setRightSpeed] = useState(260);
  const [lockSpeeds, setLockSpeeds] = useState(true);
  const [leftResponse, setLeftResponse] = useState<StepResponse>(emptyResponse);
  const [rightResponse, setRightResponse] = useState<StepResponse>(emptyResponse);
  const [error, setError] = useState('');
  const [dashMinimized, setDashMinimized] = useState(false);

  const leftScopedAlgorithms = useMemo(() => algorithms.filter((item) => item.category === leftCategory), [leftCategory]);
  const rightScopedAlgorithms = useMemo(() => algorithms.filter((item) => item.category === rightCategory), [rightCategory]);

  const left = algorithms.find((item) => item.id === leftAlgorithm) ?? leftScopedAlgorithms[0] ?? algorithms[0];
  const right = algorithms.find((item) => item.id === rightAlgorithm) ?? rightScopedAlgorithms[1] ?? rightScopedAlgorithms[0] ?? algorithms[0];

  const leftPlayer = useAnimationPlayer(leftResponse.steps, leftResponse.stats, leftSpeed);
  const rightPlayer = useAnimationPlayer(rightResponse.steps, rightResponse.stats, lockSpeeds ? leftSpeed : rightSpeed);

  const isDualAnimationMode = leftCategory === rightCategory;

  // Sync inputs from props
  useEffect(() => {
    if (initialLeftId) {
      setLeftAlgorithm(initialLeftId);
      const leftAlgo = algorithms.find((a) => a.id === initialLeftId);
      if (leftAlgo) setLeftCategory(leftAlgo.category);
    }
    if (initialRightId) {
      setRightAlgorithm(initialRightId);
      const rightAlgo = algorithms.find((a) => a.id === initialRightId);
      if (rightAlgo) setRightCategory(rightAlgo.category);
    }
  }, [initialLeftId, initialRightId]);

  // Handle Category changes and select first item
  const handleLeftCategoryChange = (cat: AlgorithmCategory) => {
    setLeftCategory(cat);
    const scoped = algorithms.filter((item) => item.category === cat);
    if (scoped.length > 0) {
      setLeftAlgorithm(scoped[0].id);
    }
  };

  const handleRightCategoryChange = (cat: AlgorithmCategory) => {
    setRightCategory(cat);
    const scoped = algorithms.filter((item) => item.category === cat);
    if (scoped.length > 0) {
      // If categories are the same, try to pick the second algorithm for variety
      if (leftCategory === cat && scoped.length > 1) {
        setRightAlgorithm(scoped[1].id);
      } else {
        setRightAlgorithm(scoped[0].id);
      }
    }
  };

  useEffect(() => {
    if (!isDualAnimationMode) {
      setLeftResponse(emptyResponse);
      setRightResponse(emptyResponse);
      return;
    }

    let cancelled = false;
    setError('');
    Promise.all([
      requestAnimationSteps({ id: left.id, category: left.category, array, target }),
      requestAnimationSteps({ id: right.id, category: right.category, array, target })
    ])
      .then(([leftData, rightData]) => {
        if (!cancelled) {
          setLeftResponse(leftData);
          setRightResponse(rightData);
        }
      })
      .catch((reason: Error) => {
        if (!cancelled) {
          setLeftResponse(emptyResponse);
          setRightResponse(emptyResponse);
          setError(reason.message || 'Backend is unavailable');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [array, left.id, left.category, right.id, right.category, target, isDualAnimationMode]);

  const leftDone = leftPlayer.currentIndex >= leftResponse.steps.length - 1 && leftResponse.steps.length > 0;
  const rightDone = rightPlayer.currentIndex >= rightResponse.steps.length - 1 && rightResponse.steps.length > 0;
  const bothDone = leftDone && rightDone;

  const leftStatus = leftPlayer.playing ? 'Running' : leftDone ? 'Finished' : 'Paused';
  const rightStatus = rightPlayer.playing ? 'Running' : rightDone ? 'Finished' : 'Paused';

  // Dynamic Winner Analysis (Only for matching categories)
  const winnerAnalysis = useMemo(() => {
    if (!bothDone || !isDualAnimationMode) return null;

    const leftStats = leftPlayer.liveStats;
    const rightStats = rightPlayer.liveStats;

    const leftCost = leftStats.comparisons + (leftStats.swaps * 2) + (leftStats.writes || 0);
    const rightCost = rightStats.comparisons + (rightStats.swaps * 2) + (rightStats.writes || 0);

    const winnerName = leftCost === rightCost ? 'Tie' : leftCost < rightCost ? left.name : right.name;
    const isLeftWinner = winnerName === left.name;
    const diffCompares = Math.abs(leftStats.comparisons - rightStats.comparisons);
    const diffSwaps = Math.abs(leftStats.swaps - rightStats.swaps);
    const diffTime = Math.abs(leftStats.executionTimeMs - rightStats.executionTimeMs);
    const diffMemory = Math.abs(leftStats.memoryBytes - rightStats.memoryBytes);

    const reasons: string[] = [];
    if (diffCompares > 0) reasons.push(`${diffCompares} fewer comparisons.`);
    if (diffSwaps > 0) reasons.push(`${diffSwaps} fewer array swaps.`);
    if (diffTime > 0) reasons.push(`${diffTime}ms lower execution estimate.`);
    if (diffMemory > 0) reasons.push(`${Math.round(diffMemory / 10.24) / 100} KB lower estimated memory footprint.`);
    reasons.push('Better processing layout on this specific dataset.');

    return {
      winner: winnerName,
      isLeft: isLeftWinner,
      isTie: winnerName === 'Tie',
      reasons: reasons.slice(0, 4)
    };
  }, [bothDone, leftPlayer.liveStats, rightPlayer.liveStats, left, right, isDualAnimationMode]);

  const leftColor = 'text-emerald-400';
  const rightColor = 'text-purple-400';

  const startBoth = () => {
    if (!leftDone) leftPlayer.play();
    if (!rightDone) rightPlayer.play();
  };
  const pauseBoth = () => {
    leftPlayer.pause();
    rightPlayer.pause();
  };
  const resetBoth = () => {
    leftPlayer.reset();
    rightPlayer.reset();
  };
  const stepBoth = () => {
    leftPlayer.stepForward();
    rightPlayer.stepForward();
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Comparison Lab</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Algorithm Duel & Comparison Arena</h1>
        </div>
        {isDualAnimationMode && (
          <div className="flex gap-2">
            <button 
              onClick={() => setArray(makeArray())} 
              className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/15 transition shadow-lg shadow-cyan-400/5"
            >
              Randomize Array
            </button>
          </div>
        )}
      </div>

      {/* Arena Configuration */}
      <section className="glass-panel p-4 border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur-md">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          {/* Left Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Left Side Selection</span>
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={leftCategory} 
                onChange={(event) => handleLeftCategoryChange(event.target.value as AlgorithmCategory)} 
                className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              >
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select 
                value={leftAlgorithm} 
                onChange={(event) => setLeftAlgorithm(event.target.value)} 
                className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              >
                {leftScopedAlgorithms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>

          {/* Right Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Right Side Selection</span>
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={rightCategory} 
                onChange={(event) => handleRightCategoryChange(event.target.value as AlgorithmCategory)} 
                className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              >
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select 
                value={rightAlgorithm} 
                onChange={(event) => setRightAlgorithm(event.target.value)} 
                className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
              >
                {rightScopedAlgorithms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>

          {/* Dual Play Controls */}
          {isDualAnimationMode ? (
            <div className="flex flex-wrap gap-2">
              <button className="toolbar-button bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={startBoth}><Play size={14} />Play Both</button>
              <button className="toolbar-button bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10" onClick={pauseBoth}><Pause size={14} />Pause Both</button>
              <button className="toolbar-button bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10" onClick={resetBoth}><RotateCcw size={14} />Reset Both</button>
              <button className="toolbar-button bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10" onClick={stepBoth}><SkipForward size={14} />Step Both</button>
            </div>
          ) : (
            <div className="h-10 flex items-center text-xs text-amber-300 font-semibold px-3 border border-amber-500/20 bg-amber-500/5 rounded-lg gap-1.5 max-w-sm">
              <AlertTriangle size={14} />
              Educational Mode Activated (Different Categories Selected)
            </div>
          )}
        </div>

        {isDualAnimationMode && (
          <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
              <input 
                type="checkbox" 
                checked={lockSpeeds} 
                onChange={(event) => setLockSpeeds(event.target.checked)} 
                className="accent-cyan-300 rounded" 
              />
              Lock Playback Speeds
            </label>
            {lockSpeeds ? <Lock size={12} className="text-cyan-300" /> : <Unlock size={12} className="text-slate-500" />}
          </div>
        )}
      </section>

      {error && isDualAnimationMode && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      {/* --- DUEL VIEWPORTS OR EDUCATIONAL BOARD SWITCHER --- */}
      {isDualAnimationMode ? (
        <>
          {/* Main Duel Viewports */}
          <section className="grid gap-6 xl:grid-cols-2">
            <ComparePanel
              title="Algorithm A (Left)"
              algorithm={left}
              algorithms={leftScopedAlgorithms}
              onAlgorithm={setLeftAlgorithm}
              array={array}
              response={leftResponse}
              player={leftPlayer}
              speed={leftSpeed}
              accentColor="emerald"
              accentHex="#10b981"
              onSpeed={(value) => {
                setLeftSpeed(value);
                if (lockSpeeds) setRightSpeed(value);
              }}
            />
            <ComparePanel
              title="Algorithm B (Right)"
              algorithm={right}
              algorithms={rightScopedAlgorithms}
              onAlgorithm={setRightAlgorithm}
              array={array}
              response={rightResponse}
              player={rightPlayer}
              speed={lockSpeeds ? leftSpeed : rightSpeed}
              accentColor="purple"
              accentHex="#a855f7"
              onSpeed={setRightSpeed}
            />
          </section>

          {/* Dynamic Summary Winner & Complexity Grid */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Complexity Side-by-Side Card */}
            <div className="glass-panel p-4 border border-white/10 bg-slate-950/70 shadow-lg">
              <h3 className="panel-title flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-cyan-300" />
                Asymptotic Properties Grid
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5">Attribute</th>
                      <th className="py-2.5 text-emerald-400">{left.name}</th>
                      <th className="py-2.5 text-purple-400">{right.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="py-2 font-semibold">Best-Case Time</td>
                      <td className="py-2 font-semibold">{left.complexity.best}</td>
                      <td className="py-2 font-semibold">{right.complexity.best}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Average-Case Time</td>
                      <td className="py-2 font-semibold">{left.complexity.average}</td>
                      <td className="py-2 font-semibold">{right.complexity.average}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Worst-Case Time</td>
                      <td className="py-2 font-semibold">{left.complexity.worst}</td>
                      <td className="py-2 font-semibold">{right.complexity.worst}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Space Complexity</td>
                      <td className="py-2 font-semibold">{left.complexity.space}</td>
                      <td className="py-2 font-semibold">{right.complexity.space}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Stable Output</td>
                      <td className={`py-2 font-bold ${algoPropsMap[left.id]?.stable ? 'text-emerald-400 bg-emerald-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[left.id]?.stable ? 'Yes' : 'No'}
                      </td>
                      <td className={`py-2 font-bold ${algoPropsMap[right.id]?.stable ? 'text-emerald-400 bg-emerald-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[right.id]?.stable ? 'Yes' : 'No'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Adaptive Execution</td>
                      <td className={`py-2 font-bold ${algoPropsMap[left.id]?.adaptive ? 'text-emerald-400 bg-emerald-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[left.id]?.adaptive ? 'Yes' : 'No'}
                      </td>
                      <td className={`py-2 font-bold ${algoPropsMap[right.id]?.adaptive ? 'text-emerald-400 bg-emerald-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[right.id]?.adaptive ? 'Yes' : 'No'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">In-Place Storage</td>
                      <td className={`py-2 font-bold ${algoPropsMap[left.id]?.inPlace ? 'text-emerald-400 bg-emerald-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[left.id]?.inPlace ? 'Yes' : 'No'}
                      </td>
                      <td className={`py-2 font-bold ${algoPropsMap[right.id]?.inPlace ? 'text-emerald-400 bg-emerald-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[right.id]?.inPlace ? 'Yes' : 'No'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Recursive Strategy</td>
                      <td className={`py-2 font-bold ${algoPropsMap[left.id]?.recursive ? 'text-purple-400 bg-purple-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[left.id]?.recursive ? 'Yes' : 'No'}
                      </td>
                      <td className={`py-2 font-bold ${algoPropsMap[right.id]?.recursive ? 'text-purple-400 bg-purple-400/5 px-2 rounded' : 'text-slate-400'}`}>
                        {algoPropsMap[right.id]?.recursive ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Winner Analysis summary card */}
            <div className="glass-panel p-4 border border-white/10 bg-slate-950/70 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="panel-title flex items-center gap-2 mb-4">
                  <Trophy size={18} className="text-amber-400" />
                  Runtime Winner Analysis
                </h3>
                {bothDone && winnerAnalysis ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-400/10 text-amber-400">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Winning Execution</div>
                        <div className="text-lg font-bold text-white">
                          {winnerAnalysis.isTie ? "It's a Statistical Tie!" : winnerAnalysis.winner}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance Reasons:</div>
                      <ul className="space-y-1.5">
                        {winnerAnalysis.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                            <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Clock size={32} className="text-slate-600 animate-pulse" />
                    <span>Waiting for both timelines to complete execution...</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 border-t border-white/5 pt-3 text-[11px] leading-5 text-slate-400">
                <strong>Big-O vs Reality:</strong> Big-O asymptotic limits show scaling trends on infinite datasets. In this actual run, the winner is determined by the raw operations count (comparisons, buffer swaps/writes) executed by the C++ engine.
              </div>
            </div>
          </section>

          {/* Floating Live Comparison Dashboard widget */}
          <div 
            className={`fixed bottom-4 right-4 z-40 rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-md transition-all duration-300 ${
              dashMinimized ? 'w-48 p-2' : 'w-72 p-4'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <Zap size={12} className="animate-pulse" />
                Arena Stats Board
              </h4>
              <button 
                onClick={() => setDashMinimized(!dashMinimized)}
                className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-slate-400 hover:bg-white/10 hover:text-white"
              >
                {dashMinimized ? 'Maximize' : 'Minimize'}
              </button>
            </div>

            {!dashMinimized && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2 text-[10px] text-slate-400 font-bold uppercase">
                  <div className={leftColor}>{left.name}</div>
                  <div className={rightColor}>{right.name}</div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Status:</span>
                    <div className="flex gap-4 font-semibold text-white">
                      <span className={leftColor}>{leftStatus}</span>
                      <span className={rightColor}>{rightStatus}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Comparisons:</span>
                    <div className="flex gap-8 font-semibold text-white">
                      <span>{leftPlayer.liveStats.comparisons}</span>
                      <span>{rightPlayer.liveStats.comparisons}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Swaps:</span>
                    <div className="flex gap-8 font-semibold text-white">
                      <span>{leftPlayer.liveStats.swaps}</span>
                      <span>{rightPlayer.liveStats.swaps}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-400">Execution Time:</span>
                    <div className="flex gap-6 font-semibold text-white">
                      <span>{leftPlayer.liveStats.executionTimeMs}ms</span>
                      <span>{rightPlayer.liveStats.executionTimeMs}ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Memory:</span>
                    <div className="flex gap-4 font-semibold text-white">
                      <span>{Math.round(leftPlayer.liveStats.memoryBytes / 1024)}KB</span>
                      <span>{Math.round(rightPlayer.liveStats.memoryBytes / 1024)}KB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashMinimized && (
              <div className="flex flex-col gap-1 text-[10px] text-white">
                <div className="flex justify-between"><span className={leftColor}>{left.name}:</span><span>{leftPlayer.liveStats.comparisons} cmp</span></div>
                <div className="flex justify-between"><span className={rightColor}>{right.name}:</span><span>{rightPlayer.liveStats.comparisons} cmp</span></div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* EDUCATIONAL COMPARISON MODE DISPLAY */
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Left Structure Column */}
          <EducationalColumn 
            info={compareData[leftCategory] || compareData['Sorting']} 
            moduleName={left.name}
            accentColor="emerald"
            borderClass="border-emerald-500/20 bg-emerald-500/5"
            headerTextClass="text-emerald-400"
          />
          
          {/* Right Structure Column */}
          <EducationalColumn 
            info={compareData[rightCategory] || compareData['Sorting']} 
            moduleName={right.name}
            accentColor="purple"
            borderClass="border-purple-500/20 bg-purple-500/5"
            headerTextClass="text-purple-400"
          />
        </section>
      )}
    </main>
  );
};

/* --- SUB-COMPONENTS --- */

interface EducationalColumnProps {
  info: typeof compareData[string];
  moduleName: string;
  accentColor: 'emerald' | 'purple';
  borderClass: string;
  headerTextClass: string;
}

const EducationalColumn = ({ info, moduleName, accentColor, borderClass, headerTextClass }: EducationalColumnProps) => {
  return (
    <div className={`glass-panel border p-5 shadow-2xl flex flex-col gap-6 ${borderClass}`}>
      {/* Module Title */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Module Structure</span>
        <h2 className={`text-xl font-extrabold mt-0.5 ${headerTextClass}`}>{moduleName} ({info.category})</h2>
      </div>

      {/* Live Interactive Simulator Demo */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Operation Simulator</h3>
        <InteractiveDemo category={info.category} />
      </div>

      {/* Definition */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Definition</h3>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 rounded-lg p-3 border border-white/5">{info.definition}</p>
      </div>

      {/* Working Principle */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Working Principle</h3>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 rounded-lg p-3 border border-white/5">{info.workingPrinciple}</p>
      </div>

      {/* Complexity Matrix */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Asymptotic Complexity</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Time Complexity</span>
            <div className="mt-1 space-y-1 text-slate-300 font-mono">
              <div>Best: <span className="font-bold text-white">{info.timeComplexity.best}</span></div>
              <div>Avg: <span className="font-bold text-white">{info.timeComplexity.average}</span></div>
              <div>Worst: <span className="font-bold text-white">{info.timeComplexity.worst}</span></div>
            </div>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Space Complexity</span>
              <span className="mt-1 block font-mono font-bold text-white">{info.spaceComplexity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Operations */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Core Operations</h3>
        <div className="flex flex-wrap gap-1.5">
          {info.supportedOperations.map((op, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1 font-medium">
              <Plus size={10} className="text-cyan-400" /> {op}
            </span>
          ))}
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Check size={14} /> Advantages
          </h3>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-3 list-disc">
            {info.advantages.map((adv, i) => <li key={i} className="leading-5">{adv}</li>)}
          </ul>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <XCircle size={14} /> Disadvantages
          </h3>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-3 list-disc">
            {info.disadvantages.map((dis, i) => <li key={i} className="leading-5">{dis}</li>)}
          </ul>
        </div>
      </div>

      {/* Real-world Applications */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Real-world Applications</h3>
        <ul className="text-xs text-slate-300 space-y-1 pl-3 list-decimal">
          {info.realWorldApplications.map((app, i) => <li key={i} className="leading-5">{app}</li>)}
        </ul>
      </div>

      {/* When to use vs when not to use */}
      <div className="grid grid-cols-1 gap-3 pt-3 border-t border-white/5">
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-start gap-2.5">
          <Lightbulb size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-5">
            <strong className="text-emerald-300 font-bold block mb-0.5">When to use:</strong>
            <span className="text-slate-300">{info.whenToUse}</span>
          </div>
        </div>
        <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-5">
            <strong className="text-rose-300 font-bold block mb-0.5">When NOT to use:</strong>
            <span className="text-slate-300">{info.whenNotToUse}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ComparePanelProps {
  title: string;
  algorithm: AlgorithmInfo;
  algorithms: AlgorithmInfo[];
  onAlgorithm: (id: string) => void;
  array: number[];
  response: StepResponse;
  player: ReturnType<typeof useAnimationPlayer>;
  speed: number;
  accentColor: 'emerald' | 'purple';
  accentHex: string;
  onSpeed: (value: number) => void;
}

const ComparePanel = ({ 
  title, 
  algorithm, 
  algorithms, 
  onAlgorithm, 
  array, 
  response, 
  player, 
  speed,
  accentColor,
  accentHex,
  onSpeed 
}: ComparePanelProps) => {
  const isEmerald = accentColor === 'emerald';
  const borderClass = isEmerald ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-purple-500/20 bg-purple-500/5';
  
  return (
    <div className={`glass-panel border p-4 shadow-xl ${borderClass}`}>
      {/* Viewport Top header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</div>
          <h2 className="text-lg font-bold text-white mt-0.5">{algorithm.name}</h2>
        </div>
        <select 
          value={algorithm.id} 
          onChange={(event) => onAlgorithm(event.target.value)} 
          className="rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-300"
        >
          {algorithms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>

      {/* Visualizer canvas */}
      <div className="relative rounded-lg border border-white/5 bg-slate-950/60 p-4">
        <WorkspaceVisualizer category={algorithm.category} array={array} step={player.currentStep} />
      </div>

      {/* Timeline Scrubber & Progress */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Timeline Scrubber</span>
          <span>Step {player.currentIndex + 1} / {Math.max(response.steps.length, 1)}</span>
        </div>
        
        {/* Interactive Scrub Slider */}
        <input 
          type="range"
          min={0}
          max={Math.max(response.steps.length - 1, 0)}
          value={player.currentIndex}
          onChange={(e) => player.jumpTo(Number(e.target.value))}
          style={{ accentColor: accentHex }}
          className="w-full h-1.5 rounded-lg cursor-pointer transition-colors"
        />

        <div className="text-xs text-slate-300 italic min-h-[1.25rem] truncate mt-1">
          {player.currentStep?.note ?? 'Ready'}
        </div>
      </div>

      {/* Bottom controls & panels */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Speed Delay
            <input 
              type="range" 
              value={speed} 
              min={40} 
              max={700} 
              onChange={(event) => onSpeed(Number(event.target.value))} 
              style={{ accentColor: accentHex }}
              className="mt-3.5 w-full cursor-pointer" 
            />
            <span className="block text-right text-[10px] text-slate-500 font-bold">{speed}ms</span>
          </label>
          
          <div className="flex gap-1.5">
            <button className="toolbar-button border border-white/10 hover:bg-white/5" onClick={player.play}><Play size={12} />Play</button>
            <button className="toolbar-button border border-white/10 hover:bg-white/5" onClick={player.pause}><Pause size={12} />Pause</button>
            <button className="toolbar-button border border-white/10 hover:bg-white/5" onClick={player.stepForward}><SkipForward size={12} />Step</button>
          </div>

          <div className="border-t border-white/5 pt-2">
            <StatisticsPanel stats={player.liveStats} progressPercent={player.progress} />
          </div>
        </div>

        <div className="rounded-lg border border-white/5 bg-slate-900/30 p-1.5 overflow-hidden">
          <CodePanel algorithm={algorithm} activeLine={player.currentStep?.line} />
        </div>
      </div>
    </div>
  );
};
