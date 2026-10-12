import { motion } from 'framer-motion';
import { AnimationStep } from '../../types/algorithm';

interface ArrayVisualizerProps {
  array: number[];
  step?: AnimationStep;
}

const colorFor = (index: number, step?: AnimationStep) => {
  if (!step) return 'from-cyan-300 to-blue-400';
  const activeIndex = step.index ?? step.i;
  if (step.action === 'failed' && activeIndex === index) return 'from-red-400 to-red-600';
  if (step.action === 'found' && activeIndex === index) return 'from-emerald-300 to-green-400';
  if (step.action === 'pivot' && activeIndex === index) return 'from-amber-300 to-orange-400';
  if (step.action === 'swap' && (activeIndex === index || step.j === index)) return 'from-pink-300 to-rose-400';
  if ((step.action === 'compare' || step.action === 'highlight') && (activeIndex === index || step.j === index)) return 'from-cyan-200 to-teal-300';
  if (step.action === 'mark-sorted' && activeIndex === index) return 'from-emerald-300 to-green-400';
  if (step.visited?.includes(index)) return 'from-indigo-300 to-violet-400';
  return 'from-slate-500 to-slate-700';
};

export const ArrayVisualizer = ({ array, step }: ArrayVisualizerProps) => {
  const values = step?.snapshot?.length ? step.snapshot : array;
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-[360px] items-end gap-1 rounded-md border border-white/10 bg-slate-950/60 p-4">
      {values.map((value, index) => (
        <motion.div
          layout
          key={index}
          className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          title={`${index}: ${value}`}
        >
          <motion.div
            animate={{ height: `${Math.max(8, (value / max) * 300)}px` }}
            className={`w-full rounded-t bg-gradient-to-t ${colorFor(index, step)} shadow-glow`}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
          />
          <span className="hidden text-[10px] text-slate-400 md:inline">{value}</span>
        </motion.div>
      ))}
    </div>
  );
};
