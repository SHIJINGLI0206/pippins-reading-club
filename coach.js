(() => {
  const panel = document.querySelector('#spelling-coach');
  const layout = document.querySelector('#page-layout');
  const launcher = document.querySelector('#coach-launcher');
  const closeButton = panel.querySelector('.coach-close');
  const microphone = document.querySelector('#coach-mic');
  const micLabel = document.querySelector('#coach-mic-label');
  const status = document.querySelector('#coach-status');
  const reply = document.querySelector('#coach-reply');
  const form = document.querySelector('#coach-form');
  const input = document.querySelector('#coach-input');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const pronunciation = window.pronunciation;
  const homophones = [
    { sea: 'the ocean', see: 'look with your eyes' },
    { flower: 'grows on a plant', flour: 'used to make bread' },
    { to: 'go to the park', too: 'also, or too much', two: 'the number 2' },
    { there: 'in that place', their: 'belongs to them', 'they’re': 'short for “they are”' },
    { hear: 'listen with your ears', here: 'in this place' },
    { right: 'correct, or the opposite of left', write: 'put words on paper' },
    { be: 'be kind', bee: 'an insect that can make honey' },
    { one: 'the number 1', won: 'came first' },
    { no: 'the opposite of yes', know: 'have the answer' },
    { rain: 'water that falls from clouds', rein: 'a strap used to guide a horse', reign: 'a time when a king or queen rules' },
    { blue: 'a colour', blew: 'what the wind did' },
    { sun: 'the star in our sky', son: 'a boy in a family' },
    { tail: 'at the back of an animal', tale: 'a story' },
    { wait: 'stay until something happens', weight: 'how heavy something is' },
    { where: 'in what place', wear: 'have clothes on' },
    { pair: 'a set of two', pear: 'a fruit' },
    { which: 'ask about a choice', witch: 'a character who casts spells' },
    { by: 'beside or near', buy: 'pay for something', bye: 'short for goodbye' },
    { ate: 'had something to eat', eight: 'the number 8' },
    { practice: 'time spent learning a skill', practise: 'to work on a skill' },
  ];
  const nzSpellings = {
    color: 'colour', colors: 'colours', colored: 'coloured', coloring: 'colouring',
    favorite: 'favourite', favorites: 'favourites', flavor: 'flavour',
    neighbor: 'neighbour', neighbors: 'neighbours', behavior: 'behaviour',
    center: 'centre', theater: 'theatre', gray: 'grey', pajamas: 'pyjamas',
  };
  const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  let returnFocus;
  let recognition;
  let localLanguage;

  if (Recognition?.available) {
    Promise.all(['en-NZ', 'en-AU'].map(async lang => {
      try {
        return await Recognition.available({ langs: [lang], processLocally: true }) === 'available' ? lang : null;
      } catch {
        return null;
      }
    })).then(results => { localLanguage = results.find(Boolean); });
  }

  function extractWord(request, fromVoice) {
    const clean = request.normalize('NFC').replace(/'/g, '’').replace(/\s+/g, ' ').trim()
      .replace(/^(?:hi |hey )?pippin[,\s]+/i, '');
    const withoutQuestion = clean.replace(/^(?:(?:can|could|would) you (?:tell me )?)?(?:how (?:do (?:i|you)|to) (?:spell|write)|what(?:’s| is) the spelling of)(?: (?:the word|the phrase))?(?:\s+|[?!.]*$)/i, '');
    const withoutCommand = withoutQuestion === clean
      ? clean.replace(/^(?:please |(?:can|could|would) you )?(?:spell|write) (?:(?:the word|the phrase) )?/i, '')
      : withoutQuestion;
    const target = withoutCommand.replace(/[.?!,;:]+$/g, '').replace(/\s+please$/i, '')
      .replace(/^[“”"‘’]+|[“”"‘’]+$/g, '').trim();

    if (/^\d+$/.test(target)) return numbers[Number(target)] || '';
    if (target.length > 48 || !/^[\p{L}\p{M}]+(?:[’\- ][\p{L}\p{M}]+)*$/u.test(target) || target.split(' ').length > 5) return '';

    const lower = target.toLowerCase();
    if (lower === 'aotearoa') return 'Aotearoa';
    if (lower === 'new zealand') return 'New Zealand';
    if (lower === 'i') return 'I';
    if (lower === 'maia') return 'Maia';
    const preferred = Object.hasOwn(nzSpellings, lower) ? nzSpellings[lower] : target;
    return fromVoice && clean === withoutCommand && !target.includes(' ') ? preferred.toLowerCase() : preferred;
  }

  function addText(parent, tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  function showCard(word, speakBack, alternatives = []) {
    cancelListening();
    reply.replaceChildren();
    const card = document.createElement('div');
    card.className = 'coach-flashcard';
    reply.append(card);

    addText(card, 'p', 'eyebrow', 'YOUR SPELLING CARD');
    const writtenWord = addText(card, 'p', `coach-word${word.length > 10 ? ' coach-word-long' : ''}`, word);
    writtenWord.tabIndex = -1;
    const copy = addText(card, 'p', 'coach-copy', 'Say it. Copy it. Check it.');
    const replay = pronunciation?.speaker?.(word);
    if (replay) copy.append(replay);
    writtenWord.focus();
    status.textContent = '';
    if (speakBack) pronunciation?.speak?.(`Here’s your spelling card for ${word}.`);
    if (alternatives.length) {
      const other = document.createElement('details');
      other.className = 'coach-other';
      reply.append(other);
      addText(other, 'summary', '', 'Did Pippin hear a different word?');
      const choices = document.createElement('div');
      choices.className = 'coach-choices';
      other.append(choices);
      for (const choice of alternatives) addChoice(choices, choice);
    }
  }

  function addChoice(parent, word, clue) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'coach-choice';
    addText(button, 'strong', '', word);
    if (clue) addText(button, 'span', '', clue);
    button.addEventListener('click', () => showCard(word, true));
    parent.append(button);
  }

  function respond(requests, fromVoice) {
    const words = [...new Set(requests.map(text => extractWord(text, fromVoice)).filter(Boolean))];
    const [word, ...alternatives] = words;
    if (!word) {
      status.textContent = 'Try just the word, or a short phrase.';
      return false;
    }
    const group = fromVoice && homophones.find(choices => Object.hasOwn(choices, word.toLowerCase()));
    if (group) {
      reply.replaceChildren();
      const prompt = addText(reply, 'p', 'coach-choice-prompt', 'These words sound alike. Which one do you mean?');
      const choices = document.createElement('div');
      choices.className = 'coach-choices';
      reply.append(choices);
      for (const [option, clue] of Object.entries(group)) addChoice(choices, option, clue);
      prompt.tabIndex = -1;
      prompt.focus();
      status.textContent = '';
      pronunciation?.speak?.(prompt.textContent);
    } else {
      showCard(word, fromVoice, alternatives.slice(0, 3));
    }
    return true;
  }

  function listeningUI(listening) {
    microphone.setAttribute('aria-pressed', String(listening));
    microphone.disabled = false;
    micLabel.textContent = listening ? 'Stop listening' : 'Talk to Pippin';
  }

  function cancelListening() {
    if (!recognition) return;
    const request = recognition;
    recognition = null;
    request.abort();
    listeningUI(false);
    status.textContent = '';
  }

  function openCoach(opener) {
    if (panel.hidden) returnFocus = opener;
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    layout.classList.add('coach-open');
    (Recognition ? microphone : input).focus();
  }

  function closeCoach() {
    cancelListening();
    pronunciation?.stop();
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    layout.classList.remove('coach-open');
    (returnFocus?.isConnected ? returnFocus : launcher).focus();
  }

  function startListening() {
    if (recognition) {
      microphone.disabled = true;
      status.textContent = 'Working out the word…';
      try {
        recognition.stop();
      } catch {
        cancelListening();
        status.textContent = 'Try saying the word again.';
      }
      return;
    }
    pronunciation?.stop();

    const request = new Recognition();
    request.lang = localLanguage || 'en-NZ';
    if (localLanguage && 'processLocally' in request) request.processLocally = true;
    request.maxAlternatives = 4;
    request.interimResults = false;
    request.continuous = false;
    let results = [];

    function endRequest() {
      if (recognition !== request) return false;
      recognition = null;
      listeningUI(false);
      return true;
    }

    request.onstart = () => {
      if (recognition === request) status.textContent = 'Listening… say your word.';
    };
    request.onresult = event => {
      results = Array.from(event.results[event.resultIndex], result => result.transcript);
    };
    request.onerror = event => {
      if (!endRequest()) return;
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)) {
        status.textContent = 'The microphone is unavailable. Try keyboard dictation or type below.';
      } else if (event.error === 'no-speech') {
        status.textContent = 'Pippin didn’t hear a word. Try again.';
      } else {
        status.textContent = 'Voice input didn’t work this time. Try again or use the box below.';
      }
    };
    request.onend = () => {
      if (!endRequest()) return;
      if (results.length) respond(results, true);
      else status.textContent = 'Pippin didn’t hear a word. Try again.';
    };

    recognition = request;
    listeningUI(true);
    status.textContent = 'Opening the microphone…';
    try {
      request.start();
    } catch {
      endRequest();
      status.textContent = 'Voice input couldn’t start. Try keyboard dictation or type below.';
    }
  }

  if (Recognition) {
    microphone.addEventListener('click', startListening);
  } else {
    microphone.hidden = true;
    status.textContent = 'Use the microphone on your keyboard to say a word, or type it below.';
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    cancelListening();
    pronunciation?.stop();
    if (respond([input.value], false)) input.value = '';
  });
  launcher.addEventListener('click', () => openCoach(launcher));
  closeButton.addEventListener('click', closeCoach);
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCoach();
  });
  document.addEventListener('click', event => {
    const shortcut = event.target.closest('[data-open-coach]');
    if (shortcut) openCoach(shortcut);
  });
  document.addEventListener('click', event => {
    if (event.target.closest('[data-speech-text], [data-guide]')) cancelListening();
  }, { capture: true });
  window.addEventListener('pagehide', cancelListening);
  window.addEventListener('hashchange', cancelListening);

  pronunciation?.decorate(panel.querySelector('.coach-intro'));
  launcher.hidden = false;
  const shortcut = document.querySelector('[data-open-coach]');
  if (shortcut) shortcut.hidden = false;
  window.spellingCoachReady = true;
})();
