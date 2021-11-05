import {Injectable} from "@angular/core";
import {Rates} from "../models/Rates";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class RatesService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getRates(): Promise<Rates> {
    return new Promise(resolve => {
      let rates = null;
      let ratesString = localStorage.getItem("rates");
      let today = new Date();
      let todayString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + ("0" + today.getDate()).slice(-2);
      if (ratesString && JSON.parse(ratesString) && JSON.parse(ratesString).date == todayString) {
        rates = JSON.parse(ratesString);
        resolve(rates);
      } else {
        this.uploadRates(todayString)
          .subscribe(
            (rates: Rates) => {
              localStorage.setItem("rates", JSON.stringify(rates));
              resolve(rates);
            });
      }
    })
  }

  uploadRates(date: string): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/currency/rates', date);
  }
}
