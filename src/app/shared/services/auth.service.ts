import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../models/User";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  register(user: User) {
    return this.http.post<User>('/api/auth/register', user)
  }

  login(user: User): Observable<{token: string}> {
    return this.http.post<{token: string}>('/api/auth/login', user)
      .pipe(tap(
        ({token}) => {
          localStorage.setItem('auth-token', token);
          this.setToken(token);
        }
      ));
  }

  logout() {
    this.setToken(null);
    localStorage.clear();
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): any {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}
