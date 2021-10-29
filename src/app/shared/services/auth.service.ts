import { Injectable } from '@angular/core';
import {User} from "../models/User";
import {Observable, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";

export const TOKEN_COOKIE_NAME = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    return this.http.post<any>('/api/auth/register', user).pipe(catchError(this.handleError));
  }

  login(user: User): Observable<any> {
    return this.http.post<any>('/api/auth/login', user).pipe(tap(user => {
      localStorage.setItem('userId', user.id.toString());
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>('/api/auth/logout', null).pipe(
      tap(() => {
        localStorage.clear();
      }),
      catchError(this.handleError));
  }

  isAuthenticated(): boolean {
    return this.isCookieWithTokenExists(TOKEN_COOKIE_NAME);
  }

  isCookieWithTokenExists(name: string): boolean {
    // TODO
    let d = new Date();
    d.setTime(d.getTime() + (1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=new_value;path=/;" + expires;
    return document.cookie.indexOf(name + '=') == -1;
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }
}
