import { NgModule, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../app/components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { 
  DetailProductComponent 
} from './components/detail-product/detail-product.component';
import { OrderComponent } from './components/order/order.component';
import { 
  OrderDetailComponent 
} from './components/order-detail/order.detail.component';
import { AuthGuardFn } from './guards/auth.guard';
import { UserProfileComponent } from './components/user-profile/user.profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuardFn } from './guards/admin.guard';
import { PaymentCallbackComponent } from './components/payment-callback/payment-callback.component';
import { HomePageComponent } from './components/homepage/homepage.component';
import { OrderUserComponent } from './components/order/order-user/order.user.component';

const routes: Routes = [
  { path: 'home/:id', component: HomeComponent },
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products/:id', component: DetailProductComponent },
  { path: 'orders', component: OrderComponent, canActivate: [AuthGuardFn] },
  { path: 'user-profile', component: UserProfileComponent, canActivate:[AuthGuardFn] },
  { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'orders/user/:id', component:  OrderUserComponent},

  //Admin 
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate:[AdminGuardFn] 
  },
  // Thêm route mới cho VnPay Return
  { path: 'payments/payment-callback', component: PaymentCallbackComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
