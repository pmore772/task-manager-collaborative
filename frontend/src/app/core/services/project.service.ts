import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { Project, CreateProjectData, UpdateProjectData } from '../models/project.model';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  // Signals for state management
  private projectsSignal = signal<Project[]>([]);
  private loadingSignal = signal<boolean>(false);
  private selectedProjectSignal = signal<Project | null>(null);

  readonly projects = this.projectsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly selectedProject = this.selectedProjectSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Project[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Project[]>>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          this.projectsSignal.set(response.data);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      })
    );
  }

  getById(id: number): Observable<ApiResponse<Project>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: (response) => {
          this.selectedProjectSignal.set(response.data);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      })
    );
  }

  create(data: CreateProjectData): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(this.apiUrl, data).pipe(
      tap(response => {
        const currentProjects = this.projectsSignal();
        this.projectsSignal.set([response.data, ...currentProjects]);
      })
    );
  }

  update(id: number, data: UpdateProjectData): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, data).pipe(
      tap(response => {
        const currentProjects = this.projectsSignal();
        const index = currentProjects.findIndex(p => p.id === id);
        if (index !== -1) {
          const updated = [...currentProjects];
          updated[index] = response.data;
          this.projectsSignal.set(updated);
        }
        if (this.selectedProjectSignal()?.id === id) {
          this.selectedProjectSignal.set(response.data);
        }
      })
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentProjects = this.projectsSignal();
        this.projectsSignal.set(currentProjects.filter(p => p.id !== id));
        if (this.selectedProjectSignal()?.id === id) {
          this.selectedProjectSignal.set(null);
        }
      })
    );
  }

  clearSelectedProject(): void {
    this.selectedProjectSignal.set(null);
  }
}
