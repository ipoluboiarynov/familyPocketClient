import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Currency} from "../models/Currency";
import {Template} from "../models/Template";

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  userId: number = 0;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/template/all', this.userId);
  }

  add(template: Template): Observable<any>{
    template.userId = this.userId;
    return this.http.post<any>('/api/template/add', template);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/template/delete/' + id);
  }

  update(template: Template) {
    return this.http.patch<any>('/api/template/update', template);
  }
}
