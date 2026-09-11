# 照片素材

01.jpg 至 18.jpg 为用户提供的 18 张 JPG，按原文件名排序导入；文件内容保持不变，未压缩、转码或修改 EXIF。合计 12,444,115 字节。ChatGPT 界面 PNG 截图按用户要求排除。

originals.json 记录原文件名、网站相对路径、显示方向的宽高、字节数和 SHA-256，可用于核对。这里的原图指用户提供的文件，不代表相机 RAW。

在 ../../content.js 的 photos 数组增删路径即可调整相册，默认每批最多追加 24 张；照片墙加载 previews/ 下的轻量 WebP，点击后查看未改动原文件。纯静态网页不会自动扫描文件夹。alt、caption 只填写用户确认的描述，目前留空。width、height 用于预留正确比例，须考虑 EXIF 方向。

照片墙的纸边和图钉由 CSS 绘制，不写入图片。目录不包含示例素材或伪媒体空文件。

previews/ 为独立有损预览副本：最大 960×1280、保持比例、WebP quality 80。content.js 每项 preview 指向对应文件；原图和 originals.json 不变。预览缺失会回退原图。
