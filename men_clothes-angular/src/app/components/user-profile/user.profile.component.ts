import { Component, ViewChild, OnInit } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators,
  ValidationErrors, 
  ValidatorFn, 
  AbstractControl
} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { UserResponse } from '../responses/user/user.response';
import { UpdateUserDTO } from '../../dtos/user/update.user.dto';
@Component({
  selector: 'user-profile',
  templateUrl: './user.profile.component.html',
  styleUrls: ['./user.profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userResponse?: UserResponse;
  userProfileForm: FormGroup;
  token: string = '';
  test: string = 'test';
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private tokenService: TokenService,
  ){        
    this.userProfileForm = this.formBuilder.group({
      fullname: ['',[Validators.required]],     
      address: ['', [Validators.minLength(3)]],       
      password: [''], 
      retype_password: [''], 
      date_of_birth: [Date.now(),[Validators.required]],      
    }, {
      validators: this.passwordMatchValidator// Custom validator function for password match
    });
  }
  
  ngOnInit(): void {  
    debugger
    this.userProfileForm.patchValue({
      date_of_birth: this.formatDateForInput(this.userResponse?.date_of_birth)
    });

    this.token = this.tokenService.getToken();
    this.userService.getUserDetail(this.token).subscribe({
      next: (response: any) => {
        const dateOfBirth = new Date(response.date_of_birth);
        
        this.userResponse = {
          ...response,
          date_of_birth: dateOfBirth,
        };    
        this.userProfileForm.patchValue({
          fullname: this.userResponse?.fullname ?? '',
          address: this.userResponse?.address ?? '',
          date_of_birth: this.formatDateForInput(dateOfBirth),
        });        
        this.userService.saveUserResponseToLocalStorage(this.userResponse);  
        console.log('userResponse', this.userResponse);
      },
      complete: () => {
        debugger;
      },
      error: (error: any) => {
        debugger;
        alert(error.error.message);
      }
    })
  }
  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const retypedPassword = formGroup.get('retype_password')?.value;
      if (password !== retypedPassword) {
        return { passwordMismatch: true };
      }
  
      return null;
    };
  }

  private formatTimestampToDateString(timestamp: number): string {
    const date = new Date(timestamp);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  private showErrorAlert(fieldName: string, errorType: string): void {
    const errorMessages: any = {
      fullname: {
        required: 'Vui lòng nhập họ và tên'
      },
      address: {
        minlength: 'Địa chỉ phải có ít nhất 3 ký tự'
      },
      date_of_birth: {
        required: 'Vui lòng chọn ngày sinh'
      },
      password: {
        minlength: 'Mật khẩu phải có ít nhất 3 ký tự'
      },
      retype_password: {
        passwordMismatch: 'Mật khẩu nhập lại không khớp'
      }
    };

    if (errorMessages[fieldName] && errorMessages[fieldName][errorType]) {
      alert(errorMessages[fieldName][errorType]);
    } else {
      alert(`Lỗi không xác định ở trường ${fieldName}`);
    }
  }

  private validatePassword(): boolean {
  const password = this.userProfileForm.get('password')?.value;
  const retypePassword = this.userProfileForm.get('retype_password')?.value;
  
  if (password || retypePassword) {
    // Kiểm tra độ dài
    if (password.length < 3) {
      alert('Mật khẩu phải có ít nhất 3 ký tự');
      return false;
    }
    // Kiểm tra khớp
    if (password !== retypePassword) {
      alert('Mật khẩu nhập lại không khớp');
      return false;
    }
  }
  return true;
  }

  private validateForm(): boolean {
    let isValid = true;

    // Kiểm tra các trường thông tin cơ bản
    const fieldsToCheck = ['fullname', 'address', 'date_of_birth'];
    fieldsToCheck.forEach(field => {
      const control = this.userProfileForm.get(field);
      if (control?.invalid) {
        const errorKey = Object.keys(control.errors!)[0];
        this.showErrorAlert(field, errorKey);
        isValid = false;
      }
    });

    // Kiểm tra mật khẩu nếu có nhập
    if (!this.validatePassword()) {
      isValid = false;
    }

    return isValid;
  }

  private formatDateForInput(date: Date | undefined): string | null {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
    
  save(): void {
    debugger

    // Validate toàn bộ form trước
    if (!this.validateForm()) {
      return;
    }

    const rawDate = this.userProfileForm.get('date_of_birth')?.value;
    console.log('rawDate', rawDate);
    const dateOfBirth = new Date(rawDate + 'T00:00:00');
    dateOfBirth.setDate(dateOfBirth.getDate() + 1);

    // if (this.userProfileForm.valid) {
      const updateUserDTO: UpdateUserDTO = {
        fullname: this.userProfileForm.get('fullname')?.value,
        address: this.userProfileForm.get('address')?.value,
        password: this.userProfileForm.get('password')?.value || undefined,
        retype_password: this.userProfileForm.get('retype_password')?.value || undefined,
        date_of_birth: dateOfBirth 
      };
  
      this.userService.updateUserDetail(this.token, updateUserDTO)
        .subscribe({
          next: (response: any) => {
            this.userService.removeUserFromLocalStorage();
            this.tokenService.removeToken();
            this.router.navigate(['/login']);
          },
          error: (error: any) => {
            alert(error.error.message);
          }
        });
    } 
  //   else {
  //     if (this.userProfileForm.hasError('passwordMismatch')) {        
  //       alert('Mật khẩu và mật khẩu gõ lại chưa chính xác')
  //     }
  //   }
  // }    
}

