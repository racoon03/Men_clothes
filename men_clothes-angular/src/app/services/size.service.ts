import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { Size } from '../models/size';
@Injectable({
  providedIn: 'root'
})
export class SizeService {
  private apiGetSizes  = `${environment.apiBaseUrl}/sizes`;

  constructor(private http: HttpClient) { }
  getSizes():Observable<Size[]> {    
      return this.http.get<Size[]>(this.apiGetSizes);           
  }

  createSizes(sizes: Size[]): Observable<Size> {
  return this.http.post<Size>(`${environment.apiBaseUrl}/sizes`, sizes);
  }

  addSize(sizeData: { name: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/sizes`, sizeData);
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