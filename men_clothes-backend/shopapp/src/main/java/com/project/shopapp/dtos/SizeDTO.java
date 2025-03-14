package com.project.shopapp.dtos;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SizeDTO {
    @NotEmpty(message = "Size's name cannot be empty")
    private String name;
}
