import html2canvas from 'html2canvas';
import { useEffect, useMemo, useRef, useState } from 'react';
import { algorithms } from './data/algorithms';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { LandingPage } from './components/layout/LandingPage';
import { ControlsPanel } from './components/panels/ControlsPanel';
import { StatisticsPanel } from './components/panels/StatisticsPanel';
import { ExplanationPanel } from './components/panels/ExplanationPanel';
import { Star } from 'lucide-react';
import { WorkspaceVisualizer } from './components/visualizers/WorkspaceVisualizer';
import { CompareMode } from './components/comparison/CompareMode';
import { useAnimationPlayer } from './hooks/useAnimationPlayer';
import { requestAnimationSteps } from './services/algorithmApi';
import { generateDataset } from './services/datasetService';
import { AlgorithmCategory, StepResponse } from './types/algorithm';

const firstByCategory = (category: AlgorithmCategory) => algorithms.find((item) => item.category === category) ?? algorithms[0];

export default function App() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
    } catch (_) {}
    return true;
  });
  const [view, setView] = useState<AlgorithmCategory | 'Home' | 'Compare' | 'Favorites'>('Home');
  const [selectedId, setSelectedId] = useState('bubble-sort');
  
  // Dataset and Input States
  const [datasetType, setDatasetType] = useState('random');
  const [size, setSize] = useState(18);
  const [array, setArray] = useState(() => generateDataset('random', 18));
  const [speed, setSpeed] = useState(260);
  const [target, setTarget] = useState(42);
  const [customArray, setCustomArray] = useState('');
  const [operation, setOperation] = useState('');
  
  // Comparison presets
  const [compareLeft, setCompareLeft] = useState<string | null>(null);
  const [compareRight, setCompareRight] = useState<string | null>(null);
  
  // Auto-playback trigger on launch
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const [response, setResponse] = useState<StepResponse>({ 
    steps: [], 
    stats: { comparisons: 0, swaps: 0, recursionDepth: 0, visitedNodes: 0, executionTimeMs: 0, memoryBytes: 0 } 
  });
  
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('algorithm-favorites') ?? '[]') as string[]);
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('algorithm-recent') ?? '[]') as string[]);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => algorithms.find((item) => item.id === selectedId) ?? algorithms[0], [selectedId]);
  const visibleAlgorithms = useMemo(() => algorithms.filter((item) => item.category === selected.category), [selected.category]);
  const player = useAnimationPlayer(response.steps, response.stats, speed);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch (_) {}
  }, [dark]);

  // Fetch steps when input array changes
  useEffect(() => {
    requestAnimationSteps({ id: selected.id, category: selected.category, array, target, operation })
      .then(setResponse)
      .catch(() => setResponse({ 
        steps: [], 
        stats: { comparisons: 0, swaps: 0, recursionDepth: 0, visitedNodes: 0, executionTimeMs: 0, memoryBytes: 0 } 
      }));

    const nextRecent = [selected.id, ...recent.filter((id) => id !== selected.id)].slice(0, 6);
    setRecent(nextRecent);
    localStorage.setItem('algorithm-recent', JSON.stringify(nextRecent));
  }, [array, selected.id, selected.category, target, operation]);

  // Handle autostart when response steps load
  useEffect(() => {
    if (autoPlayNext && response.steps.length > 0) {
      player.play();
      setAutoPlayNext(false);
    }
  }, [response, autoPlayNext]);

  useEffect(() => {
    localStorage.setItem('algorithm-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Ignore if user is typing in input or search
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

      if (event.code === 'Space') {
        event.preventDefault();
        player.playing ? player.pause() : player.play();
      }
      if (event.key === 'ArrowRight') player.stepForward();
      if (event.key === 'ArrowLeft') player.stepBack();
      if (event.key.toLowerCase() === 'r') player.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player]);

  // Unified global navigation handler
  const handleNavigate = (
    nextView: AlgorithmCategory | 'Home' | 'Compare' | 'Favorites',
    nextId?: string,
    leftId?: string,
    rightId?: string,
    autoPlay = false
  ) => {
    setView(nextView);
    if (nextView !== 'Home' && nextView !== 'Compare' && nextView !== 'Favorites') {
      const nextAlgorithm = nextId
        ? algorithms.find((item) => item.id === nextId && item.category === nextView)
        : firstByCategory(nextView);
      if (nextAlgorithm) setSelectedId(nextAlgorithm.id);
      setOperation('');
      if (nextView === 'Searching' && array.length > 0) {
        setTarget(array[Math.floor(array.length / 2)]);
      }
    } else if (nextId) {
      setSelectedId(nextId);
    }
    if (leftId) setCompareLeft(leftId);
    if (rightId) setCompareRight(rightId);
    if (autoPlay) setAutoPlayNext(true);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setArray(generateDataset(datasetType, newSize));
  };

  const handleDatasetTypeChange = (type: string) => {
    setDatasetType(type);
    setArray(generateDataset(type, size));
  };

  const handleShuffle = () => {
    setArray((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleReverse = () => {
    setArray((prev) => [...prev].reverse());
  };

  const handleOperation = (nextOperation: string) => {
    setOperation(`${nextOperation}-${Date.now()}`);
    setAutoPlayNext(true);
  };

  const applyArray = () => {
    const parsed = customArray
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);
    if (parsed.length > 1) {
      setArray(parsed);
      setSize(parsed.length);
    }
  };

  const screenshot = async () => {
    if (!workspaceRef.current) return;
    const canvas = await html2canvas(workspaceRef.current, { backgroundColor: '#050816' });
    const link = document.createElement('a');
    link.download = `${selected.id}-visualization.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const fullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen?.().catch((err) => {
        console.error(`Fullscreen request failed: ${err.message}`);
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  if (view === 'Home') {
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100">
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <Sidebar mobile onClose={() => setMobileMenuOpen(false)} selected="Home" onSelect={(item) => handleNavigate(item)} />
            </div>
          </div>
        )}
        <Sidebar selected={view} onSelect={(item) => handleNavigate(item)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar 
            dark={dark} 
            onTheme={() => setDark((value) => !value)} 
            setDark={setDark} 
            onFullscreen={fullscreen} 
            onScreenshot={screenshot} 
            onNavigate={handleNavigate} 
            onMenu={() => setMobileMenuOpen(true)}
          />
          <LandingPage 
            onStart={() => handleNavigate('Sorting')} 
            onCompare={() => handleNavigate('Compare')} 
            onCategory={(cat) => handleNavigate(cat)} 
          />
        </div>
      </div>
    );
  }

  if (view === 'Compare') {
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100">
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <Sidebar mobile onClose={() => setMobileMenuOpen(false)} selected="Compare" onSelect={(item) => handleNavigate(item)} />
            </div>
          </div>
        )}
        <Sidebar selected="Compare" onSelect={(item) => handleNavigate(item)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar 
            dark={dark} 
            onTheme={() => setDark((value) => !value)} 
            setDark={setDark} 
            onFullscreen={fullscreen} 
            onScreenshot={screenshot} 
            onNavigate={handleNavigate} 
            onMenu={() => setMobileMenuOpen(true)}
          />
          <CompareMode initialLeftId={compareLeft} initialRightId={compareRight} />
        </div>
      </div>
    );
  }

  if (view === 'Favorites') {
    const favoritedItems = algorithms.filter((item) => favorites.includes(item.id));
    return (
      <div className="flex h-screen bg-slate-950 text-slate-100">
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <Sidebar mobile onClose={() => setMobileMenuOpen(false)} selected="Favorites" onSelect={(item) => handleNavigate(item as any)} />
            </div>
          </div>
        )}
        <Sidebar selected="Favorites" onSelect={(item) => handleNavigate(item as any)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar 
            dark={dark} 
            onTheme={() => setDark((value) => !value)} 
            setDark={setDark} 
            onFullscreen={fullscreen} 
            onScreenshot={screenshot} 
            onNavigate={handleNavigate} 
            onMenu={() => setMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200 font-bold">Workspace Collections</div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Favorites Collection</h1>
            </div>

            <div className="glass-panel p-6 border border-white/10 bg-slate-950/70 shadow-lg">
              {favoritedItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoritedItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-4 hover:border-cyan-300/30 transition flex flex-col justify-between h-44">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cyan-200">{item.category}</span>
                        <h3 className="text-base font-bold text-white mt-1">{item.name}</h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <button 
                          onClick={() => handleNavigate(item.category, item.id)}
                          className="px-3 py-1.5 bg-cyan-400 text-slate-950 text-xs font-bold rounded hover:bg-cyan-300 transition"
                        >
                          Launch
                        </button>
                        <button 
                          onClick={() => setFavorites((prev) => prev.filter((id) => id !== item.id))}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 text-rose-400 text-xs font-bold rounded hover:bg-rose-500/10 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Star size={48} className="text-slate-700 animate-pulse mb-4" />
                  <h3 className="text-base font-bold text-white">Your collection is empty</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm">
                    Browse the algorithms from the sidebar or catalog and click "Save Favorite" to build your custom learning list here.
                  </p>
                  <button 
                    onClick={() => handleNavigate('Sorting')}
                    className="mt-6 px-4 py-2 bg-cyan-400 text-slate-950 text-xs font-bold rounded hover:bg-cyan-300 transition"
                  >
                    Browse Algorithms
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar mobile onClose={() => setMobileMenuOpen(false)} selected={selected.category} onSelect={(item) => handleNavigate(item)} />
          </div>
        </div>
      )}
      <Sidebar selected={selected.category} onSelect={(item) => handleNavigate(item)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar 
          dark={dark} 
          onTheme={() => setDark((value) => !value)} 
          setDark={setDark} 
          onFullscreen={fullscreen} 
          onScreenshot={screenshot} 
          onNavigate={handleNavigate} 
          onMenu={() => setMobileMenuOpen(true)}
        />
        <main className="grid flex-1 gap-4 overflow-y-auto p-4 xl:grid-cols-[1fr_360px]">
          <section className="space-y-4">
            <div className="glass-panel p-4">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200">{selected.category}</div>
                  <h1 className="mt-1 text-2xl font-semibold text-white">{selected.name}</h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFavorites((items) => items.includes(selected.id) ? items.filter((id) => id !== selected.id) : Array.from(new Set([selected.id, ...items])))}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                  >
                    {favorites.includes(selected.id) ? 'Saved' : 'Save Favorite'}
                  </button>
                  <button onClick={() => handleNavigate('Compare', undefined, selected.id)} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-300/15">
                    Compare
                  </button>
                </div>
              </div>
              
              <div ref={workspaceRef} className="relative">
                {isFullscreen && (
                  <button 
                    onClick={fullscreen} 
                    className="absolute top-4 right-4 z-[999] rounded bg-slate-900/80 px-3 py-1.5 text-xs text-white border border-white/20 hover:bg-slate-950 transition"
                  >
                    Exit Fullscreen
                  </button>
                )}
                <WorkspaceVisualizer category={selected.category} array={array} step={player.currentStep} />
              </div>
              
              {/* Scrub timeline */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-bold">
                  <span>Timeline Scrubbing</span>
                  <span>Step {player.currentIndex + 1} / {Math.max(response.steps.length, 1)}</span>
                </div>
                <input 
                  type="range"
                  min={0}
                  max={Math.max(response.steps.length - 1, 0)}
                  value={player.currentIndex}
                  onChange={(e) => player.jumpTo(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg cursor-pointer accent-cyan-300"
                />
                
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300 min-h-[1.5rem]">
                  <span>{player.currentStep?.note ?? 'Ready'}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                  {[
                    ['Compared', 'bg-cyan-300'],
                    ['Swapped', 'bg-pink-300'],
                    ['Sorted', 'bg-emerald-300'],
                    ['Pivot', 'bg-amber-300']
                  ].map(([label, color]) => (
                    <span key={label} className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <ExplanationPanel algorithm={selected} step={player.currentStep} />
          </section>

          <aside className="space-y-4">
            <ControlsPanel
              algorithm={selected}
              algorithms={visibleAlgorithms}
              onAlgorithm={(id) => handleNavigate(selected.category, id)}
              size={size}
              speed={speed}
              target={target}
              customArray={customArray}
              playing={player.playing}
              datasetType={datasetType}
              onDatasetType={handleDatasetTypeChange}
              onSize={handleSizeChange}
              onSpeed={setSpeed}
              onTarget={setTarget}
              onCustomArray={setCustomArray}
              onApplyArray={applyArray}
              onShuffle={handleShuffle}
              onReverse={handleReverse}
              onOperation={handleOperation}
              onPlay={player.play}
              onPause={player.pause}
              onStepForward={player.stepForward}
              onStepBack={player.stepBack}
              onReset={player.reset}
            />
            <StatisticsPanel stats={player.liveStats} progressPercent={player.progress} />
            
            <section className="glass-panel p-4 border border-white/10 bg-slate-950/70">
              <h2 className="panel-title">Recently Viewed</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((id) => {
                  const item = algorithms.find((algorithm) => algorithm.id === id);
                  return item ? (
                    <button 
                      key={id} 
                      onClick={() => handleNavigate(item.category, id)} 
                      className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                    >
                      {item.name}
                    </button>
                  ) : null;
                })}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
