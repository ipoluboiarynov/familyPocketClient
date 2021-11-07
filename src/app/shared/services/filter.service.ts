import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Filter} from "../models/Filter";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/filter/all', this.userId);
  }

  add(filter: Filter): Observable<any>{
    console.log(filter);
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
