// src/app/components/color/color-mapping.ts

/**
 * Bản đồ màu sắc dùng trong toàn bộ ứng dụng
 * Ánh xạ ID màu sang mã màu HEX
 */
export const COLOR_MAPPING: {[key: number]: string} = {
  1: '#011004',     // Đen
  2: '#089822',     // Xanh lá
  3: '#f8ea27',     // Vàng
  4: '#FFFFFF',     // Trắng
  5: '#888380',     // Xám
  6: '#713f0d',     // Nâu
  7: '#0c36f5',     // Xanh dương
  8: '#580808',     // Đỏ vang
  9: '#10046f',     // Xanh Navy
  10: '#D2B48C',    // Be
  11: '#850798'     // Tím
};

/**
 * Lấy mã màu từ ID màu
 * @param colorId ID của màu
 * @returns Mã màu HEX tương ứng, hoặc màu mặc định nếu không tìm thấy
 */
export function getColorCodeById(colorId: number): string {
  return COLOR_MAPPING[colorId] || '#cccccc'; // Default color if not found
}

/**
 * Kiểm tra xem màu có phải là màu sáng không
 * @param colorCode Mã màu HEX
 * @returns true nếu là màu sáng, false nếu là màu tối
 */
export function isLightColor(colorCode: string): boolean {
  // Chuyển từ HEX sang RGB
  const hex = colorCode.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Tính độ sáng (Luminance)
  // Formula: 0.299*R + 0.587*G + 0.114*B
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // Nếu độ sáng > 155, coi là màu sáng
  return brightness > 155;
}

/**
 * Chuyển đổi mã màu HEX sang RGBA
 * @param hexColor Mã màu HEX
 * @param alpha Độ trong suốt (0-1)
 * @returns Chuỗi màu RGBA
 */
export function hexToRgba(hexColor: string, alpha: number = 1): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Tạo màu tương phản từ mã màu HEX
 * @param hexColor Mã màu HEX
 * @returns Mã màu HEX tương phản (đen hoặc trắng)
 */
export function getContrastColor(hexColor: string): string {
  return isLightColor(hexColor) ? '#000000' : '#FFFFFF';
}

/**
 * Thêm màu mới vào COLOR_MAPPING
 * @param id ID màu mới
 * @param hexColor Mã màu HEX
 * @returns true nếu thêm thành công, false nếu ID đã tồn tại
 */
export function addColorToMapping(id: number, hexColor: string): boolean {
  // Kiểm tra xem ID đã tồn tại chưa
  if (COLOR_MAPPING[id] !== undefined) {
    console.warn(`Màu với ID ${id} đã tồn tại trong COLOR_MAPPING`);
    return false;
  }
  
  // Kiểm tra tính hợp lệ của mã màu HEX
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(hexColor)) {
    console.error(`Mã màu ${hexColor} không hợp lệ. Sử dụng định dạng: #RRGGBB hoặc #RGB`);
    return false;
  }
  
  // Thêm màu mới vào mapping
  COLOR_MAPPING[id] = hexColor;
  console.log(`Đã thêm màu mới với ID ${id} và mã màu ${hexColor}`);
  console.log(COLOR_MAPPING);
  return true;
}

/**
 * Tìm ID màu từ mã màu HEX
 * @param hexColor Mã màu HEX cần tìm
 * @returns ID của màu nếu tìm thấy, -1 nếu không tìm thấy
 */
export function findColorIdByHex(hexColor: string): number {
  const normalizedHex = hexColor.toLowerCase();
  
  for (const [idStr, hex] of Object.entries(COLOR_MAPPING)) {
    if (hex.toLowerCase() === normalizedHex) {
      return parseInt(idStr);
    }
  }
  
  return -1; // Không tìm thấy
}

/**
 * Lấy tất cả các ID màu từ COLOR_MAPPING
 * @returns Mảng các ID màu
 */
export function getAllColorIds(): number[] {
  return Object.keys(COLOR_MAPPING).map(id => parseInt(id));
}

/**
 * Lấy ID màu lớn nhất hiện tại
 * @returns ID màu lớn nhất
 */
export function getMaxColorId(): number {
  const ids = getAllColorIds();
  return Math.max(...ids);
}

/**
 * Thêm màu mới vào COLOR_MAPPING với ID tự động tăng
 * @param hexColor Mã màu HEX
 * @returns ID màu mới nếu thêm thành công, -1 nếu thất bại
 */
export function addColorWithAutoId(hexColor: string): number {
  const newId = getMaxColorId() + 1;
  const success = addColorToMapping(newId, hexColor);
  
  return success ? newId : -1;
}