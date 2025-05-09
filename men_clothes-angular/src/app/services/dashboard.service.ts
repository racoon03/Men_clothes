import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Get profit statistics for a date range
   * @param startDate Start date in yyyy-MM-dd format
   * @param endDate End date in yyyy-MM-dd format
   * @returns Observable with profit statistics data
   */
  getProfitStatistics(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    
    return this.http.get<any>(`${this.apiUrl}/profit`, { params });
  }

  /**
   * Get profit data by time unit (day, week, month, quarter, year)
   * @param timeUnit Time unit to group data by
   * @param startDate Start date in yyyy-MM-dd format
   * @param endDate End date in yyyy-MM-dd format
   * @returns Observable with profit data grouped by time unit
   */
  getProfitByTimeUnit(timeUnit: string, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    
    return this.http.get<any>(`${this.apiUrl}/profit/${timeUnit}`, { params });
  }

  /**
   * Export profit report as Excel file
   * @param startDate Start date in yyyy-MM-dd format
   * @param endDate End date in yyyy-MM-dd format
   * @returns Observable with Excel file as Blob
   */
  exportProfitReport(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    
    return this.http.get(`${this.apiUrl}/export/profit`, {
      params,
      responseType: 'blob',
      headers: new HttpHeaders({
      'Accept': 'application/vnd.ms-excel'
      })
    });
  }
}