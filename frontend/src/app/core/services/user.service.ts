import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { User } from '../models/user.model';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  search(query?: string): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();
    if (query) {
      params = params.set('search', query);
    }
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }
}
