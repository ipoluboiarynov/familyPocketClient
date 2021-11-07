import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Category} from "../models/Category";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  userId: number = 0;

  constructor(private http: HttpClient,
              private auth: AuthService) {
    let getUserId = this.auth.getUserId();
    if (getUserId) {
      this.userId = +getUserId;
    }
  }

  getAll(): Observable<any> {
    return this.http.post<any>('/api/category/all', this.userId);
  }

  add(category: Category): Observable<any>{
    category.userId = this.userId;
    return this.http.post<any>('/api/category/add', category);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>('/api/category/delete/' + id);
  }

  update(category: Category) {
    return this.http.patch<any>('/api/category/update', category);
  }
}
