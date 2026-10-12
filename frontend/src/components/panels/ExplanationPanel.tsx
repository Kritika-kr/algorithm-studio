import { useState } from 'react';
import { AlgorithmInfo, AnimationStep } from '../../types/algorithm';
import { educationalData } from '../../data/educationalData';
import { compareData } from '../../data/compareData';
import { BookOpen, Code2, HelpCircle, Terminal } from 'lucide-react';

interface ExplanationPanelProps {
  algorithm: AlgorithmInfo;
  step?: AnimationStep;
}

const languages = ['cpp', 'java', 'python', 'javascript'] as const;

const generateStepExplanation = (algorithmId: string, step: AnimationStep | undefined) => {
  if (!step) return "Ready. Start playback to trace execution.";
  
  const { action, i, j, value, snapshot = [], note } = step;
  const valI = i !== undefined && i >= 0 && i < snapshot.length ? snapshot[i] : null;
  const valJ = j !== undefined && j >= 0 && j < snapshot.length ? snapshot[j] : null;

  switch (algorithmId) {
    case 'bubble-sort':
      if (action === 'compare') {
        return `Comparing element at index ${i} (${valI}) and index ${j} (${valJ}).`;
      }
      if (action === 'swap') {
        return `Since ${valI} > ${valJ}, we swap them to correct the inversion.`;
      }
      if (action === 'mark-sorted') {
        return `Index ${i} (${valI}) has bubbled to its correct location and is marked as sorted.`;
      }
      break;
      
    case 'selection-sort':
      if (action === 'compare') {
        return `Comparing unsorted value at index ${j} (${valJ}) with current minimum at index ${i} (${valI}).`;
      }
      if (action === 'swap') {
        return `Minimum found. Swapping index ${i} (${valI}) with index ${j} (${valJ}).`;
      }
      if (action === 'mark-sorted') {
        return `Index ${i} is now sorted.`;
      }
      break;

    case 'insertion-sort':
      if (action === 'compare') {
        return `Comparing key at index ${j} (${valJ}) with sorted index ${i} (${valI}).`;
      }
      if (action === 'swap') {
        return `Value ${valI} is larger, shifting it right and moving active index to ${j}.`;
      }
      break;

    case 'quick-sort':
      if (action === 'pivot') {
        return `Choosing pivot element ${value} at index ${i}.`;
      }
      if (action === 'compare') {
        return `Comparing value at index ${i} (${valI}) with pivot (${value}).`;
      }
      if (action === 'swap') {
        return `Swapping elements at index ${i} (${valI}) and index ${j} (${valJ}) to divide partitions.`;
      }
      break;

    case 'binary-search':
      if (action === 'compare') {
        return `Probing midpoint index ${i} (value: ${valI}).`;
      }
      if (action === 'found') {
        return `Target match found at index ${i}!`;
      }
      if (action === 'highlight') {
        return `${valI} does not match target. Adjusting boundary search range.`;
      }
      break;
  }
  
  return note || "Executing algorithm instruction.";
};

