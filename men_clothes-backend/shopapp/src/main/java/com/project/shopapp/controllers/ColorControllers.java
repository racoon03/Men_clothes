package com.project.shopapp.controllers;

import com.project.shopapp.dtos.CategoryDTO;
import com.project.shopapp.dtos.ColorDTO;
import com.project.shopapp.models.Category;
import com.project.shopapp.models.Color;
import com.project.shopapp.services.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/colors")
@RequiredArgsConstructor
public class ColorControllers {
    private final ColorService colorService;
    @PostMapping("")
    //Nếu tham số truyền vào là 1 object thì sao ? => Data Transfer Object = Request Object
    public ResponseEntity<?> createColor(
            @Valid @RequestBody ColorDTO colorDTO,
            BindingResult result) {
        if(result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ResponseEntity.badRequest().body(errorMessages);
        }
        colorService.createColor(colorDTO);
        return ResponseEntity.ok("Insert color successfully");
    }
    @GetMapping("")
    public ResponseEntity<List<Color>> getAllColors() {
        List<Color> colors = colorService.getAllColors();
        return ResponseEntity.ok(colors);
    }
    @PutMapping("/{id}")
    public ResponseEntity<String> updateColor(
            @PathVariable Long id,
            @Valid @RequestBody ColorDTO colorDTO
    ) {
        colorService.updateColor(id, colorDTO);
        return ResponseEntity.ok("Update color successfully");
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteColor(@PathVariable Long id) {
        colorService.deleteColor(id);
        return ResponseEntity.ok("Delete color with id: "+id+" successfully");
    }
}
