package com.project.shopapp.repositories;


import com.project.shopapp.models.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    //Tìm các đơn hàng của 1 user nào đó
    List<Order> findByUserId(Long userId);
    @Query("SELECT o FROM Order o WHERE o.active = true AND (:keyword IS NULL OR :keyword = '' OR " +
            "o.fullName LIKE %:keyword% " +
            "OR o.address LIKE %:keyword% " +
            "OR o.note LIKE %:keyword% " +
            "OR o.email LIKE %:keyword%)")
    Page<Order> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Tự động sắp xếp giảm dần theo orderDate
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // tim theo user co phan trang theo ngay moi nhat
    Page<Order> findByUserIdOrderByOrderDateDesc(Long userId, Pageable pageable);
    List<Order> findByStatusNotAndActive(String status, boolean active);
    List<Order> findByStatusAndActive(String status, boolean active);
}
