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
        <!-- Header avec preview couleur -->
        <div class="modal-header" [style.background]="'linear-gradient(135deg, ' + form.value.color + ' 0%, ' + form.value.color + '99 100%)'">
          <div class="header-content">
            <div class="project-icon" [style.background-color]="form.value.color">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="header-text">
              <h2 class="modal-title">
                {{ project ? 'Modifier le projet' : 'Nouveau projet' }}
              </h2>
              <p class="modal-subtitle">
                {{ project ? 'Mettez à jour les informations' : 'Créez un espace pour organiser vos tâches' }}
              </p>
            </div>
          </div>
          <button class="btn-close" (click)="onClose()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <!-- Nom du projet -->
            <div class="form-group">
              <label for="name" class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Nom du projet
                <span class="required">*</span>
              </label>
              <div class="input-wrapper" [class.error]="form.controls['name'].errors && form.controls['name'].touched" [class.success]="form.controls['name'].valid && form.controls['name'].touched">
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  placeholder="Ex: Refonte site web, App mobile..."
                  class="form-input"
                />
                @if (form.controls['name'].valid && form.controls['name'].touched) {
                  <span class="input-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                }
              </div>
              @if (form.controls['name'].errors?.['required'] && form.controls['name'].touched) {
                <p class="error-message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Le nom est requis
                </p>
              }
              @if (form.controls['name'].errors?.['minlength'] && form.controls['name'].touched) {
                <p class="error-message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Minimum 3 caractères
                </p>
              }
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="description" class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="17" y1="10" x2="3" y2="10"/>
                  <line x1="21" y1="6" x2="3" y2="6"/>
                  <line x1="21" y1="14" x2="3" y2="14"/>
                  <line x1="17" y1="18" x2="3" y2="18"/>
                </svg>
                Description
                <span class="optional">(optionnel)</span>
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                placeholder="Décrivez les objectifs et le contexte du projet..."
                class="form-textarea"
              ></textarea>
              <p class="input-hint">Une bonne description aide votre équipe à comprendre le projet</p>
            </div>

            <!-- Couleur -->
            <div class="form-group">
              <label class="form-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="13.5" cy="6.5" r="2.5"/>
                  <circle cx="17.5" cy="10.5" r="2.5"/>
                  <circle cx="8.5" cy="7.5" r="2.5"/>
                  <circle cx="6.5" cy="12.5" r="2.5"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
                </svg>
                Couleur du projet
              </label>
              <div class="color-section">
                <div class="color-preview" [style.background-color]="form.value.color">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div class="color-picker">
                  @for (color of colors; track color) {
                    <button
                      type="button"
                      class="color-option"
                      [class.selected]="form.value.color === color"
                      [style.background-color]="color"
                      [attr.aria-label]="'Couleur ' + color"
                      (click)="selectColor(color)"
                    >
                      @if (form.value.color === color) {
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Annuler
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="form.invalid || loading()"
              [style.background-color]="form.value.color"
            >
              @if (loading()) {
                <span class="spinner spinner-sm"></span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  @if (project) {
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  } @else {
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  }
                </svg>
              }
              {{ project ? 'Enregistrer les modifications' : 'Créer le projet' }}
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
      background-color: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      position: relative;
      padding: 2rem;
      color: white;
      overflow: hidden;
    }

    .modal-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    }

    .header-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .project-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
    }

    .project-icon:hover {
      transform: scale(1.05);
    }

    .header-text {
      flex: 1;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .modal-subtitle {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0.25rem 0 0;
    }

    .btn-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .modal-body {
      padding: 1.5rem 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 0.5rem;

      svg {
        color: var(--gray-400);
      }
    }

    .required {
      color: #EF4444;
    }

    .optional {
      font-weight: 400;
      color: var(--gray-400);
      font-size: 0.75rem;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid var(--gray-200);
      border-radius: 10px;
      font-size: 0.9375rem;
      transition: all 0.2s ease;
      background: var(--gray-50);

      &::placeholder {
        color: var(--gray-400);
      }

      &:hover {
        border-color: var(--gray-300);
      }

      &:focus {
        outline: none;
        border-color: var(--primary);
        background: white;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
    }

    .input-wrapper.error .form-input {
      border-color: #EF4444;
      background: #FEF2F2;

      &:focus {
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
      }
    }

    .input-wrapper.success .form-input {
      border-color: #10B981;
      padding-right: 2.5rem;
    }

    .input-icon {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
    }

    .input-icon.success {
      color: #10B981;
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: #EF4444;
      font-size: 0.8125rem;
      margin-top: 0.5rem;
      animation: shake 0.4s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }

    .input-hint {
      color: var(--gray-400);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .color-section {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }

    .color-preview {
      width: 64px;
      height: 64px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .color-picker {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.625rem;
      flex: 1;
    }

    .color-option {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 3px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      &.selected {
        border-color: var(--gray-900);
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.25rem 2rem;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-100);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary {
      background: white;
      color: var(--gray-600);
      border: 2px solid var(--gray-200);

      &:hover {
        background: var(--gray-50);
        border-color: var(--gray-300);
      }
    }

    .btn-primary {
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .modal {
        max-height: 100vh;
        border-radius: 0;
      }

      .modal-header {
        padding: 1.5rem;
      }

      .modal-body {
        padding: 1.25rem 1.5rem;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .color-section {
        flex-direction: column;
        align-items: center;
      }

      .color-picker {
        justify-content: center;
      }
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
