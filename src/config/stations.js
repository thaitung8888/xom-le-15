// Các trạm dừng khi cuộn trang, theo thứ tự đi từ đầu ngõ vào tiệm.
// Mỗi trạm gồm: chữ hiển thị ở góc màn hình và vị trí camera.
//   camera.pos  : vị trí camera [x, y, z] (mét)
//   camera.look : điểm camera nhìn vào
//   cameraPortrait : (không bắt buộc) vị trí camera riêng cho màn hình dọc (điện thoại)
//   side        : 'left' | 'right' — chú thích nằm góc trái hay phải
// Trục toạ độ: z âm là đi sâu vào ngõ; mặt tiền kính ở z = -20, tường cuối tiệm ở z = -44.

export const STATIONS = [
  {
    id: 'dau-ngo',
    kind: 'hero',
    label: 'Đầu ngõ',
    camera: { pos: [0, 1.6, 7], look: [0, 2.8, -20] },
    hero: {
      eyebrow: ['Phù Đổng', '·', 'Hà Nội · từ 2026'],
      titleHtml: 'Tiệm quần áo ở số <em>15</em>, cuối xóm.',
      lede: '',
      hint: 'Cuộn để vào xóm'
    }
  },
  {
    id: 'vao-ngo',
    label: 'Vào ngõ',
    side: 'right',
    camera: { pos: [0.2, 1.65, -13.2], look: [0, 2.1, -30] },
    title: 'Tường vàng, cửa chớp xanh, dây điện, gió nhẹ',
    body: ''
  },
  {
    id: 'hoodie',
    label: 'Kệ quần áo',
    side: 'right',
    camera: { pos: [0.1, 1.75, -27.3], look: [-5, 2.1, -27.8] },
    // điện thoại: lùi về gần tường đối diện để thấy đủ cả dãy áo
    cameraPortrait: { pos: [3.3, 1.7, -27.7], look: [-5, 1.75, -27.8] },
    title: 'Sản phẩm hiện có ở cửa hàng',
    body: ''
  },
  {
    id: 'skate',
    label: 'Góc sưu tầm',
    side: 'left',
    camera: { pos: [1.3, 1.5, -24.8], look: [5, 1.6, -24.8] },
    title: 'Bóng thi đấu, áo đấu đóng khung của xóm',
    body: 'Đồ trưng bày, không bán. Bấm vào từng quả bóng hay khung áo để xem câu chuyện.'
  },
  {
    id: 'hang-moi',
    label: 'Món nổi bật',
    side: 'right',
    camera: { pos: [1.15, 1.85, -28.45], look: [-0.6, 1.45, -31.55] },
    title: 'Món tiệm chọn tuần này',
    body: ''
  },
  {
    id: 'buc-tuong',
    label: 'Bức tường',
    side: 'left',
    camera: { pos: [0.85, 1.8, -31.8], look: [5, 1.95, -32.0] },
    title: 'Graffiti tím vàng, vẽ tay',
    body: 'Chữ XÓM LẺ phủ ngang tường, chen giữa hàng chục chữ ký của người qua xóm.'
  },
  {
    id: 'tuong-giay',
    label: 'Tường giày',
    side: 'right',
    camera: { pos: [0, 1.6, -39.2], look: [0, 1.75, -44] },
    title: 'Tường giày, đang chờ hàng',
    body: 'Hàng giá đỡ đã lắp sẵn, xen giữa poster chạy đêm, bóng rổ, đá cầu. Giày về là lên đây.'
  },
  {
    id: 'phong-thu',
    label: 'Phòng thử',
    side: 'right',
    camera: { pos: [-0.3, 1.85, -36.4], look: [-4.4, 1.2, -41.0] },
    title: 'Phòng thử trong góc, sofa ngồi chờ',
    body: ''
  },
  {
    id: 'quay',
    label: 'Quầy',
    side: 'left',
    camera: { pos: [0.4, 1.75, -36.4], look: [3.8, 1.5, -40.6] },
    title: 'Quầy',
    body: 'Thẻ, QR, tiền mặt.'
  },
  {
    id: 'hen-o-xom',
    kind: 'outro',
    label: 'Hẹn ở xóm',
    side: 'left',
    camera: { pos: [-4.1, 3.6, -21.6], look: [1, 0.7, -36] },
    eyebrow: 'Hẹn ở xóm',
    title: '15 Xóm Lẻ, Hà Nội',
    hours: [
      ['Mở cửa', '9:00 – 17:00, mỗi ngày'],
      ['Hàng mới', 'Hằng tháng'],
      ['Size', 'Áo S–XL']
    ],
    cta: 'Đi lại từ đầu ngõ',
    fine: 'Bản demo · nội dung và giá là ví dụ · dựng bởi Thái Thanh Tùng'
  }
];

// Tìm chỉ số trạm theo id (dùng cho sản phẩm có chấm giá)
export const stationIndex = id => STATIONS.findIndex(s => s.id === id);
