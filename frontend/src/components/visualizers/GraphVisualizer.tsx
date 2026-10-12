import { motion } from 'framer-motion';
import { defaultGraphEdges, defaultGraphNodes } from '../../data/algorithms';
import { AnimationStep, GraphEdge, GraphNode } from '../../types/algorithm';

interface GraphVisualizerProps {
  step?: AnimationStep;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  directed?: boolean;
}

export const GraphVisualizer = ({ step, nodes = defaultGraphNodes, edges = defaultGraphEdges, directed = false }: GraphVisualizerProps) => (
  <div className="relative min-h-[360px] overflow-hidden rounded-md border border-white/10 bg-slate-950/60">
    <svg className="absolute inset-0 h-full w-full">
      {edges.map((edge, index) => {
        const source = nodes.find((node) => node.id === edge.source);
        const target = nodes.find((node) => node.id === edge.target);
        if (!source || !target) return null;
        const hot = step?.edge?.[0] === edge.source && step.edge[1] === edge.target;
        return (
          <g key={`${edge.source}-${edge.target}-${index}`}>
            <line x1={`${source.x}%`} y1={`${source.y}%`} x2={`${target.x}%`} y2={`${target.y}%`} markerEnd={directed ? 'url(#graph-arrow)' : undefined} stroke={hot ? '#22d3ee' : 'rgba(255,255,255,0.18)'} strokeWidth={hot ? 4 : 2} />
            <text x={`${(source.x + target.x) / 2}%`} y={`${(source.y + target.y) / 2}%`} fill="#94a3b8" fontSize="12">{edge.weight}</text>
          </g>
        );
      })}
      <defs><marker id="graph-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="rgba(255,255,255,0.5)" /></marker></defs>
    </svg>
    {nodes.map((node) => (
      <motion.div
        key={node.id}
        animate={{ scale: step?.node === node.id ? 1.16 : 1 }}
        className={`absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-sm font-semibold ${step?.node === node.id ? 'border-cyan-300 bg-cyan-300/20 text-cyan-100' : 'border-white/10 bg-white/10 text-white'}`}
        style={{ left: `${node.x}%`, top: `${node.y}%` }}
      >
        {node.id}
      </motion.div>
    ))}
  </div>
);
