import React from 'react';
import { useTaskItemStore } from './hooks/useTaskItemStore';

export function App() {
  const { items } = useTaskItemStore();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
          <span className="text-lg font-bold">G</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">ChaarChaal</h1>
        <p className="mt-2 text-sm text-zinc-400">Loaded {items.length} records · setting up workspace</p>
      </div>
    </main>
  );
}

export default App;
