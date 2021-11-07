import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../models/User";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
      this.userId = +getUserId;
    }
  }

  getUser(): Observable<any> {
    return this.http.post<any>('/api/user/id', this.userId);
  }

  updateUser(newUser: User): Observable<any> {
    return this.http.post<any>('/api/user/update', newUser);
  }
}
