// Lõi cảnh 3D: renderer, scene, camera và các "sổ đăng ký" dùng chung giữa các khu.
// renderer / scene / camera là biến export dạng let: module khác import sẽ thấy giá trị mới sau initCore().
import * as THREE from 'three';
import { small } from '../env.js';

export const T = THREE;
export let renderer, scene, camera;
export let maxAniso = 1;
// Đổ bóng thật (đèn rọi kệ áo). Tắt trên màn nhỏ cho nhẹ, khi đó dùng bóng giả vẽ sẵn.
export const SHADOWS = !small;

export function initCore(canvas) {
  renderer = new T.WebGLRenderer({ canvas, antialias: devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.4 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  maxAniso = renderer.capabilities.getMaxAnisotropy();
  renderer.shadowMap.enabled = SHADOWS;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  scene = new T.Scene();
  const night = new T.Color('#0f0e18');
  scene.background = night;
  scene.fog = new T.FogExp2(night, 0.03);
  camera = new T.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 120);
  return { renderer, scene, camera };
}

// Texture dùng chung giữa nhiều khu (sàn, bê tông, logo…), tạo trong textures/shared.js
export const TX = {};

// Chấm giá: { stop, pos: Vector3, product }
export const hotspots = [];
export const addHotspot = h => hotspots.push(h);

// Hiệu ứng chạy mỗi khung hình (neon nhấp nháy, cửa trượt, bụi bay…)
const frameFns = [];
export const onFrame = fn => frameFns.push(fn);
export const runFrame = (t, dt) => { for (const f of frameFns) f(t, dt); };
