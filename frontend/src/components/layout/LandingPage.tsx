import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Binary, Check, Code2, GitCompareArrows, Layers3, Menu, Moon, Pause, Play, RotateCcw, Sun, X } from 'lucide-react';
import { AlgorithmCategory } from '../../types/algorithm';
import { categories } from '../../data/algorithms';

interface LandingPageProps {
  dark: boolean;
  onTheme: () => void;
  onStart: () => void;
  onCompare: () => void;
  onCategory: (category: AlgorithmCategory) => void;
}

const learningAreas = [
  { number: '01', title: 'Watch every step', text: 'Follow comparisons, swaps, visits, and updates as they happen.', icon: Play },
  { number: '02', title: 'Set your own pace', text: 'Pause, step through a trace, or change the playback speed whenever you need.', icon: RotateCcw },
  { number: '03', title: 'Connect code to behavior', text: 'See the active line beside the visual state and algorithm explanation.', icon: Code2 }
];

const questions = [
  ['What can I explore here?', 'The workspace includes sorting, searching, linked lists, stacks, queues, trees, graphs, and dynamic programming examples.'],
  ['Can I control the animation?', 'Yes. Play, pause, step forward or backward, reset, adjust the speed, and scrub through the timeline.'],
  ['Can I use my own data?', 'You can choose a dataset shape or enter a custom comma-separated integer array for sorting and searching.'],
  ['Do I need to create an account?', 'No account is required to use the visualizer. Your favorites and recent items are kept in your browser.']
];

const makeBubbleSortTrace = () => {
  const values = [18, 32, 24, 51, 39, 60, 44, 29];
  const trace: Array<{ values: number[]; pair: [number, number]; action: 'Compare' | 'Swap' }> = [];
  for (let end = values.length - 1; end > 0; end -= 1) {
    for (let index = 0; index < end; index += 1) {
      trace.push({ values: [...values], pair: [index, index + 1], action: 'Compare' });
      if (values[index] > values[index + 1]) {
        [values[index], values[index + 1]] = [values[index + 1], values[index]];
        trace.push({ values: [...values], pair: [index, index + 1], action: 'Swap' });
      }
    }
  }
  return trace;
};

const bubbleSortTrace = makeBubbleSortTrace();

