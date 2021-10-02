import { Injectable } from '@angular/core';
import {User} from "../models/User";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: any = null;

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    return this.http.post<any>('/api/auth/register', user).pipe(catchError(this.handleError));
  }

  login(user: User): Observable<any> {
    return this.http.post<any>('/api/auth/login', user).pipe(catchError(this.handleError));
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

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }
}
