import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  userId: number = 0;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/filter/all', this.userId);
  }
}
