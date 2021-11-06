import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Filter} from "../models/Filter";

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

  add(filter: Filter): Observable<any>{
    filter.userId = this.userId;
    return this.http.post<any>('/api/filter/add', filter);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/filter/delete/' + id);
  }

  update(filter: Filter) {
    return this.http.patch<any>('/api/filter/update', filter);
  }
}
