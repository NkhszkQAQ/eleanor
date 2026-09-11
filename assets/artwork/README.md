# 开场装饰图案

- `parcel-approved.jpg`：用户确认的生成预览，细缎带、小结、长尾、深酒红色，奶油白包装纸；不是个人照片。
- `parcel-paper.jpg`：基于确认图仅移除丝带生成的对齐底图，供展开动画使用。
- 两张图均由内置 imagegen 生成，1536×1024，使用 sips 转为 JPEG（质量 88）以控制网页体积；未改变确认图构图。主图 167,140 字节，底图 138,487 字节。
- 页面在原图上通过 SVG viewBox 显示包裹，通过裁切、色彩透明蒙版和 CSS 位移／淡出实现分层动画；静止时展示完整确认图。
- 未包含网络参考图或此前 Microsoft Fluent UI Emoji 图形。运行时无需外部服务。

## 底图生成使用的最终提示词

Precise object removal edit for an animation background plate. In the supplied approved gift image, remove ONLY all dark burgundy ribbon: both loops, central knot, both long tails, horizontal and vertical wrapping bands, and the shadows cast by the ribbon. Inpaint the ivory paper and cream backdrop underneath. Preserve EXACTLY the gift package's size, angle, position, corners, folds, paper texture, surrounding background, lighting and the package's own shadow. Do not move or rotate the parcel. Keep the same 1536 by 1024 composition. The result must be the exact same closed ivory-paper parcel without any ribbon, on the exact same cream background. No text, no additional objects, no holes, do not open the paper. This will be aligned underneath the original image for a ribbon-removal and paper-unwrapping animation, so composition registration matters.
