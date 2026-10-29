# 15 Xóm Lẻ

Trang web 3D của tiệm streetwear **15 Xóm Lẻ**: người xem cuộn trang để đi từ đầu ngõ, qua cửa kính, vào từng góc trong tiệm. Dựng bằng **Three.js** (cảnh 3D) và **Vite** (công cụ chạy và đóng gói).

## Chạy thử

Cần Node.js 18 trở lên. Sản phẩm lấy từ Supabase (xem mục **Cơ sở dữ liệu và trang quản trị** bên dưới).

```bash
npm install
npm run dev       # mở http://localhost:5173, sửa code là trang tự tải lại
npm run build     # đóng gói ra thư mục dist/ để đưa lên mạng
npm run preview   # xem thử bản đã đóng gói
```

- Cửa tiệm: `http://localhost:5173/`
- Trang quản trị: `http://localhost:5173/admin.html` (trên Vercel: `/admin`)

## Cấu trúc thư mục

```
xom-le-15/
├─ index.html                  Khung trang cửa tiệm: canvas, màn tải, logo, thanh trạm, khung chi tiết sản phẩm
├─ admin.html                  Trang quản trị sản phẩm
├─ vercel.json                 Cho phép mở /admin không cần đuôi .html
├─ supabase/schema.sql         Tạo bảng, kho ảnh, phân quyền trên Supabase (chạy một lần)
├─ scripts/prepare_image.py    (tuỳ chọn) xử lý ảnh bằng Python; trang admin đã tự làm việc này
├─ public/products/            Ảnh 11 món mẫu (dùng khi nhập món mẫu và khi mất kết nối Supabase)
├─ public/collection/          Ảnh bóng lưu niệm và khung áo đấu của Góc sưu tầm
└─ src/
   ├─ main.js                  Điểm vào: dựng giao diện rồi chọn chế độ vẽ nền
   ├─ env.js                   Thông tin môi trường (màn nhỏ, giảm chuyển động)
   │
   ├─ config/                  ★ NỘI DUNG — phần hay sửa nhất
   │  ├─ stations.js           10 trạm: chữ hiển thị + vị trí camera
   │  ├─ products.js           Sản phẩm MẪU / dự phòng (sản phẩm thật nằm trên Supabase)
   │  ├─ collection.js         Góc sưu tầm: 5 ván, bóng lưu niệm, khung áo có chữ ký (viết tay, không bán)
   │  ├─ supabase.js           Địa chỉ project Supabase + publishable key
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
   ├─ data/catalog.js          Tải sản phẩm từ Supabase cho cửa tiệm (có dự phòng)
   ├─ admin/                   Trang quản trị: main.js (giao diện), api.js (Supabase), image.js (xử lý ảnh)
   │
   ├─ ui/                      Giao diện HTML (không dính tới 3D)
   │  ├─ sections.js           Tạo các <section> và nội dung chú thích từ stations.js
   │  ├─ scroll.js             Đổi vị trí cuộn thành tiến độ qua các trạm
   │  ├─ hud.js                Phần trăm, thanh trạm, đổi chú thích
   │  ├─ loader.js             Màn hình tải, chờ phông chữ
   │  ├─ hotspots.js           Chấm giá + bấm thẳng vào món đồ trong cảnh 3D
   │  └─ productDetail.js      Khung chi tiết sản phẩm toàn màn hình
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
   │  ├─ props/                Đồ vật dùng lại: chậu cây, ghế, dây điện, giày, rèm, garment.js (áo 2.5D từ ảnh)
   │  └─ zones/                ★ Mỗi khu trong tiệm một file
   │     ├─ index.js           Danh sách và thứ tự dựng các khu
   │     ├─ alley.js           Con ngõ
   │     ├─ storefront.js      Mặt tiền kính, cửa trượt, biển neon
   │     ├─ shell.js           Vỏ tiệm: sàn, tường, trần, đèn chính
   │     ├─ hoodieRail.js      Kệ áo: tối đa 25 món 2.5D xếp đè lên nhau
   │     ├─ collectionCorner.js Góc sưu tầm: ván treo dọc, kệ bóng trong hộp mica, khung áo đấu
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

**Thêm hoặc sửa sản phẩm trên kệ áo** — dùng trang quản trị `/admin` (xem mục bên dưới), không cần sửa code.

**Góc sưu tầm** (đồ trưng bày, không bán) — sửa `src/config/collection.js`: đổi mẫu ván, thêm/bớt bóng, khung áo, chữ trên bảng đồng và câu chuyện hiện khi bấm vào.
Ảnh bóng: vuông, nền trong suốt, quả bóng tròn sát mép. Ảnh khung áo: chụp chính diện, cắt sát mép ngoài khung. Đặt vào `public/collection/`.

**Sản phẩm ở tường giày** (đang để trống, chưa chuyển sang cơ sở dữ liệu) — thêm một mục vào `src/config/products.js`:

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

Sản phẩm có trong danh sách sẽ tự hiện chấm giá. Khu `shoes` (giá đỡ trên tường giày, đánh số từ 0 theo hàng từ dưới lên, mỗi hàng từ trái sang phải). Khi đủ giày thật, đặt `fillDemoShoes: false` trong `settings.js` để bỏ giày mẫu.

**Thêm một khu mới** — tạo file trong `src/scene/zones/`, export một hàm `buildTenKhu()`, rồi thêm hàm đó vào `BUILD_STEPS` trong `zones/index.js`. Hiệu ứng chạy mỗi khung hình thì đăng ký bằng `onFrame(fn)` từ `scene/core.js`.

## Cơ sở dữ liệu và trang quản trị

Sản phẩm trên kệ áo được lưu trên **Supabase** (cơ sở dữ liệu Postgres + kho ảnh + đăng nhập).

**Cài đặt lần đầu** (đã làm một lần cho project hiện tại):
1. Tạo project trên supabase.com (Region Singapore).
2. SQL Editor → dán `supabase/schema.sql` → Run.
3. Authentication → Users → Add user (tick Auto Confirm), rồi chạy dòng `insert into public.admins …` ở cuối file SQL với email đó.
4. Authentication → Sign In / Providers → tắt "Allow new users to sign up".
5. Điền Project URL và publishable key vào `src/config/supabase.js` (hoặc biến môi trường `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

