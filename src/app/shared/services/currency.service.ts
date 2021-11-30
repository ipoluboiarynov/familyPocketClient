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

  getRateByName(name: string, base: boolean) {
    let result = 1;
    let rates = window.localStorage.getItem('rates');
    if (rates) {
      let rates_obj = JSON.parse(rates);
      if (rates_obj.rates) {
        if (base) {
          result = Math.round((1 /rates_obj.rates[name]) * 100)/ 100;
        } else {
          result = Math.round((rates_obj.rates[name] * 100)) / 100;
        }
      }
    }
    return result;
  }
}
