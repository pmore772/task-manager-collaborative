import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '@app/core/services/project.service';
import { TaskService } from '@app/core/services/task.service';
import { UserService } from '@app/core/services/user.service';
import { Project, UpdateProjectData } from '@app/core/models/project.model';
import { Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '@app/core/models/task.model';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProjectFormComponent, TaskFormComponent],
  template: `
    <div class="container">
      @if (projectService.loading()) {
        <div class="loading-state">
          <span class="spinner"></span>
          <p>Chargement du projet...</p>
        </div>
      } @else if (project()) {
        <div class="page-header">
          <div class="breadcrumb">
            <a routerLink="/projects">Projets</a>
            <span class="separator">/</span>
            <span>{{ project()!.name }}</span>
          </div>

          <div class="project-info">
            <div class="project-color" [style.background-color]="project()!.color"></div>
            <div>
              <h1 class="project-name">{{ project()!.name }}</h1>
              @if (project()!.description) {
                <p class="project-description">{{ project()!.description }}</p>
              }
            </div>
            <button class="btn btn-ghost" (click)="openEditProjectModal()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              Modifier
            </button>
          </div>
        </div>

        <div class="tasks-section">
          <div class="tasks-header">
            <h2>Tâches</h2>
            <div class="tasks-actions">
              <div class="filters">
                <select [(ngModel)]="statusFilter" (change)="applyFilters()">
                  <option value="">Tous les statuts</option>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminé</option>
                </select>

                <select [(ngModel)]="priorityFilter" (change)="applyFilters()">
                  <option value="">Toutes priorités</option>
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              
              <button class="btn btn-primary" (click)="openCreateTaskModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nouvelle tâche
              </button>
            </div>
          </div>

          @if (taskService.loading()) {
            <div class="loading-state">
              <span class="spinner"></span>
            </div>
          } @else if (taskService.tasks().length === 0) {
            <div class="empty-state card">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
              <h3>Aucune tâche</h3>
              <p>Ajoutez votre première tâche à ce projet.</p>
              <button class="btn btn-primary" (click)="openCreateTaskModal()">
                Ajouter une tâche
              </button>
            </div>
          } @else {
            <div class="tasks-board">
              <!-- Todo Column -->
              <div class="task-column">
                <div class="column-header">
                  <span class="column-title">À faire</span>
                  <span class="column-count">{{ todoTasks().length }}</span>
                </div>
                <div class="task-list">
                  @for (task of todoTasks(); track task.id) {
                    <div class="task-card card" (click)="openEditTaskModal(task)">
                      <div class="task-priority" [class]="'priority-' + task.priority"></div>
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.description) {
                        <p class="task-description">{{ task.description }}</p>
                      }
                      <div class="task-meta">
                        @if (task.due_date) {
                          <span class="task-due" [class.overdue]="isOverdue(task)">
                            {{ formatDate(task.due_date) }}
                          </span>
                        }
                        @if (task.assignees && task.assignees.length > 0) {
                          <div class="task-assignees">
                            @for (assignee of task.assignees.slice(0, 3); track assignee.id) {
                              <span class="assignee-avatar" [title]="assignee.name">
                                {{ getInitials(assignee.name) }}
                              </span>
                            }
                            @if (task.assignees.length > 3) {
                              <span class="assignee-more">+{{ task.assignees.length - 3 }}</span>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- In Progress Column -->
              <div class="task-column">
                <div class="column-header">
                  <span class="column-title">En cours</span>
                  <span class="column-count">{{ inProgressTasks().length }}</span>
                </div>
                <div class="task-list">
                  @for (task of inProgressTasks(); track task.id) {
                    <div class="task-card card" (click)="openEditTaskModal(task)">
                      <div class="task-priority" [class]="'priority-' + task.priority"></div>
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.description) {
                        <p class="task-description">{{ task.description }}</p>
                      }
                      <div class="task-meta">
                        @if (task.due_date) {
                          <span class="task-due" [class.overdue]="isOverdue(task)">
                            {{ formatDate(task.due_date) }}
                          </span>
                        }
                        @if (task.assignees && task.assignees.length > 0) {
                          <div class="task-assignees">
                            @for (assignee of task.assignees.slice(0, 3); track assignee.id) {
                              <span class="assignee-avatar" [title]="assignee.name">
                                {{ getInitials(assignee.name) }}
                              </span>
                            }
                            @if (task.assignees.length > 3) {
                              <span class="assignee-more">+{{ task.assignees.length - 3 }}</span>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Done Column -->
              <div class="task-column done-column">
                <div class="column-header">
                  <span class="column-title">Terminé</span>
                  <span class="column-count">{{ doneTasks().length }}</span>
                </div>
                <div class="task-list">
                  @for (task of doneTasks(); track task.id) {
                    <div class="task-card card" (click)="openEditTaskModal(task)">
                      <div class="task-priority" [class]="'priority-' + task.priority"></div>
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.description) {
                        <p class="task-description">{{ task.description }}</p>
                      }
                      <div class="task-meta">
                        @if (task.due_date) {
                          <span class="task-due">
                            {{ formatDate(task.due_date) }}
                          </span>
                        }
                        @if (task.assignees && task.assignees.length > 0) {
                          <div class="task-assignees">
                            @for (assignee of task.assignees.slice(0, 3); track assignee.id) {
                              <span class="assignee-avatar" [title]="assignee.name">
                                {{ getInitials(assignee.name) }}
                              </span>
                            }
                            @if (task.assignees.length > 3) {
                              <span class="assignee-more">+{{ task.assignees.length - 3 }}</span>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="error-state card">
          <h3>Projet non trouvé</h3>
          <p>Le projet demandé n'existe pas ou a été supprimé.</p>
          <a routerLink="/projects" class="btn btn-primary">Retour aux projets</a>
        </div>
      }
      
      @if (showProjectModal()) {
        <app-project-form
          [project]="project()"
          (save)="onSaveProject($event)"
          (close)="closeProjectModal()"
        />
      }

      @if (showTaskModal()) {
        <app-task-form
          [task]="selectedTask()"
          [projectId]="project()!.id"
          [users]="[]"
          (save)="onSaveTask($event)"
          (delete)="onDeleteTask($event)"
          (statusChange)="onStatusChange($event)"
          (close)="closeTaskModal()"
        />
      }
    </div>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: 1rem;

      a {
        color: var(--primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .separator {
        color: var(--gray-300);
      }
    }

    .project-info {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .project-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      margin-top: 0.25rem;
    }

    .project-name {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .project-description {
      color: var(--gray-500);
      margin-top: 0.25rem;
    }

    .tasks-section {
      margin-top: 2rem;
    }

    .tasks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
      }
    }

    .tasks-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .filters {
      display: flex;
      gap: 0.5rem;

      select {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius);
        background: white;
        font-size: 0.875rem;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--primary);
        }
      }
    }

    .tasks-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .task-column {
      background: var(--gray-50);
      border-radius: var(--radius);
      padding: 1rem;
      min-height: 400px;
    }

    .done-column {
      background: var(--success-50);
    }

    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--gray-200);
    }

    .column-title {
      font-weight: 600;
      color: var(--gray-700);
    }

    .column-count {
      background: var(--gray-200);
      color: var(--gray-600);
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .task-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      padding-left: 1.25rem;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .task-priority {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-radius: var(--radius) 0 0 var(--radius);

      &.priority-low {
        background-color: var(--success-500);
      }

      &.priority-medium {
        background-color: var(--warning-500);
      }

      &.priority-high {
        background-color: var(--danger-500);
      }
    }

    .task-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .task-description {
      font-size: 0.75rem;
      color: var(--gray-500);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--gray-100);
    }

    .task-due {
      font-size: 0.75rem;
      color: var(--gray-500);

      &.overdue {
        color: var(--danger-500);
        font-weight: 500;
      }
    }

    .task-assignees {
      display: flex;
      gap: -0.5rem;
    }

    .assignee-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      font-size: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      border: 2px solid white;
      margin-left: -8px;

      &:first-child {
        margin-left: 0;
      }
    }

    .assignee-more {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--gray-200);
      color: var(--gray-600);
      font-size: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      border: 2px solid white;
      margin-left: -8px;
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

    .error-state, .empty-state {
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

    @media (max-width: 1024px) {
      .tasks-board {
        grid-template-columns: 1fr;
      }

      .task-column {
        min-height: auto;
      }
    }

    @media (max-width: 768px) {
      .tasks-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .tasks-actions {
        flex-direction: column;
      }

      .filters {
        width: 100%;
        
        select {
          flex: 1;
        }
      }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  projectService = inject(ProjectService);
  taskService = inject(TaskService);
  userService = inject(UserService);
  private route = inject(ActivatedRoute);

  project = signal<Project | null>(null);
  showProjectModal = signal(false);
  showTaskModal = signal(false);
  selectedTask = signal<Task | null>(null);

  statusFilter = '';
  priorityFilter = '';

  todoTasks = computed(() => 
    this.taskService.tasks().filter(t => t.status === 'todo')
  );

  inProgressTasks = computed(() => 
    this.taskService.tasks().filter(t => t.status === 'in_progress')
  );

  doneTasks = computed(() => 
    this.taskService.tasks().filter(t => t.status === 'done')
  );

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject(projectId);
    this.loadTasks(projectId);
    this.userService.search().subscribe();
  }

  private loadProject(id: number): void {
    this.projectService.getById(id).subscribe({
      next: (response) => this.project.set(response.data)
    });
  }

  private loadTasks(projectId: number): void {
    this.taskService.getAll({ project_id: projectId }).subscribe();
  }

  applyFilters(): void {
    const projectId = this.project()?.id;
    if (!projectId) return;

    const filters: any = { project_id: projectId };
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.priorityFilter) filters.priority = this.priorityFilter;

    this.taskService.getAll(filters).subscribe();
  }

  openEditProjectModal(): void {
    this.showProjectModal.set(true);
  }

  closeProjectModal(): void {
    this.showProjectModal.set(false);
  }

  onSaveProject(data: UpdateProjectData): void {
    const project = this.project();
    if (project) {
      this.projectService.update(project.id, data).subscribe({
        next: (response) => {
          this.project.set(response.data);
          this.closeProjectModal();
        }
      });
    }
  }

  openCreateTaskModal(): void {
    this.selectedTask.set(null);
    this.showTaskModal.set(true);
  }

  openEditTaskModal(task: Task): void {
    this.selectedTask.set(task);
    this.showTaskModal.set(true);
  }

  closeTaskModal(): void {
    this.showTaskModal.set(false);
    this.selectedTask.set(null);
  }

  onSaveTask(data: CreateTaskData | UpdateTaskData): void {
    const task = this.selectedTask();
    const projectId = this.project()?.id;
    
    if (task) {
      this.taskService.update(task.id, data as UpdateTaskData).subscribe({
        next: () => this.closeTaskModal()
      });
    } else if (projectId) {
      this.taskService.create(projectId, data as CreateTaskData).subscribe({
        next: () => this.closeTaskModal()
      });
    }
  }

  onDeleteTask(task: Task): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
      this.taskService.delete(task.id).subscribe({
        next: () => this.closeTaskModal()
      });
    }
  }

  onStatusChange({ task, status }: { task: Task; status: TaskStatus }): void {
    this.taskService.updateStatus(task.id, status).subscribe();
  }

  isOverdue(task: Task): boolean {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