**Dùng trang quản trị** (`/admin`): đăng nhập → lần đầu bấm "Nhập 11 món mẫu" → thêm / sửa / xoá / ẩn hiện / đổi thứ tự.
Ảnh tải lên được tự xử lý trong trình duyệt: xoá nền trơn (ảnh JPG nền trắng, xám), cắt sát viền, thu nhỏ còn 1024px, lưu WebP.
Ảnh đẹp nhất: chụp chính diện, cao từ 1000px, nền đã xoá hoặc nền trơn khác màu áo.

**Cửa tiệm đọc dữ liệu thế nào** (`src/data/catalog.js`): kệ áo luôn lấy từ Supabase (kể cả khi trống); tường giày vẫn dùng `src/config/products.js`; Góc sưu tầm viết tay trong `src/config/collection.js`.
Nếu không kết nối được Supabase, cửa tiệm dùng tạm danh sách mẫu để không bao giờ trống.

**Bảo mật**: publishable key nằm công khai trong trang là bình thường. Quyền do phân quyền (RLS) trong `schema.sql` quyết định:
ai cũng chỉ đọc được món đang bày; thêm / sửa / xoá phải đăng nhập bằng tài khoản có tên trong bảng `admins`.
Không bao giờ đưa secret key (`sb_secret_…`) hay mật khẩu database vào code.

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

- Chuyển tường giày sang cơ sở dữ liệu + trang quản trị.
- Thêm chỗ trưng bày cho đảo hàng mới (`zone: 'island'`).
- Tối ưu cho điện thoại: gộp vật thể tĩnh, giảm đèn, tự hạ chất lượng khi máy yếu.
