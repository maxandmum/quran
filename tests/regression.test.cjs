const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
function load(code, dependencies) {
  const context = vm.createContext(dependencies);
  vm.runInContext(code, context);
  return context;
}

function homeHarness(state = {}) {
  const S = { lessons: {}, ex: {}, days: {}, goal: 30, ...state };
  const COURSE = { lessons: Array.from({ length: 110 }, (_, i) => ({ n: i + 1 })), modules: [{ id: 1, from: 1, to: 30 }, { id: 2, from: 31, to: 55 }, { id: 3, from: 56, to: 95 }, { id: 4, from: 96, to: 110 }] };
  return load(section('function homeLearningState()', 'async function pageHome('), {
    S, COURSE, today: () => '2026-11-05',
    nextLessonN: () => COURSE.lessons.find(l => l.n >= (S.placeFrom || 1) && !S.lessons[l.n]?.done)?.n || 1,
    moduleOf: n => COURSE.modules.find(m => n >= m.from && n <= m.to)
  }).homeLearningState();
}
test('home: a beginner starts at lesson one with zero course and daily progress', () => {
  const d = homeHarness();
  assert.equal(d.started, false); assert.equal(d.n, 1);
  assert.equal(d.completed, 0); assert.equal(d.points, 0); assert.equal(d.allDone, false);
});
test('home: placement skips do not count as completed lessons and points do not imply a completed lesson', () => {
  const d = homeHarness({ placeFrom: 31, days: { '2026-11-05': 45 }, lessons: { 999: { done: true } } });
  assert.equal(d.started, true); assert.equal(d.n, 31); assert.equal(d.module.id, 2);
  assert.equal(d.completed, 0); assert.equal(d.completedToday, 0); assert.equal(d.dailyPercent, 100);
});
test('home: only lessons actually completed today get the daily completion marker', () => {
  const d = homeHarness({ lessons: { 1: { done: true, at: '2026-11-04' }, 2: { done: true, at: '2026-11-05' }, 3: { done: false, at: '2026-11-05' } } });
  assert.equal(d.n, 3); assert.equal(d.completed, 2); assert.equal(d.completedToday, 1); assert.equal(d.moduleDone, 2);
});
test('home: a finished course remains 110 of 110 instead of offering lesson one as new', () => {
  const d = homeHarness({ lessons: Object.fromEntries(Array.from({ length: 110 }, (_, i) => [i + 1, { done: true, at: '2026-11-04' }])) });
  assert.equal(d.allDone, true); assert.equal(d.n, 110); assert.equal(d.completed, 110); assert.equal(d.percent, 100);
});

function offlineHarness(failing = [], { opaque = false, mutate = false } = {}) {
  const S = { reciter: 'reader-a', lang: 'ru' }, stored = new Map();
  const urls = ['text.json', 'translation.json', '1.mp3', '2.mp3'];
  const response = () => ({ ok: true, type: opaque ? 'opaque' : 'cors', headers: { get: () => 'audio/mpeg' }, clone: response, blob: async () => ({ size: 100 }), json: async () => ({}) });
  let saved = 0;
  const context = load(section('async function offSave(', '// для сохранённой суры'), {
    S, OFF_CACHE: 'test', window: { caches: {} }, navigator: {},
    caches: { open: async () => ({ match: async url => stored.get(url), put: async (url, value) => stored.set(url, value) }) },
    offURLs: (n, rec, lang) => { assert.equal(rec, 'reader-a'); assert.equal(lang, 'ru'); return urls; },
    fetch: async url => { if (mutate) { S.reciter = 'reader-b'; S.lang = 'tr'; } if (failing.includes(url)) throw Error('network'); return response(); },
    save: () => saved++
  });
  return { S, stored, save: () => context.offSave(1, () => {}), saved: () => saved };
}
test('offline: all mandatory files are required, including one or two failed requests', async () => {
  for (const failures of [['1.mp3'], ['1.mp3', '2.mp3']]) {
    const h = offlineHarness(failures);
    await assert.rejects(h.save(), /net/);
    assert.equal(h.S.off, undefined);
    assert.equal(h.saved(), 0);
  }
});
test('offline: opaque responses cannot be advertised as playable offline', async () => {
  const h = offlineHarness([], { opaque: true });
  await assert.rejects(h.save(), /net/);
  assert.equal(h.S.off, undefined);
});
test('offline: a successful copy records the language and reader at the start of the download', async () => {
  const h = offlineHarness([], { mutate: true });
  await h.save();
  assert.equal(h.stored.size, 4);
  assert.equal(h.S.off[1].rec, 'reader-a');
  assert.equal(h.S.off[1].lang, 'ru');
  assert.equal(h.S.off[1].complete, true);
});

