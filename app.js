const main = document.querySelector('#main');
const storageKey = 'pippins-reading-club-v1';
const steps = ['Read', 'Talk', 'Write on paper'];
const skills = ['Reading', 'Talking about the text', 'Writing'];
const supportLevels = ['On her own', 'With a prompt', 'Together'];
const conventions = ['Capital letters', 'Spaces', 'Full stops'];
const practiceMonth = new Intl.DateTimeFormat('en-NZ', { month: 'short', timeZone: 'UTC' });
const practiceDates = lessons.map((_, index) => {
  const date = new Date(Date.UTC(2026, 10, 5 + index));
  const number = date.getUTCDate();
  const suffix = number % 100 >= 11 && number % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th');
  return { number, label: `${number}${suffix} ${practiceMonth.format(date)}`, iso: date.toISOString().slice(0, 10) };
});
let records = {};
let storageAvailable = true;

try {
  records = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
} catch {
  storageAvailable = false;
}

function save(day, changes) {
  records[day] = { ...records[day], ...changes };
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function icon(name, className = '') {
  return `<svg class="${className}" aria-hidden="true"><use href="./art.svg#${name}"></use></svg>`;
}

function dateLabel(day, className = '') {
  const { label, iso } = practiceDates[day - 1];
  return `<time class="${className}" datetime="${iso}">${label}</time>`;
}

function nest(animate = false) {
  const feathers = lessons.map((_, index) => {
    const day = index + 1;
    const filled = records[day]?.done;
    return `<span class="feather ${filled ? 'earned' : ''}" title="${practiceDates[index].label}">${filled ? icon('feather', animate === day ? 'float-in' : '') : practiceDates[index].number}</span>`;
  }).join('');
  return `<div class="nest" aria-hidden="true">${feathers}</div>`;
}

function status(day) {
  const record = records[day];
  if (record?.done) return 'Completed';
  return record?.started ? 'Started' : 'Ready';
}

function lessonLink(day) {
  const record = records[day] || {};
  if (record.done) return `#day-${day}/read`;
  const step = !record.read ? 'read' : !record.talk ? (record.questionOne ? 'talk-2' : 'talk-1') : 'write';
  return `#day-${day}/${step}`;
}

function home() {
  const completed = lessons.filter((_, index) => records[index + 1]?.done).length;
  const started = Object.keys(records)
    .filter(day => records[day]?.started && !records[day].done)
    .sort((a, b) => records[b].updated - records[a].updated)[0];
  const next = Number(started) || lessons.findIndex((_, index) => !records[index + 1]?.done) + 1;
  const nextDate = practiceDates[next - 1]?.label;
  return `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">A LITTLE ADVENTURE EVERY DAY</span>
        <h1>Pippin’s<br> Reading Club</h1>
        <p>Read with a fluffy friend, talk about what you find, and make up something of your own.</p>
        <a class="button primary" href="${next ? lessonLink(next) : '#review'}" data-say>${started ? `Keep going · ${nextDate}` : next ? `Start ${nextDate}` : 'Visit your feather nest'} <span aria-hidden="true">→</span></a>
      </div>
      <figure class="hero-art"><img src="./pippin.svg" alt="Pippin the fluffy kiwi reading in a leafy nest" width="500" height="344"></figure>
    </section>
    <section class="progress-strip" aria-label="Your feather nest">
      <div><strong data-say>Your feather nest</strong><p>${completed} of 7 lessons completed</p></div>
      ${nest()}
    </section>
    <section class="week" aria-labelledby="week-title">
      <div class="section-heading"><div><p class="eyebrow">YOUR READING TRAIL</p><h2 id="week-title">Pick a date</h2></div><p>About 15–20 minutes each</p></div>
      <div class="day-grid">
        ${lessons.map((lesson, index) => {
          const day = index + 1;
          const state = status(day);
          return `<a class="day-card" href="${lessonLink(day)}">
            <div class="day-art ${lesson.colour}">${dateLabel(day, 'practice-date')}${icon(lesson.art)}</div>
            <div class="day-info"><h3>${lesson.title}</h3><p>${lesson.kind} <span aria-hidden="true">·</span> ${lesson.focus}</p><span class="status ${state.toLowerCase()}">${state}</span></div>
          </a>`;
        }).join('')}
      </div>
    </section>`;
}

function passage(lesson) {
  const lines = lesson.text.length > 1 ? lesson.text : lesson.text[0].split(/(?<=[.!?])\s+/);
  const words = lesson.text.join(' ').match(/\p{L}+(?:[’'-]\p{L}+)*/gu);
  const uniqueWords = [...new Map(words.map(word => [word.toLowerCase(), word])).values()];
  return `<div class="passage lines">${lines.map(line => `<p>${line}</p>`).join('')}</div>
    <details class="help word-picker"><summary data-say>Hear a word</summary>
      <ul class="words">${uniqueWords.map(word => `<li>${word}</li>`).join('')}</ul>
    </details>`;
}

function lessonPage(day, step, celebrate) {
  const lesson = lessons[day - 1];
  const base = `#day-${day}/`;
  if (step === 'finish') {
    return `<section class="finish panel">
      <img src="./pippin.svg" alt="" width="270" height="186">
      <p class="eyebrow">${dateLabel(day)} · Completed</p>
      <h1>One more feather!</h1>
      <p>You read, talked and wrote on paper. Thanks for practising with Pippin.</p>
      ${nest(celebrate ? day : false)}
      <div class="actions"><a class="button primary" href="#home">Back to my week <span aria-hidden="true">→</span></a><a class="button secondary" href="#review">See my review</a></div>
    </section>`;
  }

  const active = step === 'read' ? 0 : step === 'write' ? 2 : 1;
  const stageLinks = ['read', 'talk-1', 'write'];
  const record = records[day] || {};
  const completed = [record.read, record.talk, record.write];
  let activity;
  if (active === 0) {
    activity = `
      <h2 id="activity-title" tabindex="-1">Read aloud</h2>
      <div class="warmup"><h3>Word warm-up</h3>
      <ul class="words">${lesson.words.map(word => `<li>${word}</li>`).join('')}</ul><p>${lesson.warmup}</p></div>
      ${passage(lesson)}
      <details class="help"><summary>Grown-up help</summary><p>Let the reader try first. If they get stuck, point to the letters, say the sounds and blend them together. Give a tricky word if needed, then reread the sentence. For the first and last lessons, note how much help the first read took.</p></details>
      <div class="actions"><button class="button primary" data-next="talk-1" data-mark="read">I’ve read it <span aria-hidden="true">→</span></button></div>`;
  } else if (active === 1) {
    const questionIndex = step === 'talk-2' ? 1 : 0;
    const [question, answer] = lesson.questions[questionIndex];
    activity = `
      <p class="eyebrow">QUESTION ${questionIndex + 1} OF ${lesson.questions.length}</p>
      <h2 id="activity-title" tabindex="-1">${question}</h2>
      <p>Say your answer to a grown-up.</p>
      <details class="help"><summary>Look back at the reading</summary>${passage(lesson)}</details>
      <details class="help"><summary>Grown-up help</summary><p>${answer}</p></details>
      <div class="actions">
        <button class="button primary" data-next="${questionIndex ? 'write' : 'talk-2'}" data-mark="${questionIndex ? 'talk' : 'questionOne'}">${questionIndex ? 'Ready to write' : 'Next question'} <span aria-hidden="true">→</span></button>
        <a class="button secondary" href="${base}${questionIndex ? 'talk-1' : 'read'}">Back</a>
      </div>`;
  } else {
    activity = `
      <div class="writing-heading"><h2 id="activity-title" tabindex="-1">Write on paper</h2>${icon('pen')}</div>
      <p class="prompt">${lesson.writing}</p>
      <div data-writing-guide="${day}"></div>
      <div class="warmup" id="writing-starter" tabindex="-1"><strong>A way to start</strong><p class="starter">${lesson.starter}</p><p>${lesson.tip}</p></div>
      <ol class="writing-steps">
        <li><strong>Say it.</strong> Tell a grown-up your idea.</li>
        <li><strong>Write it.</strong> Pick up your pen and write your idea on paper.</li>
        <li><strong>Read it back.</strong> Check capitals, spaces and full stops.</li>
      </ol>
      <button class="button secondary writing-coach" type="button" data-open-coach hidden>Ask Pippin for spelling help</button>
      <div class="actions"><button class="button primary" data-next="finish" data-mark="write">I’ve written on paper <span aria-hidden="true">→</span></button>
      <a class="button secondary" href="${base}talk-2">Back</a></div>`;
  }

  return `<div class="lesson-shell" data-day="${day}">
    <a class="back-link" href="#home" data-say="My week">← My week</a>
    <header class="lesson-banner ${lesson.colour}"><div><p class="eyebrow">${dateLabel(day)} · ${lesson.kind} · ${lesson.focus}</p><h1>${lesson.title}</h1></div>${icon(lesson.art)}</header>
    <nav aria-label="Practice steps" class="steps">
      ${steps.map((label, index) => `<a href="${base}${stageLinks[index]}" data-say="${label}" ${index === active ? 'aria-current="step"' : ''}><span>${completed[index] ? '✓' : index + 1}</span>${label}${completed[index] ? '<span class="sr-only"> completed</span>' : ''}</a>`).join('')}
    </nav>
    <section class="panel activity" aria-labelledby="activity-title">${activity}</section>
  </div>`;
}

function observations(record) {
  const checked = conventions.filter((_, index) => record.checks?.includes(String(index)));
  return `<dl class="observations">
    ${skills.map((skill, index) => `<div><dt>${skill}</dt><dd>${supportLevels[record.support?.[index]] ?? '—'}</dd></div>`).join('')}
    <div><dt>Complete sentences</dt><dd>${escapeText(record.sentences || '—')}</dd></div>
    <div><dt>Checked independently</dt><dd>${checked.join(', ') || '—'}</dd></div>
  </dl>`;
}

function notesForm(day, record) {
  return `<form class="notes-form" data-notes-day="${day}">
    <div class="form-grid">${skills.map((skill, index) => `<label>${skill}${index === 0 && (day === 1 || day === 7) ? ' · first read' : ''}
      <select name="skill-${index}"><option value="">Choose if observed</option>${supportLevels.map((level, value) => `<option value="${value}" ${record.support?.[index] === String(value) ? 'selected' : ''}>${level}</option>`).join('')}</select></label>`).join('')}
      <label>Complete sentences<input type="number" name="sentences" min="0" max="99" inputmode="numeric" value="${escapeText(record.sentences)}"></label>
    </div>
    <fieldset><legend>Checked independently</legend>${conventions.map((label, index) => `<label class="check"><input type="checkbox" name="checks" value="${index}" ${record.checks?.includes(String(index)) ? 'checked' : ''}> ${label}</label>`).join('')}</fieldset>
    <label>Optional note<textarea name="note" maxlength="400" rows="3" placeholder="What felt easier today?">${escapeText(record.note)}</textarea></label>
    <button class="button secondary" type="submit">Save notes</button>
    <span class="save-message" role="status"></span>
  </form>`;
}

function review() {
  const completed = lessons.filter((_, index) => records[index + 1]?.done).length;
  const anyNotes = Boolean(records[1]?.support || records[7]?.support);
  return `<div class="review-shell">
    <a class="back-link" href="#home" data-say="My week">← My week</a>
    <header class="review-banner"><div><p class="eyebrow">YOUR FEATHER NEST</p><h1>My practice review</h1><p>${completed} of 7 lessons completed. Each feather marks a day you practised.</p></div>${nest()}</header>
    <section class="review-records" aria-labelledby="record-title">
      <div class="section-heading"><h2 id="record-title">Practice by date</h2><button class="button secondary print-button" type="button" id="print-review" data-say>Print review</button></div>
      ${lessons.map((lesson, index) => {
        const day = index + 1;
        const record = records[day] || {};
        const done = [record.read, record.talk, record.write].map((item, i) => item ? steps[i] : '').filter(Boolean);
        const state = status(day);
        const startedDate = record.started ? new Date(record.started).toLocaleDateString('en-NZ', {
          day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Pacific/Auckland',
        }) : '';
        return `<article class="review-row">
          <div class="review-day"><div class="review-icon ${lesson.colour}">${icon(lesson.art)}</div><div><p class="eyebrow">${dateLabel(day)}</p><h3 data-say="${practiceDates[index].label}. ${escapeText(lesson.title)}."><a href="${lessonLink(day)}">${lesson.title}</a></h3><p>${done.length ? done.join(' · ') : 'No steps recorded yet'}</p>${startedDate ? `<p>Started ${startedDate}</p>` : ''}</div><span class="status ${state.toLowerCase()}" data-say>${state}</span></div>
          <details class="help review-notes"><summary data-say="Grown-up notes">Grown-up notes<span class="notes-indicator">${record.support ? ' · Saved' : ''}</span></summary>${notesForm(day, record)}</details>
          <div class="print-notes">${record.support ? `${observations(record)}${record.note ? `<p class="print-note">${escapeText(record.note)}</p>` : ''}` : ''}</div>
        </article>`;
      }).join('')}
    </section>
    <section class="panel comparison" aria-labelledby="compare-title">
      <h2 id="compare-title">${dateLabel(1)} and ${dateLabel(7)}</h2>
      <p>Compare the first read and look at the two paper samples together.</p>
      <div class="comparison-grid">${[1, 7].map(day => `<section><h3>${dateLabel(day)}</h3>${observations(records[day] || {})}</section>`).join('')}</div>
      <p class="compare-hint" ${anyNotes ? 'hidden' : ''}>Add grown-up notes for either date to start the comparison.</p>
    </section>
    <p class="privacy">Progress and notes are saved in this browser. Keep the handwritten pages with you.</p>
  </div>`;
}

let nextCelebration = null;
let disposeWritingGuide;

function render({ focus = false } = {}) {
  disposeWritingGuide?.();
  window.pronunciation?.stop();
  const hash = location.hash || '#home';
  const match = /^#day-([1-7])\/(read|talk-1|talk-2|write|finish)$/.exec(hash);
  const reviewPage = hash === '#review';
  let content;

  if (match) {
    const day = Number(match[1]);
    const record = records[day] || {};
    const step = match[2] === 'finish' && !record.done ? 'write' : match[2];
    if (!record.started) save(day, { started: Date.now(), updated: Date.now() });
    content = lessonPage(day, step, nextCelebration === day);
    document.title = `${practiceDates[day - 1].label} · ${lessons[day - 1].title} | Pippin’s Reading Club`;
  } else {
    content = reviewPage ? review() : home();
    document.title = reviewPage ? 'My practice review | Pippin’s Reading Club' : 'Pippin’s Reading Club';
  }

  nextCelebration = null;
  main.innerHTML = `<p id="storage-message" class="storage-message" role="status" ${storageAvailable ? 'hidden' : ''}>This browser couldn’t save your practice. Keep this tab open to use it for this visit.</p>${content}`;
  window.pronunciation?.decorate(main);
  const writingGuide = main.querySelector('[data-writing-guide]');
  disposeWritingGuide = writingGuide ? window.mountWritingGuide?.(writingGuide) : undefined;
  const coachShortcut = main.querySelector('[data-open-coach]');
  if (coachShortcut && window.spellingCoachReady) coachShortcut.hidden = false;
  for (const [id, active] of [['home-link', !reviewPage], ['review-link', reviewPage]]) {
    const link = document.getElementById(id);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (focus) {
    const heading = main.querySelector('#activity-title') || main.querySelector('h1');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

main.addEventListener('click', event => {
  const button = event.target.closest('button[data-next]');
  if (event.target.closest('#print-review')) {
    window.print();
    return;
  }
  if (!button) return;

  const day = Number(button.closest('[data-day]').dataset.day);
  const { mark, next } = button.dataset;
  const record = records[day];
  const changes = { [mark]: true, updated: Date.now() };
  if (mark === 'talk' && !record.questionOne) {
    location.hash = `#day-${day}/talk-1`;
    return;
  }
  const progress = { ...record, ...changes };
  if (progress.read && progress.talk && progress.write) {
    changes.done = true;
    if (!record.done) nextCelebration = day;
  }
  save(day, changes);
  location.hash = changes.done ? `#day-${day}/finish` : mark === 'write' ? lessonLink(day) : `#day-${day}/${next}`;
});

main.addEventListener('submit', event => {
  const form = event.target.closest('[data-notes-day]');
  if (!form) return;
  event.preventDefault();
  const day = Number(form.dataset.notesDay);
  const fields = new FormData(form);
  save(day, {
    support: skills.map((_, index) => fields.get(`skill-${index}`)),
    sentences: fields.get('sentences'),
    checks: fields.getAll('checks'),
    note: fields.get('note').trim(),
  });
  form.querySelector('.save-message').textContent = storageAvailable ? 'Notes saved on this device.' : 'Notes kept for this visit.';
  document.querySelector('#storage-message').hidden = storageAvailable;
  const row = form.closest('.review-row');
  row.querySelector('.notes-indicator').textContent = storageAvailable ? ' · Saved' : '';
  row.querySelector('.print-notes').innerHTML = `${observations(records[day])}${records[day].note ? `<p class="print-note">${escapeText(records[day].note)}</p>` : ''}`;
  if (day === 1 || day === 7) {
    const comparisonDay = main.querySelectorAll('.comparison-grid section')[day === 1 ? 0 : 1];
    comparisonDay.querySelector('.observations').outerHTML = observations(records[day]);
    window.pronunciation?.decorate(comparisonDay);
    main.querySelector('.compare-hint').hidden = true;
  }
});

document.querySelector('#skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});
window.addEventListener('hashchange', () => render({ focus: true }));
window.pronunciation?.decorate(document.querySelector('.masthead'));
window.pronunciation?.decorate(document.querySelector('.footer'));
render();
