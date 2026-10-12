import { AlgorithmCategory, AnimationStep } from '../../types/algorithm';
import { ArrayVisualizer } from './ArrayVisualizer';
import { GraphVisualizer } from './GraphVisualizer';
import { StructureVisualizer } from './StructureVisualizer';

interface WorkspaceVisualizerProps {
  category: AlgorithmCategory;
  array: number[];
  step?: AnimationStep;
}

export const WorkspaceVisualizer = ({ category, array, step }: WorkspaceVisualizerProps) => {
  if (category === 'Sorting' || category === 'Searching') return <ArrayVisualizer array={array} step={step} />;
  if (category === 'Graphs') return <GraphVisualizer step={step} />;
  if (category === 'Linked List' || category === 'Stack' || category === 'Queue' || category === 'Trees') return <StructureVisualizer mode={category} step={step} />;
  if (category === 'Dynamic Programming') {
    const values = step?.snapshot ?? [];
    const activeIndex = step?.index ?? -1;

    return (
      <section className="min-h-[360px] rounded-md border border-white/10 bg-slate-950/60 p-6 text-slate-200" aria-label="Fibonacci dynamic programming table">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Fibonacci · bottom-up</h2>
            <p className="mt-1 text-sm text-slate-400">Each step stores the next value using the two previous states.</p>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">O(n) time · O(n) space</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="list" aria-label="Computed Fibonacci states">
          {Array.from({ length: 8 }, (_, index) => {
            const computed = values[index];
            const active = activeIndex === index;
            return (
              <div key={index} role="listitem" className={`rounded-lg border p-4 transition-colors ${active ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/[0.03]'}`} aria-current={active ? 'step' : undefined}>
                <div className="text-xs uppercase tracking-wide text-slate-500">F({index})</div>
                <div className={`mt-2 font-mono text-2xl ${computed === undefined ? 'text-slate-600' : active ? 'text-cyan-200' : 'text-white'}`}>{computed ?? '—'}</div>
                <div className="mt-1 text-xs text-slate-500">{computed === undefined ? 'pending' : 'computed'}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-5 min-h-5 text-sm text-slate-400" aria-live="polite">{step?.note ?? 'Press Play to compute the Fibonacci states.'}</p>
      </section>
    );
  }
  return (
    <div className="grid min-h-[360px] place-items-center rounded-md border border-white/10 bg-slate-950/60 p-6 text-center text-slate-300">
      Dynamic programming workspace with state-table animation hooks is scaffolded for backend traces.
    </div>
  );
};
