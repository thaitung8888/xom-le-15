// Khu góc skate (tường phải, phía trước): 8 mặt ván, băng ghế, máy đĩa than.
import { BR } from '../../config/brand.js';
import { T, scene, addHotspot } from '../core.js';
import { productsIn } from '../../config/products.js';
import { stationIndex } from '../../config/stations.js';
import { std, box, plane } from '../helpers.js';
import { rr } from '../random.js';
import { deckTex } from '../textures/deck.js';

export const DECKS = ['Sọc chéo', 'Số 15', 'Ca rô', 'Mặt trời', 'Mèo đầu ngõ', 'Chữ XÓM', 'Hoa sen', 'Chấm bi'];
export const deckZ = i => -22.6 - i * 0.62;

export function buildSkateCorner() {
  const decks = [];
  DECKS.forEach((n, i) => {
    const m = new T.MeshStandardMaterial({ map: deckTex(i), transparent: true, alphaTest: 0.5, roughness: 0.55, side: T.DoubleSide });
    const d = plane(0.21, 0.84, m, 4.93, 1.85, deckZ(i), -Math.PI / 2); d.rotation.z = rr(-0.015, 0.015); decks.push(d);
    box(0.06, 0.03, 0.05, std('#999', 0.3, 1), 4.97, 1.42, deckZ(i));
  });
  const wood = std('#6d4a2e', 0.6);
  box(0.46, 0.08, 2.3, wood, 4.45, 0.46, -24.8);
  for (const z of [-23.8, -25.8]) box(0.4, 0.42, 0.06, std('#1b1b1b', 0.5, 0.6), 4.45, 0.21, z);
  box(0.42, 0.1, 0.36, std('#2a2a2c', 0.4, 0.3), 4.45, 0.55, -25.6);
  const rec = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.01, 30), std('#0c0c0c', 0.25)); rec.position.set(4.45, 0.61, -25.6); scene.add(rec);
  const lab = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.012, 20), std(BR.yellow, 0.6)); lab.position.set(4.45, 0.612, -25.6); scene.add(lab);
  // gối tựa tím trên băng ghế
  const cush = box(0.4, 0.08, 0.6, std(BR.purple, 0.95), 4.45, 0.54, -24.3); cush.rotation.y = 0.1;
  // Chấm giá cho các mặt ván có trong danh sách sản phẩm
  const stop = stationIndex('skate');
  // object: để bấm thẳng vào mặt ván; preview: hình in của ván, dùng làm ảnh trong khung chi tiết
  productsIn('skate').forEach(p => addHotspot({ stop, pos: new T.Vector3(4.85, 1.95, deckZ(p.slot)), product: p, object: decks[p.slot], preview: decks[p.slot]?.material.map.image }));
}
