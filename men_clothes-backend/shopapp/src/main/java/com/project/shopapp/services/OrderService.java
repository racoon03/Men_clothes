package com.project.shopapp.services;

import com.project.shopapp.dtos.CartItemDTO;
import com.project.shopapp.dtos.OrderDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.models.*;
import com.project.shopapp.repositories.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor

public class OrderService implements IOrderService{
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ModelMapper modelMapper;
    private final ProductVariantService productVariantService;
    @PersistenceContext
    private EntityManager entityManager;
    @Override
    @Transactional
    public Order createOrder(OrderDTO orderDTO) throws Exception {
        //tìm xem user'id có tồn tại ko
        User user = userRepository
                .findById(orderDTO.getUserId())
                .orElseThrow(() -> new DataNotFoundException("Cannot find user with id: "+orderDTO.getUserId()));
        //convert orderDTO => Order
        //dùng thư viện Model Mapper
        // Tạo một luồng bảng ánh xạ riêng để kiểm soát việc ánh xạ
        modelMapper.typeMap(OrderDTO.class, Order.class)
                .addMappings(mapper -> mapper.skip(Order::setId));
        // Cập nhật các trường của đơn hàng từ orderDTO
        Order order = new Order();
        modelMapper.map(orderDTO, order);
        order.setUser(user);
        order.setOrderDate(LocalDate.now());//lấy thời điểm hiện tại
        order.setStatus(OrderStatus.PENDING);
        //Kiểm tra shipping date phải >= ngày hôm nay
        LocalDate shippingDate = orderDTO.getShippingDate() == null
                ? LocalDate.now() : orderDTO.getShippingDate();
        if (shippingDate.isBefore(LocalDate.now())) {
            throw new DataNotFoundException("Date must be at least today !");
        }
        order.setShippingDate(shippingDate);
        order.setActive(true);
        orderRepository.save(order);
        // Tạo danh sách các đối tượng OrderDetail từ cartItems
        List<OrderDetail> orderDetails = new ArrayList<>();
        for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
            // Tạo một đối tượng OrderDetail từ CartItemDTO
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);

            // Lấy thông tin sản phẩm từ cartItemDTO
            Long productId = cartItemDTO.getProductId();
            Long colorId = cartItemDTO.getColorId();
            Long sizeId = cartItemDTO.getSizeId();
            int quantity = cartItemDTO.getQuantity();

