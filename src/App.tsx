import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Circle,
  Trash2,
  Menu,
  X,
} from 'lucide-react';
import { useTaskItemStore } from './hooks/useTaskItemStore';
import { SummaryBar } from './components/SummaryBar';
import { TaskItemCategory } from './types/taskItem';
import { exportToCsv } from './utils/storage';

const CATEGORIES: (TaskItemCategory | 'All')[] = [
  'All',
  'Backlog',
  'In Progress',
  'Review',
  'Done',
];

export function App() {
  const {
    filteredItems,
    filter,
    setFilter,
    summary,
    addItem,
    toggleStatus,
    removeItem,
  } = useTaskItemStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskItemCategory>('Backlog');
  const [metricValue, setMetricValue] = useState('25');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addItem({
      title: title.trim(),
      category,
      status: 'active',
      metricValue: Number(metricValue) || 0,
    });
    setTitle('');
  }

  function handleDownloadCsv() {
    const csv = exportToCsv(filteredItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chaarchaal-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
            G
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">ChaarChaal</p>
            <p className="truncate text-[11px] text-zinc-500">Workspace</p>
          </div>
          <button
            className="ml-auto rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Menu
          </p>
          <button className="flex w-full items-center gap-3 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-300">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter({ ...filter, category: cat });
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                filter.category === cat
                  ? 'bg-zinc-800/80 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Circle className="h-3.5 w-3.5 opacity-60" />
              {cat}
            </button>
          ))}
        </nav>

        <div className="border-t border-zinc-800/80 p-4">
          <p className="text-[11px] text-zinc-500">A browser-based Ludo game built with React, featuring an interactive board, turn-based gameplay, and responsive UI. Deployed to GitHub Pages... (inspired by mort3za/ludo)</p>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={filter.query}
              onChange={(e) => setFilter({ ...filter, query: e.target.value })}
              placeholder="Search taskItems..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Dashboard</h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Manage and track your taskItems
                </p>
              </div>
            </div>

            <SummaryBar
              totalCount={summary.totalCount}
              activeCount={summary.activeCount}
              totalMetric={summary.totalMetric}
            />

            {/* Add form */}
            <form
              onSubmit={handleSubmit}
              className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 md:p-5"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <Plus className="h-4 w-4 text-emerald-400" />
                Add new taskItem
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title..."
                  className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskItemCategory)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder="Value"
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </form>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter({ ...filter, category: cat })}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    filter.category === cat
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-500">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-zinc-300">No taskItems found</p>
                <p className="mt-1 text-xs text-zinc-500">Try a different filter or add a new entry</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
                <div className="hidden grid-cols-12 gap-4 border-b border-zinc-800/80 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500 sm:grid">
                  <div className="col-span-5">Title</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Value</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <ul className="divide-y divide-zinc-800/60">
                  {filteredItems.map((item) => (
                    <li
                      key={item.id}
                      className="grid grid-cols-1 items-center gap-3 px-5 py-4 transition hover:bg-zinc-900/50 sm:grid-cols-12 sm:gap-4"
                    >
                      <div className="sm:col-span-5">
                        <p className="text-sm font-medium text-zinc-100">{item.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500 sm:hidden">
                          {item.category} · {item.status}
                        </p>
                      </div>
                      <div className="hidden sm:col-span-2 sm:block">
                        <span className="inline-flex rounded-lg bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="hidden sm:col-span-2 sm:block">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : item.status === 'paused'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-zinc-700/50 text-zinc-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === 'active'
                                ? 'bg-emerald-400'
                                : item.status === 'paused'
                                  ? 'bg-amber-400'
                                  : 'bg-zinc-500'
                            }`}
                          />
                          {item.status}
                        </span>
                      </div>
                      <div className="hidden text-right font-mono text-sm text-zinc-200 sm:col-span-1 sm:block">
                        {item.metricValue}
                      </div>
                      <div className="flex items-center justify-end gap-1 sm:col-span-2">
                        <button
                          onClick={() => toggleStatus(item.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                          title="Toggle status"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
