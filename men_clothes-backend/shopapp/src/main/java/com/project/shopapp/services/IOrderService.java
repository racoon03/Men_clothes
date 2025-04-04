package com.project.shopapp.services;

import com.project.shopapp.dtos.OrderDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.models.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IOrderService {
    Order createOrder(OrderDTO orderDTO) throws Exception;
    Order getOrder(Long id);
    Order updateOrder(Long id, OrderDTO orderDTO) throws DataNotFoundException;
    void deleteOrder(Long id);
    List<Order> findByUserId(Long userId);

    Page<Order> getOrdersByKeyword(String keyword, Pageable pageable);
    Page<Order> findByUserIdWithPagination(Long userId, Pageable pageable);

    // cancel don hang
    void updateOrderStatus(Long id, String status) throws DataNotFoundException;

    Page<Order> getOrdersWithFilters(String keyword, String status, String paymentMethod,
                                     Integer month, Integer year, Float minPrice, Float maxPrice,
                                     Pageable pageable);

    int countSoldProductsByProductId(Long productId);
    int countCancelledProductsByProductId(Long productId);
}
