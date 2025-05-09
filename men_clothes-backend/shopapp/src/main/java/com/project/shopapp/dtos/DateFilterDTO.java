package com.project.shopapp.dtos;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DateFilterDTO {
    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    /**
     * Thiết lập giá trị mặc định nếu không được cung cấp
     */
    public void setDefaultValues() {
        if (startDate == null) {
            // Mặc định là 30 ngày trước
            startDate = LocalDate.now().minusDays(30);
        }

        if (endDate == null) {
            // Mặc định là ngày hiện tại
            endDate = LocalDate.now();
        }
    }

    /**
     * Kiểm tra xem khoảng thời gian có hợp lệ không
     * @return true nếu hợp lệ, false nếu không
     */
    public boolean isValid() {
        if (startDate == null || endDate == null) {
            return false;
        }

        // Ngày kết thúc phải sau hoặc bằng ngày bắt đầu
        return !endDate.isBefore(startDate);
    }
}
