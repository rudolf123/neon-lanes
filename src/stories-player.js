// Asset-agnostic stories player. Content comes from stories-content.js.
export function mountStories({container, ids, language, content, mark, onFinish, onClose, onPlay, onReward = onFinish, isCurrent, duration = 7000}) {
  const abort = new AbortController(), {signal} = abort;
  let index = 0, elapsed = 0, lastTick = null, frame = 0, generation = 0;
  let disposed = false, loaded = false, manualPause = false, holding = false;
  let pressStart = 0, suppressClickUntil = 0, pointerId = null;
  const root = document.createElement('section');
  root.className = 'stories-screen';
  root.setAttribute('aria-roledescription', 'carousel');
  root.tabIndex = -1;
  const canvas = document.createElement('div');
  canvas.className = 'stories-canvas';
  let artworkSize = {width: 1440, height: 3200};
  function fitText() {
    for (const box of canvas.querySelectorAll('.stories-copy')) {
      box.style.fontSize = '';
      const child = box.firstElementChild;
      const base = parseFloat(getComputedStyle(box).fontSize);
      let size = base;
      while (size > base * .7 && (child.getBoundingClientRect().height > box.clientHeight + 1 || child.getBoundingClientRect().width > box.clientWidth + 1)) {
        size -= .5; box.style.fontSize = size + 'px';
      }
    }
    const button = canvas.querySelector('.stories-action'), label = button?.querySelector('.stories-action-label');
    if (label) {
      label.style.fontSize = '';
      const icon = button.querySelector('.stories-play-icon, .stories-reward-icon');
      const gap = icon ? parseFloat(getComputedStyle(button).columnGap) : 0;
      const available = Math.min(button.clientWidth * (icon ? .61 : .95), button.clientWidth - (icon?.getBoundingClientRect().width || 0) - gap - button.clientWidth * .06);
      const base = parseFloat(getComputedStyle(label).fontSize);
      let size = base;
      while (size > base * .65 && (label.scrollWidth > available + 1 || label.scrollHeight > button.clientHeight * .88)) {
        size -= .5; label.style.fontSize = size + 'px';
      }
    }
  }
  function layout() {
    const scale = Math.min(root.clientWidth / artworkSize.width, root.clientHeight / artworkSize.height);
    const width = artworkSize.width * scale, height = artworkSize.height * scale;
    Object.assign(canvas.style, {width: width + 'px', height: height + 'px', left: (root.clientWidth - width) / 2 + 'px', top: (root.clientHeight - height) / 2 + 'px'});
    fitText();
  }
  const observer = new ResizeObserver(layout);
  observer.observe(root);
  container.replaceChildren(root);
  document.documentElement.classList.add('stories-mode');
  const listen = (target, name, callback) => target.addEventListener(name, callback, {signal});
  const paused = () => !loaded || manualPause || holding || document.hidden || !document.hasFocus();

  function completeCurrent() {
    if (loaded && isCurrent()) mark(ids[index]);
  }
  function end(callback) {
    if (disposed) return;
    destroy(); callback();
  }
  function advance() {
    if (!isCurrent()) { end(onFinish); return; }
    // Never consume a slide that has not loaded or failed to load.
    if (!loaded) return;
    completeCurrent();
    if (index + 1 === ids.length) end(onFinish);
    else { index++; show(); }
  }
  function previous() {
    if (!isCurrent()) { end(onFinish); return; }
    if (index > 0) index--;
    show();
  }
  function setProgress() {
    root.querySelectorAll('.stories-progress-fill').forEach((bar, i) => {
      const fraction = i < index ? 1 : i > index ? 0 : elapsed / duration;
      bar.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`;
    });
    const progress = root.querySelector('[role="progressbar"]');
    progress?.setAttribute('aria-valuenow', String(Math.round(elapsed / duration * 100)));
  }
  function clock(time) {
    if (disposed) return;
    if (!isCurrent()) { end(onFinish); return; }
    if (!paused() && lastTick !== null) elapsed += Math.min(100, time - lastTick);
    lastTick = time;
    setProgress();
    if (elapsed >= duration) advance();
    if (!disposed) frame = requestAnimationFrame(clock);
  }
  function show() {
    const token = ++generation, item = content(ids[index], language);
    loaded = false; elapsed = 0; lastTick = null; holding = false; pointerId = null;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.dataset.story = ids[index];
    canvas.dataset.kind = item.type;
    root.dataset.ready = 'false';
    root.setAttribute('aria-label', item.alt);
    root.replaceChildren();
    canvas.replaceChildren();
    const backdrop = document.createElement('img');
    backdrop.className = 'stories-backdrop'; backdrop.alt = '';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.draggable = false; backdrop.decoding = 'async';
    root.append(backdrop, canvas);

    const image = document.createElement('img');
    image.className = 'stories-artwork'; image.alt = item.alt;
    image.draggable = false; image.decoding = 'async';
    const imageReady = () => {
      if (disposed || token !== generation) return;
      loaded = true; lastTick = null; root.dataset.ready = 'true';
      artworkSize = {width: image.naturalWidth, height: image.naturalHeight}; layout();
      root.querySelector('[data-stories="action"]').disabled = false;
      root.querySelector('.stories-loading').hidden = true;
    };
    image.onload = async () => {
      // Avoid counting decoding time as time spent watching the artwork.
      try { await image.decode(); } catch {}
      await document.fonts.ready;
      imageReady();
    };
    image.onerror = () => {
      if (disposed || token !== generation) return;
      root.dataset.ready = 'error';
      const status = root.querySelector('.stories-loading');
      status.textContent = item.ui.imageError;
      const retry = document.createElement('button');
      retry.className = 'stories-retry'; retry.textContent = item.ui.retry;
      retry.onclick = show; status.append(retry);
    };
    canvas.append(image);

    // Parse the tiny, trusted <y> marker grammar without injecting HTML.
    function addCopy(className, text) {
      const box = document.createElement('div'); box.className = 'stories-copy ' + className;
      const inner = document.createElement('span'); inner.className = 'stories-text-content';
      let yellow = false;
      for (const line of text.split('\n')) {
        const row = document.createElement('span'); row.className = 'stories-text-line';
        for (const token of line.split(/(<y>|<\/y>)/)) {
          if (token === '<y>') yellow = true;
          else if (token === '</y>') yellow = false;
          else if (token) {
            const span = document.createElement('span'); span.textContent = token;
            if (yellow) span.className = 'stories-highlight';
            row.append(span);
          }
        }
        inner.append(row);
      }
      box.append(inner); canvas.append(box);
    }
    addCopy('stories-heading', item.heading);
    addCopy('stories-body', item.body);
    if (item.type === 'intro') addCopy('stories-invitation', item.invitation);

    const header = document.createElement('header');
    header.className = 'stories-header';
    const progress = document.createElement('div');
    progress.className = 'stories-progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', item.ui.progress.replace('{current}', index + 1).replace('{total}', ids.length));
    progress.setAttribute('aria-valuemin', '0'); progress.setAttribute('aria-valuemax', '100');
    for (const id of ids) {
      const track = document.createElement('span'); track.className = 'stories-progress-track';
      const fill = document.createElement('span'); fill.className = 'stories-progress-fill';
      track.append(fill); progress.append(track);
    }
    header.append(progress);
    root.append(header);

    const hotspot = (button, box) => {
      ['left','top','width','height'].forEach((prop, i) => button.style[prop] = box[i] * 100 + '%');
    };
    const close = document.createElement('button');
    close.className = 'stories-button stories-close'; close.dataset.stories = 'close';
    close.setAttribute('aria-label', item.ui.close);
    hotspot(close, item.hotspots.close); canvas.append(close);

    const nav = document.createElement('nav'); nav.className = 'stories-navigation';
    for (const [action, label] of [['previous', item.ui.previous], ['next', item.ui.next]]) {
      const button = document.createElement('button');
      button.dataset.stories = action; button.setAttribute('aria-label', label);
      button.className = 'stories-tap'; nav.append(button);
    }
    canvas.append(nav);

    const status = document.createElement('div');
    status.className = 'stories-loading'; status.setAttribute('role', 'status');
    status.textContent = item.ui.loading; root.append(status);
    const action = document.createElement('button');
    action.className = 'stories-button stories-action stories-action--' + item.type; action.dataset.stories = 'action';
    action.disabled = true;
    const label = ids[index] === 'intro' ? item.ui.next : ids[index] === 'completed' ? item.ui.reward : item.ui.play;
    action.setAttribute('aria-label', label.replace(/\n/g, ' '));
    hotspot(action, item.hotspots.action);
    if (item.type === 'day') {
      const icon = document.createElement('span'); icon.className = 'stories-play-icon'; icon.setAttribute('aria-hidden', 'true'); action.append(icon);
    } else if (item.type === 'completed') {
      const icon = document.createElement('img'); icon.className = 'stories-reward-icon'; icon.src = 'public/assets/psd/gift.webp'; icon.alt = ''; action.append(icon);
    }
    const text = document.createElement('span'); text.className = 'stories-action-label';
    text.textContent = item.type === 'intro' ? item.ui.event : label;
    action.append(text);
    canvas.append(action);
    setProgress();
    backdrop.src = item.image;
    image.src = item.image;
    // Warm only the next story's artwork, not all seven days.
    if (ids[index + 1]) { const next = new Image(); next.src = content(ids[index + 1], language).image; }
  }

  listen(root, 'click', e => {
    const action = e.target.closest('[data-stories]')?.dataset.stories;
    if (!action || (e.detail !== 0 && performance.now() < suppressClickUntil)) return;
    if (action === 'close') end(onClose);
    else if (action === 'previous') previous();
    else if (action === 'next') advance();
    else if (action === 'action') {
      if (!isCurrent()) { end(onFinish); return; }
      if (!loaded) return;
      if (ids[index] === 'intro') advance();
      else { completeCurrent(); end(ids[index] === 'completed' ? onReward : onPlay); }
    }
  });
  listen(root, 'pointerdown', e => {
    if (!e.target.closest('.stories-tap') || !e.isPrimary || e.button !== 0) return;
    holding = true; pressStart = performance.now(); pointerId = e.pointerId;
    e.target.setPointerCapture(e.pointerId);
    lastTick = null;
  });
  const release = e => {
    if (pointerId !== e.pointerId) return;
    if (performance.now() - pressStart > 250 || e.type === 'pointercancel') suppressClickUntil = performance.now() + 500;
    holding = false; pointerId = null; lastTick = null;
  };
  listen(root, 'pointerup', release); listen(root, 'pointercancel', release);
  listen(root, 'lostpointercapture', release);
  listen(document, 'visibilitychange', () => {holding = false; pointerId = null; lastTick = null;});
  listen(window, 'blur', () => {holding = false; pointerId = null; lastTick = null;});
  listen(window, 'focus', () => {lastTick = null;});
  listen(root, 'contextmenu', e => e.preventDefault());
  listen(document, 'keydown', e => {
    if (e.repeat || disposed || e.target.matches('input, select, textarea')) return;
    if (e.code === 'ArrowRight') {e.preventDefault(); advance();}
    if (e.code === 'ArrowLeft') {e.preventDefault(); previous();}
    if (e.code === 'Escape') {e.preventDefault(); end(onClose);}
  });
  function destroy() {
    if (disposed) return;
    disposed = true; generation++; cancelAnimationFrame(frame); abort.abort(); observer.disconnect();
    document.documentElement.classList.remove('stories-mode');
  }
  show(); root.focus({preventScroll: true});
  frame = requestAnimationFrame(clock);
  return {
    destroy,
    setLanguage(value) {if (!disposed && language !== value) {language = value; show();}},
    pause() {manualPause = true; lastTick = null;},
    resume() {manualPause = false; lastTick = null;},
  };
}
