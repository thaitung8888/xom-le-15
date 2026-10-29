// Cài đặt chung của trang.
export const SETTINGS = {
  // Bản render Blender: điền vào đây để trang chạy chuỗi ảnh thay cho cảnh Three.js.
  // Ảnh đặt trong public/frames/. Trạm thứ k (0..9) phải nằm ở khung k * (count - 1) / 9.
  // Ví dụ: { count: 271, src: i => `frames/${String(i + 1).padStart(4, '0')}.webp` }
  sequence: null,

  // Lấp các giá đỡ giày còn trống bằng giày mẫu (tắt khi đã có đủ sản phẩm thật)
  fillDemoShoes: false,

  // Chiều dài đồ treo trên kệ theo loại (mét, từ điểm cao nhất tới gấu).
  // Mọi món cùng loại được ép về đúng chiều dài này, ảnh gốc to nhỏ hay thừa nền bao nhiêu cũng không ảnh hưởng.
  garmentLengths: { tee: 0.72, hoodie: 0.82, dress: 1.32 },

  // Link cho nút "Nhắn tiệm giữ món này" trong khung chi tiết sản phẩm
  // (ví dụ 'https://zalo.me/09xxxxxxxx' hoặc 'https://m.me/ten-trang'). Để null thì ẩn nút.
  contactUrl: null,

  // Hạt giống ngẫu nhiên: giữ nguyên để cảnh lần nào cũng giống nhau
  seed: 15
};
