import { useState } from 'react';
import { defaultGraphEdges, defaultGraphNodes } from '../../data/algorithms';
import { GraphEdge, GraphNode } from '../../types/algorithm';

interface Props { nodes: GraphNode[]; edges: GraphEdge[]; directed: boolean; error: string | null; onNodes: (nodes: GraphNode[]) => void; onEdges: (edges: GraphEdge[]) => void; onDirected: (directed: boolean) => void; }
const field = 'min-w-0 rounded-md border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-white';

export function GraphEditor({ nodes, edges, directed, error, onNodes, onEdges, onDirected }: Props) {
  const [nodeId, setNodeId] = useState('');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [weight, setWeight] = useState('1');
  const addNode = () => { const id = nodeId.trim(); if (!id || nodes.some((node) => node.id === id)) return; const angle = (nodes.length / Math.max(nodes.length + 1, 1)) * Math.PI * 2; onNodes([...nodes, { id, x: 50 + Math.cos(angle) * 35, y: 50 + Math.sin(angle) * 35 }]); setNodeId(''); };
  const addEdge = () => { const parsed = Number(weight); if (!source || !target || !Number.isFinite(parsed)) return; onEdges([...edges, { source, target, weight: parsed }]); };
  const reset = () => { onNodes(defaultGraphNodes.map((node) => ({ ...node }))); onEdges(defaultGraphEdges.map((edge) => ({ ...edge }))); onDirected(false); };
  return <section className="glass-panel space-y-3 border border-white/10 p-4" aria-label="Graph editor">
    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-white">Graph editor</h2><button className="text-xs text-cyan-200 hover:text-cyan-100" onClick={reset}>Reset to sample graph</button></div>
    <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={directed} onChange={(event) => onDirected(event.target.checked)} /> Directed graph</label>
    <div className="flex gap-2"><input aria-label="New node ID" className={field} placeholder="Node ID" value={nodeId} onChange={(event) => setNodeId(event.target.value)} /><button className="rounded bg-cyan-300 px-3 text-xs font-semibold text-slate-950" onClick={addNode}>Add node</button></div>
    <div className="max-h-20 space-y-1 overflow-y-auto">{nodes.map((node) => <div className="flex items-center justify-between text-xs text-slate-300" key={node.id}><span>{node.id}</span><button className="text-rose-300" aria-label={`Remove node ${node.id}`} onClick={() => { onNodes(nodes.filter((item) => item.id !== node.id)); onEdges(edges.filter((edge) => edge.source !== node.id && edge.target !== node.id)); }}>Remove</button></div>)}</div>
    <div className="grid grid-cols-[1fr_1fr_68px_auto] gap-2"><select aria-label="Edge source" className={field} value={source} onChange={(event) => setSource(event.target.value)}><option value="">From</option>{nodes.map(({ id }) => <option key={id}>{id}</option>)}</select><select aria-label="Edge target" className={field} value={target} onChange={(event) => setTarget(event.target.value)}><option value="">To</option>{nodes.map(({ id }) => <option key={id}>{id}</option>)}</select><input aria-label="Edge weight" className={field} type="number" step="1" value={weight} onChange={(event) => setWeight(event.target.value)} /><button className="rounded bg-cyan-300 px-2 text-xs font-semibold text-slate-950" onClick={addEdge}>Add</button></div>
    <div className="max-h-24 space-y-1 overflow-y-auto">{edges.map((edge, index) => <div className="flex items-center justify-between text-xs text-slate-300" key={`${edge.source}-${edge.target}-${index}`}><span>{edge.source} {directed ? '→' : '—'} {edge.target} <span className="text-slate-500">({edge.weight})</span></span><button className="text-rose-300" aria-label={`Remove edge ${edge.source} ${edge.target}`} onClick={() => onEdges(edges.filter((_, edgeIndex) => index !== edgeIndex))}>Remove</button></div>)}</div>
    {error && <p role="alert" className="rounded border border-rose-400/30 bg-rose-400/10 p-2 text-xs text-rose-200">{error}</p>}
  </section>;
}
