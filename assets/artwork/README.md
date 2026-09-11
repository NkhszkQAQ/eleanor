# 开场装饰图案

当前素材由内置 imagegen 编辑此前用户确认的图案，属于网站装饰，不是个人照片。

- `parcel-sharp.webp`：保持细缎带、小结、长尾及深酒红色，增强边缘、缎带与纸张细节。1536×1024，946,126 字节。
- `parcel-paper-sharp.webp`：由增强后的图仅移除丝带生成，包裹保持完整。1536×1024，884,466 字节。
- 生成 PNG 以 sharp 转为无损 WebP；已比较解码后的 RGB 数据，像素完全相同。没有放大插值、额外锐化滤镜或有损 JPEG 编码。请求过更大尺寸，但实际输出仍为 1536×1024，不宣称是 3K／4K 图片。
- SVG 裁切与色彩蒙版仅用来保留既有丝带移开动作；包装纸始终是完整的一层，随后整个开场淡出。首次显示时才请求图案，无外部运行时资源。

## 主图最终提示词（内置 imagegen）

Use case: precise-object-edit. Asset type: high-resolution website opening artwork. Improve ONLY the clarity and fine detail of the supplied approved ivory parcel and deep burgundy thin satin bow. Keep the EXACT same composition, scale, placement, camera angle, lighting, cream background, silhouette, knot position, loop outlines, two long tail contours, ribbon wrapping bands and colors. This image must register spatially with the input for an existing ribbon animation. Make the edges of the satin ribbon crisp, fine satin weave visible, paper folds clean and finely textured; everything on the parcel in focus, without artificial halos, grain, painted softness or oversharpening. Preserve the soft natural cast shadows in the background. Output at 3072 by 2048 pixels if supported, highest practical detail. No new objects, no text, no watermark, no redesign, no crop or zoom. The purpose is sharper viewing on high-density mobile and desktop screens, while preserving the approved design.

## 无丝带图最终提示词（内置 imagegen）

Use case: precise-object-edit. Create the aligned background plate for this website parcel animation. Remove ONLY all burgundy ribbon, bow knot, loops, wrapping bands, long tails and ribbon cast shadows. Reconstruct ivory paper beneath. Keep EXACTLY the same framing, pixel positions, angle, parcel contour, corners, folds, crisp paper texture, soft light, cast shadow and cream background. Keep the parcel CLOSED and INTACT, do not split or unfold it. No text, new objects or changes to the parcel. Preserve sharp detail and original image dimensions. This will be underlaid behind the original, so exact spatial alignment is essential.
