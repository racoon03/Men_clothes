import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { environment } from '../enviroments/enviroment';
import { HttpUtilService } from './http.util.service';
import { UserResponse } from '../components/responses/user/user.response';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
import { ApiResponse } from '../components/responses/api.responses';
import { UserListResponse } from '../components/responses/user/user.list.response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
    private apiUserList = `${environment.apiBaseUrl}/users/list-user`;
  private apiUserStatus = `${environment.apiBaseUrl}/users/status`;


  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  }

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService
  ) { }

  register(registerDTO: RegisterDTO):Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<any> {    
    return this.http.post(this.apiLogin, loginDTO, this.apiConfig);
  }

  getUserDetail(token: string) {
    return this.http.post(this.apiUserDetail, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }

  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO): Observable<ApiResponse>  {
    let userResponse = this.getUserResponseFromLocalStorage();        
    return this.http.put<ApiResponse>(`${this.apiUserDetail}/${userResponse?.id}`,updateUserDTO,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }

  saveUserResponseToLocalStorage(userResponse?: UserResponse) {
    try {
      debugger
      if(userResponse == null || !userResponse) {
        return;
      }
      // Convert the userResponse object to a JSON string
      const userResponseJSON = JSON.stringify(userResponse);  
      // Save the JSON string to local storage with a key (e.g., "userResponse")
      localStorage.setItem('user', userResponseJSON);  
      console.log('User response saved to local storage.');
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }
  getUserResponseFromLocalStorage() {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = localStorage.getItem('user'); 
      if(userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);  
      console.log('User response retrieved from local storage.');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user response from local storage:', error);
      return null; // Return null or handle the error as needed
    }
  }

  removeUserFromLocalStorage():void {
    try {
      // Remove the user data from local storage using the key
      localStorage.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   */
  isUserLoggedIn(): boolean {
    const user = this.getUserResponseFromLocalStorage();
    return user !== null;
  }
  
  /**
   * Lấy tên người dùng
   */
  getUserName(): string {
    const user = this.getUserResponseFromLocalStorage();
    return user?.fullname || 'Khách';
  }
  
  /**
   * Lấy ID người dùng
   */
  getUserId(): number {
    const user = this.getUserResponseFromLocalStorage();
    return user?.id || 0;
  }
  
  /**
   * Cập nhật đầy đủ thông tin người dùng vào form
   */
  fillUserInfoToForm(formGroup: any): void {
    const user = this.getUserResponseFromLocalStorage();
    
    if (user) {
      formGroup.patchValue({
        fullname: user.fullname || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        email: user.email || ''
      });
    }
  }

  /**
   * Lấy danh sách người dùng với phân trang và tìm kiếm
   */
  getAllUsers(keyword: string = '', page: number = 1, limit: number = 10): Observable<UserListResponse> {
    const token = localStorage.getItem('token');
    
    // Tạo params
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    // Thêm keyword nếu có
    if (keyword && keyword.trim() !== '') {
      params = params.set('keyword', keyword);
    }
    
    // Tạo headers với token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserListResponse>(this.apiUserList, { 
      headers: headers,
      params: params
    });
  }

  /**
   * Cập nhật trạng thái hoạt động của người dùng
   */
  updateUserStatus(userId: number, isActive: boolean): Observable<UserResponse> {
    const token = localStorage.getItem('token');
    
    // Tạo headers với token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<UserResponse>(`${this.apiUserStatus}/${userId}?active=${isActive}`, {}, {
      headers: headers
    });
  }
}
