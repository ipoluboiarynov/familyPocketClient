import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Account} from "../models/Account";

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  userId: number = 0;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(date?: string): Observable<any> {
    if(!date) {
      let today = new Date();
      date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + ("0" + today.getDate()).slice(-2);
    }
    return this.http.post<any>('/api/account/all', {id: this.userId, date: date});
  }

  getById(id: number, date: string): Observable<any> {
    return this.http.post<any>('/api/account/id', {id: id, date: date});
  }

  add(account: Account): Observable<any>{
    account.userId = this.userId;
    return this.http.post<any>('/api/account/add', account);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/account/delete/' + id);
  }

  update(account: Account) {
    return this.http.patch<any>('/api/account/update', account);
  }
}
