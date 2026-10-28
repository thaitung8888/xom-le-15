# 15 Xóm Lẻ

Trang web 3D của tiệm streetwear **15 Xóm Lẻ**: người xem cuộn trang để đi từ đầu ngõ, qua cửa kính, vào từng góc trong tiệm. Dựng bằng **Three.js** (cảnh 3D) và **Vite** (công cụ chạy và đóng gói).

## Chạy thử

Cần Node.js 18 trở lên.

```bash
npm install
npm run dev       # mở http://localhost:5173, sửa code là trang tự tải lại
npm run build     # đóng gói ra thư mục dist/ để đưa lên mạng
npm run preview   # xem thử bản đã đóng gói
```

## Cấu trúc thư mục

```
xom-le-15/
├─ index.html                  Khung trang: canvas, màn tải, logo, thanh trạm, thẻ sản phẩm
├─ public/                     File tĩnh (ảnh sản phẩm, chuỗi ảnh render sau này)
└─ src/
   ├─ main.js                  Điểm vào: dựng giao diện rồi chọn chế độ vẽ nền
   ├─ env.js                   Thông tin môi trường (màn nhỏ, giảm chuyển động)
   │
   ├─ config/                  ★ NỘI DUNG — phần hay sửa nhất
   │  ├─ stations.js           10 trạm: chữ hiển thị + vị trí camera
   │  ├─ products.js           Sản phẩm đang trưng bày (tên, giá, chỗ đặt, màu)
   │  ├─ brand.js              Màu thương hiệu, phông chữ cần tải
   │  └─ settings.js           Cài đặt chung (chuỗi ảnh Blender, giày mẫu, hạt ngẫu nhiên)
   │
   ├─ styles/                  CSS tách theo phần
   │  ├─ tokens.css            Màu, phông, nền chung
   │  ├─ chrome.css            Logo góc, phần trăm, thanh trạm, màn tải
   │  ├─ track.css             Đường cuộn, màn mở đầu
   │  ├─ caption.css           Chú thích cố định ở góc dưới
   │  └─ product.css           Chấm giá và thẻ sản phẩm
   │
   ├─ ui/                      Giao diện HTML (không dính tới 3D)
   │  ├─ sections.js           Tạo các <section> và nội dung chú thích từ stations.js
   │  ├─ scroll.js             Đổi vị trí cuộn thành tiến độ qua các trạm
   │  ├─ hud.js                Phần trăm, thanh trạm, đổi chú thích
   │  ├─ loader.js             Màn hình tải, chờ phông chữ
   │  ├─ hotspots.js           Chấm giá: chiếu điểm 3D ra màn hình
   │  └─ productCard.js        Thẻ thông tin sản phẩm
   │
   ├─ brand/logo.js            Hàm vẽ logo vòm (dùng cho màn tải, texture, poster)
   │
   ├─ scene/                   Cảnh 3D
   │  ├─ index.js              Dựng từng khu theo thứ tự, vòng lặp vẽ
   │  ├─ core.js               renderer / scene / camera, sổ đăng ký chấm giá và hiệu ứng mỗi khung
   │  ├─ cameraRig.js          Đường bay camera qua các trạm, liếc theo chuột
   │  ├─ helpers.js            Hàm dựng nhanh: vật liệu, hộp, mặt phẳng, quầng sáng
   │  ├─ random.js             Số ngẫu nhiên có hạt giống (cảnh lần nào cũng giống nhau)
   │  ├─ textures/             Texture vẽ bằng canvas: tường ngõ, graffiti, ván, poster, neon…
   │  ├─ props/                Đồ vật dùng lại: chậu cây, ghế, dây điện, giày, rèm
   │  └─ zones/                ★ Mỗi khu trong tiệm một file
   │     ├─ index.js           Danh sách và thứ tự dựng các khu
   │     ├─ alley.js           Con ngõ
   │     ├─ storefront.js      Mặt tiền kính, cửa trượt, biển neon
   │     ├─ shell.js           Vỏ tiệm: sàn, tường, trần, đèn chính
   │     ├─ hoodieRail.js      Kệ hoodie
   │     ├─ skateCorner.js     Góc skate
   │     ├─ graffitiWall.js    Bức graffiti
   │     ├─ island.js          Đảo hàng mới
   │     ├─ shoeWall.js        Tường giày
   │     ├─ fittingLounge.js   Phòng thử + sofa
   │     ├─ counter.js         Quầy thu ngân
   │     └─ dust.js            Bụi trong ánh đèn
   │
   └─ sequence/player.js       Chế độ chạy chuỗi ảnh render từ Blender
```

