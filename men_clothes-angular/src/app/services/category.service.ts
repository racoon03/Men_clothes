import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { Category } from '../models/category';
import { CategoryDTO } from '../dtos/category/category.dto';
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiGetCategories  = `${environment.apiBaseUrl}/categories`;

  constructor(private http: HttpClient) { }
  getCategories(page: number, limit: number):Observable<Category[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());     
      return this.http.get<Category[]>(this.apiGetCategories, { params });           
  }

  getAllCategories():Observable<Category[]> {    
        return this.http.get<Category[]>(this.apiGetCategories);           
  }

  createCategory(category: Category): Observable<Category> {
  return this.http.post<Category>(`${environment.apiBaseUrl}/categories`, category);
  }
  createMutilCategory(categories: Category[]): Observable<Category> {
    return this.http.post<Category>(`${environment.apiBaseUrl}/categories`, categories);
  }


  updateCategory(categoryId: number, categoryData: CategoryDTO): Observable<any> {
      const url = `${environment.apiBaseUrl}/categories/${categoryId}`;
      return this.http.put(url, categoryData);
  }
  deleteCategory(categoryId: number): Observable<any> {
      const url = `${environment.apiBaseUrl}/categories/${categoryId}`;
      return this.http.delete(url, { responseType: 'text' });
  }
  
  // Trong category.service.ts
  countCategories(): Observable<number> {
    return this.http.get<number>(`${this.apiGetCategories}/count`);
  }
}