export const LandingPage = ({ dark, onTheme, onStart, onCompare, onCategory }: LandingPageProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const demoStep = bubbleSortTrace[demoIndex];
  const comparisons = bubbleSortTrace.slice(0, demoIndex + 1).filter((step) => step.action === 'Compare').length;

  useEffect(() => {
    if (!demoPlaying) return undefined;
    if (demoIndex >= bubbleSortTrace.length - 1) {
      setDemoPlaying(false);
      return undefined;
    }
    const timeout = window.setTimeout(() => setDemoIndex((index) => Math.min(index + 1, bubbleSortTrace.length - 1)), 520);
    return () => window.clearTimeout(timeout);
  }, [demoIndex, demoPlaying]);

  const page = dark ? 'bg-[#080b17] text-slate-100' : 'bg-[#f7f8fc] text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-600';
  const panel = dark ? 'border-white/10 bg-slate-900/75' : 'border-slate-200 bg-white';
  const quietButton = dark ? 'border-white/15 bg-white/5 text-slate-100 hover:bg-white/10' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100';

  return (
    <main className={`h-screen w-full min-w-0 overflow-x-hidden overflow-y-auto scroll-smooth ${page}`}>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${dark ? 'border-white/10 bg-[#080b17]/85' : 'border-slate-200 bg-white/85'}`}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <a href="#home" className="flex shrink-0 items-center gap-2.5" aria-label="Algorithm Studio home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"><Binary size={21} /></span>
            <span className="text-sm font-bold tracking-tight">Algorithm <span className="text-indigo-500">Studio</span></span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main navigation">
            <a className={`${muted} transition hover:text-indigo-500`} href="#home">Home</a>
            <a className={`${muted} transition hover:text-indigo-500`} href="#features">Features</a>
            <a className={`${muted} transition hover:text-indigo-500`} href="#why-studio">Why this studio</a>
            <a className={`${muted} transition hover:text-indigo-500`} href="#faq">FAQs</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button className={`grid h-9 w-9 place-items-center rounded-lg border transition ${quietButton}`} onClick={onTheme} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={onStart} className="hidden rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 sm:inline-flex">
              Open visualizer <ArrowRight className="ml-2" size={15} />
            </button>
            <button className={`grid h-9 w-9 place-items-center rounded-lg border md:hidden ${quietButton}`} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className={`grid gap-1 border-t px-5 py-3 md:hidden ${dark ? 'border-white/10 bg-[#080b17]' : 'border-slate-200 bg-white'}`} aria-label="Mobile navigation">
            {[["Home", "#home"], ["Features", "#features"], ["Why this studio", "#why-studio"], ["FAQs", "#faq"]].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className={`rounded-lg px-3 py-2 text-sm ${muted} hover:bg-indigo-500/10 hover:text-indigo-500`}>{label}</a>
            ))}
            <button onClick={() => { setMenuOpen(false); onStart(); }} className="mt-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-left text-sm font-semibold text-white">Open visualizer</button>
          </nav>
        )}
      </header>

      <section id="home" className="relative isolate overflow-hidden">
        <div className={`pointer-events-none absolute inset-0 -z-10 ${dark ? 'bg-[radial-gradient(ellipse_at_15%_15%,rgba(99,102,241,0.24),transparent_42%),radial-gradient(ellipse_at_85%_40%,rgba(14,165,233,0.12),transparent_38%)]' : 'bg-[radial-gradient(ellipse_at_15%_15%,rgba(129,140,248,0.22),transparent_42%),radial-gradient(ellipse_at_85%_40%,rgba(56,189,248,0.16),transparent_38%)]'}`} />
        <div className="mx-auto grid min-h-[660px] max-w-7xl items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${dark ? 'border-indigo-400/25 bg-indigo-400/10 text-indigo-200' : 'border-indigo-200 bg-indigo-50 text-indigo-700'}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> A clearer way to learn DSA
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.4rem]">
              Master DSA through <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">interactive visualization</span>
            </h1>
            <p className={`mt-6 max-w-xl text-base leading-7 md:text-lg md:leading-8 ${muted}`}>
              See algorithms come to life, one operation at a time. Explore the logic, follow the code, and learn at your own pace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={onStart} className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-500">
                Start visualizing <ArrowRight className="ml-2" size={16} />
              </button>
              <button onClick={onCompare} className={`inline-flex items-center rounded-xl border px-5 py-3.5 text-sm font-semibold transition ${quietButton}`}>
                <GitCompareArrows className="mr-2" size={16} /> Compare algorithms
              </button>
            </div>
            <div className={`mt-5 flex items-center gap-2 text-xs ${muted}`}><Check size={14} className="text-emerald-500" /> No account needed · Free to explore</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative mx-auto w-full max-w-[610px]">
            <div className={`absolute -inset-5 -z-10 rounded-[2rem] blur-2xl ${dark ? 'bg-indigo-500/10' : 'bg-indigo-400/20'}`} />
            <div className={`overflow-hidden rounded-2xl border shadow-2xl ${panel} ${dark ? 'shadow-black/30' : 'shadow-slate-300/40'}`}>
              <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? 'border-white/10' : 'border-slate-100'}`}>
                <div><div className="text-sm font-semibold">Sorting visualizer</div><div className={`mt-0.5 text-xs ${muted}`}>Bubble sort · step {demoIndex + 1} of {bubbleSortTrace.length}</div></div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${demoPlaying ? 'bg-emerald-500/10 text-emerald-500' : dark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{demoPlaying ? 'Playing' : demoStep.action}</span>
              </div>
              <div className={`relative px-5 pb-5 pt-6 ${dark ? 'bg-slate-950/50' : 'bg-slate-50/70'}`}>
                <div className="absolute left-[45%] top-8 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl" />
                <div className="relative flex h-[220px] items-end justify-center gap-2 rounded-xl border px-5 pb-4 pt-6 sm:gap-3 sm:px-8">
                  {demoStep.values.map((value, index) => {
                    const active = demoStep.pair.includes(index);
                    return (
                    <motion.div key={index} animate={{ height: `${Math.max(24, (value / 60) * 100)}%` }} transition={{ type: 'spring', stiffness: 180, damping: 22 }} className={`relative flex min-w-0 flex-1 items-end justify-center rounded-t-md ${active ? demoStep.action === 'Swap' ? 'bg-gradient-to-t from-violet-600 to-indigo-400 shadow-lg shadow-indigo-500/25' : 'bg-gradient-to-t from-sky-600 to-cyan-400 shadow-lg shadow-cyan-500/20' : dark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                      <span className={`mb-2 text-[10px] font-semibold ${active || dark ? 'text-white' : 'text-slate-600'}`}>{value}</span>
                    </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white" onClick={() => { if (demoPlaying) { setDemoPlaying(false); } else { if (demoIndex >= bubbleSortTrace.length - 1) setDemoIndex(0); setDemoPlaying(true); } }} title={demoPlaying ? 'Pause demo' : 'Play demo'} aria-label={demoPlaying ? 'Pause sorting preview' : 'Play sorting preview'}>{demoPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}</button>
                    <button className={`grid h-9 w-9 place-items-center rounded-lg border ${quietButton}`} onClick={() => { setDemoPlaying(false); setDemoIndex(0); }} title="Reset demo" aria-label="Reset sorting preview"><RotateCcw size={14} /></button>
                    <div className={`ml-1 h-1.5 w-24 overflow-hidden rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((demoIndex + 1) / bubbleSortTrace.length) * 100}%` }} /></div>
                  </div>
                  <span className={`text-xs ${muted}`}>{demoStep.action} <b className="ml-1 text-indigo-500">{comparisons}</b></span>
                </div>
              </div>
              <div className={`grid grid-cols-3 divide-x border-t ${dark ? 'divide-white/10 border-white/10' : 'divide-slate-100 border-slate-100'}`}>
                {[["O(n²)", 'Average time'], ["O(1)", 'Extra space'], ['Stable', 'Sort property']].map(([value, label]) => <div key={label} className="px-3 py-3.5 text-center"><div className="text-sm font-bold text-indigo-500">{value}</div><div className={`mt-0.5 text-[10px] ${muted}`}>{label}</div></div>)}
              </div>
            </div>
            <div className={`absolute -left-4 top-20 hidden rounded-xl border px-3 py-2 text-xs shadow-xl sm:block ${panel}`}><span className="mr-2 text-violet-500">●</span>Compare values</div>
            <div className={`absolute -right-4 bottom-20 hidden rounded-xl border px-3 py-2 text-xs shadow-xl sm:block ${panel}`}><span className="mr-2 text-emerald-500">●</span>Swap complete</div>
          </motion.div>
        </div>
      </section>

      <section className={`border-y ${dark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white/70'}`}>
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-3 md:px-8">
          {[["8", 'learning areas'], ['Step by step', 'interactive traces'], ['No sign-up', 'start right away']].map(([value, label]) => <div key={label} className="flex items-center justify-center gap-3 text-center sm:justify-start"><span className="text-xl font-bold tracking-tight text-indigo-500">{value}</span><span className={`text-sm ${muted}`}>{label}</span></div>)}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Features</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Understand the idea behind every step</h2>
          <p className={`mt-4 leading-7 ${muted}`}>A focused set of tools to help you move from reading an algorithm to understanding how it behaves.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {learningAreas.map(({ number, title, text, icon: Icon }) => (
            <article key={number} className={`rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${panel} ${dark ? 'hover:shadow-indigo-950/30' : 'hover:shadow-indigo-100'}`}>
              <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/10 text-indigo-500"><Icon size={20} /></span><span className={`text-sm font-semibold ${dark ? 'text-slate-600' : 'text-slate-300'}`}>{number}</span></div>
              <h3 className="mt-7 text-lg font-bold">{title}</h3>
              <p className={`mt-2 text-sm leading-6 ${muted}`}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="why-studio" className={`scroll-mt-24 border-y py-20 md:py-24 ${dark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-indigo-50/60'}`}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Explore the studio</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">One workspace. Many ways to learn.</h2>
            <p className={`mt-4 leading-7 ${muted}`}>Choose a topic, shape the input, and explore the operations that make each algorithm work.</p>
            <button onClick={onStart} className="mt-7 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">Explore the visualizer <ArrowRight className="ml-2" size={15} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category, index) => (
              <button key={category} onClick={() => onCategory(category)} className={`group flex items-center justify-between rounded-xl border p-4 text-left transition hover:border-indigo-400/50 hover:bg-indigo-500/5 ${panel}`}>
                <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-sm font-bold text-indigo-500">{String(index + 1).padStart(2, '0')}</span><span className="text-sm font-semibold">{category}</span></span>
                <ArrowRight size={15} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
        <div className="text-center"><div className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">FAQs</div><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2><p className={`mt-3 ${muted}`}>A few quick details before you jump in.</p></div>
        <div className="mt-10 space-y-3">
          {questions.map(([question, answer]) => <details key={question} className={`group rounded-xl border p-5 ${panel}`}><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:hidden">{question}<span className="text-xl font-normal text-indigo-500 transition group-open:rotate-45">+</span></summary><p className={`mt-3 max-w-3xl text-sm leading-6 ${muted}`}>{answer}</p></details>)}
        </div>
      </section>

      <section className="px-5 pb-20 md:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 px-6 py-12 text-center text-white shadow-2xl shadow-indigo-900/20 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.2),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(56,189,248,0.25),transparent_30%)]" />
          <div className="relative"><Layers3 className="mx-auto mb-4" size={26} /><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to see how it works?</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">Pick an algorithm and start exploring its decisions, one step at a time.</p><button onClick={onStart} className="mt-7 inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50">Start learning <ArrowRight className="ml-2" size={15} /></button></div>
        </div>
      </section>

      <footer className={`border-t ${dark ? 'border-white/10 bg-slate-950/50' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
          <a href="#home" className="flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white"><Binary size={18} /></span>Algorithm Studio</a>
          <div className={`flex flex-wrap gap-x-5 gap-y-2 ${muted}`}><a className="hover:text-indigo-500" href="#features">Features</a><a className="hover:text-indigo-500" href="#why-studio">Explore topics</a><a className="hover:text-indigo-500" href="#faq">FAQs</a></div>
          <span className={`text-xs ${muted}`}>Learn by seeing. Understand by doing.</span>
        </div>
      </footer>
    </main>
  );
};