Quy ước chia lớp: **config** chỉ chứa dữ liệu, **ui** chỉ lo HTML, **scene** chỉ lo 3D. Muốn đổi chữ hay giá thì không cần đụng vào code 3D.

## Sửa nội dung thường gặp

**Đổi chữ ở một trạm** — sửa `title` / `body` trong `src/config/stations.js`.

**Chỉnh góc máy** — sửa `camera.pos` (vị trí) và `camera.look` (điểm nhìn) của trạm đó. Trục toạ độ: `z` âm là đi sâu vào ngõ, mặt tiền kính ở `z = -20`, tường cuối tiệm ở `z = -44`, `x` âm là tường trái.

**Thêm hoặc sửa sản phẩm** — thêm một mục vào `src/config/products.js`:

```js
{
  id: 'giay-tim-moi',
  zone: 'shoes', slot: 12,          // giá đỡ số 12 trên tường giày
  kind: 'Giày',
  name: 'Giày Tím Mới',
  price: 950000,
  meta: 'Size 39 đến 44',
  look: { upper: '#3b2ca6', sole: '#f6f4ee', accent: '#ffc700' }
}
```

Sản phẩm có trong danh sách sẽ tự hiện chấm giá. Các khu đang nhận sản phẩm: `skate` (slot 0–7) và `shoes` (giá đỡ trên tường giày, đánh số từ 0 theo hàng từ dưới lên, mỗi hàng từ trái sang phải). Khi đủ giày thật, đặt `fillDemoShoes: false` trong `settings.js` để bỏ giày mẫu.

**Thêm một khu mới** — tạo file trong `src/scene/zones/`, export một hàm `buildTenKhu()`, rồi thêm hàm đó vào `BUILD_STEPS` trong `zones/index.js`. Hiệu ứng chạy mỗi khung hình thì đăng ký bằng `onFrame(fn)` từ `scene/core.js`.

## Chuyển sang bản render Blender

1. Render chuỗi ảnh theo đúng đường bay camera (trạm thứ k nằm ở khung `k × (count − 1) / 9`).
2. Đặt ảnh vào `public/frames/` (ví dụ `0001.webp`, `0002.webp`…).
3. Trong `src/config/settings.js`, điền `sequence: { count: 271, src: i => \`frames/${String(i + 1).padStart(4, '0')}.webp\` }`.

Chữ, thanh trạm và hiệu ứng dừng ở mỗi trạm giữ nguyên.

## Đưa lên mạng (Vercel)

Đẩy thư mục lên GitHub, vào vercel.com → New Project → chọn repo. Vercel tự nhận Vite: build command `npm run build`, output `dist`.

## Ghi chú kỹ thuật

- Three.js đang khoá ở bản `0.128.0` để ánh sáng và màu giống hệt bản gốc. Nâng cấp lên bản mới cần chỉnh lại cách quản lý màu (`outputEncoding` → `outputColorSpace`) và độ sáng đèn.
- Phần 3D được tải riêng (dynamic import) nên màn hình tải hiện ngay.
- Toàn bộ hình ảnh trong cảnh được vẽ bằng code, không cần file ảnh hay mô hình ngoài.

## Hướng phát triển tiếp

- Quản lý sản phẩm: lưu `products.js` vào cơ sở dữ liệu, thêm trang quản trị để thêm/sửa/xoá sản phẩm và tải ảnh.
- Gắn ảnh sản phẩm thật lên poster và thẻ sản phẩm.
- Thêm chỗ trưng bày cho kệ hoodie (`zone: 'hoodie'`) và đảo hàng mới (`zone: 'island'`).
- Tối ưu cho điện thoại: gộp vật thể tĩnh, giảm đèn, tự hạ chất lượng khi máy yếu.
# xom-le-15
