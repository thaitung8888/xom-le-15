// Danh sách sản phẩm MẪU (dự phòng).
// Từ khi có Supabase, sản phẩm thật được thêm/sửa ở trang /admin và lưu trong cơ sở dữ liệu.
// Danh sách dưới đây chỉ dùng khi: khu đó chưa chuyển sang cơ sở dữ liệu (ván, giày),
// hoặc không kết nối được Supabase, hoặc để "nhập món mẫu" lần đầu trong trang admin.
// Ván trượt, bóng và khung áo ở Góc sưu tầm là đồ trưng bày: xem src/config/collection.js.
// Mỗi sản phẩm được gắn vào một "chỗ trưng bày" (zone + slot) trong cảnh 3D.
// Sản phẩm có trong danh sách này sẽ tự có chấm giá bấm được.
//
//   zone : 'shoes' (giá đỡ trên tường giày, đánh số từ 0: hàng dưới lên trên, mỗi hàng trái sang phải; hiện đang để trống)
//          'hoodie' (thanh treo tường trái, tối đa 25 món, tự xếp đè lên nhau và căn giữa)
//   type : (khu hoodie) 'tee' áo thun/polo/áo đấu · 'hoodie' · 'dress' váy — quyết định chiều dài
//          (xem garmentLengths trong settings.js) và độ phồng
//   slot : (khu hoodie) thứ tự trên thanh, số nhỏ ở phía cửa. Bỏ trống thì tự xếp: thun → hoodie → váy
//   featured: true = món nổi bật trên đảo giữa tiệm (chỉ một món)
//   image: (khu hoodie) ảnh chụp chính diện đã xoá nền, đặt trong public/products/
//          (dùng scripts/prepare_image.py để xoá nền trơn, cắt sát viền và thu nhỏ)
//   Thông tin hiện trong khung chi tiết (đều không bắt buộc):
//     brand, sizes: ['S', 'M', …], material, color, fit, description
//     images: [{ src, label }] nhiều mặt (ví dụ mặt trước / mặt sau / cận chất vải); bỏ trống thì dùng image
//     meta: một dòng ghi chú ngắn, chỉ hiện khi không có sizes/material/color/fit
//   look : màu dùng để dựng mô hình (giày: upper / sole / accent)
//   price: số nguyên, đơn vị đồng
//
// Giai đoạn sau, danh sách này sẽ được lấy từ cơ sở dữ liệu thay vì viết tay.

import { BR } from './brand.js';

