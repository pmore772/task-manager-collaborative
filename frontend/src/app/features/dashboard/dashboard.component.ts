import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '@app/core/services/dashboard.service';
import { ProjectService } from '@app/core/services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-subtitle">Vue d'ensemble de vos projets et tâches</p>
      </div>

      @if (dashboardService.loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Chargement des données...</p>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon stat-icon-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardService.stats()?.projects_count || 0 }}</span>
              <span class="stat-label">Projets</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon stat-icon-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardService.stats()?.total_tasks || 0 }}</span>
              <span class="stat-label">Tâches totales</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon stat-icon-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardService.stats()?.done_tasks || 0 }}</span>
              <span class="stat-label">Complétées</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon stat-icon-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardService.stats()?.in_progress_tasks || 0 }}</span>
              <span class="stat-label">En cours</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon stat-icon-danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardService.stats()?.overdue_tasks || 0 }}</span>
              <span class="stat-label">En retard</span>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon stat-icon-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ dashboardService.stats()?.todo_tasks || 0 }}</span>
              <span class="stat-label">À faire</span>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Recent Tasks -->
          <div class="dashboard-section card">
            <div class="section-header">
              <h2>Tâches récentes</h2>
              <a routerLink="/projects" class="btn btn-ghost btn-sm">Voir tout</a>
            </div>
            
            @if (dashboardService.recentTasks().length === 0) {
              <div class="empty-section">
                <p>Aucune tâche récente</p>
              </div>
            } @else {
              <div class="task-list">
                @for (task of dashboardService.recentTasks(); track task.id) {
                  <div class="task-item" [routerLink]="['/projects', task.project_id]">
                    <div class="task-status" [class]="'status-' + task.status"></div>
                    <div class="task-info">
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.project) {
                        <span class="task-project">{{ task.project.name }}</span>
                      }
                    </div>
                    <div class="task-meta">
                      <span class="task-priority badge" [class]="'badge-' + task.priority">
                        {{ getPriorityLabel(task.priority) }}
                      </span>
                      @if (task.due_date) {
                        <span class="task-due" [class.overdue]="isOverdue(task)">
                          {{ formatDate(task.due_date) }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Projects Overview -->
          <div class="dashboard-section card">
            <div class="section-header">
              <h2>Mes projets</h2>
              <a routerLink="/projects" class="btn btn-ghost btn-sm">Voir tout</a>
            </div>

            @if (projectService.projects().length === 0) {
              <div class="empty-section">
                <p>Aucun projet</p>
                <a routerLink="/projects" class="btn btn-primary btn-sm">
                  Créer un projet
                </a>
              </div>
            } @else {
              <div class="project-list">
                @for (project of projectService.projects().slice(0, 5); track project.id) {
                  <a [routerLink]="['/projects', project.id]" class="project-item">
                    <div class="project-color" [style.background-color]="project.color"></div>
                    <div class="project-info">
                      <h4 class="project-name">{{ project.name }}</h4>
                      <span class="project-tasks">
                        {{ project.completed_tasks_count || 0 }}/{{ project.tasks_count || 0 }} tâches
                      </span>
                    </div>
                    @if (project.tasks_count && project.tasks_count > 0) {
                      <div class="project-progress">
                        <div class="progress-bar">
                          <div 
                            class="progress-fill" 
                            [style.width.%]="((project.completed_tasks_count || 0) / project.tasks_count) * 100"
                          ></div>
                        </div>
                        <span class="progress-text">
                          {{ Math.round(((project.completed_tasks_count || 0) / project.tasks_count) * 100) }}%
                        </span>
                      </div>
                    }
                  </a>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .page-subtitle {
      color: var(--gray-500);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
      color: var(--gray-500);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon-primary {
      background: var(--primary-light);
      color: var(--primary);
    }

    .stat-icon-success {
      background: var(--success-50);
      color: var(--success-500);
    }

    .stat-icon-warning {
      background: var(--warning-50);
      color: var(--warning-500);
    }

    .stat-icon-danger {
      background: var(--danger-50);
      color: var(--danger-500);
    }

    .stat-icon-info {
      background: #e0f2fe;
      color: #0284c7;
    }

    .stat-icon-secondary {
      background: var(--gray-100);
      color: var(--gray-600);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .dashboard-section {
      padding: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--gray-100);

      h2 {
        font-size: 1rem;
        font-weight: 600;
      }
    }

    .empty-section {
      text-align: center;
      padding: 2rem;
      color: var(--gray-500);

      p {
        margin-bottom: 1rem;
      }
    }

    .task-list {
      display: flex;
      flex-direction: column;
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--gray-50);
      }
    }

    .task-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.status-todo {
        background-color: var(--gray-400);
      }

      &.status-in_progress {
        background-color: var(--primary);
      }

      &.status-done {
        background-color: var(--success-500);
      }
    }

    .task-info {
      flex: 1;
      min-width: 0;
    }

    .task-title {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .task-project {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .task-due {
      font-size: 0.75rem;
      color: var(--gray-500);

      &.overdue {
        color: var(--danger-500);
      }
    }

    .project-list {
      display: flex;
      flex-direction: column;
    }

    .project-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius);
      text-decoration: none;
      color: inherit;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--gray-50);
      }
    }

    .project-color {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    .project-info {
      flex: 1;
      min-width: 0;
    }

    .project-name {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-900);
    }

    .project-tasks {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .project-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100px;
    }

    .progress-bar {
      flex: 1;
      height: 4px;
      background-color: var(--gray-200);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--success-500);
      border-radius: 2px;
    }

    .progress-text {
      font-size: 0.75rem;
      color: var(--gray-500);
      min-width: 32px;
      text-align: right;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  projectService = inject(ProjectService);
  Math = Math;

  ngOnInit(): void {
    this.dashboardService.getData().subscribe();
    this.projectService.getAll().subscribe();
  }

  isOverdue(task: any): boolean {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute'
    };
    return labels[priority] || priority;
  }
}
