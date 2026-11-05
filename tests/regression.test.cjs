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
    this.children = []; this.style = {}; this.className = attrs.class || '';
    this.classList = { add() {}, remove() {}, toggle() {} };
    if (attrs.style) for (const part of attrs.style.split(';')) { const [k, v] = part.split(':'); if (k) this.style[k] = v; }
    Object.assign(this, Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('on'))));
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
  const S = { ex: { 'e1.0': 1 }, lessons: {} }, v = h('main'); let lessonContext;
  const lesson = { n: 1, title: 'Lesson', goal: 'Goal', blocks: [{ type: 'ex' }, { type: 'trace' }, { type: 'test' }] };
  const ctx = load(section('async function pageLesson(', '\n/* ═════════════ блоки'), {
    ...ui, S, COURSE: { lessons: [{ ready: true }] }, allowLesson: async () => true,
    moduleOf: () => ({ id: 1, title: 'Alphabet' }), loadModule: async () => [lesson], loadSura: async () => ({}),
    lessonLanguageNotice: () => null, renderBlock: (b, k, context) => { lessonContext = context; return h('div'); },
    save() {}, addXP() {}, checkBadges() {}, today: () => '2026-11-05', exCounter: 0
  });
  await ctx.pageLesson(v, 1);
  const finish = v.all().find(x => x.tag === 'button');
  assert.equal(finish.disabled, true);
  assert.match(v.textContent, /1 из 3/);
  finish.onclick();
  assert.equal(S.lessons[1], undefined);
  lessonContext.onSolve('t1.1', null);
  assert.equal(finish.disabled, true);
  lessonContext.onSolve('test1.2', null);
  assert.equal(finish.disabled, false);
  assert.match(v.textContent, /3 из 3/);
  finish.onclick();
  assert.equal(S.lessons[1].done, true);
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
