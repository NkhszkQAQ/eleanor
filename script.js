(() => {
  "use strict";
  const config = window.SITE_CONTENT;
  const labels = config.labels;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const icons = {
    play: '<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="4"/>',
    message: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    song: '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    photo: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    previous: '<path d="m14 6-6 6 6 6"/>',
    next: '<path d="m10 6 6 6-6 6"/>'
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
  const text = (value) => typeof value === "string" ? value.trim() : "";
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return labels.unknownTime;
    const value = Math.floor(seconds);
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor(value / 60) % 60;
    const remainder = String(value % 60).padStart(2, "0");
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
  };

  document.title = text(config.pageTitle) || [labels.message, labels.music, labels.photos].join(" · ");
  $(".skip-link").textContent = labels.skip;
  const heroTitle = text(config.hero?.title);
  const heroBody = text(config.hero?.body);
  $("#hero").hidden = !heroTitle && !heroBody;
  $("#hero-title").textContent = heroTitle;
  $("#hero-title").hidden = !heroTitle;
  $("#hero-body").textContent = heroBody;
  $("#hero-body").hidden = !heroBody;

  const players = [];
  let activePlayer = null;
  function createPlayer(key, fallbackTitle) {
    const settings = config.audio?.[key] || {};
    const title = text(settings.title) || fallbackTitle;
    const src = text(settings.src);
    const card = document.createElement("section");
    card.className = `player player--${key}`;
    card.setAttribute("aria-labelledby", `${key}-title`);
    // Markup below is fixed UI only. All configurable text is assigned with textContent.
    card.innerHTML = `<div class="player-header"><div class="player-art" aria-hidden="true">${icon(key)}</div><h2 id="${key}-title"></h2></div>
      <div class="player-controls"><button class="play-button" type="button" aria-pressed="false"></button>
      <div class="timeline"><input class="seek" type="range" min="0" max="0" value="0" step="0.1" disabled>
      <div class="times"><span class="elapsed"></span><span class="duration"></span></div></div></div>
      <p class="player-status" id="${key}-status" role="status"></p>`;
    $("h2", card).textContent = title;
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    card.append(audio);
    $("#players").append(card);
    const button = $(".play-button", card);
    const seek = $(".seek", card);
    const status = $(".player-status", card);
    button.setAttribute("aria-describedby", status.id);
    seek.setAttribute("aria-label", `${title} · ${labels.progress}`);
    let request = 0;
    let pending = false;
    let failed = false;
    let watchdog = null;
    const clearWatchdog = () => { clearTimeout(watchdog); watchdog = null; };
    const setStatus = (value) => { status.textContent = value; };
    const validDuration = () => !failed && Number.isFinite(audio.duration) && audio.duration > 0;
    function renderButton() {
      const playing = !audio.paused && !audio.ended;
      const action = failed ? labels.retry : playing || pending ? labels.pause : audio.ended ? labels.replay : labels.play;
      button.innerHTML = icon(playing || pending ? "pause" : "play");
      button.setAttribute("aria-label", `${action} · ${title}`);
      button.setAttribute("aria-pressed", String(playing));
      button.title = action;
    }
    function renderProgress() {
      const available = validDuration();
      const current = failed ? NaN : audio.currentTime;
      $(".elapsed", card).textContent = available ? formatTime(current) : labels.unknownTime;
      $(".duration", card).textContent = available ? formatTime(audio.duration) : labels.unknownTime;
      seek.disabled = !available;
      seek.max = available ? String(audio.duration) : "0";
      seek.value = available ? String(Math.min(current, audio.duration)) : "0";
      seek.style.setProperty("--progress", available ? `${Math.min(100, current / audio.duration * 100)}%` : "0%");
      seek.setAttribute("aria-valuetext", available ? `${formatTime(current)} / ${formatTime(audio.duration)}` : labels.unknownTime);
    }
    function stop() {
      request++;
      pending = false;
      clearWatchdog();
      audio.pause();
      if (activePlayer === player) activePlayer = null;
      if (!failed) setStatus("");
      renderButton();
    }
    function fail(message) {
      stop();
      failed = true;
      setStatus(message);
      renderButton();
      renderProgress();
    }
    function watchLoading() {
      clearWatchdog();
      watchdog = setTimeout(() => {
        if (audio.readyState < 3) fail(labels.slowAudio);
      }, 15000);
    }
    const player = { audio, stop };
    players.push(player);
    button.addEventListener("click", async () => {
      if (pending || !audio.paused) { stop(); return; }
      players.forEach((other) => { if (other !== player) other.stop(); });
      activePlayer = player;
      const attempt = ++request;
      if (!src) { fail(labels.unavailableAudio); return; }
      if (failed || audio.error) {
        failed = false;
        audio.src = src;
        audio.load();
      }
      if (audio.ended) audio.currentTime = 0;
      pending = true;
      setStatus(labels.loading);
      renderButton();
      watchLoading();
      try {
        await audio.play();
        if (attempt !== request || activePlayer !== player) return;
        pending = false;
        clearWatchdog();
        setStatus("");
        renderButton();
      } catch (error) {
        if (attempt !== request) return;
        pending = false;
        clearWatchdog();
        if (error.name === "NotAllowedError") { stop(); setStatus(labels.blockedAudio); }
        else if (error.name !== "AbortError") fail(labels.unavailableAudio);
        else { stop(); }
        renderButton();
      }
    });
    audio.addEventListener("play", () => {
      if (activePlayer !== player) { audio.pause(); return; }
      players.forEach((other) => { if (other !== player) other.stop(); });
      renderButton();
    });
    audio.addEventListener("playing", () => { pending = false; clearWatchdog(); setStatus(""); renderButton(); });
    audio.addEventListener("pause", () => { pending = false; clearWatchdog(); renderButton(); });
    audio.addEventListener("ended", () => {
      pending = false;
      if (activePlayer === player) activePlayer = null;
      clearWatchdog();
      setStatus(labels.ended);
      renderButton();
      renderProgress();
    });
    audio.addEventListener("error", () => fail(labels.unavailableAudio));
    audio.addEventListener("waiting", () => { if (!audio.paused) { setStatus(labels.buffering); watchLoading(); } });
    audio.addEventListener("stalled", () => { if (!audio.paused) { setStatus(labels.buffering); watchLoading(); } });
    audio.addEventListener("loadedmetadata", () => { failed = false; renderProgress(); });
    ["durationchange", "timeupdate", "seeked", "emptied"].forEach((event) => audio.addEventListener(event, renderProgress));
    seek.addEventListener("input", () => {
      if (!validDuration()) return;
      try { audio.currentTime = Math.max(0, Math.min(Number(seek.value), audio.duration)); }
      catch { setStatus(labels.seekFailed); }
      renderProgress();
    });
    renderButton();
    renderProgress();
    if (src) audio.src = src;
    else fail(labels.unavailableAudio);
  }
  createPlayer("message", labels.message);
  createPlayer("song", labels.music);

  const photos = Array.isArray(config.photos) ? config.photos.filter((photo) => photo && typeof photo === "object") : [];
  const grid = $("#photo-grid");
  $("#photos-heading").textContent = labels.photos;
  $("#photo-count").textContent = String(photos.length).padStart(2, "0");
  $("#photos-empty").textContent = labels.noPhotos;
  $("#photos-empty").hidden = photos.length > 0;
  photos.forEach((photo, index) => {
    const figure = document.createElement("figure");
    figure.className = "photo";
    const button = document.createElement("button");
    button.className = "photo-button";
    button.type = "button";
    button.setAttribute("aria-label", `${labels.viewPhoto} ${index + 1}`);
    button.setAttribute("aria-haspopup", "dialog");
    button.innerHTML = `<span class="photo-placeholder" aria-hidden="true">${icon("photo")}<span></span></span><span class="photo-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>`;
    const placeholder = $(".photo-placeholder", button);
    $("span", placeholder).textContent = labels.loading;
    const img = document.createElement("img");
    img.alt = text(photo.alt);
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", () => { placeholder.hidden = true; button.classList.add("is-loaded"); });
    img.addEventListener("error", () => { img.hidden = true; $("span", placeholder).textContent = labels.unavailablePhoto; });
    button.prepend(img);
    if (text(photo.src)) img.src = photo.src;
    else { img.hidden = true; $("span", placeholder).textContent = labels.unavailablePhoto; }
    button.addEventListener("click", () => openViewer(index, button));
    figure.append(button);
    if (text(photo.caption)) {
      const caption = document.createElement("figcaption");
      caption.textContent = photo.caption;
      figure.append(caption);
    }
    grid.append(figure);
  });

  const viewer = $("#viewer");
  const stage = $("#viewer-stage");
  const viewerStatus = $("#viewer-status");
  const closeButton = $("#viewer-close");
  const previousButton = $("#viewer-prev");
  const nextButton = $("#viewer-next");
  let currentPhoto = 0;
  let photoRequest = 0;
  let returnFocus = null;
  let savedScroll = 0;
  let savedBodyStyle = null;
  $("#viewer-title").textContent = labels.photos;
  [[closeButton, "close", labels.close], [previousButton, "previous", labels.previous], [nextButton, "next", labels.next]].forEach(([button, name, label]) => {
    button.innerHTML = icon(name);
    button.setAttribute("aria-label", label);
    button.title = label;
  });
  function showPhoto(index) {
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];
    const attempt = ++photoRequest;
    $("img", stage)?.remove();
    viewerStatus.hidden = false;
    viewerStatus.textContent = labels.loading;
    stage.setAttribute("aria-busy", "true");
    $("#viewer-counter").textContent = `${currentPhoto + 1} / ${photos.length}`;
    $("#viewer-caption").textContent = text(photo.caption);
    $("#viewer-caption").hidden = !text(photo.caption);
    previousButton.disabled = nextButton.disabled = photos.length < 2;
    const img = new Image();
    img.alt = text(photo.alt) || `${labels.photos} ${currentPhoto + 1}`;
    img.hidden = true;
    img.decoding = "async";
    img.onload = () => {
      if (attempt !== photoRequest || !viewer.open) return;
      img.hidden = false;
      viewerStatus.hidden = true;
      stage.setAttribute("aria-busy", "false");
    };
    img.onerror = () => {
      if (attempt !== photoRequest || !viewer.open) return;
      img.hidden = true;
      viewerStatus.textContent = labels.unavailablePhoto;
      stage.setAttribute("aria-busy", "false");
    };
    stage.append(img);
    if (text(photo.src)) img.src = photo.src;
    else img.onerror();
  }
  function openViewer(index, trigger) {
    if (!photos.length || viewer.open) return;
    returnFocus = trigger;
    savedScroll = window.scrollY;
    savedBodyStyle = document.body.getAttribute("style");
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    Object.assign(document.body.style, { position: "fixed", top: `-${savedScroll}px`, width: "100%", overflow: "hidden", paddingRight: `${scrollbar}px` });
    viewer.showModal();
    showPhoto(index);
    closeButton.focus({ preventScroll: true });
  }
  function closeViewer() { if (viewer.open) viewer.close(); }
  viewer.addEventListener("close", () => {
    photoRequest++;
    $("img", stage)?.remove();
    if (savedBodyStyle === null) document.body.removeAttribute("style");
    else document.body.setAttribute("style", savedBodyStyle);
    window.scrollTo(0, savedScroll);
    returnFocus?.focus({ preventScroll: true });
  });
  closeButton.addEventListener("click", closeViewer);
  previousButton.addEventListener("click", () => showPhoto(currentPhoto - 1));
  nextButton.addEventListener("click", () => showPhoto(currentPhoto + 1));
  let backdropPress = false;
  viewer.addEventListener("pointerdown", (event) => { backdropPress = event.target === viewer; });
  viewer.addEventListener("click", (event) => { if (backdropPress && event.target === viewer) closeViewer(); backdropPress = false; });
  viewer.addEventListener("cancel", (event) => { event.preventDefault(); closeViewer(); });
  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(currentPhoto + (event.key === "ArrowRight" ? 1 : -1));
    }
    if (event.key === "Tab") {
      const controls = [closeButton, previousButton, nextButton].filter((button) => !button.disabled);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("pagehide", () => { players.forEach((player) => player.stop()); closeViewer(); });
})();
