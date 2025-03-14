package com.project.shopapp.repositories;

import com.project.shopapp.models.OrderDetail;
import com.project.shopapp.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM ProductVariant v " +
            "WHERE v.product.id = ?1 AND v.color.id = ?2 AND v.size.id = ?3")
    boolean existsByProductIdAndColorIdAndSizeId(Long productId, Long colorId, Long sizeId);

}
