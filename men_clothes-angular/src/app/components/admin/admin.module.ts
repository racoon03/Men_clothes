import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { OrderAdminComponent } from './order/order.admin.component';
import { DetailOrderAdminComponent } from './detail-order/detail.order.admin.component';
import { ProductAdminComponent } from './product/product.admin.component';
import { CategoryAdminComponent } from './category/category.admin.component';
import { CommonModule } from '@angular/common';
import { DetailProductAdminComponent } from './detail-product/detail.product.admin.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { AddProductAdminComponent } from './add-product/add.product.admin.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DashboardAdminComponent } from './dashboard/dashboard.admin.component';
import { UserAdminComponent } from './user/user.admin.component';
import { CouponAdminComponent } from './coupon/coupon.admin.component';

@NgModule({
  declarations: [
    AdminComponent,
    OrderAdminComponent,
    DetailOrderAdminComponent,
    ProductAdminComponent,
    CategoryAdminComponent,
    DetailProductAdminComponent,
    DashboardAdminComponent,
    AddProductAdminComponent,
    CouponAdminComponent,
    UserAdminComponent,
  ],
  imports: [
    AdminRoutingModule, // import routes,
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    NgSelectModule,
  ]
})
export class AdminModule {}