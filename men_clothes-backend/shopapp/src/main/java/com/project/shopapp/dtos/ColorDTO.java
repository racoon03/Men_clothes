package com.project.shopapp.dtos;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ColorDTO {
    @NotEmpty(message = "Color's name cannot be empty")
    private String name;
}
