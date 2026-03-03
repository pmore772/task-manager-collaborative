import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project, CreateProjectData, UpdateProjectData } from '@app/core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">
            {{ project ? 'Modifier le projet' : 'Nouveau projet' }}
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
            <div class="form-group">
              <label for="name">Nom du projet *</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                placeholder="Ex: Site e-commerce"
              />
              @if (form.controls['name'].errors?.['required'] && form.controls['name'].touched) {
                <p class="error">Le nom est requis</p>
              }
              @if (form.controls['name'].errors?.['minlength'] && form.controls['name'].touched) {
                <p class="error">Le nom doit contenir au moins 3 caractères</p>
              }
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                rows="3"
                placeholder="Décrivez brièvement le projet..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Couleur du projet</label>
              <div class="color-picker">
                @for (color of colors; track color) {
                  <button
                    type="button"
                    class="color-option"
                    [class.selected]="form.value.color === color"
                    [style.background-color]="color"
                    (click)="selectColor(color)"
                  ></button>
                }
              </div>
            </div>
          </div>

          <div class="modal-footer">
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
              {{ project ? 'Enregistrer' : 'Créer' }}
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
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid var(--gray-100);
    }

    .color-picker {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .color-option {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;

      &:hover {
        transform: scale(1.1);
      }

      &.selected {
        border-color: var(--gray-900);
      }
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border-width: 2px;
      margin-right: 0.5rem;
    }
  `]
})
export class ProjectFormComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() save = new EventEmitter<CreateProjectData | UpdateProjectData>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  loading = signal(false);

  colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.project?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.project?.description || ''],
      color: [this.project?.color || this.colors[0]]
    });
  }

  selectColor(color: string): void {
    this.form.patchValue({ color });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading.set(true);
      this.save.emit(this.form.value);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
