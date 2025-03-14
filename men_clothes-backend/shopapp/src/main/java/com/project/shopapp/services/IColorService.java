package com.project.shopapp.services;

import com.project.shopapp.dtos.CategoryDTO;
import com.project.shopapp.dtos.ColorDTO;
import com.project.shopapp.models.Category;
import com.project.shopapp.models.Color;

import java.util.List;

public interface IColorService {
    Color createColor(ColorDTO category);
    Color getColorById(long id);
    List<Color> getAllColors();
    Color updateColor(long colorId, ColorDTO color);
    void deleteColor(long id);
}
