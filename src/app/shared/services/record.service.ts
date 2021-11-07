import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Record} from "../models/Record";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class RecordService{
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/record/all', this.userId);
  }

  add(record: Record): Observable<any>{
    record.userId = this.userId;
    return this.http.post<any>('/api/record/add', record);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/record/delete/' + id);
  }

  update(record: Record) {
    return this.http.patch<any>('/api/record/update', record);
  }
}
