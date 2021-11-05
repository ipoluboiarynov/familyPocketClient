import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Filter} from "../models/Filter";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/filter/all', this.userId);
  }

  add(filter: Filter): Observable<any>{
    filter.userId = this.userId;
    return this.http.post<any>(this.baseUrl + '/api/filter/add', filter);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/api/filter/delete/' + id);
  }

  update(filter: Filter) {
    return this.http.patch<any>(this.baseUrl + '/api/filter/update', filter);
  }
}
