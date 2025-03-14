package com.project.shopapp.repositories;

import com.project.shopapp.models.Color;
import com.project.shopapp.models.Size;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SizeRepository extends JpaRepository<Size, Long> {
}
