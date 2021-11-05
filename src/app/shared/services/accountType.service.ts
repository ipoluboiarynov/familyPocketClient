import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AccountType} from "../models/AccountType";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class AccountTypeService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/account-type/all', this.userId);
  }

  add(accountType: AccountType): Observable<any>{
    accountType.userId = this.userId;
    return this.http.post<any>(this.baseUrl + '/api/account-type/add', accountType);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/api/account-type/delete/' + id);
  }

  update(accountType: AccountType) {
    return this.http.patch<any>(this.baseUrl + '/api/account-type/update', accountType);
  }
}
