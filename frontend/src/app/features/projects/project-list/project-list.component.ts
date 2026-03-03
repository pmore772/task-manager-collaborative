import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '@app/core/services/project.service';
import { Project, CreateProjectData, UpdateProjectData } from '@app/core/models/project.model';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Mes Projets</h1>
          <p class="page-subtitle">Gérez vos projets et leurs tâches</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau projet
        </button>
      </div>

      @if (projectService.loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Chargement des projets...</p>
        </div>
      } @else if (projectService.projects().length === 0) {
        <div class="empty-state card">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </svg>
          <h3>Aucun projet</h3>
          <p>Créez votre premier projet pour commencer à gérer vos tâches.</p>
          <button class="btn btn-primary" (click)="openCreateModal()">
            Créer un projet
          </button>
        </div>
      } @else {
        <div class="projects-grid">
          @for (project of projectService.projects(); track project.id) {
            <div class="project-card card" [style.border-left-color]="project.color">
              <div class="project-header">
                <div class="project-color" [style.background-color]="project.color"></div>
                <div class="project-actions">
                  <button class="btn btn-ghost btn-sm" (click)="openEditModal(project)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-sm" (click)="deleteProject(project)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              <a [routerLink]="['/projects', project.id]" class="project-content">
                <h3 class="project-name">{{ project.name }}</h3>
                @if (project.description) {
                  <p class="project-description">{{ project.description }}</p>
                }
              </a>

              <div class="project-stats">
                <div class="stat">
                  <span class="stat-value">{{ project.tasks_count || 0 }}</span>
                  <span class="stat-label">Tâches</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ project.completed_tasks_count || 0 }}</span>
                  <span class="stat-label">Terminées</span>
                </div>
                @if (project.tasks_count && project.tasks_count > 0) {
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      [style.width.%]="((project.completed_tasks_count || 0) / project.tasks_count) * 100"
                    ></div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (showModal()) {
        <app-project-form
          [project]="selectedProject()"
          (save)="onSaveProject($event)"
          (close)="closeModal()"
        />
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      border-left: 4px solid;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .project-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .project-actions {
      display: flex;
      gap: 0.25rem;
    }

    .btn-sm {
      padding: 0.375rem;
    }

    .project-content {
      display: block;
      text-decoration: none;
      color: inherit;
    }

    .project-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .project-description {
      font-size: 0.875rem;
      color: var(--gray-500);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-stats {
      display: flex;
      gap: 1.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
      align-items: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background-color: var(--gray-200);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--success-500);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;

      svg {
        margin-bottom: 1rem;
        color: var(--gray-300);
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--gray-500);
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class ProjectListComponent implements OnInit {
  projectService = inject(ProjectService);

  showModal = signal(false);
  selectedProject = signal<Project | null>(null);

  ngOnInit(): void {
    this.projectService.getAll().subscribe();
  }

  openCreateModal(): void {
    this.selectedProject.set(null);
    this.showModal.set(true);
  }

  openEditModal(project: Project): void {
    this.selectedProject.set(project);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedProject.set(null);
  }

  onSaveProject(data: CreateProjectData | UpdateProjectData): void {
    const project = this.selectedProject();
    
    if (project) {
      this.projectService.update(project.id, data as UpdateProjectData).subscribe({
        next: () => this.closeModal()
      });
    } else {
      this.projectService.create(data as CreateProjectData).subscribe({
        next: () => this.closeModal()
      });
    }
  }

  deleteProject(project: Project): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) {
      this.projectService.delete(project.id).subscribe();
    }
  }
}
