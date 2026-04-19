export type TaskItemCategory = 'Backlog' | 'In Progress' | 'Review' | 'Done';

export type TaskItemStatus = 'active' | 'paused' | 'archived';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskItemCategory;
  status: TaskItemStatus;
  metricValue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItemFilter {
  query: string;
  category: TaskItemCategory | 'All';
  status: TaskItemStatus | 'all';
}

      <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-zinc-200">New section</h3>
        <p className="mt-1 text-xs text-zinc-400">Added in recent update</p>
      
      <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-zinc-200">New section</h3>
        <p className="mt-1 text-xs text-zinc-400">Added in recent update</p>
      </section>
</section>
// ChaarChaal update
// ChaarChaal update
// TODO: refine taskItem.ts layout spacing
