// Góc sưu tầm (tường phải, phía trước): đồ trưng bày, KHÔNG bán. Sửa chữ / ảnh ngay trong file này.
// Ảnh đặt trong public/collection/:
//   bóng: ảnh vuông, nền trong suốt, quả bóng tròn sát mép (xem cách làm trong README)
//   khung: ảnh chụp chính diện cả khung áo, cắt sát mép ngoài khung
// Mỗi món có thể có:
//   name, kind (dòng nhỏ phía trên tên), facts: [['Nhãn', 'Giá trị'], …], description (câu chuyện),
//   plaque: [dòng 1, dòng 2] chữ khắc trên bảng đồng dưới quả bóng

// 5 ván trượt treo dọc, chỉ để trưng bày: số thứ tự mẫu in trong src/scene/textures/deck.js
// (0 Sọc chéo · 1 Số 15 · 2 Ca rô · 3 Mặt trời · 4 Mèo đầu ngõ · 5 Chữ XÓM · 6 Hoa sen · 7 Chấm bi)
export const COLLECTION_DECKS = [1, 3, 5, 6, 4];

// Bóng lưu niệm, xếp từ trái sang phải (nhìn từ giữa tiệm). Tất cả cùng một cỡ.
export const BALL_DIAMETER = 0.22;   // mét (bóng số 5 thật khoảng 22 cm)
export const BALLS = [
  {
    id: 'bong-champions-league',
    image: 'collection/bong-champions-league.webp',
    kind: 'Bóng thi đấu',
    name: 'Bóng UEFA Champions League',
    plaque: ['UEFA CHAMPIONS LEAGUE', 'Bóng thi đấu'],
    facts: [['Giải đấu', 'UEFA Champions League']],
    description: 'Quả bóng mang hoạ tiết ngôi sao quen thuộc của đêm Champions League.'
  },
  {
    id: 'bong-trionda-2026',
    image: 'collection/bong-trionda-2026.webp',
    kind: 'Bóng thi đấu chính thức',
    name: 'Bóng Trionda · World Cup 2026',
    plaque: ['FIFA WORLD CUP 2026', 'Trionda'],
    facts: [['Giải đấu', 'FIFA World Cup 2026'], ['Nước chủ nhà', 'Mỹ · Canada · Mexico']],
    description: 'Ba màu đỏ, xanh lá, xanh dương cho ba nước cùng đăng cai.'
  },
  {
    id: 'bong-al-rihla-2022',
    image: 'collection/bong-al-rihla-2022.webp',
    kind: 'Bóng thi đấu chính thức',
    name: 'Bóng Al Rihla · World Cup 2022',
    plaque: ['FIFA WORLD CUP 2022', 'Al Rihla'],
    facts: [['Giải đấu', 'FIFA World Cup 2022'], ['Nước chủ nhà', 'Qatar']],
    description: 'Al Rihla nghĩa là "chuyến đi" trong tiếng Ả Rập.'
  }
];

// Khung áo đấu có chữ ký, từ trái sang phải. Cùng chiều cao, bề ngang theo tỉ lệ ảnh.
export const FRAME_HEIGHT = 1.0;     // mét
export const FRAMES = [
  {
    id: 'khung-ronaldo',
    image: 'collection/khung-ronaldo.webp',
    kind: 'Áo đấu có chữ ký',
    name: 'Cristiano Ronaldo · Real Madrid',
    facts: [['Cầu thủ', 'Cristiano Ronaldo'], ['Câu lạc bộ', 'Real Madrid'], ['Số áo', '7']],
    description: 'Áo trắng sân nhà Real Madrid số 7, chữ ký ngay trên số áo.'
  },
  {
    id: 'khung-messi',
    image: 'collection/khung-messi.webp',
    kind: 'Áo đấu có chữ ký',
    name: 'Lionel Messi · Argentina',
    facts: [['Cầu thủ', 'Lionel Messi'], ['Đội tuyển', 'Argentina'], ['Số áo', '10']],
    description: 'Áo sọc trắng xanh số 10 của đội tuyển Argentina, có chữ ký của Messi.'
  }
];
