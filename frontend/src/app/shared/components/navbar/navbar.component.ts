import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/dashboard" class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span>Task Manager</span>
          </a>
        </div>

        <div class="navbar-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            Dashboard
          </a>
          <a routerLink="/projects" routerLinkActive="active" class="nav-link">
            Projets
          </a>
          <a routerLink="/tasks" routerLinkActive="active" class="nav-link">
            Tâches
          </a>
        </div>

        <div class="navbar-user">
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser()?.name }}</span>
            <span class="user-email">{{ authService.currentUser()?.email }}</span>
          </div>
          <button class="btn-logout" (click)="logout()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background-color: white;
      border-bottom: 1px solid var(--gray-200);
      z-index: 40;
    }

    .navbar-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1rem;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .navbar-brand .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.125rem;
      color: var(--primary-600);
      text-decoration: none;

      svg {
        color: var(--primary-600);
      }
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-600);
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s;

      &:hover {
        background-color: var(--gray-100);
        color: var(--gray-900);
      }

      &.active {
        background-color: var(--primary-50);
        color: var(--primary-600);
      }
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-900);
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .btn-logout {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background-color: var(--gray-100);
      border-radius: 0.5rem;
      cursor: pointer;
      color: var(--gray-600);
      transition: all 0.2s;

      &:hover {
        background-color: var(--error-500);
        color: white;
      }
    }

    @media (max-width: 768px) {
      .navbar-links {
        display: none;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout().subscribe();
  }
}
