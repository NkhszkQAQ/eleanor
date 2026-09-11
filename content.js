/* 只需编辑此文件；普通脚本使双击 index.html 也可使用，无需构建。 */
window.SITE_CONTENT = {
  pageTitle: "语音贺卡 · 音乐 · 照片",
  hero: {
    title: "",
    body: ""
  },
  audio: {
    message: { title: "语音贺卡", src: "assets/audio/message.mp3" },
    song: { title: "", src: "assets/audio/song.mp3" }
  },
  // 增删对象即可增减照片；alt 与 caption 仅填写你提供的真实内容。
  photos: [
    { src: "assets/photos/01.jpg", alt: "", caption: "" },
    { src: "assets/photos/02.jpg", alt: "", caption: "" },
    { src: "assets/photos/03.jpg", alt: "", caption: "" },
    { src: "assets/photos/04.jpg", alt: "", caption: "" },
    { src: "assets/photos/05.jpg", alt: "", caption: "" },
    { src: "assets/photos/06.jpg", alt: "", caption: "" }
  ],
  labels: {
    message: "语音贺卡", music: "音乐", photos: "照片",
    play: "播放", pause: "暂停", replay: "重新播放", retry: "重试",
    progress: "播放进度", unknownTime: "--:--",
    loading: "正在加载…", buffering: "正在缓冲…", ended: "播放结束",
    unavailableAudio: "音频暂不可用", slowAudio: "加载较慢，可重试",
    blockedAudio: "无法播放，请再次点击播放",
    seekFailed: "暂时无法跳转，请稍后重试",
    unavailablePhoto: "照片暂不可用", noPhotos: "暂无照片",
    viewPhoto: "查看照片", close: "关闭图片查看器",
    previous: "上一张", next: "下一张", skip: "跳至内容"
  }
};
