import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../models/User";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getUser(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/user/id', this.userId);
  }

  updateUser(newUser: User): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/user/update', newUser);
  }
}