const keys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
function timesHarness(rows = [], failure = false) {
  const rowsFor = async () => { if (failure) throw Error('offline'); return rows; };
  return load(section('const hasCityCoords =', 'const tMin ='), {
    PT_KEYS: keys, ymd: () => '2026-11-05', dyRows: rowsFor, dumkYear: rowsFor,
    calcTimes: () => ({ fajr: '05:00' }), cityOff: () => 3
  });
}
test('prayer times: successful official results retain their actual source', async () => {
  const h = timesHarness([['2026-11-05', '05:00', '06:00', '12:00', '15:00', '18:00', '19:00']]);
  for (const src of ['dy', 'dumk']) assert.equal((await h.timesFor({ src }, new Date())).source, src);
});
test('prayer times: unavailable official results are explicitly marked calculated', async () => {
  const h = timesHarness([], true);
  for (const src of ['dy', 'dumk']) {
    const times = await h.timesFor({ src, lat: '41', lng: '29' }, new Date());
    assert.equal(times.source, 'calc');
    assert.equal(times.fajr, '05:00');
  }
});
test('prayer times: missing or invalid coordinates must not turn into 0°,0°', async () => {
  const h = timesHarness([], true);
  for (const coords of [{ lat: null, lng: null }, { lat: '', lng: '29' }, { lat: 'bad', lng: 29 }, { lat: 91, lng: 29 }]) {
    await assert.rejects(h.timesFor({ src: 'dy', ...coords }, new Date()), /coordinates/);
  }
  assert.equal((await h.timesFor({ src: 'calc', lat: 0, lng: 0 }, new Date())).source, 'calc');
});

// A small DOM substitute keeps these tests dependency-free. The application
// functions themselves run unmodified; the browser checklist covers real DOM,
// focus, persistence, Arabic text and styling.
class Element {
  constructor(tag, attrs = {}, ...kids) {
    this.tag = tag; this.attrs = attrs; this.isConnected = true;
    this.children = []; this.style = {}; this.dataset = {}; this.className = attrs.class || '';
    this.classList = { add() {}, remove() {}, toggle() {} };
    if (attrs.style) for (const part of attrs.style.split(';')) { const [k, v] = part.split(':'); if (k) this.style[k] = v; }
    Object.assign(this, Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('on'))));
    if (attrs.html) this.innerHTML = attrs.html;
    this.append(...kids);
  }
  append(...kids) { this.children.push(...kids.flat().filter(x => x != null)); }
  set innerHTML(value) { this.children = []; this.html = value; }
  get innerHTML() { return this.html || ''; }
  get firstChild() { return this.children[0]; }
  get textContent() { return this.children.length ? this.children.map(x => x instanceof Element ? x.textContent : String(x)).join('') : (this.html || '').replace(/<[^>]*>/g, ''); }
  set textContent(value) { this.children = [String(value)]; }
  all() { return [this, ...this.children.flatMap(x => x instanceof Element ? x.all() : [])]; }
  querySelectorAll(selector) { return this.all().filter(x => x.tag === selector); }
  setAttribute(key, value) { this.attrs[key] = value; }
  getAttribute(key) { return this.attrs[key]; }
  scrollIntoView() {}
  cloneNode() { return new Element(this.tag, this.attrs); }
  focus() { this.focused = true; }
}
const h = (...args) => new Element(...args);
const L = value => typeof value === 'string' ? value : value?.ru || '';
const ui = { h, L, LX: r => r, T: key => key, icon: () => '', esc: String, mdEl: x => h('p', {}, L(x)), mdInline: L, md: L };
test('placement: repeated unknown and option clicks score only one answer', () => {
  const timers = [], S = { lang: 'ru' }, v = h('main');
  const ctx = load(section('function pagePlacement(', '\nfunction pageTrainer('), {
    ...ui, S, PLACE: [{ n: ['Буквы', 'Буквы', 'Harfler'], items: [['letters', 8]] }],
    TRAINERS: [{ id: 'letters', make: () => ({ q: 'Test', options: [{ t: 'A' }, { t: 'B' }], answer: 0 }) }],
    shuffle: x => x, backHead: () => h('header'), routeDelay: fn => timers.push(fn)
  });
  ctx.pagePlacement(v);
  v.all().find(x => x.tag === 'button' && x.textContent === 'Начать тест').onclick();
  const unknown = v.all().find(x => x.tag === 'button' && x.textContent === 'Не знаю');
  const choice = v.all().find(x => x.tag === 'button' && x.textContent === 'A');
  unknown.onclick(); unknown.onclick(); choice.onclick();
  assert.equal(timers.length, 1);
  assert.equal(unknown.disabled, true);
  assert.equal(choice.disabled, true);
  timers.shift()();
  assert.match(v.textContent, /2 \/ 8/);
  assert.doesNotMatch(v.textContent, /3 \/ 8/);
});

