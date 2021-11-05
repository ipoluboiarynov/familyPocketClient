import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Currency} from "../models/Currency";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/currency/all', this.userId);
  }

  add(currency: Currency): Observable<any>{
    currency.userId = this.userId;
    return this.http.post<any>(this.baseUrl + '/api/currency/add', currency);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/api/currency/delete/' + id);
  }

  update(currency: Currency) {
    return this.http.patch<any>(this.baseUrl + '/api/currency/update', currency);
  }
}
