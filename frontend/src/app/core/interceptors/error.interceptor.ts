import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        router.navigate(['/auth/login']);
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Vous n\'avez pas les permissions nécessaires.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 422) {
        // Validation errors - keep the original error for form handling
        return throwError(() => error);
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur.';
      }

      console.error('HTTP Error:', error);
      
      return throwError(() => ({
        ...error,
        message: errorMessage
      }));
    })
  );
};
