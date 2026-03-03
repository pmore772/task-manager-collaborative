import { Task } from './task.model';
import { User } from './user.model';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  user_id: number;
  tasks_count?: number;
  completed_tasks_count?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  tasks?: Task[];
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
}
