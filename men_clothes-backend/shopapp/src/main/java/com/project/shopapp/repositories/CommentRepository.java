package com.project.shopapp.repositories;

import com.project.shopapp.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUserIdAndProductId(@Param("userId") Long userId,
                                           @Param("productId") Long productId);
    List<Comment> findByProductId(@Param("productId") Long productId);

    List<Comment> findByUserId(@Param("productId") Long userId);

    List<Comment> findTop5ByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId);

    List<Comment> findTop5ByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
}
