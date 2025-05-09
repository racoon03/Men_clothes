import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { TokenService } from './token.service';
import { HttpUtilService } from './http.util.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiBaseUrl}/comments`;

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService,
    private tokenService: TokenService
  ) { }

  // Lấy comments theo sản phẩm
  getCommentsByProduct(productId: number): Observable<any> {
    const url = `${this.apiUrl}`;
    const params = new HttpParams().set('product_id', productId.toString());
    
    return this.http.get<any>(url, { params });
  }

  // Thêm comment mới
  addComment(commentData: any): Observable<any> {
    return this.http.post(this.apiUrl, commentData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      }),
      responseType: 'text'
    });
  }

  // Cập nhật comment
  updateComment(commentId: number, commentData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${commentId}`, commentData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      })
    });
  }
}