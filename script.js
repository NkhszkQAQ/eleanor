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

  const pageType = document.body.dataset.page;
  const pageLabels = { home: labels.home, voices: labels.message, photos: labels.album };
  const siteName = text(config.pageTitle);
  document.title = pageType === "home" ? siteName || labels.home : [pageLabels[pageType], siteName].filter(Boolean).join(" · ");
  $(".site-mark").setAttribute("aria-label", labels.home);
  $(".skip-link").textContent = labels.skip;
  document.querySelectorAll("[data-label]").forEach((node) => { node.textContent = labels[node.dataset.label]; });
  document.querySelectorAll("[data-nav]").forEach((node) => {
    node.textContent = pageLabels[node.dataset.nav];
    if (node.dataset.nav === pageType) node.setAttribute("aria-current", "page");
  });
  document.addEventListener("keydown", () => { document.documentElement.dataset.input = "keyboard"; });
  document.addEventListener("pointerdown", () => { document.documentElement.dataset.input = "pointer"; });
  const voices = Array.isArray(config.voices) ? config.voices.filter((item) => item && typeof item === "object") : [];
  const photos = Array.isArray(config.photos) ? config.photos.filter((item) => item && typeof item === "object") : [];
  const number = (value) => String(value).padStart(2, "0");
  const players = [];
  let activePlayer = null;
  function createPlayer(key, settings, mount, variant = "voice") {
    const title = text(settings.title) || (variant === "song" ? labels.music : labels.message);
    const src = text(settings.src);
    const metadata = settings.metadata;
    // This is a measured file fact, not an invented live media duration.
    const knownDuration = variant === "song" && metadata?.src === src && Number.isFinite(metadata.duration) && metadata.duration > 0 ? metadata.duration : NaN;
    const card = document.createElement("section");
    card.className = `player player--${variant}`;
    card.setAttribute("aria-labelledby", `${key}-title`);
    // Markup below is fixed UI only. All configurable text is assigned with textContent.
    card.innerHTML = `<div class="player-header"><div class="player-art" aria-hidden="true">${icon(variant === "song" ? "song" : "message")}</div><div class="player-track-info"><h2 id="${key}-title"></h2><p class="player-credit" hidden></p></div></div>
      <div class="player-controls"><button class="play-button" type="button" aria-pressed="false"></button>
      <div class="timeline"><input class="seek" type="range" min="0" max="0" value="0" step="0.1" disabled>
      <div class="times"><span class="elapsed"></span><span class="duration"></span></div></div></div>
      <p class="player-status" id="${key}-status" role="status"></p>`;
    $("h2", card).textContent = title;
    const credit = text(settings.credit);
    $(".player-credit", card).textContent = credit;
    $(".player-credit", card).hidden = !credit;
    const audio = document.createElement("audio");
    audio.preload = "none";
    card.append(audio);
    mount.append(card);
    const button = $(".play-button", card);
    const seek = $(".seek", card);
    const status = $(".player-status", card);
    button.setAttribute("aria-describedby", status.id);
    seek.setAttribute("aria-label", `${title} · ${labels.progress}`);
    const level = variant === "song" && Number.isFinite(settings.volume) ? Math.max(0, Math.min(1, settings.volume)) : 1;
    audio.volume = level;
    let output = null;
    let silent = false;
    // GainNode also controls quiet playback on mobile browsers that ignore audio.volume.
    // Keep file:// on native audio: opaque file origins cannot reliably feed Web Audio.
    function prepareOutput() {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (variant !== "song" || output || !Context || location.protocol === "file:") return;
      const context = new Context();
      const gain = context.createGain();
      gain.gain.value = silent ? 0 : level;
      const source = context.createMediaElementSource(audio);
      source.connect(gain);
      gain.connect(context.destination);
      output = { context, gain };
      audio.volume = 1;
    }
    function setLevel(quiet, fade = false) {
      silent = quiet;
      if (output) {
        const { context, gain } = output;
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(quiet || fade ? 0 : level, context.currentTime);
        if (!quiet && fade) gain.gain.linearRampToValueAtTime(level, context.currentTime + 0.6);
        audio.muted = false;
      } else {
        audio.volume = level;
        audio.muted = quiet;
      }
    }
    let request = 0;
    let pending = false;
    let failed = false;
    let hasStarted = false;
    let watchdog = null;
    const clearWatchdog = () => { clearTimeout(watchdog); watchdog = null; };
    const setStatus = (value) => {
      const resting = variant === "song" ? (audio.ended ? labels.ended : pending ? labels.loading : !audio.paused ? labels.playingAudio : hasStarted ? labels.pausedAudio : labels.readyAudio) : "";
      status.textContent = value || resting;
    };
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
      const preview = !failed && Number.isFinite(knownDuration);
      $(".elapsed", card).textContent = available ? formatTime(current) : preview ? formatTime(0) : labels.unknownTime;
      $(".duration", card).textContent = available ? formatTime(audio.duration) : preview ? formatTime(knownDuration) : labels.unknownTime;
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
        if (output && output.context.state !== "running") { stop(); setStatus(labels.blockedAudio); }
        else if (audio.readyState < 3) fail(labels.slowAudio);
      }, 15000);
    }
    const player = { audio, stop, card, play: start, reveal() {
      if (activePlayer !== player || failed) return;
      // Playback was unlocked silently by the opening gesture; let the song start here.
      if (silent) { try { audio.currentTime = 0; } catch { /* Metadata may still be loading. */ } }
      setLevel(false, true);
    }, prepare() {
      if (audio.preload === "none") { audio.preload = "metadata"; audio.load(); }
    } };
    players.push(player);
    button.addEventListener("click", () => {
      if (pending || !audio.paused) { stop(); return; }
      start();
    });
    async function start({ silent: quiet = false } = {}) {
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
        silent = quiet;
        prepareOutput();
        setLevel(quiet);
        // Both calls occur within the user gesture, before any await or animation timer.
        const resume = output ? output.context.resume() : Promise.resolve();
        const playback = audio.play();
        await Promise.all([resume, playback]);
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
    }
    audio.addEventListener("play", () => {
      if (activePlayer !== player) { audio.pause(); return; }
      hasStarted = true;
      players.forEach((other) => { if (other !== player) other.stop(); });
      renderButton();
    });
    audio.addEventListener("playing", () => {
      if (output && output.context.state !== "running") return;
      pending = false; clearWatchdog(); setStatus(""); renderButton();
    });
    audio.addEventListener("pause", () => {
      pending = false; clearWatchdog();
      if (!failed && [labels.playingAudio, labels.buffering].includes(status.textContent)) setStatus("");
      renderButton();
    });
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
    setStatus("");
    if (src) audio.src = src;
    else fail(labels.unavailableAudio);
    return player;
  }

  // Native dialog supplies background inertness. Restore synchronously as well as
  // on close, so rapid close/reopen cannot retain a fixed body or stale focus.
  function modal(dialog, closeButton, onClose, onStep) {
    let trigger = null;
    let scroll = 0;
    let bodyStyle = null;
    let locked = false;
    function restore() {
      if (!locked) return;
      locked = false;
      onClose();
      if (bodyStyle === null) document.body.removeAttribute("style");
      else document.body.setAttribute("style", bodyStyle);
      window.scrollTo(0, scroll);
      trigger?.focus({ preventScroll: true });
    }
    function close() { if (dialog.open) dialog.close(); restore(); }
    closeButton.addEventListener("click", close);
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    dialog.addEventListener("close", () => { if (!dialog.open) restore(); });
    let backdrop = false;
    dialog.addEventListener("pointerdown", (event) => { backdrop = event.target === dialog; });
    dialog.addEventListener("click", (event) => { if (backdrop && event.target === dialog) close(); backdrop = false; });
    dialog.addEventListener("keydown", (event) => {
      // Range arrows always belong to the audio slider, never to letter navigation.
      if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && event.target.tagName !== "INPUT") {
        event.preventDefault();
        onStep(event.key === "ArrowRight" ? 1 : -1);
      }
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll("button, input, a[href]")].filter((node) => !node.disabled && node.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    return {
      close,
      open(source) {
        if (dialog.open) return;
        trigger = source;
        scroll = window.scrollY;
        bodyStyle = document.body.getAttribute("style");
        const gap = window.innerWidth - document.documentElement.clientWidth;
        Object.assign(document.body.style, { position: "fixed", top: `-${scroll}px`, width: "100%", overflow: "hidden", paddingRight: `${gap}px` });
        locked = true;
        dialog.showModal();
        closeButton.focus({ preventScroll: true });
      }
    };
  }
  const songPlayer = createPlayer("song", config.audio?.song || {}, $("#music-player"), "song");
  const openModals = [];
  if (pageType === "home") setupHome();
  if (pageType === "photos") setupPhotos();
  if (pageType === "voices") setupVoices();
  window.addEventListener("pagehide", () => { players.forEach((player) => player.stop()); openModals.forEach((item) => item.close()); });

  function setupVoices() {
    $("#voice-count").textContent = number(voices.length);
    $("#voices-empty").textContent = labels.noVoices;
    $("#voices-empty").hidden = voices.length > 0;
    const dialog = $("#letter-dialog");
    const close = $("#letter-close");
    close.innerHTML = icon("close");
    close.setAttribute("aria-label", labels.closeVoice);
    const previous = $("#letter-prev"), next = $("#letter-next");
    previous.textContent = labels.previousVoice;
    next.textContent = labels.nextVoice;
    previous.disabled = next.disabled = voices.length < 2;
    const recordings = new Map();
    let current = 0;
    const controller = modal(dialog, close, () => recordings.forEach((item) => item.stop()), (direction) => show(current + direction));
    openModals.push(controller);
    function show(index) {
      if (!voices.length) return;
      current = (index + voices.length) % voices.length;
      recordings.forEach((item) => { item.stop(); item.card.hidden = true; });
      const entry = voices[current];
      const title = text(entry.name) || `${labels.message} ${number(current + 1)}`;
      $("#letter-title").textContent = title;
      $("#letter-number").textContent = number(current + 1);
      $("#letter-counter").textContent = `${current + 1} / ${voices.length}`;
      $("#letter-note").textContent = text(entry.note);
      $("#letter-note").hidden = !text(entry.note);
      if (!recordings.has(current)) recordings.set(current, createPlayer(`voice-${current + 1}`, { title, src: entry.src }, $("#voice-players")));
      const player = recordings.get(current);
      player.card.hidden = false;
      player.prepare();
    }
    previous.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    voices.forEach((entry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "voice-envelope";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-label", `${labels.openVoice} ${number(index + 1)}${text(entry.name) ? ` · ${text(entry.name)}` : ""}`);
      button.innerHTML = `<span class="envelope-face" aria-hidden="true"><span class="envelope-fold"></span><span class="envelope-stamp">${number(index + 1)}</span><span class="wax-seal">${icon("message")}</span></span><span class="envelope-meta"><span class="envelope-name"></span><span class="envelope-open" aria-hidden="true">↗</span></span>`;
      $(".envelope-name", button).textContent = text(entry.name) || number(index + 1);
      button.addEventListener("click", () => { controller.open(button); show(index); });
      $("#voice-grid").append(button);
    });
  }

  function setupHome() {
    const heroTitle = text(config.hero?.title), heroBody = text(config.hero?.body);
    $("#hero").hidden = !heroTitle && !heroBody && !config.hero?.reserveSpace;
    $("#hero").classList.toggle("reserved-copy", !heroTitle && !heroBody && !!config.hero?.reserveSpace);
    $("#hero-title").textContent = heroTitle;
    $("#hero-title").hidden = !heroTitle;
    $("#hero-body").textContent = heroBody;
    $("#hero-body").hidden = !heroBody;
    $("#voice-entry-count").textContent = number(voices.length);
    $(".letter-entry").setAttribute("aria-label", `${labels.openVoice} · ${voices.length}`);
    setupOpening();
    $("#album-entry-count").textContent = number(photos.length);
    $(".album-entry").setAttribute("aria-label", `${labels.openAlbum} · ${photos.length}`);
  }

  function setupOpening() {
    const dialog = $("#parcel-dialog");
    if (!config.opening?.enabled || typeof dialog?.showModal !== "function") return;
    const openButton = $("#parcel-open"), hint = $("#parcel-hint");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Persist first-visit state per site directory, including Pages subpaths.
    const directory = new URL(".", window.location.href).pathname;
    const key = `parcel-opened:v1:${directory}`;
    // The Pages repository was renamed; keep existing visitors past the opening.
    const visitKeys = directory === "/eleanor/" ? [key, "parcel-opened:v1:/memorial-site/"] : [key];
    let opening = false, finishTimer = null, loadTimer = null;
    let artReady = false, paperReady = false, musicPrepared = false;
    const title = text(config.opening.title), body = text(config.opening.body);
    $("#parcel-heading").textContent = title;
    $("#parcel-heading").hidden = !title;
    $("#opening-body").textContent = body;
    $("#opening-body").hidden = !body;
    $("#opening-copy").hidden = !title && !body && !config.opening.reserveSpace;
    $("#opening-copy").classList.toggle("reserved-copy", !title && !body && !!config.opening.reserveSpace);
    dialog.setAttribute("aria-label", labels.openParcel);
    function remember() {
      try { localStorage.setItem(key, "yes"); } catch { /* Storage may be blocked. */ }
      try { sessionStorage.setItem(key, "yes"); } catch { /* Optional fallback. */ }
    }
    openButton.setAttribute("aria-label", labels.openParcel);
    const controller = modal(dialog, $("#parcel-skip"), () => {
      clearTimeout(finishTimer);
      clearTimeout(loadTimer);
      opening = false;
      dialog.classList.remove("is-unwrapping");
      openButton.removeAttribute("aria-disabled");
      hint.textContent = labels.openParcel;
      if (musicPrepared) {
        if (document.hidden) songPlayer.stop();
        else songPlayer.reveal();
        musicPrepared = false;
      }
      remember();
    }, () => {});
    openModals.push(controller);
    function loadArtwork(src) {
      return new Promise((resolve, reject) => {
        if (!text(src)) { reject(new Error("Missing artwork path")); return; }
        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = reject;
        image.src = src;
      });
    }
    function show(source) {
      controller.open(source);
      openButton.focus({ preventScroll: true });
      hint.textContent = labels.loading;
      openButton.setAttribute("aria-disabled", "true");
      // Request artwork only when the first-visit introduction is actually shown.
      loadTimer = setTimeout(controller.close, 12000);
      loadArtwork(config.opening.artwork?.image).then((src) => {
        if (!dialog.open) return;
        clearTimeout(loadTimer);
        $("#parcel-photo").setAttribute("href", src);
        artReady = true;
        dialog.classList.add("art-ready");
        openButton.removeAttribute("aria-disabled");
        hint.textContent = labels.openParcel;
      }).catch(() => { if (dialog.open) controller.close(); });
      loadArtwork(config.opening.artwork?.paper).then((src) => {
        if (!dialog.open) return;
        $("#parcel-paper-photo").setAttribute("href", src);
        paperReady = true;
      }).catch(() => { /* The approved image alone can still reveal the home. */ });
    }
    openButton.addEventListener("click", (event) => {
      if (opening) return;
      // Keyboard/assistive activation and reduced motion reveal the home instantly.
      const immediate = reduced.matches || event.detail === 0;
      if (!immediate && !artReady) return;
      opening = true;
      if (config.audio?.song?.playAfterOpening) {
        musicPrepared = true;
        songPlayer.play({ silent: true });
      }
      if (immediate) { controller.close(); return; }
      dialog.classList.toggle("is-simple-opening", !paperReady);
      openButton.setAttribute("aria-disabled", "true");
      hint.textContent = labels.openingParcel;
      dialog.classList.add("is-unwrapping");
      // The bounded timer also completes when transition events aren't delivered.
      finishTimer = setTimeout(controller.close, 1150);
    });
    reduced.addEventListener("change", () => { if (opening && reduced.matches) controller.close(); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && opening) controller.close();
    });
    let seen = false;
    try { seen = visitKeys.some((visitKey) => localStorage.getItem(visitKey) === "yes"); } catch { /* Try session fallback. */ }
    try { seen = seen || visitKeys.some((visitKey) => sessionStorage.getItem(visitKey) === "yes"); } catch { /* Both stores may be blocked. */ }
    // Migrate earlier session-only visits, and record on display to cover reloads.
    remember();
    if (!seen) show($("#main"));
  }

  function setupPhotos() {
    const grid = $("#photo-grid");
    const loadMore = $("#load-more");
    loadMore.textContent = labels.loadMore;
    $("#photos-heading").textContent = labels.album;
    $("#photo-count").textContent = number(photos.length);
    $("#photos-empty").textContent = labels.noPhotos;
    $("#photos-empty").hidden = photos.length > 0;
    // A bounded batch size controls work per interaction, never the photo count.
    const batch = Math.min(100, Math.max(1, Math.floor(Number(config.photoBatchSize) || 24)));
    let rendered = 0;
    function appendBatch(manual = false) {
      const firstNew = rendered;
      const end = Math.min(photos.length, rendered + batch);
      const fragment = document.createDocumentFragment();
      for (; rendered < end; rendered++) {
        const index = rendered, photo = photos[index];
        const figure = document.createElement("figure");
        figure.className = "photo";
        const button = document.createElement("button");
        button.className = "photo-button";
        button.type = "button";
        button.setAttribute("aria-label", `${labels.viewPhoto} ${index + 1}`);
        button.setAttribute("aria-haspopup", "dialog");
        button.innerHTML = `<span class="photo-window"><span class="photo-placeholder" aria-hidden="true">${icon("photo")}<span></span></span></span><span class="photo-bottom"><span class="photo-index" aria-hidden="true">${number(index + 1)}</span><span aria-hidden="true">↗</span></span>`;
        const window = $(".photo-window", button);
        const placeholder = $(".photo-placeholder", button);
        $("span", placeholder).textContent = labels.loading;
        const img = document.createElement("img");
        img.alt = text(photo.alt);
        img.loading = "lazy";
        img.decoding = "async";
        // Optional dimensions reserve the exact aspect ratio before loading.
        if (Number(photo.width) > 0 && Number(photo.height) > 0) window.style.aspectRatio = `${Number(photo.width)} / ${Number(photo.height)}`;
        img.addEventListener("load", () => { placeholder.hidden = true; button.classList.add("is-loaded"); });
        img.addEventListener("error", () => { img.hidden = true; $("span", placeholder).textContent = labels.unavailablePhoto; });
        window.prepend(img);
        if (text(photo.src)) img.src = photo.src;
        else { img.hidden = true; $("span", placeholder).textContent = labels.unavailablePhoto; }
        button.addEventListener("click", () => { viewerControl.open(button); showPhoto(index); });
        figure.append(button);
        if (text(photo.caption)) { const caption = document.createElement("figcaption"); caption.textContent = photo.caption; figure.append(caption); }
        fragment.append(figure);
      }
      grid.append(fragment);
      loadMore.hidden = rendered >= photos.length;
      $("#gallery-progress").textContent = photos.length ? `${rendered} / ${photos.length}` : "";
      if (manual) grid.children[firstNew]?.querySelector("button").focus({ preventScroll: true });
    }
    loadMore.addEventListener("click", () => appendBatch(true));
    // IntersectionObserver is enhancement only; the load-more button always works.
    const observer = typeof window.IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && rendered < photos.length && !document.querySelector("dialog[open]")) appendBatch();
    }, { rootMargin: "300px" }) : null;
    appendBatch();
    observer?.observe(loadMore);

    const viewer = $("#viewer"), stage = $("#viewer-stage"), status = $("#viewer-status");
    const close = $("#viewer-close"), previous = $("#viewer-prev"), next = $("#viewer-next");
    let current = 0, request = 0;
    $("#viewer-title").textContent = labels.photos;
    [[close, "close", labels.close], [previous, "previous", labels.previous], [next, "next", labels.next]].forEach(([button, name, label]) => { button.innerHTML = icon(name); button.setAttribute("aria-label", label); });
    const viewerControl = modal(viewer, close, () => { request++; $("img", stage)?.remove(); }, (direction) => showPhoto(current + direction));
    openModals.push(viewerControl);
    function showPhoto(index) {
      if (!photos.length) return;
      current = (index + photos.length) % photos.length;
      const photo = photos[current], attempt = ++request;
      $("img", stage)?.remove();
      status.hidden = false;
      status.textContent = labels.loading;
      stage.setAttribute("aria-busy", "true");
      $("#viewer-counter").textContent = `${current + 1} / ${photos.length}`;
      $("#viewer-caption").textContent = text(photo.caption);
      $("#viewer-caption").hidden = !text(photo.caption);
      previous.disabled = next.disabled = photos.length < 2;
      const img = new Image();
      img.alt = text(photo.alt) || `${labels.photos} ${current + 1}`;
      img.hidden = true;
      img.decoding = "async";
      img.onload = () => { if (attempt !== request || !viewer.open) return; img.hidden = false; status.hidden = true; stage.setAttribute("aria-busy", "false"); };
      img.onerror = () => { if (attempt !== request || !viewer.open) return; img.hidden = true; status.textContent = labels.unavailablePhoto; stage.setAttribute("aria-busy", "false"); };
      stage.append(img);
      if (text(photo.src)) img.src = photo.src;
      else img.onerror();
    }
    previous.addEventListener("click", () => showPhoto(current - 1));
    next.addEventListener("click", () => showPhoto(current + 1));
  }
})();
