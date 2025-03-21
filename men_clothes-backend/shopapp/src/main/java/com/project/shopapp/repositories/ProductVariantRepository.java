package com.project.shopapp.repositories;

import com.project.shopapp.models.Color;
import com.project.shopapp.models.OrderDetail;
import com.project.shopapp.models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM ProductVariant v " +
            "WHERE v.product.id = ?1 AND v.color.id = ?2 AND v.size.id = ?3")
    boolean existsByProductIdAndColorIdAndSizeId(Long productId, Long colorId, Long sizeId);

    // lay mau theo product_id
    @Query("SELECT DISTINCT pv.color.id FROM ProductVariant pv WHERE pv.product.id = :productId")
    List<Long> findColorsByProductId(@Param("productId") Long productId);

    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id = :productId")
    List<ProductVariant> findProductVariantById(@Param("productId") Long productId);

    Optional<ProductVariant> findByProductIdAndColorIdAndSizeId(Long productId, Long colorId, Long sizeId);
}
