const audioStatus = document.querySelector('#speech-status');
const synthesizer = window.speechSynthesis;
const speechIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4zM15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
let playback;

function speaker(text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'speaker';
  button.dataset.speechText = text;
  button.setAttribute('aria-label', `Hear ${text}`);
  button.setAttribute('aria-pressed', 'false');
  button.title = 'Hear it';
  button.innerHTML = speechIcon;
  return button;
}

function spokenText(element) {
  return (element.dataset.say || element.textContent).replace(/[→←]/g, '').replace(/\s+/g, ' ').trim();
}

function addSpeakers(root) {
  for (const card of root.querySelectorAll('.day-card')) {
    if (card.parentElement.classList.contains('audio-card')) continue;
    const wrapper = document.createElement('div');
    wrapper.className = 'audio-card';
    card.before(wrapper);
    const text = card.querySelector('.day-number').textContent + '. ' +
      card.querySelector('h3').textContent + '. ' + card.querySelector('.day-info p').textContent + '. ' +
      card.querySelector('.status').textContent + '.';
    wrapper.append(card, speaker(text));
  }

  const selectors = 'h1, h2, h3, main p, .hero .eyebrow, .warmup > strong, .words li, .writing-steps li, .observations dt, .observations dd, .actions a, .actions button, .help summary, [data-say]';
  for (const element of root.querySelectorAll(selectors)) {
    if (element.closest('.day-card, .print-notes, .notes-form') || element.matches('[role="status"]')) continue;
    if (element.matches('p.eyebrow') && element.closest('.review-day')) continue;
    if (element.parentElement.classList.contains('audio-heading') || element.querySelector('.speaker')) continue;
    const text = spokenText(element);
    if (!/[\p{L}\p{N}]/u.test(text)) continue;
    const button = speaker(text);
    if (element.matches('h1, h2, h3, a, button')) {
      const wrapper = document.createElement(element.matches('a, button') ? 'span' : 'div');
      wrapper.className = element.matches('a, button') ? 'audio-heading audio-action' : 'audio-heading';
      element.before(wrapper);
      wrapper.append(element, button);
    } else {
      element.append(button);
    }
  }
}

function stopPronunciation() {
  audioStatus.textContent = '';
  if (!playback) return;
  playback.button.setAttribute('aria-pressed', 'false');
  playback = null;
  synthesizer.cancel();
}

function pronunciationVoice() {
  const voices = synthesizer.getVoices();
  for (const locale of ['en-nz', 'en-au', 'en-gb']) {
    const voice = voices.find(item => item.lang.toLowerCase().replace('_', '-') === locale);
    if (voice) return voice;
  }
  const english = voices.filter(item => /^en(?:[-_]|$)/i.test(item.lang));
  return english.find(item => item.default) || english[0];
}

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-speech-text]');
  if (!button) return;
  event.preventDefault();

  const wasPlaying = playback?.button === button;
  stopPronunciation();
  if (wasPlaying) return;
  if (!synthesizer || !window.SpeechSynthesisUtterance) {
    audioStatus.textContent = 'Pronunciation audio is unavailable in this browser.';
    return;
  }

  const utterance = new SpeechSynthesisUtterance(button.dataset.speechText);
  const voice = pronunciationVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang.replace('_', '-') || 'en-NZ';
  utterance.rate = 0.86;
  playback = { utterance, button };
  button.setAttribute('aria-pressed', 'true');

  function finish(failed = false) {
    if (playback?.utterance !== utterance) return;
    button.setAttribute('aria-pressed', 'false');
    playback = null;
    if (failed) audioStatus.textContent = 'Audio couldn’t play. Check that this device has an English speech voice.';
  }

  utterance.onend = () => finish();
  utterance.onerror = event => finish(!['canceled', 'interrupted'].includes(event.error));
  try {
    synthesizer.speak(utterance);
  } catch {
    finish(true);
  }
});

window.addEventListener('pagehide', stopPronunciation);
window.pronunciation = { decorate: addSpeakers, stop: stopPronunciation };
