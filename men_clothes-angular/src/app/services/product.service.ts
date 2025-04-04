import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { Product } from '../models/product';
import { ProductDTO } from '../dtos/product/product.dto';
import { HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiGetProducts = `${environment.apiBaseUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(keyword:string, categoryId:number, 
              page: number, limit: number
    ): Observable<Product[]> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('category_id', categoryId)
      .set('page', page.toString())
      .set('limit', limit.toString());            
    return this.http.get<Product[]>(this.apiGetProducts, { params });
  }
  getDetailProduct(productId: number) {
    return this.http.get(`${environment.apiBaseUrl}/products/${productId}`);
  }
  getProductsByIds(productIds: number[]): Observable<Product[]> {
    // Chuyển danh sách ID thành một chuỗi và truyền vào params
    debugger
    const params = new HttpParams().set('ids', productIds.join(',')); 
    return this.http.get<Product[]>(`${this.apiGetProducts}/by-ids`, { params });
  }
  deleteProduct(productId: number): Observable<any> {
  const url = `${environment.apiBaseUrl}/products/${productId}`;
    return this.http.delete(url, { responseType: 'text' });
  }

  getProductDetailById(productId: number): Observable<any> {
    const url = `${environment.apiBaseUrl}/products/detail-product/${productId}`;
    return this.http.get(url);
  }

  updateProduct(productId: number, productData: ProductDTO): Observable<any> {
      const url = `${environment.apiBaseUrl}/products/${productId}`;
      return this.http.put(url, productData);
  }
  
  createProduct(productData: ProductDTO,  token: string): Observable<any> {
      const url = `${environment.apiBaseUrl}/products`;
      return this.http.post(url, productData, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        })
    });
  }

  saveProductImages(productId: number, formData: FormData , token: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/products/uploads/${productId}`;
    console.log('Gửi request upload ảnh đến URL:', url);
    return this.http.post(url, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
        // Không cần 'Content-Type' vì FormData sẽ tự thiết lập
      })
  });
}
}
