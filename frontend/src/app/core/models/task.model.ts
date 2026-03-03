import { User } from './user.model';
import { Project } from './project.model';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  status_label: string;
  priority: TaskPriority;
  priority_label: string;
  due_date: string | null;
  is_overdue: boolean;
  project_id: number;
  creator_id: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  creator?: User;
  assignees?: User[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  assignee_ids?: number[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  assignee_ids?: number[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: number;
}
