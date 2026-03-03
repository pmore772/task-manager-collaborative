import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../models/user.model';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  private tokenSignal = signal<string | null>(this.loadTokenFromStorage());

  // Computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly token = this.tokenSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearAuth()),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<{ data: User }> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/me`).pipe(
      tap(response => {
        this.currentUserSignal.set(response.data);
        this.saveUserToStorage(response.data);
      })
    );
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.tokenSignal.set(response.access_token);
    this.currentUserSignal.set(response.user);
    this.saveTokenToStorage(response.access_token);
    this.saveUserToStorage(response.user);
  }

  private clearAuth(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  private saveTokenToStorage(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private loadTokenFromStorage(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}
