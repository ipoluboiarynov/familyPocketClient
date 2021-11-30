import {Injectable} from '@angular/core';
import {User} from "../models/User";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";

const TOKEN_NAME = 'access_token';
const USER_KEY = 'user_id';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  register(user: User): Observable<any> {
    return this.http.post<any>('/api/auth/register', user).pipe(catchError(this.handleError));
  }

  login(user: User): Observable<any> {
    return this.http.post<any>('/api/auth/login', user).pipe(catchError(this.handleError));
  }

  logout(): void {
    window.sessionStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_NAME);
    window.sessionStorage.setItem(TOKEN_NAME, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_NAME);
  }

  saveUserId(userId: number): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, userId.toString());
  }

  getUserId(): string | null {
    return sessionStorage.getItem(USER_KEY);
  }


  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

}
