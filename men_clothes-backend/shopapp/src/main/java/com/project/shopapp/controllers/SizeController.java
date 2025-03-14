package com.project.shopapp.controllers;

import com.project.shopapp.dtos.CategoryDTO;
import com.project.shopapp.dtos.SizeDTO;
import com.project.shopapp.models.Category;
import com.project.shopapp.models.Size;
import com.project.shopapp.services.CategoryService;
import com.project.shopapp.services.SizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/sizes")
@RequiredArgsConstructor

public class SizeController {
    private final SizeService sizeService;
    @PostMapping("")
    //Nếu tham số truyền vào là 1 object thì sao ? => Data Transfer Object = Request Object
    public ResponseEntity<?> createSize(
            @Valid @RequestBody SizeDTO sizeDTO,
            BindingResult result) {
        if(result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errorMessages);
        }
        sizeService.createSize(sizeDTO);
        return ResponseEntity.ok("Insert size successfully");
    }

    //Hiện tất cả các categories
    @GetMapping("")
    public ResponseEntity<List<Size>> getAllCategories() {
        List<Size> sizes = sizeService.getAllSizes();
        return ResponseEntity.ok(sizes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody SizeDTO sizeDTO
    ) {
        sizeService.updateSize(id, sizeDTO);
        return ResponseEntity.ok("Update size successfully");
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        sizeService.deleteSize(id);
        return ResponseEntity.ok("Delete size with id: "+id+" successfully");
    }
}