test('lesson: restored completion includes exercises, tracing and tests and gates finish', async () => {
  const S = { ex: { 'e1.0': 1 }, lessons: {}, lessonSteps: { 1: 'practice' } }, v = h('main'); let lessonContext, lessonAwards = 0;
  const lesson = { n: 1, title: 'Lesson', goal: 'Goal', blocks: [{ type: 'ex' }, { type: 'trace' }, { type: 'test' }] };
  const ctx = load(section('function lessonStagePlan(', 'function lessonAudioSamples(') + section('async function pageLesson(', '\n/* ═════════════ блоки'), {
    ...ui, S, COURSE: { lessons: [{ ready: true }] }, allowLesson: async () => true,
    moduleOf: () => ({ id: 1, title: 'Alphabet' }), loadModule: async () => [lesson], loadSura: async () => ({}),
    lessonAudioSamples: () => [], focusLessonContent() {}, stopAudio() {}, lessonLanguageNotice: () => null, renderBlock: (b, k, context) => { lessonContext = context; return h('div'); },
    save() {}, addXP: xp => { if (xp === 20) lessonAwards++; }, checkBadges() {}, today: () => '2026-11-05', exCounter: 0
  });
  await ctx.pageLesson(v, 1);
  const practice = v.all().find(x => x.attrs.id === 'lesson-1-practice');
  assert.equal(practice.hidden, false);
  v.all().find(x => x.tag === 'button' && x.textContent === '1Разбор').onclick();
  assert.equal(S.lessonSteps[1], 'theory');
  const finish = v.all().find(x => x.className.includes('lesson-finish'));
  assert.equal(finish.disabled, true);
  assert.match(v.textContent, /1 из 3/);
  finish.onclick();
  assert.equal(S.lessons[1], undefined);
  lessonContext.onSolve('t1.1', null);
  assert.equal(finish.disabled, true);
  lessonContext.onSolve('test1.2', null);
  assert.equal(finish.disabled, false);
  assert.match(v.textContent, /Задания: 3 \/ 3/);
  finish.onclick();
  assert.equal(S.lessons[1].done, true);
  assert.equal(v.all().find(x => x.className === 'lesson-result').hidden, false);
  finish.onclick();
  assert.equal(lessonAwards, 1);
});

test('lesson: all 110 lesson stage plans preserve every original block index and order', () => {
  const ctx = load(section('function lessonStagePlan(', 'function lessonAudioSamples('), {});
  let count = 0;
  for (let m = 1; m <= 4; m++) {
    const rows = JSON.parse(fs.readFileSync(path.join(__dirname, `../data/lessons-m${m}.json`)));
    for (const lesson of rows.lessons || rows) {
      for (const audio of [false, true]) {
        const plan = ctx.lessonStagePlan(lesson.blocks, audio);
        assert.equal(JSON.stringify(plan.flatMap(s => s.entries.map(e => e.index))), JSON.stringify(lesson.blocks.map((_, i) => i)), `lesson ${lesson.n}`);
        assert.equal(plan.some(s => s.id === 'listen'), audio);
        assert.equal(plan.at(-1).id, 'check');
      }
      count++;
    }
  }
  assert.equal(count, 110);
});

