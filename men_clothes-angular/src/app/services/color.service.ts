import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { Category } from '../models/category';
import { CategoryDTO } from '../dtos/category/category.dto';
import { Color } from '../models/color';
@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private apiGetColors  = `${environment.apiBaseUrl}/colors`;

  constructor(private http: HttpClient) { }
  getColors():Observable<Color[]> {    
      return this.http.get<Color[]>(this.apiGetColors);           
  }

  createColors(colors: Color[]): Observable<Color> {
  return this.http.post<Color>(`${environment.apiBaseUrl}/colors`, colors);
  }

  // Trong ColorService
  addColor(color: {name: string}): Observable<any> {
    return this.http.post(this.apiGetColors, color);
  }


  // updateColors(categoryId: number, categoryData: CategoryDTO): Observable<any> {
  //     const url = `${environment.apiBaseUrl}/categories/${categoryId}`;
  //     return this.http.put(url, categoryData);
  // }
  // deleteColors(categoryId: number): Observable<any> {
  //     const url = `${environment.apiBaseUrl}/categories/${categoryId}`;
  //     return this.http.delete(url, { responseType: 'text' });
  // }
}