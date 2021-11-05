import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Template} from "../models/Template";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/template/all', this.userId);
  }

  add(template: Template): Observable<any>{
    template.userId = this.userId;
    return this.http.post<any>(this.baseUrl + '/api/template/add', template);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/api/template/delete/' + id);
  }

  update(template: Template) {
    return this.http.patch<any>(this.baseUrl + '/api/template/update', template);
  }
}
