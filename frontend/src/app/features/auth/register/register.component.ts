import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Inscription</h1>
          <p>Créez votre compte gratuitement</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-error">
            {{ errorMessage }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="name">Nom complet</label>
            <input
              type="text"
              id="name"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('name')"
              formControlName="name"
              placeholder="John Doe"
            />
            @if (isFieldInvalid('name')) {
              <span class="form-error">Le nom est requis</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              type="email"
              id="email"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('email')"
              formControlName="email"
              placeholder="votre@email.com"
            />
            @if (isFieldInvalid('email')) {
              <span class="form-error">L'email est requis et doit être valide</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('password')"
              formControlName="password"
              placeholder="••••••••"
            />
            @if (isFieldInvalid('password')) {
              <span class="form-error">Le mot de passe doit contenir au moins 8 caractères</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password_confirmation">Confirmer le mot de passe</label>
            <input
              type="password"
              id="password_confirmation"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('password_confirmation') || passwordMismatch"
              formControlName="password_confirmation"
              placeholder="••••••••"
            />
            @if (isFieldInvalid('password_confirmation')) {
              <span class="form-error">La confirmation est requise</span>
            }
            @if (passwordMismatch) {
              <span class="form-error">Les mots de passe ne correspondent pas</span>
            }
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="loading">
            @if (loading) {
              <span class="spinner"></span>
            }
            S'inscrire
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(135deg, var(--primary-50) 0%, var(--gray-100) 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--gray-900);
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--gray-500);
        font-size: 0.875rem;
      }
    }

    .btn-full {
      width: 100%;
      margin-top: 1rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--gray-200);

      p {
        font-size: 0.875rem;
        color: var(--gray-600);
      }

      a {
        color: var(--primary-600);
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required]
  });

  loading = false;
  errorMessage = '';

  get passwordMismatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmation = this.registerForm.get('password_confirmation')?.value;
    return confirmation && password !== confirmation;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordMismatch) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          const errors = err.error.errors;
          this.errorMessage = Object.values(errors).flat().join(', ');
        } else {
          this.errorMessage = err.error?.message || 'Une erreur est survenue';
        }
      }
    });
  }
}
