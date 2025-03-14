package com.project.shopapp.services;

import com.project.shopapp.dtos.ColorDTO;
import com.project.shopapp.dtos.SizeDTO;
import com.project.shopapp.models.Color;
import com.project.shopapp.models.Size;

import java.util.List;

public interface ISizeService {
    Size createSize(SizeDTO sizeDTO);
    Size getSizeById(long id);
    List<Size> getAllSizes();
    Size updateSize(long sizeId, SizeDTO size);
    void deleteSize(long id);
}
