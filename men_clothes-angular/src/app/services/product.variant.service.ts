import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { CreateProductVariantDTO } from '../dtos/product/create.product.variant.dto';
import { HttpUtilService } from './http.util.service';
import { HttpHeaders } from '@angular/common/http';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {
  private apiUrl = `${environment.apiBaseUrl}/product-variants`;
  

  constructor(private http: HttpClient,
              private httpUtilService: HttpUtilService,
              private tokenService: TokenService) { }
  
  createProduct(productData: CreateProductVariantDTO): Observable<any> {
      return this.http.post(this.apiUrl, productData);
    }

    // Phương thức tạo nhiều biến thể cùng lúc
  createProductVariants(productDataArray: CreateProductVariantDTO[], token: string): Observable<any> {
      const url = `${environment.apiBaseUrl}/product-variants/batch`;
      return this.http.post(url, productDataArray, {
          headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          })
      });
  }

  getProductVariants(productId: number): Observable<any> {
      const url = `${environment.apiBaseUrl}/product-variants/${productId}`;
      return this.http.get(url);
  }

  getColorsProductVariants(productId: number): Observable<any> {
      const url = `${environment.apiBaseUrl}/product-variants/colors/${productId}`;
      return this.http.get(url);
  }

  // Trong ProductVariantService
  importStock(importData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/product-variants/import`, importData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      })
    });
  }

  updateQuantityToZero(variantId: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/product-variants/${variantId}/set-zero`, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      })
    });
  }
}
