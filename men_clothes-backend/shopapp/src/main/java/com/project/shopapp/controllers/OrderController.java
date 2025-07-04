package com.project.shopapp.controllers;

import com.project.shopapp.components.LocalizationUtils;
import com.project.shopapp.dtos.*;
import com.project.shopapp.models.Order;
import com.project.shopapp.responses.OrderListResponse;
import com.project.shopapp.responses.OrderResponse;
import com.project.shopapp.responses.ResponseObject;
import com.project.shopapp.services.IOrderService;
import com.project.shopapp.utils.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/orders")
@RequiredArgsConstructor

public class OrderController {
    private final IOrderService orderService;
    private final LocalizationUtils localizationUtils;
    @PostMapping("")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody OrderDTO orderDTO,
            BindingResult result
    ) {
        try {
            if(result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            Order orderResponse = orderService.createOrder(orderDTO);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/user/{user_id}") // Thêm biến đường dẫn "user_id"
    //GET http://localhost:8088/api/v1/orders/4
    //tim order theo user
    public ResponseEntity<?> getOrders(@Valid @PathVariable("user_id") Long userId) {
        try {
            List<Order> orders = orderService.findByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Thêm endpoint mới hỗ trợ phân trang
    @GetMapping("/user/{user_id}/paged")
    public ResponseEntity<?> getPagedOrders(
            @Valid @PathVariable("user_id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
            Page<Order> orderPage = orderService.findByUserIdWithPagination(userId, pageRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orders", orderPage.getContent());
            response.put("currentPage", orderPage.getNumber());
            response.put("totalItems", orderPage.getTotalElements());
            response.put("totalPages", orderPage.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    // chi tiet mot don hang theo id
    public ResponseEntity<?> getOrder(@Valid @PathVariable("id") Long orderId) {
        try {
            Order existingOrder = orderService.getOrder(orderId);
            OrderResponse orderResponse = OrderResponse.fromOrder(existingOrder);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    //PUT http://localhost:8088/api/v1/orders/2
    //công việc của admin
    public ResponseEntity<?> updateOrder(
            @Valid @PathVariable long id,
            @Valid @RequestBody OrderDTO orderDTO) {

        try {
            Order order = orderService.updateOrder(id, orderDTO);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@Valid @PathVariable Long id) {
        //xóa mềm => cập nhật trường active = false
        orderService.deleteOrder(id);
        return ResponseEntity.ok(localizationUtils.getLocalizedMessage(MessageKeys.DELETE_ORDER_SUCCESSFULLY));
    }

    @GetMapping("/get-orders-by-keyword")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<OrderListResponse> getOrdersByKeyword(
            @RequestParam(defaultValue = "", required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        // Tạo Pageable từ thông tin trang và giới hạn
        PageRequest pageRequest = PageRequest.of(
                page, limit-1,
                //Sort.by("createdAt").descending()
                Sort.by("id").descending()
        );
        Page<OrderResponse> orderPage = orderService
                .getOrdersByKeyword(keyword, pageRequest)
                .map(OrderResponse::fromOrder);
        // Lấy tổng số trang
        int totalPages = orderPage.getTotalPages();
        List<OrderResponse> orderResponses = orderPage.getContent();
        return ResponseEntity.ok(OrderListResponse
                .builder()
                .orders(orderResponses)
                .totalPages(totalPages)
                .build());
    }

    // cancel don hang
    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateOrderStatus(
            @Valid @PathVariable Long id,
            @Valid @RequestBody OrderStatusDTO statusDTO) {
        try {
            orderService.updateOrderStatus(id, statusDTO.getStatus());
            return ResponseEntity.ok().body(
                    new ResponseObject("Update order status successfully", HttpStatus.OK, null)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ResponseObject(e.getMessage(), HttpStatus.BAD_REQUEST, null)
            );
        }
    }

    @GetMapping("/find-orders-keyword")
    public ResponseEntity<OrderListResponse> findOrdersByKeyword(
            @RequestParam(defaultValue = "", required = false) String keyword,
            @RequestParam(defaultValue = "", required = false) String status,
            @RequestParam(defaultValue = "", required = false) String paymentMethod,
            @RequestParam(defaultValue = "", required = false) Integer month,
            @RequestParam(defaultValue = "", required = false) Integer year,
            @RequestParam(defaultValue = "0", required = false) Float minPrice,
            @RequestParam(defaultValue = "0", required = false) Float maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        // Tạo Pageable từ thông tin trang và giới hạn
        PageRequest pageRequest = PageRequest.of(
                page, limit,
                Sort.by("id").descending()
        );

        Page<OrderResponse> orderPage = orderService
                .getOrdersWithFilters(keyword, status, paymentMethod, month, year, minPrice, maxPrice, pageRequest)
                .map(OrderResponse::fromOrder);

        // Lấy tổng số trang
        int totalPages = orderPage.getTotalPages();
        List<OrderResponse> orderResponses = orderPage.getContent();

        return ResponseEntity.ok(OrderListResponse
                .builder()
                .orders(orderResponses)
                .totalPages(totalPages)
                .build());
    }

    @GetMapping("/stats/product/{productId}/sold")
    public ResponseEntity<Integer> getProductSoldCount(@PathVariable Long productId) {
        int count = orderService.countSoldProductsByProductId(productId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/product/{productId}/cancelled")
    public ResponseEntity<Integer> getProductCancelledCount(@PathVariable Long productId) {
        int count = orderService.countCancelledProductsByProductId(productId);
        return ResponseEntity.ok(count);
    }

    // restore dơn hang
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelOrder(@Valid @PathVariable Long id) {
        try {
            Order cancelledOrder = orderService.cancelOrder(id);
            return ResponseEntity.ok().body(
                    new ResponseObject("Order cancelled successfully", HttpStatus.OK, OrderResponse.fromOrder(cancelledOrder))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ResponseObject(e.getMessage(), HttpStatus.BAD_REQUEST, null)
            );
        }
    }
}
