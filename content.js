/* 只需编辑此文件；普通脚本使双击 index.html 也可使用，无需构建。 */
window.SITE_CONTENT = {
  pageTitle: "Eleanor",
  hero: {
    title: "",
    body: "",
    reserveSpace: true
  },
  // 同一浏览器仅首次展示；开场文案留空，等确认后填写。
  opening: {
    enabled: true, title: "", body: "", reserveSpace: true,
    artwork: { image: "assets/artwork/parcel-sharp.webp", paper: "assets/artwork/parcel-paper-sharp.webp" }
  },
  audio: {
    song: {
      title: "天使にふれたよ!", credit: "椎名モンブラン",
      src: "assets/audio/song-stream.mp3", volume: 0.2, autoplay: true, playAfterOpening: true,
      // Measured from the supplied MP3; update or remove when replacing the file.
      metadata: { src: "assets/audio/song-stream.mp3", duration: 182.073469 }
    }
  },
  // 九个人的录音；姓名与寄语默认留空，仅填写真实内容。
  voices: [
    { name: "", note: "", src: "assets/audio/voices/01.mp3" },
    { name: "", note: "", src: "assets/audio/voices/02.mp3" },
    { name: "", note: "", src: "assets/audio/voices/03.mp3" },
    { name: "", note: "", src: "assets/audio/voices/04.mp3" },
    { name: "", note: "", src: "assets/audio/voices/05.mp3" },
    { name: "", note: "", src: "assets/audio/voices/06.mp3" },
    { name: "", note: "", src: "assets/audio/voices/07.mp3" },
    { name: "", note: "", src: "assets/audio/voices/08.mp3" },
    { name: "", note: "", src: "assets/audio/voices/09.mp3" }
  ],
  // 照片不设张数上限；每批追加 24 张，预览图按需懒加载，点击查看原图。
  photoBatchSize: 24,
  // 增删对象即可增减照片；alt 与 caption 仅填写你提供的真实内容。
  photos: [
    { src: "assets/photos/01.jpg", preview: "assets/photos/previews/01.webp", width: 1280, height: 960, alt: "", caption: "" },
    { src: "assets/photos/02.jpg", preview: "assets/photos/previews/02.webp", width: 1024, height: 1366, alt: "", caption: "" },
    { src: "assets/photos/03.jpg", preview: "assets/photos/previews/03.webp", width: 1024, height: 1366, alt: "", caption: "" },
    { src: "assets/photos/04.jpg", preview: "assets/photos/previews/04.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/05.jpg", preview: "assets/photos/previews/05.webp", width: 1707, height: 1280, alt: "", caption: "" },
    { src: "assets/photos/06.jpg", preview: "assets/photos/previews/06.webp", width: 865, height: 1653, alt: "", caption: "" },
    { src: "assets/photos/07.jpg", preview: "assets/photos/previews/07.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/08.jpg", preview: "assets/photos/previews/08.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/09.jpg", preview: "assets/photos/previews/09.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/10.jpg", preview: "assets/photos/previews/10.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/11.jpg", preview: "assets/photos/previews/11.webp", width: 960, height: 1280, alt: "", caption: "" },
    { src: "assets/photos/12.jpg", preview: "assets/photos/previews/12.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/13.jpg", preview: "assets/photos/previews/13.webp", width: 4032, height: 3024, alt: "", caption: "" },
    { src: "assets/photos/14.jpg", preview: "assets/photos/previews/14.webp", width: 4032, height: 3024, alt: "", caption: "" },
    { src: "assets/photos/15.jpg", preview: "assets/photos/previews/15.webp", width: 3024, height: 4032, alt: "", caption: "" },
    { src: "assets/photos/16.jpg", preview: "assets/photos/previews/16.webp", width: 1280, height: 1707, alt: "", caption: "" },
    { src: "assets/photos/17.jpg", preview: "assets/photos/previews/17.webp", width: 1440, height: 1080, alt: "", caption: "" },
    { src: "assets/photos/18.jpg", preview: "assets/photos/previews/18.webp", width: 1279, height: 1706, alt: "", caption: "" }
  ],
  labels: {
    openParcel: "轻触拆开包裹", openingParcel: "正在拆开…",
    skipOpening: "跳过开场",
    home: "首页", album: "相册", openAlbum: "打开相册",
    message: "语音贺卡", music: "音乐", photos: "照片",
    play: "播放", pause: "暂停", readyAudio: "点击播放", playingAudio: "正在播放", pausedAudio: "已暂停", replay: "重新播放", retry: "重试",
    progress: "播放进度", unknownTime: "--:--",
    loading: "正在加载…", buffering: "正在缓冲…", ended: "播放结束",
    unavailableAudio: "音频暂不可用", slowAudio: "加载较慢，可重试",
    blockedAudio: "无法播放，请再次点击播放",
    seekFailed: "暂时无法跳转，请稍后重试",
    unavailablePhoto: "照片暂不可用", noPhotos: "暂无照片",
    openVoice: "打开语音贺卡", closeVoice: "关闭语音贺卡",
    previousVoice: "上一份", nextVoice: "下一份", noVoices: "暂无录音",
    loadMore: "加载更多照片",
    viewPhoto: "查看照片", close: "关闭图片查看器",
    previous: "上一张", next: "下一张", skip: "跳至内容"
  }
};
