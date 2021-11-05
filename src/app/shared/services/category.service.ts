import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Category} from "../models/Category";
import {environment} from "../../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  userId: number = 0;
  baseUrl: string = environment.backend.baseUrl;

  constructor(private http: HttpClient) {
    let getUserId = localStorage.getItem('userId');
    if (getUserId !== null) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/api/category/all', this.userId);
  }

  add(category: Category): Observable<any>{
    category.userId = this.userId;
    return this.http.post<any>(this.baseUrl + '/api/category/add', category);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/api/category/delete/' + id);
  }

  update(category: Category) {
    return this.http.patch<any>(this.baseUrl + '/api/category/update', category);
  }
}
