import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AccountType} from "../models/AccountType";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class AccountTypeService {
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/account-type/all', this.userId);
  }

  add(accountType: AccountType): Observable<any>{
    accountType.userId = this.userId;
    return this.http.post<any>('/api/account-type/add', accountType);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/account-type/delete/' + id);
  }

  update(accountType: AccountType) {
    return this.http.patch<any>('/api/account-type/update', accountType);
  }
}
