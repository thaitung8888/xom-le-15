// Cài đặt chung của trang.
export const SETTINGS = {
  // Bản render Blender: điền vào đây để trang chạy chuỗi ảnh thay cho cảnh Three.js.
  // Ảnh đặt trong public/frames/. Trạm thứ k (0..9) phải nằm ở khung k * (count - 1) / 9.
  // Ví dụ: { count: 271, src: i => `frames/${String(i + 1).padStart(4, '0')}.webp` }
  sequence: null,

  // Lấp các giá đỡ giày còn trống bằng giày mẫu (tắt khi đã có đủ sản phẩm thật)
  fillDemoShoes: true,

  // Hạt giống ngẫu nhiên: giữ nguyên để cảnh lần nào cũng giống nhau
  seed: 15
};
