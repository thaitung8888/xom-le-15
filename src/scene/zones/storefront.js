// Khu 2 — mặt tiền kính, cửa trượt, biển neon, hộp đèn logo đầu ngõ.
import { BR } from '../../config/brand.js';
import { reduce } from '../../env.js';
import { T, scene, renderer, camera, TX, onFrame } from '../core.js';
import { std, box, plane, halo, pool, neonMaterial } from '../helpers.js';
import { plant } from '../props/plant.js';
import { neonTube, signTex, roundelTex } from '../textures/brand.js';
import { canvasTex } from '../textures/canvas.js';

export function buildStorefront() {
  // bản đồ phản chiếu đơn giản cho kính: trời đêm, đèn vàng, neon tím
  const envSrc = canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b1932'); gr.addColorStop(0.5, '#2a2440'); gr.addColorStop(1, '#0c0b12');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (const [x, y, r, c] of [[0.25, 0.42, 60, 'rgba(255,170,80,.9)'], [0.75, 0.4, 50, 'rgba(255,190,110,.7)'], [0.5, 0.36, 70, 'rgba(120,90,255,.8)'], [0.1, 0.55, 90, 'rgba(201,164,87,.5)'], [0.9, 0.55, 90, 'rgba(201,164,87,.5)']]) {
      const rg = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
    }
  });
  envSrc.mapping = T.EquirectangularReflectionMapping;
  const pm = new T.PMREMGenerator(renderer), env = pm.fromEquirectangular(envSrc).texture; pm.dispose();
  const glass = new T.MeshStandardMaterial({ color: '#b9c6d6', metalness: 0.9, roughness: 0.04, envMap: env, envMapIntensity: 1.3, transparent: true, opacity: 0.2, depthWrite: false, side: T.DoubleSide });
  const metal = std('#16151c', 0.35, 0.7);

  const fm = new T.MeshStandardMaterial({ map: TX.facade, roughness: 0.85 });
  const Z = -20, D = 0.3, GW = 3.9, GT = 3.25;     // kính rộng hết lòng ngõ, cao 3.25 m
  box(5 - GW / 2, 4.6, D, fm, -(5 + GW / 2) / 2, 2.3, Z);
  box(5 - GW / 2, 4.6, D, fm, (5 + GW / 2) / 2, 2.3, Z);
  box(GW, 4.6 - GT, D, fm, 0, (4.6 + GT) / 2, Z);
  box(4, 4.4, D, fm, 0, 6.8, Z);
  // ngưỡng cửa
  box(4.2, 0.12, 0.7, std('#3a3842', 0.6), 0, 0.06, Z + 0.25);
  box(GW, 0.02, 0.04, std(BR.yellow, 0.4), 0, 0.125, Z + 0.58);
  // khung kính: đố đứng, thanh chân, thanh đầu
  for (const x of [-GW / 2, -0.72, 0.72, GW / 2]) box(0.06, GT, 0.1, metal, x, GT / 2, Z);
  box(GW, 0.12, 0.1, metal, 0, 0.18, Z); box(GW, 0.08, 0.12, metal, 0, GT - 0.04, Z);
  box(1.44, 0.06, 0.12, metal, 0, 3.0, Z + 0.06);   // ray cửa trượt
  // hai tấm kính cố định hai bên
  const sideW = GW / 2 - 0.72;
  for (const s of [-1, 1]) plane(sideW, GT - 0.3, glass, s * (0.72 + sideW / 2), 0.24 + (GT - 0.3) / 2, Z);
  // chữ trắng nhỏ trên kính hai bên
  const smallText = (lines) => new T.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false, map: canvasTex(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center';
    lines.forEach(([t, f, y]) => { g.font = f; g.fillText(t, w / 2, y); });
  }) });
  plane(1.0, 0.25, smallText([['STREETWEAR', '800 44px Montserrat, sans-serif', 54], ['HÀ NỘI · TỪ 2026', '600 28px Montserrat, sans-serif', 102]]), -(0.72 + sideW / 2), 1.2, Z + 0.012);
  plane(1.0, 0.25, smallText([['MỞ CỬA 9:00 – 22:00', '800 40px Montserrat, sans-serif', 54], ['MỖI NGÀY', '600 28px Montserrat, sans-serif', 102]]), (0.72 + sideW / 2), 1.2, Z + 0.012);
  // hai cánh cửa trượt, logo tròn chia đôi trên hai cánh
  const rt = roundelTex();
  const half = off => { const t = rt.clone(); t.needsUpdate = true; t.repeat.set(0.5, 1); t.offset.set(off, 0); return new T.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.8, depthWrite: false }); };
  const leaf = (side) => {
    const g = new T.Group();
    plane(0.72, 2.8, glass, 0, 0, 0, 0, g);
    box(0.72, 0.05, 0.04, metal, 0, 1.4, 0, g); box(0.72, 0.05, 0.04, metal, 0, -1.4, 0, g);
    box(0.04, 2.8, 0.04, metal, side * 0.34, 0, 0, g);
    box(0.025, 0.6, 0.025, std('#c9c2b0', 0.3, 1), -side * 0.26, 0, 0.05, g);  // tay nắm
    const lg = plane(0.62, 1.24, half(side < 0 ? 0 : 0.5), -side * 0.05, 0.25, 0.015, 0, g);
    g.position.set(side * 0.36, 1.6, Z + 0.09); scene.add(g);
    return g;
  };
  const doorL = leaf(-1), doorR = leaf(1);
  // Cửa tự trượt mở khi camera tới gần mặt tiền
  onFrame(() => {
    const o = Math.min(1, Math.max(0, (-14.5 - camera.position.z) / 3)), e = o * o * (3 - 2 * o);
    doorL.position.x = -0.36 - 0.7 * e; doorR.position.x = 0.36 + 0.7 * e;
  });
  // vệt phản chiếu chéo trên kính
  const streak = canvasTex(512, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (const [x, wd, a] of [[0.12, 50, 0.5], [0.2, 16, 0.4], [0.62, 70, 0.35], [0.74, 20, 0.45]]) {
      const gr = g.createLinearGradient(x * w, 0, x * w + wd, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.save(); g.translate(x * w, 0); g.transform(1, 0, -0.5, 1, 0, 0); g.fillStyle = gr; g.fillRect(-wd / 2 + 0, 0, wd * 2, h); g.restore();
    }
  });
  plane(GW, GT - 0.3, new T.MeshBasicMaterial({ map: streak, transparent: true, opacity: 0.1, blending: T.AdditiveBlending, depthWrite: false }), 0, 0.24 + (GT - 0.3) / 2, Z + 0.14);
  // biển số nhà xanh Hà Nội
  plane(0.36, 0.26, new T.MeshStandardMaterial({ map: signTex([['15', 120, 104, 900]], '#1e4f9c', '#ffffff', 256, 190, 'Montserrat'), roughness: 0.5 }), 1.7, 3.85, Z + 0.16);
  // biển neon: "15" vàng + "XÓM LẺ" tím
  box(2.7, 1.0, 0.06, std(BR.ink, 0.6, 0.3), 0, 4.15, Z + 0.2);
  const neonMat = neonMaterial(canvasTex(1024, 380, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    neonTube(g, '15', 180, 285, '900 220px Montserrat, sans-serif', '#ffc700', '#fff6cf');
    neonTube(g, 'XÓM LẺ', 650, 268, '800 150px Montserrat, sans-serif', '#7b5cff', '#efe9ff');
  }));
  plane(2.62, 0.97, neonMat, 0, 4.15, Z + 0.25);
  const nh = halo('rgba(110,80,255,1)', 4.6, 0.3, 4.1, Z + 0.4, 0.42);
  halo('rgba(255,199,0,1)', 2.2, -0.85, 4.1, Z + 0.4, 0.3);
  const nl = new T.PointLight('#7b5cff', 2.2, 9, 1.7); nl.position.set(0.3, 3.9, Z + 1.3); scene.add(nl);
  const nl2 = new T.PointLight('#ffc23a', 0.8, 6, 1.7); nl2.position.set(-0.9, 3.9, Z + 1.0); scene.add(nl2);
  // Neon thỉnh thoảng chập chờn
  onFrame((t) => {
    let k = 1;
    if (!reduce) { const s = Math.sin(t * 0.0013) + Math.sin(t * 0.0071); if (s > 1.84) k = 0.3 + 0.5 * (Math.sin(t * 0.09) > 0); }
    neonMat.opacity = k; nh.material.opacity = 0.42 * k; nl.intensity = 2.2 * k;
  });
  // hộp đèn logo nhô ra từ tường phải của ngõ
  const lb = new T.Group();
  box(0.66, 0.84, 0.1, std(BR.ink, 0.5, 0.3), 0, 0, 0, lb);
  const face = new T.MeshStandardMaterial({ map: TX.badge, emissiveMap: TX.badge, emissive: '#ffffff', emissiveIntensity: 0.75, transparent: true, alphaTest: 0.3, roughness: 0.5, side: T.DoubleSide });
  plane(0.6, 0.78, face, 0, 0, 0.052, 0, lb); plane(0.6, 0.78, face, 0, 0, -0.052, Math.PI, lb);
  box(0.36, 0.04, 0.04, std('#222', 0.5, 0.7), 0.45, 0.3, 0, lb);
  lb.position.set(1.47, 3.0, -16.6); scene.add(lb);
  halo('rgba(120,90,255,1)', 1.8, 1.47, 3.0, -16.5, 0.35);
  // ánh sáng trong tiệm hắt ra nền ngõ
  pool(0, 0.02, -18.4, 0, 3.6, 3.2, 0.16, 'rgba(255,220,170,1)').rotation.x = -Math.PI / 2;
  // hai chậu cây hai bên cửa kính
  plant(-1.62, Z + 0.75, 0.85); plant(1.64, Z + 0.8, 0.75);
}
