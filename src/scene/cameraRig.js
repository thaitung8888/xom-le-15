// Đường bay của camera qua các trạm, cộng thêm chút liếc theo chuột.
import { T, camera, renderer } from './core.js';
import { reduce } from '../env.js';

export function createCameraRig(stations) {
  const N = stations.length;
  // Màn hình dọc (điện thoại) dùng cameraPortrait nếu trạm có khai báo, ví dụ lùi xa hơn để thấy đủ dãy áo
  let posCurve, lookCurve, portrait = null;
  function build(p) {
    if (p === portrait) return;
    portrait = p;
    const cam = s => (p && s.cameraPortrait) || s.camera;
    posCurve = new T.CatmullRomCurve3(stations.map(s => new T.Vector3(...cam(s).pos)), false, 'centripetal');
    lookCurve = new T.CatmullRomCurve3(stations.map(s => new T.Vector3(...cam(s).look)), false, 'centripetal');
  }
  build(innerWidth / innerHeight < 0.8);
  const p = new T.Vector3(), l = new T.Vector3(), fwd = new T.Vector3(), right = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
  let mx = 0, my = 0, smx = 0, smy = 0;

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
  });

  function place(progress) {
    const t = progress / (N - 1);
    posCurve.getPoint(t, p); lookCurve.getPoint(t, l);
    if (!reduce) {
      smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
      fwd.subVectors(l, p).normalize(); right.crossVectors(fwd, UP).normalize();
      const d = p.distanceTo(l);
      l.addScaledVector(right, smx * d * 0.09).addScaledVector(UP, -smy * d * 0.05);
    }
    camera.position.copy(p); camera.lookAt(l);
  }

  // Màn hình dọc thì mở góc nhìn rộng hơn
  function fit() {
    const a = innerWidth / innerHeight;
    build(a < 0.8);
    camera.aspect = a; camera.fov = a < 0.8 ? 72 : a < 1.2 ? 62 : 55; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', fit);

  return { place, fit };
}
