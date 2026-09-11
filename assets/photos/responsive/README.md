# 自适应照片预览

每张照片提供 480px 和最多 960px 宽的 AVIF（原文件更窄时不放大），保留原始比例与 EXIF 显示方向。由对应原图生成，Sharp AVIF quality 50 / effort 6 / 4:2:0；没有裁切、修图或改动原文件。

content.js 中 previewAvif 是包含实际宽度描述符的 srcset；浏览器依据页面尺寸和像素密度选择。原有 previews/*.webp 继续用于不支持 AVIF 或 AVIF 请求失败时的回退，WebP 失败则回退原图。没有把图片嵌入脚本或 HTML。

所有 480px 版本共 296,159 字节，所有大尺寸版本共 909,647 字节（不同屏幕会选择其中一种，不会同时请求两套）。新增或替换图片时同步更新 src、preview 和 previewAvif；可省略 previewAvif，继续仅使用 WebP／原图。
