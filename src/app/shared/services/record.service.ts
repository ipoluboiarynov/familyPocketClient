import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Record} from "../models/Record";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class RecordService{
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/record/all', this.userId);
  }

  add(record: Record): Observable<any>{
    record.userId = this.userId;
    return this.http.post<any>(this.baseUrl + '/api/record/add', record);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/api/record/delete/' + id);
  }

  update(record: Record) {
    return this.http.patch<any>(this.baseUrl + '/api/record/update', record);
  }
}
