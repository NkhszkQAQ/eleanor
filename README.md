# Eleanor 网站使用说明

这是可直接打开、可部署到 GitHub Pages 的独立静态礼物网站（统一首页 + 语音贺卡独立页 + 相册独立页）。没有后端、数据库、构建流程、外部字体或第三方脚本。默认不包含个人音频或照片，替换素材后即可展示。

## 1. 替换素材与文案

- 九个人的真实录音放到 `assets/audio/voices/01.mp3` 至 `09.mp3`；唯一一首音乐放到 `assets/audio/song.mp3`。
- 在 `content.js` 的 `voices` 数组中填写每人的 `name`、可选 `note` 与 `src`。姓名和寄语默认留空，页面只显示编号；增删对象也可改变信封数量。旧版 `audio.message` 已被 `voices` 数组替代。
- 将真实照片放到 `assets/photos/01.jpg` 至 `06.jpg`。没有文件时显示占位，播放器显示“音频暂不可用”，未知时长显示 `--:--`。
- 用文本编辑器打开 `content.js`。`hero.title` 与 `hero.body` 均留空；`hero.reserveSpace: true` 保留首页空白文案区域。开场的 `opening.title`、`opening.body` 同样留空，`opening.reserveSpace: true` 保留空白区域。只有填写经确认的真实文案后才显示文字；设为 false 可取消对应的空白预留。浏览器标签页名称仍为 Eleanor。
- `audio.song.title` 可填写歌名；留空显示“音乐”。音频路径在各自 `src` 修改。
- `photos` 数组增删对象即可增减照片，**没有固定总张数上限**，默认六个位置只是起始配置。每项支持 `src`、`alt`（无障碍描述）、`caption`（可选说明）及可选 `width`／`height`（预留原始比例）。清空数组会显示“暂无照片”。
- 照片默认每批追加 24 张，接近底部时自动追加；也可点击“加载更多照片”。`photoBatchSize` 控制每批数量（1–100），不限制总数。所有原图懒加载，查看器可切换到尚未追加缩略图的照片。实际容量取决于图片体积、设备内存与网络，不代表无限存储。
- 文件夹新增照片后仍需把相应路径加入 `photos`，纯静态网页不会自动扫描文件夹。
- `labels` 集中配置功能标签与状态提示；`pageTitle` 是浏览器标签页标题。配置均按纯文本显示，不解析 HTML。
- 三个页面都位于项目根目录，素材路径相对于当前 HTML，请使用 `assets/...` 或 `./assets/...`，不要以 `/` 开头。文件名大小写必须完全一致。
- 使用真正的 MP3 音频和 JPG／PNG／WebP 照片；不要只修改扩展名。HEIC 请先转换格式。建议压缩过大的照片以便移动网络加载。

目录中的 README 用于保留素材目录；没有空白 MP3／JPG 假文件。

## 2. 本地预览

直接双击 `index.html` 即可；无需安装依赖。也可以在本目录运行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:8080/`；终端按 Ctrl+C 停止。如果系统没有 Python，直接打开 HTML 即可。

首页使用柔和包装纸与丝带开场，轻触／点击后约 1.45 秒进入首页。同一浏览器首次展示时写入持久记录，刷新、新标签页、关闭浏览器后重新打开均不会自动重播；无重播入口。旧版会话记录会迁移，已经看过的用户无需再拆。可随时跳过或按 Esc 进入；键盘和系统“减少动态效果”直接进入。`opening.enabled` 可关闭开场，提示在 `labels` 配置，开场不自动播放音乐。记录仅存于当前浏览器：换设备、无痕窗口或清除网站数据会视为首次；若持久存储被禁用，会尝试会话记录，全部存储被禁用时无法保证跨次记忆，但仍可正常进入网站。

只需分享首页的一个网址。首页 `index.html` 放置音乐、语音贺卡入口和相册入口；`voices.html` 是独立的九人语音贺卡页，`photos.html` 是独立相册页，两页都有返回首页链接。点击信封才加载对应录音；打开信封不自动播放。开始录音时会暂停音乐；切换信封或关闭信纸会暂停旧录音。三个页面使用同一首歌，跳转页面与浏览器返回后不会自动续播。点击进度条、拖动滑块或聚焦滑块后按方向键调整进度。进度和时长来自浏览器实际媒体状态；文件不可用时可以重试，持续加载超过 15 秒会提供重试提示。

信纸可以用上一份／下一份按钮或左右键切换；焦点位于音频进度条时，左右键只调整进度。Esc、关闭按钮或遮罩可关闭并恢复焦点。

点击照片打开查看器；前后按钮或左右方向键循环切换。Esc、关闭按钮或图片区域之外的遮罩可关闭。Tab 在查看器按钮间循环，关闭后返回原照片按钮和原滚动位置。只有一张照片时前后按钮禁用。

## 3. GitHub Pages 最短部署步骤

1. 解压 ZIP，把**解压后的内容**放入你选择的 GitHub 仓库的 `main` 分支根目录：根目录应直接看到 `index.html`、`voices.html`、`photos.html`、`styles.css`、`script.js`、`content.js`、`.nojekyll` 与 `assets/`。不要在仓库根目录再套一层 `memorial-site/`。替换好素材后提交上传。
2. 仓库 **Settings → Pages → Build and deployment → Source → Deploy from a branch**；选择 **main** 和 **/(root)**，点击 **Save**。
3. 等待 Pages 发布任务成功，打开 Settings → Pages 给出的网站地址。项目站点通常是 `https://你的用户名.github.io/仓库名/`。首次上线后再核对真实音频与照片。

以上步骤依据 [GitHub 官方发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) 和 [入口文件要求](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。本项目使用相对路径并包含 `.nojekyll`，无需 npm、构建命令或环境变量。

## 验证与兼容范围

本轮重设计的实际执行结果见 `VERIFICATION.md`。推荐使用支持原生 `<dialog>` 的现代 Chrome、Edge、Safari 或 Firefox。最终个人素材替换后应重新检查；浏览器响应式测试不等同于真机验收。