test('lesson: recorded audio samples use real lesson examples and omit an empty listening stage', () => {
  const core = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core.json')));
  const SURA_D = Object.fromEntries(core.suras.map(s => [s.n, JSON.parse(fs.readFileSync(path.join(__dirname, `../quran/${String(s.n).padStart(3, '0')}.json`)))]));
  const ctx = load(section('function lessonAudioSamples(', 'function lessonListening('), {
    L, LX: r => r, T: x => x, SURA_D,
    letterBy: ar => core.letters.find(x => x.ar === ar), suraBy: n => core.suras.find(x => x.n === n),
    wordURL: loc => `https://audio.qurancdn.com/wbw/${loc}.mp3`, ayahURL: (s, a) => `https://everyayah.com/${s}/${a}.mp3`
  });
  for (let m = 1; m <= 4; m++) {
    const rows = JSON.parse(fs.readFileSync(path.join(__dirname, `../data/lessons-m${m}.json`)));
    for (const lesson of rows.lessons || rows) {
      const samples = ctx.lessonAudioSamples(lesson);
      assert.ok(samples.length <= 4);
      assert.equal(new Set(samples.map(s => s.url)).size, samples.length);
      for (const sample of samples) { assert.ok(sample.ar); assert.ok(sample.label); assert.match(sample.url, /^https:\/\//); }
      if (lesson.n === 1) assert.equal(samples.length, 0);
      if (lesson.n === 3 || lesson.n === 96) assert.ok(samples.length > 0);
    }
  }
});

test('lesson audio: lesson speed is applied without changing the default outside lessons', async () => {
  const Audio1 = { play: () => Promise.resolve() };
  const ctx = load(section('function playURL(', '/* ───── озвучка букв'), {
    Audio1, OFF_MAP: {}, LP: null, stopAudio() {}, toast() {}, T: x => x
  });
  for (const [el, explicit, expected] of [[null, undefined, 1], [{ closest: () => ({ dataset: { audioRate: '0.75' } }), classList: { add() {}, remove() {} } }, undefined, 0.75], [null, 1.25, 1.25]]) {
    const pending = ctx.playURL('https://example.com/example.mp3', el, explicit);
    assert.equal(Audio1.playbackRate, expected);
    Audio1.onended(); assert.equal(await pending, true);
  }
});

test('lesson quiz: feedback waits for manual advance and repeated answer events score once', () => {
  const S = { tests: {} }; let passed = 0;
  const ctx = load(section('function testEl(', '/* ═════════════ аяты'), {
    ...ui, S, save() {}, checkBadges() {}, focusLessonContent() {},
    exEl: (item, key, unused, opts) => h('button', { onclick: () => { opts.onDone(true); opts.onDone(true); } }, 'answer')
  });
  const box = ctx.testEl({ items: [{}, {}], pass: 70 }, '1.0', { onSolve: () => passed++ });
  box.all().find(x => x.tag === 'button' && x.textContent === 'testStart').onclick();
  box.all().find(x => x.tag === 'button' && x.textContent === 'answer').onclick();
  assert.match(box.textContent, /question 1 \/ 2/);
  const next = box.all().find(x => x.className === 'btn test-next');
  assert.equal(next.hidden, false); next.onclick();
  assert.match(box.textContent, /question 2 \/ 2/);
  box.all().find(x => x.tag === 'button' && x.textContent === 'answer').onclick();
  box.all().find(x => x.className === 'btn test-next').onclick();
  assert.equal(S.tests['1.0'], 100); assert.equal(passed, 1);
});

test('lesson practice: an error reveals the authored explanation and a correction solves once', () => {
  const S = { ex: {} }; let solved = 0;
  const ctx = load(section('let exCounter =', '/* ───── контрольная'), { ...ui, S });
  const box = ctx.exEl({ kind: 'mcq', q: 'Question', options: [{ t: 'A' }, { t: 'B' }], answer: 1, explain: 'Rule explanation' }, '1.0', { onSolve: () => solved++ });
  box.all().find(x => x.tag === 'button' && x.textContent === 'A').onclick();
  assert.match(box.textContent, /Rule explanation/); assert.equal(solved, 0);
  const right = box.all().find(x => x.tag === 'button' && x.textContent === 'B');
  right.onclick(); right.onclick(); assert.equal(solved, 1);
});

test('router: late asynchronous rendering cannot append to the current page', async () => {
  let current = h('main'), release;
  const prepare = el => { el.replaceWith = next => { el.isConnected = false; current = next; prepare(next); }; };
  prepare(current);
  const location = { hash: '#/ref' };
  const context = load(section('let ROUTE_SEQ =', '\nfunction notFound('), {
    h, location, document: { querySelectorAll: () => [], body: { dataset: {} } },
    $: () => current, window: { scrollTo() {} }, ASK_DISMISS: null, RTIP: null, stopAudio() {}, onListenChange: null,
    markNav() {}, pageRef: async view => { await new Promise(resolve => { release = resolve; }); view.append('old page'); },
    pageMe: view => view.append('current page'), notFound: () => assert.fail('unexpected route failure'),
    setTimeout, clearTimeout, console
  });
  const first = context.route();
  location.hash = '#/me';
  await context.route();
  release(); await first;
  assert.equal(current.textContent, 'current page');
});
