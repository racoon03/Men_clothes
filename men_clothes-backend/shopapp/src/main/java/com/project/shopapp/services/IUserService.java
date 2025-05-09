package com.project.shopapp.services;

import com.project.shopapp.dtos.UpdateUserDTO;
import com.project.shopapp.dtos.UserDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.exceptions.PermissionDenyException;
import com.project.shopapp.models.User;
import com.project.shopapp.responses.UserResponse;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface IUserService {
    User createUser(UserDTO userDTO) throws DataNotFoundException, PermissionDenyException;
    String login(String phoneNumber, String password, Long roleId) throws Exception;

    User updateUser(Long userId, UpdateUserDTO updatedUserDTO) throws Exception;

    User getUserDetailsFromToken(String token) throws Exception;

    Page<UserResponse> getAllUsers(String keyword, PageRequest pageRequest);

    User updateUserActiveStatus(Long userId, boolean active) throws DataNotFoundException;
}
