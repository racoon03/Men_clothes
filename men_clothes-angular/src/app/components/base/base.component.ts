import { Inject, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { RoleService } from '../../services/role.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Location } from '@angular/common';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PaymentService } from '../../services/payment.service';

export class BaseComponent {
    router: Router = inject(Router);
    categoryService: CategoryService = inject(CategoryService);
    productService: ProductService = inject(ProductService);
    tokenService: TokenService = inject(TokenService);
    activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    userService: UserService = inject(UserService);
    roleService: RoleService = inject(RoleService);
    cartService: CartService = inject(CartService);
    orderService = inject(OrderService);
    paymentService = inject(PaymentService);
    
    document: Document = inject(DOCUMENT);
    location: Location = inject(Location);


        
    generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
        const maxVisiblePages = 5;
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(currentPage - halfVisiblePages, 1);
        let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(endPage - maxVisiblePages + 1, 1);
        }
        return new Array(endPage - startPage + 1).fill(0)
            .map((_, index) => startPage + index);
    }
}


