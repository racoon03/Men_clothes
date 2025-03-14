package com.project.shopapp.services;

import com.project.shopapp.dtos.ColorDTO;
import com.project.shopapp.models.Color;
import com.project.shopapp.repositories.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorService implements IColorService {
    private final ColorRepository colorRepository;
    @Override
    public Color createColor(ColorDTO colorDTO) {
        Color newColor = Color.builder()
                .name(colorDTO.getName()).build();
        return colorRepository.save(newColor);
    }

    @Override
    public Color getColorById(long id) {
        return colorRepository.findById(id).
                orElseThrow(() -> new RuntimeException("Color not found"));
    }

    @Override
    public List<Color> getAllColors() {
        return colorRepository.findAll();
    }

    @Override
    public Color updateColor(long colorId, ColorDTO colorDTO) {
        Color existingColor = getColorById(colorId);
        existingColor.setName(colorDTO.getName());
        colorRepository.save(existingColor);
        return existingColor;
    }

    @Override
    public void deleteColor(long id) {
        colorRepository.deleteById(id);
    }
}
