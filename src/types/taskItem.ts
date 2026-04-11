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
