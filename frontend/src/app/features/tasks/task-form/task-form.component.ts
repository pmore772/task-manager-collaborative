import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '@app/core/models/task.model';
import { User } from '@app/core/models/user.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">
            {{ task ? 'Modifier la tâche' : 'Nouvelle tâche' }}
          </h2>
          <button class="btn btn-ghost" (click)="onClose()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group flex-2">
                <label for="title">Titre de la tâche *</label>
                <input
                  type="text"
                  id="title"
                  formControlName="title"
                  placeholder="Ex: Implémenter la page d'accueil"
                />
                @if (form.controls['title'].errors?.['required'] && form.controls['title'].touched) {
                  <p class="error">Le titre est requis</p>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                rows="3"
                placeholder="Décrivez la tâche en détail..."
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="status">Statut</label>
                <select id="status" formControlName="status">
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminé</option>
                </select>
              </div>

              <div class="form-group">
                <label for="priority">Priorité</label>
                <select id="priority" formControlName="priority">
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div class="form-group">
                <label for="due_date">Date d'échéance</label>
                <input
                  type="date"
                  id="due_date"
                  formControlName="due_date"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Assignés</label>
              <div class="assignees-selector">
                @for (user of users; track user.id) {
                  <label class="assignee-option" [class.selected]="isAssigned(user.id)">
                    <input
                      type="checkbox"
                      [value]="user.id"
                      [checked]="isAssigned(user.id)"
                      (change)="toggleAssignee(user.id)"
                    />
                    <span class="assignee-avatar">
                      {{ getInitials(user.name) }}
                    </span>
                    <span class="assignee-name">{{ user.name }}</span>
                    <span class="assignee-email">{{ user.email }}</span>
                  </label>
                }
              </div>
            </div>

            @if (task) {
              <div class="task-info">
                <p><strong>Créé le:</strong> {{ formatDateTime(task.created_at) }}</p>
                @if (task.creator) {
                  <p><strong>Par:</strong> {{ task.creator.name }}</p>
                }
              </div>
            }
          </div>

          <div class="modal-footer">
            @if (task) {
              <button 
                type="button" 
                class="btn btn-danger" 
                (click)="onDelete()"
              >
                Supprimer
              </button>
            }
            <div class="spacer"></div>
            <button type="button" class="btn btn-ghost" (click)="onClose()">
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                <span class="spinner spinner-sm"></span>
              }
              {{ task ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: var(--radius);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    }

    .modal-lg {
      max-width: 650px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-100);
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid var(--gray-100);
    }

    .spacer {
      flex: 1;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .flex-2 {
      grid-column: span 3;
    }

    .assignees-selector {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      padding: 0.5rem;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius);
    }

    .assignee-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: var(--radius);
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--gray-50);
      }

      &.selected {
        background-color: var(--primary-light);
      }

      input[type="checkbox"] {
        display: none;
      }
    }

    .assignee-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
    }

    .assignee-name {
      font-weight: 500;
      color: var(--gray-900);
    }

    .assignee-email {
      color: var(--gray-500);
      font-size: 0.875rem;
      margin-left: auto;
    }

    .task-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-100);
      font-size: 0.875rem;
      color: var(--gray-500);

      p {
        margin-bottom: 0.25rem;
      }
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border-width: 2px;
      margin-right: 0.5rem;
    }

    .btn-danger {
      background-color: var(--danger-500);
      color: white;

      &:hover {
        background-color: var(--danger-600);
      }
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .flex-2 {
        grid-column: span 1;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() projectId!: number;
  @Input() users: User[] = [];
  @Output() save = new EventEmitter<CreateTaskData | UpdateTaskData>();
  @Output() delete = new EventEmitter<Task>();
  @Output() statusChange = new EventEmitter<{ task: Task; status: TaskStatus }>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  loading = signal(false);
  selectedAssignees = signal<number[]>([]);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const assigneeIds = this.task?.assignees?.map(a => a.id) || [];
    this.selectedAssignees.set(assigneeIds);

    this.form = this.fb.group({
      title: [this.task?.title || '', [Validators.required]],
      description: [this.task?.description || ''],
      status: [this.task?.status || 'todo'],
      priority: [this.task?.priority || 'medium'],
      due_date: [this.task?.due_date ? this.formatDateForInput(this.task.due_date) : '']
    });
  }

  isAssigned(userId: number): boolean {
    return this.selectedAssignees().includes(userId);
  }

  toggleAssignee(userId: number): void {
    const current = this.selectedAssignees();
    if (current.includes(userId)) {
      this.selectedAssignees.set(current.filter(id => id !== userId));
    } else {
      this.selectedAssignees.set([...current, userId]);
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      
      const data: CreateTaskData | UpdateTaskData = {
        ...this.form.value,
        project_id: this.projectId,
        assignee_ids: this.selectedAssignees(),
        due_date: this.form.value.due_date || null
      };

      this.save.emit(data);
    }
  }

  onDelete(): void {
    if (this.task) {
      this.delete.emit(this.task);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
