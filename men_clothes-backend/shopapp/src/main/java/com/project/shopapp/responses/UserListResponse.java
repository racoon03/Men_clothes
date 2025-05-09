package com.project.shopapp.responses;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserListResponse {
    @JsonProperty("users")
    private List<UserResponse> users;

    @JsonProperty("total_pages")
    private int totalPages;
}
