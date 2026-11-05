window.mountWritingGuide = function mountWritingGuide(root) {
  const example = writingExamples[Number(root.dataset.writingGuide) - 1];
  const speech = window.pronunciation;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const selections = [];
  let mode;
  let picture = 0;
  let idea = 0;
  let timer;
  let playing = false;
  let muted = false;

  root.innerHTML = `
    <div class="guide-launchers">
      <button class="button secondary guide-watch" type="button" data-guide="watch" aria-controls="writing-guide-content" aria-expanded="false"><span aria-hidden="true">▶</span> Watch Pippin show me</button>
      <button class="button secondary guide-ideas" type="button" data-guide="ideas" aria-controls="writing-guide-content" aria-expanded="false"><span aria-hidden="true">✦</span> Give me an idea</button>
    </div>
    <div class="guide-content" id="writing-guide-content" hidden></div>`;
  const content = root.querySelector('.guide-content');

  function addSpeaker(container, text) {
    const button = speech?.speaker?.(text);
    if (button) container.append(button);
  }

  function updateControls() {
    const play = content.querySelector('[data-guide="play"]');
    if (!play) return;
    play.textContent = playing ? 'Pause' : 'Play';
    content.querySelector('[data-guide="next"]').disabled = picture === example.pictures.length - 1;
    content.querySelector('[data-guide="sound"]').textContent = muted ? 'Turn sound on' : 'Mute narration';
  }

  function pause(stopAudio = true) {
    clearTimeout(timer);
    playing = false;
    if (stopAudio) speech?.stop();
    updateControls();
  }

  function drawPicture() {
    const [title, caption, prop, detail, motion] = example.pictures[picture];
    content.querySelector('.guide-figure').innerHTML = `
      <div class="guide-scene scene-${example.theme} motion-${motion}" aria-hidden="true">
        <div class="scene-cloud scene-cloud-left"></div><div class="scene-cloud scene-cloud-right"></div>
        <div class="scene-ground"></div>
        <img class="scene-pippin" src="./pippin.svg" alt="" width="170" height="117">
        <span class="scene-detail">${detail}</span>
        <span class="scene-prop">${prop}</span>
      </div>
      <figcaption>
        <p class="eyebrow">Picture ${picture + 1} of ${example.pictures.length}</p>
        <p class="guide-picture-title">${title}</p>
        <p class="guide-caption">${caption}</p>
      </figcaption>`;
    addSpeaker(content.querySelector('.guide-caption'), caption);
    content.querySelector('.guide-recap').hidden = picture < example.pictures.length - 1;
    updateControls();
  }

  function narrate() {
    if (!muted) speech?.speak?.(example.pictures[picture][1]);
  }

  function schedulePicture() {
    timer = setTimeout(() => {
      if (picture === example.pictures.length - 1) {
        pause(false);
        return;
      }
      picture += 1;
      drawPicture();
      narrate();
      schedulePicture();
    }, 5200);
  }

  function play() {
    playing = true;
    updateControls();
    narrate();
    schedulePicture();
  }

  function openWatch() {
    picture = 0;
    content.innerHTML = `
      <h3 tabindex="-1">Watch Pippin’s example</h3>
      <figure class="guide-figure"></figure>
      <div class="guide-controls">
        <button class="button secondary" type="button" data-guide="play">Play</button>
        <button class="button secondary" type="button" data-guide="next">Next picture <span aria-hidden="true">→</span></button>
        <button class="button secondary" type="button" data-guide="replay">Replay</button>
        <button class="button secondary guide-sound" type="button" data-guide="sound">Mute narration</button>
      </div>
      <div class="guide-recap" hidden>
        <ol class="guide-plan" aria-label="Pippin’s example in order">
          ${example.pictures.map(([title, , prop, detail], index) =>
            `<li><span class="guide-idea-art" aria-hidden="true">${index === 0 ? prop : detail}</span><strong>${title}</strong></li>`).join('')}
        </ol>
        <p class="guide-turn">Your turn! Try your own idea on paper.</p>
      </div>
      <button class="button guide-close" type="button" data-guide="close">Back to writing</button>`;
    drawPicture();
    content.querySelector('h3').focus();
    if (!reducedMotion.matches) play();
  }

  function drawIdeas(focus = true) {
    const question = example.choices[idea];
    if (question) {
      const [title, options] = question;
      content.innerHTML = `
        <p class="eyebrow">Idea ${idea + 1} of ${example.choices.length}</p>
        <h3 tabindex="-1">${title}</h3>
        <div class="guide-choice-grid">
          ${options.map(([art, label], index) => `<div class="guide-choice">
            <button type="button" data-guide="choose" data-option="${index}" class="guide-choice-button">
              <span class="guide-idea-art" aria-hidden="true">${art}</span><span>${label}</span>
            </button>
          </div>`).join('')}
        </div>
        <div class="guide-controls">
          ${idea > 0 ? '<button class="button secondary" type="button" data-guide="previous">Previous idea</button>' : ''}
          <button class="button guide-close" type="button" data-guide="close">Back to writing</button>
        </div>`;
      addSpeaker(content.querySelector('h3'), title);
      content.querySelectorAll('.guide-choice').forEach((card, index) => addSpeaker(card, options[index][1]));
    } else {
      content.innerHTML = `
        <p class="eyebrow">YOUR PICTURE PLAN</p>
        <h3 tabindex="-1">Say it, then write it</h3>
        <ol class="guide-plan">
          ${example.choices.map(([title, options], index) => {
            const [art, label] = options[selections[index]];
            return `<li><span class="guide-idea-art" aria-hidden="true">${art}</span><strong>${title}</strong><span class="guide-plan-label">${label}</span></li>`;
          }).join('')}
        </ol>
        <p class="guide-finish">${example.finish}</p>
        <div class="guide-controls">
          <button class="button secondary" type="button" data-guide="change">Change ideas</button>
          <button class="button guide-close" type="button" data-guide="close">Back to writing</button>
        </div>`;
      content.querySelectorAll('.guide-plan-label').forEach(label => addSpeaker(label, label.textContent));
      addSpeaker(content.querySelector('.guide-finish'), example.finish);
    }
    if (focus) content.querySelector('h3').focus();
  }

  function open(nextMode) {
    pause();
    mode = nextMode;
    for (const button of root.querySelectorAll('.guide-launchers button')) {
      button.setAttribute('aria-expanded', String(button.dataset.guide === mode));
    }
    content.hidden = false;
    if (mode === 'watch') openWatch();
    else drawIdeas();
  }

  function close(focusTarget) {
    pause();
    content.hidden = true;
    root.querySelectorAll('.guide-launchers button').forEach(button => button.setAttribute('aria-expanded', 'false'));
    mode = undefined;
    focusTarget?.focus();
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-guide]');
    if (!button) return;
    const action = button.dataset.guide;
    switch (action) {
      case 'watch':
      case 'ideas':
        if (mode === action) close(button);
        else open(action);
        break;
      case 'play':
        if (playing) pause();
        else play();
        break;
      case 'next':
        pause();
        picture += 1;
        drawPicture();
        narrate();
        if (button.disabled) content.querySelector('[data-guide="replay"]').focus();
        break;
      case 'replay':
        pause();
        picture = 0;
        drawPicture();
        if (reducedMotion.matches) narrate();
        else play();
        break;
      case 'sound':
        muted = !muted;
        if (muted) speech?.stop();
        else narrate();
        updateControls();
        break;
      case 'choose':
        speech?.stop();
        selections[idea] = Number(button.dataset.option);
        idea += 1;
        drawIdeas();
        break;
      case 'previous':
        speech?.stop();
        idea -= 1;
        drawIdeas();
        break;
      case 'change':
        speech?.stop();
        idea = 0;
        drawIdeas();
        break;
      case 'close':
        close(document.querySelector('#writing-starter'));
        break;
    }
  });

  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mode) close(root.querySelector(`.guide-launchers [data-guide="${mode}"]`));
  });
  document.addEventListener('click', event => {
    if (!playing) return;
    if (event.target.closest('[data-speech-text]')) pause(false);
    else if (event.target.closest('[data-open-coach], #coach-launcher, #coach-mic')) pause();
  }, { capture: true, signal: events.signal });
  window.addEventListener('pagehide', () => pause(), { signal: events.signal });
  return () => {
    clearTimeout(timer);
    events.abort();
  };
};
