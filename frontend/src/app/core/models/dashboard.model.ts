import { Task } from './task.model';

export interface DashboardStatistics {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  projects_count: number;
}

export interface DashboardByPriority {
  high: number;
  medium: number;
  low: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  by_priority: DashboardByPriority;
  recent_tasks: Task[];
}
