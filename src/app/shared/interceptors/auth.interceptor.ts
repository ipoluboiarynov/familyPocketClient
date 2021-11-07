import {Injectable} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

const TOKEN_HEADER = 'Authorization';
const USER_HEADER = 'userId';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService,
              private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authRequest = req;
    const token = this.auth.getToken();
    const userId = this.auth.getUserId();

    if (token && userId) {
      authRequest = req.clone({
        setHeaders: {
          'Authorization': token,
          'userId': userId
        }
      });
    }
    return next.handle(authRequest).pipe(

      catchError(
        (error: HttpErrorResponse) => this.handleAuthError(error)
      )
    );
  }

  private handleAuthError(error: HttpErrorResponse): Observable<any> {
    if (error.status === 401) {
      this.auth.logout();
      this.router.navigate(['/login'], {
        queryParams: {
          sessionFailed: true
        }
      }).then();
    }
    return throwError(error)
  }
}
