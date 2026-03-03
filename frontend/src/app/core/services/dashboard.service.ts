import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { DashboardData, DashboardStatistics } from '../models/dashboard.model';
import { Task } from '../models/task.model';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  // Signals for state management
  private dashboardDataSignal = signal<DashboardData | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly dashboardData = this.dashboardDataSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  
  // Computed signals for easier template access
  readonly stats = computed<DashboardStatistics | null>(() => this.dashboardDataSignal()?.statistics ?? null);
  readonly recentTasks = computed<Task[]>(() => this.dashboardDataSignal()?.recent_tasks ?? []);

  constructor(private http: HttpClient) {}

  getData(): Observable<ApiResponse<DashboardData>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<DashboardData>>(this.apiUrl).pipe(
      tap({
        next: (response) => {
          this.dashboardDataSignal.set(response.data);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      })
    );
  }

  refresh(): void {
    this.getData().subscribe();
  }
}