export const PRODUCTS = [
  {
    id: 'thun-nirvana',
    zone: 'hoodie', type: 'tee', slot: 0, featured: true,
    image: 'products/thun-nirvana.webp',
    kind: 'Áo thun · oversize',
    name: 'Áo thun In Utero Tour ’93',
    price: 390000,
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Cotton 100%, wash bạc màu',
    color: 'Đen than',
    fit: 'Oversize, vai rơi',
    description: 'Áo thun in hình tour diễn ’93, vải được wash cho màu đen ngả than như áo cũ lâu năm. Hình in nứt nhẹ theo thời gian, càng mặc càng có chất.'
  },
  {
    id: 'thun-hong',
    zone: 'hoodie', type: 'tee', slot: 1,
    image: 'products/thun-hong.webp',
    kind: 'Áo thun · basic',
    name: 'Áo thun Hồng Phấn',
    price: 220000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: 'Cotton 100%, 220gsm',
    color: 'Hồng phấn',
    fit: 'Regular, cổ bo dày',
    description: 'Mẫu áo trơn mặc hằng ngày, màu hồng phấn dịu dễ phối với quần jean hay quần túi hộp.'
  },
  {
    id: 'ao-liverpool-san-nha',
    zone: 'hoodie', type: 'tee', slot: 2,
    image: 'products/ao-liverpool-san-nha.webp',
    kind: 'Áo đấu · sân nhà',
    name: 'Áo Liverpool sân nhà',
    price: 450000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: 'Polyester thun lạnh, lỗ thoáng khí',
    color: 'Đỏ, viền trắng',
    fit: 'Slim, ôm vừa',
    description: 'Áo đấu sân nhà, vải nhẹ và thoáng, mặc đá bóng hay mặc đi xem trận đều hợp.'
  },
  {
    id: 'thun-xanh',
    zone: 'hoodie', type: 'tee', slot: 3,
    image: 'products/thun-xanh.webp',
    kind: 'Áo thun · heavyweight',
    name: 'Áo thun Xanh Biển',
    price: 260000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: 'Cotton dày 250gsm',
    color: 'Xanh biển đậm',
    fit: 'Boxy, vai rơi',
    description: 'Áo thun dáng hộp, vải dày đứng form, có đường may tam giác dưới cổ kiểu áo nỉ cổ điển.'
  },
  {
    id: 'thun-den',
    zone: 'hoodie', type: 'tee', slot: 4,
    image: 'products/thun-den.webp',
    kind: 'Áo thun · slim',
    name: 'Áo thun Đen Slub',
    price: 220000,
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Cotton slub',
    color: 'Đen',
    fit: 'Slim, ôm nhẹ',
    description: 'Vải slub có vân sợi to nhỏ tự nhiên, mặt vải sần nhẹ nên áo đen trơn không bị nhàm.'
  },
  {
    id: 'thun-new-york',
    zone: 'hoodie', type: 'tee', slot: 5,
    image: 'products/thun-new-york.webp',
    kind: 'Áo thun · in nổi',
    name: 'Áo thun New York 92',
    price: 350000,
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Cotton 100%, chữ in nổi',
    color: 'Xanh rừng, chữ vàng',
    fit: 'Oversize',
    description: 'Phong cách áo đội thể thao đại học Mỹ: chữ in nổi, số 92 và nhãn vải may ở gấu.'
  },
  {
    id: 'ao-mu-san-nha',
    zone: 'hoodie', type: 'tee', slot: 6,
    image: 'products/ao-mu-san-nha.webp',
    kind: 'Áo đấu · sân nhà',
    name: 'Áo Manchester United sân nhà',
    price: 450000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: 'Polyester thun lạnh',
    color: 'Đỏ, cổ bẻ sọc trắng đen',
    fit: 'Regular',
    description: 'Áo đấu sân nhà với cổ bẻ kiểu polo, viền tay sọc trắng đen.'
  },
  {
    id: 'thun-nau',
    zone: 'hoodie', type: 'tee', slot: 7,
    image: 'products/thun-nau.webp',
    kind: 'Áo thun · slim',
    name: 'Áo thun Nâu Cacao',
    price: 220000,
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Cotton pha spandex, co giãn',
    color: 'Nâu cacao',
    fit: 'Slim',
    description: 'Áo thun ôm dáng, vải co giãn bốn chiều, màu nâu trầm hợp mặc trong áo khoác.'
  },
  {
    id: 'polo-navy',
    zone: 'hoodie', type: 'tee', slot: 8,
    image: 'products/polo-navy.webp',
    kind: 'Áo polo',
    name: 'Polo Navy',
    price: 320000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    material: 'Vải cá sấu cotton',
    color: 'Xanh navy',
    fit: 'Slim',
    description: 'Polo ba khuy, cổ đứng gọn, mặc đi làm hay đi chơi đều được.'
  },
  {
    id: 'hoodie-navy',
    zone: 'hoodie', type: 'hoodie', slot: 9,
    image: 'products/hoodie-navy.webp',
    kind: 'Hoodie · nỉ bông',
    name: 'Hoodie Navy Mũ Đen',
    price: 590000,
    sizes: ['M', 'L', 'XL', 'XXL'],
    material: 'Nỉ bông 420gsm',
    color: 'Navy, lót mũ đen',
    fit: 'Form rộng',
    description: 'Hoodie nỉ bông dày, mũ hai lớp lót đen, túi kangaroo trước bụng. Lô đầu tiên của tiệm.'
  },
  {
    id: 'vay-hai-day-den',
    zone: 'hoodie', type: 'dress', slot: 10,
    image: 'products/vay-hai-day-den.webp',
    kind: 'Váy · dáng dài',
    name: 'Váy Hai Dây Đen Xếp Ly',
    price: 690000,
    sizes: ['S', 'M', 'L'],
    material: 'Vải tuyết mưa đứng form',
    color: 'Đen',
    fit: 'Dáng xoè, dài chấm gót',
    description: 'Váy hai dây dáng dài, thân trên ôm, chân váy xếp ly xoè nhẹ khi bước.'
  }
];

// Danh sách đang dùng: mặc định là danh sách mẫu; src/data/catalog.js thay bằng dữ liệu từ Supabase
let active = PRODUCTS;
export const setActiveProducts = list => { active = list; };

// Sản phẩm thuộc một khu trưng bày
export const productsIn = zone => active.filter(p => p.zone === zone);

// Món nổi bật (chọn bằng nút ★ trong trang admin), đặt trên đảo giữa tiệm. Không có thì trả về null.
export const featuredProduct = () => active.find(p => p.featured && p.image) || null;

// Định dạng giá kiểu Việt Nam: 1150000 → "1.150.000₫"
export const formatPrice = n => n.toLocaleString('vi-VN') + '₫';
