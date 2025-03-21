import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { CreateProductVariantDTO } from '../dtos/product/create.product.variant.dto';
import { HttpUtilService } from './http.util.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {
  private apiUrl = `${environment.apiBaseUrl}/product-variants`;

  constructor(private http: HttpClient) { }
  
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
}
