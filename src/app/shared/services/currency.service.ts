import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Currency} from "../models/Currency";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/currency/all', this.userId);
  }

  add(currency: Currency): Observable<any>{
    currency.userId = this.userId;
    return this.http.post<any>('/api/currency/add', currency);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/currency/delete/' + id);
  }

  update(currency: Currency) {
    return this.http.patch<any>('/api/currency/update', currency);
  }
}
