import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Template} from "../models/Template";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
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
