// Thứ tự dựng các khu. Mỗi bước là một mục trên thanh tải.
// Muốn thêm khu mới: tạo file trong thư mục này, export một hàm build…(), rồi thêm vào danh sách.
import { buildSharedTextures } from '../textures/shared.js';
import { buildAlley } from './alley.js';
import { buildStorefront } from './storefront.js';
import { buildShell } from './shell.js';
import { buildHoodieRail } from './hoodieRail.js';
import { buildCollectionCorner } from './collectionCorner.js';
import { buildGraffitiWall } from './graffitiWall.js';
import { buildIsland } from './island.js';      // cần TX.muralCanvas từ bức graffiti, nên dựng sau
import { buildShoeWall } from './shoeWall.js';
import { buildFittingLounge } from './fittingLounge.js';
import { buildCounter } from './counter.js';
import { buildDust } from './dust.js';

export const BUILD_STEPS = [
  buildSharedTextures,
  buildAlley,
  buildStorefront,
  buildShell,
  buildHoodieRail,
  buildCollectionCorner,
  buildGraffitiWall,
  buildIsland,
  buildShoeWall,
  buildFittingLounge,
  buildCounter,
  buildDust
];
