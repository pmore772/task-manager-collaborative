import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskStatus } from '../models/task.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly apiUrl = environment.apiUrl;

  // Signals for state management
  private tasksSignal = signal<Task[]>([]);
  private loadingSignal = signal<boolean>(false);
  private filtersSignal = signal<TaskFilters>({});

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly filters = this.filtersSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getAll(filters?: TaskFilters): Observable<ApiResponse<Task[]>> {
    this.loadingSignal.set(true);
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.project_id) params = params.set('project_id', filters.project_id.toString());
      this.filtersSignal.set(filters);
    }

    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/tasks`, { params }).pipe(
      tap({
        next: (response) => {
          this.tasksSignal.set(response.data);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      })
    );
  }

  getByProject(projectId: number, filters?: Partial<TaskFilters>): Observable<ApiResponse<Task[]>> {
    this.loadingSignal.set(true);
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
    }

    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/projects/${projectId}/tasks`, { params }).pipe(
      tap({
        next: (response) => {
          this.tasksSignal.set(response.data);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}`);
  }

  create(projectId: number, data: CreateTaskData): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/projects/${projectId}/tasks`, data).pipe(
      tap(response => {
        const currentTasks = this.tasksSignal();
        this.tasksSignal.set([response.data, ...currentTasks]);
      })
    );
  }

  update(id: number, data: UpdateTaskData): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}`, data).pipe(
      tap(response => {
        const currentTasks = this.tasksSignal();
        const index = currentTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          const updated = [...currentTasks];
          updated[index] = response.data;
          this.tasksSignal.set(updated);
        }
      })
    );
  }

  updateStatus(id: number, status: TaskStatus): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}/status`, { status }).pipe(
      tap(response => {
        const currentTasks = this.tasksSignal();
        const index = currentTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          const updated = [...currentTasks];
          updated[index] = response.data;
          this.tasksSignal.set(updated);
        }
      })
    );
  }

  assignUsers(taskId: number, userIds: number[]): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/tasks/${taskId}/assign`, { user_ids: userIds }).pipe(
      tap(response => {
        const currentTasks = this.tasksSignal();
        const index = currentTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          const updated = [...currentTasks];
          updated[index] = response.data;
          this.tasksSignal.set(updated);
        }
      })
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/tasks/${id}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSignal();
        this.tasksSignal.set(currentTasks.filter(t => t.id !== id));
      })
    );
  }

  setFilters(filters: TaskFilters): void {
    this.filtersSignal.set(filters);
  }

  clearFilters(): void {
    this.filtersSignal.set({});
  }

  clearTasks(): void {
    this.tasksSignal.set([]);
  }
}
