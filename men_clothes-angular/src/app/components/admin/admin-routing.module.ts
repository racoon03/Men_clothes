import { AdminComponent } from "./admin.component";
import { OrderAdminComponent } from "./order/order.admin.component";
import { DetailOrderAdminComponent } from "./detail-order/detail.order.admin.component";
import { Route, Router,Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ProductAdminComponent } from "./product/product.admin.component";
import { CategoryAdminComponent } from "./category/category.admin.component";
import { DetailProductAdminComponent } from "./detail-product/detail.product.admin.component";
import { AddProductAdminComponent } from "./add-product/add.product.admin.component";
import { DashboardAdminComponent } from "./dashboard/dashboard.admin.component";
import { UserAdminComponent } from "./user/user.admin.component";
import { CouponAdminComponent } from "./coupon/coupon.admin.component";
const routes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        children: [
            {
                path: 'dashboard',
                component: DashboardAdminComponent
            },
            {
                path: 'orders',
                component: OrderAdminComponent
            },
            {
                path: 'orders/:id',
                component: DetailOrderAdminComponent
            },
            {
                path: 'products',
                component: ProductAdminComponent
            },
            {
                path: 'products/:id',
                component: DetailProductAdminComponent
            },
            {
                path: 'categories',
                component: CategoryAdminComponent
            },
            {
                path: 'add-product',
                component: AddProductAdminComponent
            },
            {
                path: 'users',
                component: UserAdminComponent
            },
            {
                path: 'coupons',
                component: CouponAdminComponent
            },
        ]
    }
];
@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
