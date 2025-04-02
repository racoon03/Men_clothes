package com.project.shopapp.services;

import com.project.shopapp.dtos.CartItemDTO;
import com.project.shopapp.dtos.OrderDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.models.*;
import com.project.shopapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@Service
@RequiredArgsConstructor

public class OrderService implements IOrderService{
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ModelMapper modelMapper;
    private final ProductVariantService productVariantService;
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

}
