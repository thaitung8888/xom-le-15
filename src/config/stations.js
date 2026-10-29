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
      eyebrow: ['Streetwear', '·', 'Hà Nội · từ 2026'],
      titleHtml: 'Một tiệm quần áo ở số <em>15</em>, cuối xóm.',
      lede: 'Đèn đường vàng, nền gạch ướt, một biển neon tím trên cửa. Đi chậm, nhìn quanh.',
      hint: 'Cuộn để vào xóm'
    }
  },
  {
    id: 'vao-ngo',
    label: 'Vào ngõ',
    side: 'right',
    camera: { pos: [0.2, 1.65, -13.2], look: [0, 2.1, -30] },
    title: 'Tường vàng, cửa chớp xanh, dây điện, gió nhẹ',
    body: 'Ngõ rộng hai mét, cuối ngõ là mặt kính sáng đèn. Cửa tự trượt mở khi bạn bước tới.'
  },
  {
    id: 'hoodie',
    label: 'Kệ hoodie',
    side: 'right',
    camera: { pos: [0.1, 1.75, -27.3], look: [-5, 2.1, -27.8] },
    // điện thoại: lùi về gần tường đối diện để thấy đủ cả dãy áo
    cameraPortrait: { pos: [3.3, 1.7, -27.7], look: [-5, 1.75, -27.8] },
    title: 'Giá treo dọc tường trái, đang chờ hàng',
    body: 'Lô hoodie đầu tiên sắp lên kệ: nỉ bông 420gsm, form rộng.'
  },
  {
    id: 'skate',
    label: 'Góc sưu tầm',
    side: 'left',
    camera: { pos: [1.3, 1.5, -24.8], look: [5, 1.6, -24.8] },
    title: 'Bóng thi đấu, áo đấu đóng khung và ván của xóm',
    body: 'Đồ trưng bày, không bán. Bấm vào từng quả bóng hay khung áo để xem câu chuyện.'
  },
  {
    id: 'hang-moi',
    label: 'Hàng mới',
    side: 'right',
    camera: { pos: [1.7, 2.15, -27.3], look: [-1.0, 1.1, -31.8] },
    title: 'Về mỗi sáng thứ Sáu',
    body: 'Đảo trưng bày giữa tiệm: bục khối xếp chồng, khung lưới sắt, poster của xóm. Hàng về là lên đây trước.'
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
    body: 'Hai phòng rèm nhung tím nép trong góc. Bên ngoài có sofa, đèn cây và gương toàn thân.'
  },
  {
    id: 'quay',
    label: 'Quầy',
    side: 'left',
    camera: { pos: [0.4, 1.75, -36.4], look: [3.8, 1.5, -40.6] },
    title: 'Quầy gọn, trả nhanh',
    body: 'Thẻ, QR, tiền mặt. Mặt quầy ngà liền khối, ốp lam tím, đèn vàng hắt dưới chân.'
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
      ['Mở cửa', '9:00 – 22:00, mỗi ngày'],
      ['Hàng mới', 'Sáng thứ Sáu'],
      ['Size', 'Áo S–XL · Giày 39–44']
    ],
    cta: 'Đi lại từ đầu ngõ',
    fine: 'Bản demo · nội dung và giá là ví dụ · dựng bằng Three.js'
  }
];

// Tìm chỉ số trạm theo id (dùng cho sản phẩm có chấm giá)
export const stationIndex = id => STATIONS.findIndex(s => s.id === id);
