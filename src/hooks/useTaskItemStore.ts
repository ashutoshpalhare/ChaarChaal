import { useState } from 'react';
import { TaskItem } from '../types/taskItem';
import { INITIAL_TASKITEMS } from '../data/seed';

export function useTaskItemStore() {
  const [items, setItems] = useState<TaskItem[]>(INITIAL_TASKITEMS);

  function addItem(entry: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    setItems((prev) => [
      { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }

  return { items, addItem };
}
