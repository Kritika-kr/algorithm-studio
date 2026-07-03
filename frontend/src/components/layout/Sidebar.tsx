import { motion } from 'framer-motion';
import { BarChart3, Binary, Braces, GitBranch, GitCompareArrows, Home, Layers3, ListTree, Network, Search, SquareStack, Star, X, type LucideIcon } from 'lucide-react';
import { AlgorithmCategory } from '../../types/algorithm';
import { categories } from '../../data/algorithms';

type SidebarItem = AlgorithmCategory | 'Home' | 'Compare' | 'Favorites';

const icons: Record<SidebarItem, LucideIcon> = {
  Home,
  Compare: GitCompareArrows,
  Favorites: Star,
  Sorting: BarChart3,
  Searching: Search,
  'Linked List': ListTree,
  Stack: SquareStack,
  Queue: Layers3,
  Trees: GitBranch,
  Graphs: Network,
  'Dynamic Programming': Braces
};

interface SidebarProps {
  selected: SidebarItem;
  onSelect: (category: SidebarItem) => void;
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ selected, onSelect, mobile, onClose }: SidebarProps) => (
  <aside className={`border-r border-white/10 bg-slate-950/90 px-3 py-4 backdrop-blur-2xl flex flex-col ${
    mobile ? 'fixed inset-y-0 left-0 z-[1000] w-64 shadow-2xl animate-slide-in' : 'hidden lg:flex lg:w-64 lg:flex-col'
  }`}>
    <div className="mb-8 flex items-center justify-between px-2">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300">
          <Binary size={22} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide text-white">Algorithm Studio</div>
          <div className="text-xs text-slate-400">Visual execution lab</div>
        </div>
      </div>
      {mobile && (
        <button onClick={onClose} className="rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" title="Close menu">
          <X size={15} />
        </button>
      )}
    </div>

    <nav className="space-y-1 overflow-y-auto flex-1">
      {(['Home', 'Compare', 'Favorites', ...categories] as SidebarItem[]).map((item) => {
        const Icon = icons[item];
        const active = selected === item;
        return (
          <button
            key={item}
            onClick={() => {
              onSelect(item);
              if (onClose) onClose();
            }}
            className="relative flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-md bg-white/10" />}
            <span className="relative text-cyan-200"><Icon size={18} /></span>
            <span className="relative">{item}</span>
          </button>
        );
      })}
    </nav>
  </aside>
);