export const ExplanationPanel = ({ algorithm, step }: ExplanationPanelProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'interview'>('overview');
  const [language, setLanguage] = useState<(typeof languages)[number]>('cpp');
  
  const edu = educationalData[algorithm.id] || {
    overview: algorithm.description,
    howItWorks: algorithm.howItWorks,
    whenNotToUse: 'No restrictions specified.',
    realWorldExample: 'General programming applications.',
    interviewQuestions: ['Explain the complexity and space bounds of this algorithm.'],
    commonMistakes: ['Off-by-one errors in index checks.'],
    optimizations: 'Review standard libraries for optimised versions.'
  };

  const activeLine = step?.line || 0;
  const operationInfo = compareData[algorithm.category];

  return (
    <section className="glass-panel overflow-hidden border border-white/10 bg-slate-950/70 p-4 shadow-xl backdrop-blur-md">
      {/* Tabs Header */}
      <div className="flex border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'overview'
              ? 'border-cyan-300 text-cyan-200'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen size={16} />
          Overview & Steps
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'code'
              ? 'border-cyan-300 text-cyan-200'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Code2 size={16} />
          Code Execution
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
            activeTab === 'interview'
              ? 'border-cyan-300 text-cyan-200'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle size={16} />
          Educational Q&A
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-4 min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Algorithm Overview</h3>
              <p className="mt-1 text-sm leading-6 text-slate-300">{edu.overview}</p>
            </div>

            {/* Current Step Explanation (Updated Live) */}
            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3.5">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                <Terminal size={14} />
                Live Execution State
              </h4>
              <p className="mt-1 text-sm font-medium text-white">
                {generateStepExplanation(algorithm.id, step)}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">How It Works</h4>
                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-5 text-slate-300">
                  {edu.howItWorks.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Real-World Analogy</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{edu.realWorldExample}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">When NOT to Use</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{edu.whenNotToUse}</p>
                </div>
              </div>
            </div>

            {operationInfo && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Operation Cost Comparison</h4>
                <div className="mt-2 overflow-x-auto rounded-lg border border-white/5 bg-slate-900/40">
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead className="border-b border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Operation</th>
                        <th className="px-3 py-2">Best</th>
                        <th className="px-3 py-2">Average</th>
                        <th className="px-3 py-2">Worst</th>
                        <th className="px-3 py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {operationInfo.operationComparisons.map((row) => (
                        <tr key={row.operation} className="align-top">
                          <td className="px-3 py-2 font-semibold text-white">{row.operation}</td>
                          <td className="px-3 py-2 font-mono text-emerald-300">{row.best}</td>
                          <td className="px-3 py-2 font-mono text-cyan-200">{row.average}</td>
                          <td className="px-3 py-2 font-mono text-rose-300">{row.worst}</td>
                          <td className="px-3 py-2 leading-5 text-slate-400">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pseudocode */}
            <div className="rounded-md border border-white/5 bg-slate-900/50 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-200">Pseudocode</div>
              <pre className="max-h-[300px] overflow-y-auto text-xs leading-6">
                {algorithm.pseudocode.map((line, index) => (
                  <div
                    key={`pseudo-${index}`}
                    className={`rounded px-1.5 transition-colors ${
                      index + 1 === activeLine ? 'bg-cyan-300/20 text-cyan-100 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span className="mr-3 inline-block w-4 select-none text-right text-slate-600">{index + 1}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </pre>
            </div>

            {/* Reference Code */}
            <div className="flex flex-col rounded-md border border-white/5 bg-slate-900/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Reference Implementation</div>
                <div className="flex rounded bg-black/40 p-0.5">
                  {languages.map((item) => (
                    <button
                      key={item}
                      onClick={() => setLanguage(item)}
                      className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-bold transition ${
                        language === item ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <pre className="max-h-[300px] flex-1 overflow-y-auto text-xs leading-6">
                {algorithm.code[language].map((line, index) => (
                  <div
                    key={`${language}-${index}`}
                    className={`rounded px-1.5 transition-colors ${
                      index + 1 === activeLine ? 'bg-cyan-300/20 text-cyan-100 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    <span className="mr-3 inline-block w-4 select-none text-right text-slate-600">{index + 1}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'interview' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Optimization Techniques</h4>
              <p className="mt-1 text-sm leading-6 text-slate-300">{edu.optimizations}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Common Interview Questions</h4>
                <ul className="mt-2 list-disc space-y-2 pl-4 text-xs leading-5 text-slate-300">
                  {edu.interviewQuestions.map((q, idx) => (
                    <li key={idx} className="hover:text-white transition-colors">{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Common Developer Pitfalls</h4>
                <ul className="mt-2 list-disc space-y-2 pl-4 text-xs leading-5 text-slate-300">
                  {edu.commonMistakes.map((m, idx) => (
                    <li key={idx} className="hover:text-red-300 transition-colors">{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
