import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../responses/user/user.response';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { TokenService } from 'src/app/services/token.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userResponse?:UserResponse | null;
  isPopoverOpen = false;
  activeNavItem: number = 0;
  userId?: number = 0;

  constructor(
    private userService: UserService, 
    private popoverConfig: NgbPopoverConfig,  
    private tokenService: TokenService,
    private router: Router,
  ) {
    
   }
  ngOnInit() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();    
    this.userId = this.userResponse?.id;
  } 

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }

  handleItemClick(index: number): void {
    if(index === 0) {
      debugger
      this.router.navigate(['/user-profile']);                      
    }
    else if (index === 1) {
      debugger
       this.router.navigate(['/orders/user', this.userId]);
    }
    else if (index === 2) {
      this.userService.removeUserFromLocalStorage();
      this.tokenService.removeToken();
      this.userResponse = this.userService.getUserResponseFromLocalStorage();    
    }
    this.isPopoverOpen = false;   
  }

  

  setActiveNavItem(index: number) {    
    this.activeNavItem = index;
  }
}
