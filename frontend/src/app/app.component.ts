import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="app-layout">
      @if (authService.isAuthenticated()) {
        <app-navbar />
      }
      <main class="main-content" [class.with-navbar]="authService.isAuthenticated()">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
    }

    .main-content {
      padding: 1.5rem;

      &.with-navbar {
        padding-top: calc(64px + 1.5rem);
      }
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
}
