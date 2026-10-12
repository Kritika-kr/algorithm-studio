import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlgorithmStats, AnimationStep } from '../types/algorithm';

const emptyStats: AlgorithmStats = {
  comparisons: 0,
  swaps: 0,
  recursionDepth: 0,
  visitedNodes: 0,
  executionTimeMs: 0,
  memoryBytes: 0
};

export const useAnimationPlayer = (steps: AnimationStep[], baseStats?: AlgorithmStats, speed = 260) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing || steps.length === 0) return undefined;
    if (index >= steps.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => setIndex((current) => Math.min(current + 1, steps.length - 1)), speed);
    return () => window.clearTimeout(id);
  }, [index, playing, speed, steps.length]);

  const currentStep = steps[index];
  const liveStats = useMemo(() => {
    const slice = steps.slice(0, index + 1);
    const current = steps[index];
    const visitedNodes = new Set(slice.map((step) => step.node).filter(Boolean));
    const compares = slice.filter((step) => step.action === 'compare').length;
    const swaps = slice.filter((step) => step.action === 'swap').length;
    const overwrites = slice.filter((step) => step.action === 'overwrite').length;
    
    return {
      comparisons: compares,
      swaps: swaps,
      reads: compares * 2 + swaps * 2 + slice.filter(s => s.action === 'visit').length,
      writes: swaps * 2 + overwrites,
      recursionDepth: baseStats?.recursionDepth ?? emptyStats.recursionDepth,
      visitedNodes: Math.max(slice.filter((step) => step.action === 'visit' || step.action === 'highlight' || step.action === 'found').length, visitedNodes.size),
      edgesTraversed: slice.filter((step) => step.action === 'edge' || step.action === 'relax').length,
      totalCost: slice.reduce((sum, step) => sum + (step.cost ?? 0), 0),
      height: baseStats?.height,
      currentIndex: current?.index ?? current?.i,
      traversalOrder: slice.map((step) => step.node).filter(Boolean) as string[],
      executionTimeMs: Math.round((baseStats?.executionTimeMs ?? 0) * ((index + 1) / Math.max(steps.length, 1))),
      memoryBytes: baseStats?.memoryBytes ?? emptyStats.memoryBytes
    };
  }, [baseStats, index, steps]);

  return {
    currentStep,
    currentIndex: index,
    playing,
    progress: steps.length ? Math.round(((index + 1) / steps.length) * 100) : 0,
    liveStats,
    play: useCallback(() => {
      setIndex((current) => (steps.length > 0 && current >= steps.length - 1 ? 0 : current));
      setPlaying(steps.length > 0);
    }, [steps.length]),
    pause: useCallback(() => setPlaying(false), []),
    reset: useCallback(() => {
      setPlaying(false);
      setIndex(0);
    }, []),
    jumpTo: useCallback((targetIndex: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(targetIndex, Math.max(steps.length - 1, 0))));
    }, [steps.length]),
    stepForward: useCallback(() => {
      setPlaying(false);
      setIndex((current) => Math.min(current + 1, Math.max(steps.length - 1, 0)));
    }, [steps.length]),
    stepBack: useCallback(() => {
      setPlaying(false);
      setIndex((current) => Math.max(current - 1, 0));
    }, [])
  };
};
