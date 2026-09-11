# 静态网站使用说明

这是可直接打开、可部署到 GitHub Pages 的独立单页项目。没有后端、数据库、构建流程、外部字体或第三方脚本。默认不包含个人音频或照片，替换素材后即可展示。

## 1. 替换素材与文案

- 将真实语音放到 `assets/audio/message.mp3`，音乐放到 `assets/audio/song.mp3`。
- 将真实照片放到 `assets/photos/01.jpg` 至 `06.jpg`。没有文件时显示占位，播放器显示“音频暂不可用”，未知时长显示 `--:--`。
- 用文本编辑器打开 `content.js`。`hero.title` 与 `hero.body` 默认留空，对应元素隐藏；任意一项填写后只显示该项。
- `audio.song.title` 可填写歌名；留空显示“音乐”。音频路径在各自 `src` 修改。
- `photos` 数组增删对象即可增减照片。每项支持 `src`、`alt`（无障碍描述）与 `caption`（可选显示说明）。照片及说明均未预设虚构内容。清空数组会显示“暂无照片”。
- `labels` 集中配置功能标签与状态提示；`pageTitle` 是浏览器标签页标题。配置均按纯文本显示，不解析 HTML。
- 路径相对于 `index.html`，请使用 `assets/...` 或 `./assets/...`，不要以 `/` 开头。文件名大小写必须完全一致。
- 使用真正的 MP3 音频和 JPG／PNG／WebP 照片；不要只修改扩展名。HEIC 请先转换格式。建议压缩过大的照片以便移动网络加载。

目录中的 README 用于保留素材目录；没有空白 MP3／JPG 假文件。

## 2. 本地预览

直接双击 `index.html` 即可；无需安装依赖。也可以在本目录运行：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:8080/`；终端按 Ctrl+C 停止。如果系统没有 Python，直接打开 HTML 即可。

两段音频均需手动播放，开始一段会暂停另一段；没有自动续播。点击进度条、拖动滑块或聚焦滑块后按方向键调整进度。进度和时长来自浏览器实际媒体状态；文件不可用时可以重试，持续加载超过 15 秒会提供重试提示。

点击照片打开查看器；前后按钮或左右方向键循环切换。Esc、关闭按钮或图片区域之外的遮罩可关闭。Tab 在查看器按钮间循环，关闭后返回原照片按钮和原滚动位置。只有一张照片时前后按钮禁用。

## 3. GitHub Pages 最短部署步骤

1. 解压 ZIP，把**解压后的内容**放入你选择的 GitHub 仓库的 `main` 分支根目录：根目录应直接看到 `index.html`、`styles.css`、`script.js`、`content.js`、`.nojekyll` 与 `assets/`。不要在仓库根目录再套一层 `memorial-site/`。替换好素材后提交上传。
2. 仓库 **Settings → Pages → Build and deployment → Source → Deploy from a branch**；选择 **main** 和 **/(root)**，点击 **Save**。
3. 等待 Pages 发布任务成功，打开 Settings → Pages 给出的网站地址。项目站点通常是 `https://你的用户名.github.io/仓库名/`。首次上线后再核对真实音频与照片。

以上步骤依据 [GitHub 官方发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) 和 [入口文件要求](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。本项目使用相对路径并包含 `.nojekyll`，无需 npm、构建命令或环境变量。

## 验证与兼容范围

首次本地执行结果见 `VERIFICATION.md`。推荐使用支持原生 `<dialog>` 的现代 Chrome、Edge、Safari 或 Firefox。最终个人素材替换后应重新检查；浏览器响应式测试不等同于真机验收。