            // Tìm thông tin sản phẩm từ cơ sở dữ liệu (hoặc sử dụng cache nếu cần)
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new DataNotFoundException("Product not found with id: " + productId));

            ProductVariant productVariant = productVariantService.getoneById(productId, colorId, sizeId);
            if (productVariant != null  && productVariant.getQuantity() >= quantity){
                Long newQuantity = productVariant.getQuantity() - quantity;

                // Tạo DTO để cập nhật
                ProductVariantsDTO updateDTO = new ProductVariantsDTO();
                updateDTO.setProductId(productId);
                updateDTO.setColorId(colorId);
                updateDTO.setSizeId(sizeId);
                updateDTO.setQuantity(newQuantity);
                // Gọi phương thức update để cập nhật số lượng
                try {
                    productVariantService.updateProductVariant(productId,
                            updateDTO);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to update product quantity", e);
                }
            } else {
                // Xử lý trường hợp không đủ số lượng
                throw new Exception("Insufficient product quantity available");
            }

            // Đặt thông tin cho OrderDetail
            orderDetail.setProduct(product);
            orderDetail.setNumberOfProducts(quantity);
            // Các trường khác của OrderDetail nếu cần
            orderDetail.setPrice(product.getPrice());
            orderDetail.setTotalMoney(orderDTO.getTotalMoney());

            // Thêm OrderDetail vào danh sách
            orderDetails.add(orderDetail);
        }


        // Lưu danh sách OrderDetail vào cơ sở dữ liệu
        orderDetailRepository.saveAll(orderDetails);
        return order;
    }

    @Override
    public Order getOrder(Long id) {
        Order selectedOrder = orderRepository.findById(id).orElse(null);
        return selectedOrder;
    }

    @Override
    @Transactional
    public Order updateOrder(Long id, OrderDTO orderDTO) throws DataNotFoundException {
        Order order = orderRepository.findById(id).orElseThrow(() ->
                new DataNotFoundException("Cannot find order with id: " + id));
        User existingUser = userRepository.findById(
                orderDTO.getUserId()).orElseThrow(() ->
                new DataNotFoundException("Cannot find user with id: " + id));
        // Tạo một luồng bảng ánh xạ riêng để kiểm soát việc ánh xạ
        modelMapper.typeMap(OrderDTO.class, Order.class)
                .addMappings(mapper -> mapper.skip(Order::setId));
        // Cập nhật các trường của đơn hàng từ orderDTO
        modelMapper.map(orderDTO, order);
        order.setUser(existingUser);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);Order order = orderRepository.findById(id).orElse(null);
        //soft-delete
        if(order != null) {
            order.setActive(false);
            orderRepository.save(order);
        }
    }

    @Override
    public List<Order> findByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    @Override
    public Page<Order> getOrdersByKeyword(String keyword, Pageable pageable) {
        return orderRepository.findByKeyword(keyword, pageable);
    }

    // phan trang theo user sap xep theo ngay
    @Override
    public Page<Order> findByUserIdWithPagination(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId, pageable);
    }

    // cancel don hang
    @Override
    @Transactional
    public void updateOrderStatus(Long id, String status) throws DataNotFoundException {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Cannot find order with id: " + id));

        // Validation nếu cần
        if (!OrderStatus.PENDING.equals(order.getStatus()) && OrderStatus.CANCELLED.equals(status)) {
            throw new DataNotFoundException("Can only cancel orders in PENDING status");
        }

        order.setStatus(status);
        orderRepository.save(order);
    }

    // loc du lieu
    @Override
    public Page<Order> getOrdersWithFilters(String keyword, String status, String paymentMethod,
                                            Integer month, Integer year, Float minPrice, Float maxPrice,
                                            Pageable pageable) {

        // Chuỗi query động để tạo các điều kiện lọc
        StringBuilder queryBuilder = new StringBuilder("SELECT o FROM Order o WHERE o.active = true");
        Map<String, Object> parameters = new HashMap<>();

        // Lọc theo keyword
        if (keyword != null && !keyword.trim().isEmpty()) {
            queryBuilder.append(" AND (o.fullName LIKE :keyword OR o.email LIKE :keyword OR o.phoneNumber LIKE :keyword OR o.address LIKE :keyword)");
            parameters.put("keyword", "%" + keyword + "%");
        }

        // Lọc theo trạng thái đơn hàng
        if (status != null && !status.trim().isEmpty()) {
            queryBuilder.append(" AND o.status = :status");
            parameters.put("status", status);
        }

        // Lọc theo phương thức thanh toán
        if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
            queryBuilder.append(" AND o.paymentMethod = :paymentMethod");
            parameters.put("paymentMethod", paymentMethod);
        }

        // Lọc theo tháng
        if (month != null && month > 0 && month <= 12) {
            queryBuilder.append(" AND MONTH(o.orderDate) = :month");
            parameters.put("month", month);
        }

        // Lọc theo năm
        if (year != null && year > 0) {
            queryBuilder.append(" AND YEAR(o.orderDate) = :year");
            parameters.put("year", year);
        }

        // Lọc theo giá tối thiểu
        if (minPrice != null && minPrice > 0) {
            queryBuilder.append(" AND o.totalMoney >= :minPrice");
            parameters.put("minPrice", minPrice);
        }

        // Lọc theo giá tối đa
        if (maxPrice != null && maxPrice > 0) {
            queryBuilder.append(" AND o.totalMoney <= :maxPrice");
            parameters.put("maxPrice", maxPrice);
        }

        // Tạo truy vấn
        TypedQuery<Order> query = entityManager.createQuery(queryBuilder.toString(), Order.class);

        // Thiết lập tham số
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }

        // Đếm tổng số kết quả
        TypedQuery<Long> countQuery = entityManager.createQuery(
                queryBuilder.toString().replace("SELECT o", "SELECT COUNT(o)"), Long.class);

        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            countQuery.setParameter(entry.getKey(), entry.getValue());
        }

        Long total = countQuery.getSingleResult();

        // Thiết lập phân trang
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        // Trả về trang kết quả
        List<Order> orders = query.getResultList();
        return new PageImpl<>(orders, pageable, total);
    }

    /**
     * Đếm số lượng sản phẩm đã bán (đơn hàng thành công)
     */
    public int countSoldProductsByProductId(Long productId) {
        List<Order> orders = orderRepository.findByStatusNotAndActive("cancelled", true);
        int count = 0;

        for (Order order : orders) {
            for (OrderDetail detail : order.getOrderDetails()) {
                if (detail.getProduct().getId().equals(productId)) {
                    count += detail.getNumberOfProducts();
                }
            }
        }

        return count;
    }

    /**
     * Đếm số lượng sản phẩm đã hủy
     */
    public int countCancelledProductsByProductId(Long productId) {
        List<Order> orders = orderRepository.findByStatusAndActive("cancelled", true);
        int count = 0;

        for (Order order : orders) {
            for (OrderDetail detail : order.getOrderDetails()) {
                if (detail.getProduct().getId().equals(productId)) {
                    count += detail.getNumberOfProducts();
                }
            }
        }

        return count;
    }

}
