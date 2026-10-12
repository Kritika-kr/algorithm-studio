import { motion } from 'framer-motion';
import { AnimationStep } from '../../types/algorithm';

interface StructureVisualizerProps {
  mode: 'Linked List' | 'Stack' | 'Queue' | 'Trees';
  step?: AnimationStep;
}

export const StructureVisualizer = ({ mode, step }: StructureVisualizerProps) => {
  if (mode === 'Stack') {
    return <StackView step={step} />;
  }
  if (mode === 'Queue') {
    return <QueueView step={step} />;
  }
  if (mode === 'Trees') {
    return <TreeView step={step} />;
  }
  return <LinkedListView step={step} />;
};

const active = (id: number, step?: AnimationStep) => step?.i === id || step?.node === `N${id + 1}`;

const LinkedListView = ({ step }: { step?: AnimationStep }) => (
  <div className="flex min-h-[360px] items-center justify-center rounded-md border border-white/10 bg-slate-950/60 p-4">
    <div className="flex flex-wrap items-center justify-center gap-3">
      {(step?.snapshot ?? [12, 24, 36, 48]).map((value, index) => (
        <div key={value} className="flex items-center gap-3">
          <motion.div animate={{ scale: active(index, step) ? 1.08 : 1 }} className={`grid h-16 w-16 place-items-center rounded-md border ${active(index, step) ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100' : 'border-white/10 bg-white/5 text-white'}`}>
            {value}
          </motion.div>
          {index < 4 && <span className="text-cyan-200">-&gt;</span>}
        </div>
      ))}
      {step?.snapshot?.length === 0 && <p className="text-sm text-slate-400">List is empty</p>}
    </div>
  </div>
);

const StackView = ({ step }: { step?: AnimationStep }) => (
  <div className="grid min-h-[360px] place-items-center rounded-md border border-white/10 bg-slate-950/60 p-4">
    <div className="flex w-32 flex-col-reverse gap-2">
      {(step?.snapshot ?? [18, 31, 44]).map((value, index) => (
        <motion.div key={value} animate={{ x: active(index, step) ? 8 : 0 }} className={`h-14 rounded-md border text-center leading-[3.5rem] ${active(index, step) ? 'border-pink-300 bg-pink-300/15 text-pink-100' : 'border-white/10 bg-white/5 text-white'}`}>
          {value}
        </motion.div>
      ))}
      {step?.snapshot?.length === 0 && <span className="text-xs text-slate-400">Stack is empty</span>}
    </div>
  </div>
);

const QueueView = ({ step }: { step?: AnimationStep }) => (
  <div className="flex min-h-[360px] items-center justify-center rounded-md border border-white/10 bg-slate-950/60 p-4">
    <div className="flex gap-2">
      {(step?.snapshot ?? [7, 14, 21]).map((value, index) => (
        <motion.div key={value} animate={{ y: active(index, step) ? -8 : 0 }} className={`grid h-16 w-16 place-items-center rounded-md border ${active(index, step) ? 'border-emerald-300 bg-emerald-300/15 text-emerald-100' : 'border-white/10 bg-white/5 text-white'}`}>
          {value}
        </motion.div>
      ))}
      {step?.snapshot?.length === 0 && <span className="text-xs text-slate-400">Queue is empty</span>}
    </div>
  </div>
);

const TreeView = ({ step }: { step?: AnimationStep }) => {
  const nodes = [
    ['N1', '50', 'left-[46%] top-4'],
    ['N2', '30', 'left-[25%] top-28'],
    ['N3', '70', 'left-[67%] top-28'],
    ['N4', '20', 'left-[15%] top-56'],
    ['N5', '40', 'left-[35%] top-56'],
    ['N6', '60', 'left-[58%] top-56'],
    ['N7', '80', 'left-[78%] top-56']
  ];
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-md border border-white/10 bg-slate-950/60 p-4">
      <svg className="absolute inset-0 h-full w-full text-white/15">
        <line x1="50%" y1="58" x2="30%" y2="132" stroke="currentColor" />
        <line x1="50%" y1="58" x2="72%" y2="132" stroke="currentColor" />
        <line x1="30%" y1="156" x2="20%" y2="244" stroke="currentColor" />
        <line x1="30%" y1="156" x2="40%" y2="244" stroke="currentColor" />
        <line x1="72%" y1="156" x2="63%" y2="244" stroke="currentColor" />
        <line x1="72%" y1="156" x2="83%" y2="244" stroke="currentColor" />
      </svg>
      {nodes.map(([id, label, position], index) => (
        <motion.div key={id} animate={{ scale: step?.node === id || step?.i === index ? 1.12 : 1 }} className={`absolute ${position} grid h-14 w-14 place-items-center rounded-full border ${step?.node === id || step?.i === index ? 'border-cyan-300 bg-cyan-300/20 text-cyan-100' : 'border-white/10 bg-white/10 text-white'}`}>
          {label}
        </motion.div>
      ))}
    </div>
  );
};
