package com.project.shopapp.services;

import com.project.shopapp.dtos.SizeDTO;
import com.project.shopapp.models.Size;
import com.project.shopapp.repositories.SizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class SizeService implements ISizeService {
    private final SizeRepository sizeRepository;
    @Override
    public Size createSize(SizeDTO sizeDTO) {
        Size newSize = Size.builder()
                .name(sizeDTO.getName()).build();
        return sizeRepository.save(newSize);
    }

    @Override
    public Size getSizeById(long id) {
        return sizeRepository.findById(id).orElseThrow(()-> new RuntimeException("Size not found"));
    }

    @Override
    public List<Size> getAllSizes() {
        return sizeRepository.findAll();
    }

    @Override
    public Size updateSize(long sizeId, SizeDTO sizeDTO) {
        Size existingSize = getSizeById(sizeId);
        existingSize.setName(sizeDTO.getName());
        sizeRepository.save(existingSize);
        return existingSize;
    }

    @Override
    public void deleteSize(long id) {
        sizeRepository.deleteById(id);
    }
}
