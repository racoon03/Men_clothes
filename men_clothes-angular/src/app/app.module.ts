import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DetailProductComponent } from './components/detail-product/detail-product.component';
import { OrderComponent } from './components/order/order.component';
import { OrderDetailComponent } from './components/order-detail/order.detail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { 
  HttpClientModule, 
  HTTP_INTERCEPTORS 
} from '@angular/common/http';
import {TokenInterceptor} from './interceptors/token.interceptor';
import { AppComponent } from './app/app.component'
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileComponent } from './components/user-profile/user.profile.component';
import { AdminModule } from './components/admin/admin.module';
import { HomePageComponent } from './components/homepage/homepage.component';
import { OrderUserComponent } from './components/order/order-user/order.user.component';
import { OrderStatusTimelineComponent } from './shared/order_timeline/order.status.timeline';
// import { AdminComponent } from './components/admin/admin.component';
// import { OrderAdminComponent } from './components/admin/order/order.admin.component';
// import { ProductAdminComponent } from './components/admin/product/product.admin.component';
// import { CategoryAdminComponent } from './components/admin/category/category.admin.component';


@NgModule({
  declarations: [    
    HomeComponent, 
    HomePageComponent,
    HeaderComponent,
    FooterComponent, 
    DetailProductComponent,
    OrderComponent,
    OrderUserComponent,
    OrderDetailComponent,
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    OrderStatusTimelineComponent,
    AppComponent,
    //admin    
    // AdminComponent,
    // OrderAdminComponent,
    // ProductAdminComponent,
    // CategoryAdminComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    AdminModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [
    //HomeComponent,
    //DetailProductComponent,
    //OrderComponent,
    // OrderDetailComponent,
    //LoginComponent,
    //RegisterComponent
    AppComponent
  ]
})
export class AppModule { }
