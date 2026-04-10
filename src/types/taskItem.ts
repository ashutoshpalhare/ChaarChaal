export type TaskItemCategory = 'Backlog' | 'In Progress' | 'Review' | 'Done';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskItemCategory;
  metricValue: number;
  createdAt: string;
}
