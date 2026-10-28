// Danh sách sản phẩm đang trưng bày.
// Mỗi sản phẩm được gắn vào một "chỗ trưng bày" (zone + slot) trong cảnh 3D.
// Sản phẩm có trong danh sách này sẽ tự có chấm giá bấm được.
//
//   zone : 'skate' (8 mặt ván trên tường phải, slot 0–7)
//          'shoes' (giá đỡ trên tường giày, đánh số từ 0: hàng dưới lên trên, mỗi hàng trái sang phải)
//   look : màu dùng để dựng mô hình (giày: upper / sole / accent)
//   price: số nguyên, đơn vị đồng
//
// Giai đoạn sau, danh sách này sẽ được lấy từ cơ sở dữ liệu thay vì viết tay.

import { BR } from './brand.js';

export const PRODUCTS = [
  {
    id: 'van-so-15',
    zone: 'skate', slot: 1,
    kind: 'Mặt ván · gỗ phong 7 lớp',
    name: 'Ván "Số 15"',
    price: 1150000,
    meta: 'Rộng 8.0 inch · chưa gồm trục bánh'
  },
  {
    id: 'van-chu-xom',
    zone: 'skate', slot: 5,
    kind: 'Mặt ván · gỗ phong 7 lớp',
    name: 'Ván "Chữ XÓM"',
    price: 1250000,
    meta: 'Rộng 8.25 inch · in lụa thủ công'
  },
  {
    id: 'giay-vai-nga',
    zone: 'shoes', slot: 9,
    kind: 'Giày',
    name: 'Giày Vải Ngà Viền Tím',
    price: 890000,
    meta: 'Size 39 đến 44 · thử tại chỗ',
    look: { upper: '#f2efe6', sole: '#f2efe6', accent: BR.purple }
  },
  {
    id: 'giay-den-gum',
    zone: 'shoes', slot: 22,
    kind: 'Giày',
    name: 'Giày Đen Đế Gum',
    price: 990000,
    meta: 'Size 39 đến 44 · thử tại chỗ',
    look: { upper: '#1d1e22', sole: '#b77b40', accent: BR.yellow }
  },
  {
    id: 'giay-chay-xam',
    zone: 'shoes', slot: 33,
    kind: 'Giày',
    name: 'Giày Chạy Xám Cam',
    price: 1290000,
    meta: 'Size 39 đến 44 · thử tại chỗ',
    look: { upper: '#9a9da3', sole: '#f2efe6', accent: '#ff6b4a' }
  }
];

// Sản phẩm thuộc một khu trưng bày
export const productsIn = zone => PRODUCTS.filter(p => p.zone === zone);

// Định dạng giá kiểu Việt Nam: 1150000 → "1.150.000₫"
export const formatPrice = n => n.toLocaleString('vi-VN') + '₫';
