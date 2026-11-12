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
    const classes = new Set(this.className.split(" "));
    this.classList = { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x), toggle: x => classes.has(x) ? classes.delete(x) : classes.add(x) };
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

function backupHarness() {
  return load(section('const BACKUP_FORMAT =', 'function profileLearningSummary('), {
    KEY: 'test.progress', TextEncoder,
    CORE: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core.json'))),
    COURSE: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/course.json'))),
    BADGES: ['first', 'm1', 'm2', 'm3', 'm4', 's3', 's7', 's30', 't100', 'perfect', 'fatiha', 'hifz5'].map(k => [k])
  });
}
function backupFixture() {
  return { xp: 47, days: { '2026-11-05': 47 }, lessons: { 1: { done: true, at: '2026-11-05' } },
    ex: { 'e1.12': 1, 't2.5': 1, 'c1.16.0': 1 }, tests: { '30.68': 90 }, badges: { first: '2026-11-05' },
    hifz: { 1: { 1: '2026-11-05' } }, hifzAwarded: { '1:1': true }, hifzBonus: { 1: true }, tr: { n: 7, ok: 6 },
    last: { s: 112, a: 2 }, bm: { '112:2': 1793894400000 },
    rv: { 'l:ب': { i: 2, due: '2026-11-12' }, 'r:qalqala': { i: -1, due: '2026-11-06' }, 'a:1:1': { i: 0, due: '2026-11-07' } },
    exams: { 1: { best: 20, passed: true, at: '2026-11-05', score: 20 }, 2: { best: 14, passed: false, at: null, score: undefined } },
    lessonSteps: { 2: 'practice' }, place: { lv: 2, at: '2026-11-05', sc: [90, 40, null, 0] }, placeFrom: 31, goal: 60,
    tsb: { k: 1, day: '2026-11-05', d: { sub: 33 }, t: { sub: 99 }, vib: true, goal: '2026-11-05' },
    zkFav: ['tawhid'], azk: { day: '2026-11-05', c: { ev_one: 'done' } }, duaG: 2,
    lang: 'ru', theme: 'dark', city: { title: 'Private city', lat: 41 }, certName: 'Private name', off: { 1: { complete: true } } };
}
const plain = value => JSON.parse(JSON.stringify(value));
function readingHarness() { return load(section('function readingAudioPreferences(', 'async function pageSura('), {}); }
test('reading: inclusive ranges support per-ayah and whole-range repetition', () => {
  const ctx = readingHarness();
  assert.deepEqual(Array.from(ctx.readingPlaybackQueue(2, 3, 7, 3), x => x.ayah), [2, 2, 2, 3, 3, 3]);
  assert.deepEqual(Array.from(ctx.readingPlaybackQueue(2, 3, 7, 3, 'range'), x => x.ayah), [2, 3, 2, 3, 2, 3]);
  assert.deepEqual(Array.from(ctx.readingPlaybackQueue(7, 7, 7, 1), x => x.ayah), [7]);
});
test('reading: invalid ranges and unbounded repeat settings cannot create a playback queue', () => {
  const ctx = readingHarness();
  for (const args of [[0, 3, 7, 1], [3, 2, 7, 1], [1, 8, 7, 1], [1.5, 2, 7, 1], [NaN, 2, 7, 1], [1, 2, 7, 100], [1, 2, 7, 3, 'invalid']]) assert.equal(ctx.readingPlaybackQueue(...args), null);
});
test('reading: completion follows the configured queue exactly once', async () => {
  const ctx = readingHarness(), played = [], marked = [], finished = [];
  const controller = ctx.readingPlaybackController({ play: async n => { played.push(n); return true; }, onItem: x => marked.push(x.ayah), onFinish: ok => finished.push(ok) });
  await controller.start(ctx.readingPlaybackQueue(2, 3, 4, 3, 'range'));
  assert.deepEqual(played, [2, 3, 2, 3, 2, 3]); assert.deepEqual(marked, played); assert.deepEqual(finished, [true]);
});
test('reading: stopping or leaving a route prevents late audio completion from starting another ayah', async () => {
  const ctx = readingHarness(), played = [], finished = []; let release;
  const controller = ctx.readingPlaybackController({ play: n => { played.push(n); return new Promise(resolve => release = resolve); }, onItem() {}, onFinish: ok => finished.push(ok) });
  const pending = controller.start(ctx.readingPlaybackQueue(1, 3, 4, 1));
  controller.cancel(); release(true); await pending;
  assert.deepEqual(played, [1]); assert.deepEqual(finished, []);
});
test('reading: failed or rejected audio stops the queue and reports an interrupted run', async () => {
  const ctx = readingHarness();
  for (const rejects of [false, true]) {
    let attempts = 0; const finished = [];
    const controller = ctx.readingPlaybackController({ play: async () => { attempts++; if (rejects) throw Error('audio'); return false; }, onItem() {}, onFinish: ok => finished.push(ok) });
    await controller.start(ctx.readingPlaybackQueue(1, 3, 4, 3));
    assert.equal(attempts, 1); assert.deepEqual(finished, [false]);
  }
});
test('reading: read and hifz defaults differ while invalid saved preferences fall back safely', () => {
  const ctx = readingHarness();
  assert.equal(ctx.readingAudioPreferences(undefined, false).repeats, 1);
  assert.equal(ctx.readingAudioPreferences(undefined, true).repeats, 3);
  assert.deepEqual(plain(ctx.readingAudioPreferences({ rate: 99, repeats: -1, mode: '<script>' }, false)), { rate: 1, repeats: 1, mode: 'ayah' });
  assert.deepEqual(plain(ctx.readingAudioPreferences({ rate: 0.75, repeats: 5, mode: 'range' }, true)), { rate: 0.75, repeats: 5, mode: 'range' });
});
test('backup: export/import preserves learning, review, bookmarks and award history without device or personal data', () => {
  const ctx = backupHarness(), backup = ctx.makeProgressBackup(backupFixture());
  const parsed = ctx.parseProgressBackup(JSON.stringify(backup));
  assert.deepEqual(plain(parsed), plain(backup));
  assert.equal(parsed.progress.rv['l:ب'].due, '2026-11-12');
  assert.equal(parsed.progress.hifzAwarded['1:1'], true);
  assert.equal(parsed.progress.hifz[1][1], '2026-11-05');
  const legacy = plain(backup); legacy.progress.hifz[1][1] = true;
  assert.equal(ctx.parseProgressBackup(JSON.stringify(legacy)).progress.hifz[1][1], true);
  assert.equal(parsed.progress.exams[2].score, undefined);
  for (const key of ['city', 'certName', 'off', 'lang', 'theme']) assert.equal(Object.hasOwn(parsed.progress, key), false);
});
test('backup: a beginner backup is valid and includes empty optional progress sections', () => {
  const ctx = backupHarness();
  const parsed = ctx.parseProgressBackup(JSON.stringify(ctx.makeProgressBackup({ xp: 0, lessons: {} })));
  assert.equal(parsed.progress.xp, 0); assert.equal(Object.keys(parsed.progress.bm).length, 0);
});
test('backup: wrong files, future versions, invalid dates, scores and verse references are rejected', () => {
  const ctx = backupHarness(), valid = plain(ctx.makeProgressBackup(backupFixture()));
  assert.throws(() => ctx.parseProgressBackup('{bad'));
  assert.throws(() => ctx.parseProgressBackup('{}'));
  for (const mutate of [x => x.version = 2, x => x.progress.days = { '2026-02-31': 20 }, x => x.progress.xp = -1,
    x => x.progress.lessons[111] = { done: true }, x => x.progress.last = { s: 112, a: 99 }, x => x.progress.tests['30.68'] = 101,
    x => x.progress.hifz[1][1] = '2026-02-31', x => x.progress.tr.ok = 100, x => x.progress.off = { 1: { complete: true } }, x => x.progress.hifz[1][99] = true]) {
    const changed = plain(valid); mutate(changed); assert.throws(() => ctx.parseProgressBackup(JSON.stringify(changed)));
  }
});
test('backup: unsafe keys, oversized input and deeply nested input are rejected without prototype changes', () => {
  const ctx = backupHarness(), valid = plain(ctx.makeProgressBackup(backupFixture()));
  valid.progress.lessons = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.throws(() => ctx.parseProgressBackup(JSON.stringify(valid))); assert.equal({}.polluted, undefined);
  assert.throws(() => ctx.parseProgressBackup('ب'.repeat(1024 * 1024 + 1)), e => e.code === 'size');
  assert.throws(() => ctx.parseProgressBackup('['.repeat(10) + '0' + ']'.repeat(10)));
});
test('backup: preview parsing never mutates the current state or writes to storage', () => {
  const ctx = backupHarness(), current = backupFixture(), before = JSON.stringify(current);
  ctx.parseProgressBackup(JSON.stringify(ctx.makeProgressBackup({ xp: 0, lessons: {} })));
  assert.equal(JSON.stringify(current), before);
});
test('backup: restore writes a recoverable previous copy and keeps device settings and audio caches', () => {
  const ctx = backupHarness(), current = backupFixture(), incoming = ctx.makeProgressBackup({ xp: 20, lessons: { 2: { done: true, at: '2026-11-06' } } }).progress;
  const values = new Map(), storage = { setItem: (k, v) => values.set(k, v) };
  const next = ctx.restoreProgressBackup(storage, current, incoming);
  assert.equal(next.xp, 20); assert.equal(next.lessons[1], undefined); assert.equal(next.lessons[2].done, true);
  assert.equal(next.lang, current.lang); assert.deepEqual(next.city, current.city); assert.deepEqual(next.off, current.off);
  assert.equal(current.xp, 47);
  const previous = ctx.parseProgressBackup(values.get('iqra.progress-before-restore.v1'));
  assert.equal(previous.progress.xp, 47); assert.equal(previous.progress.bm['112:2'], 1793894400000);
  const undo = ctx.restoreProgressBackup(storage, next, previous.progress);
  assert.deepEqual(plain(ctx.makeProgressBackup(undo).progress), plain(ctx.makeProgressBackup(current).progress));
});
test('backup: failed storage writes do not replace current progress', () => {
  const ctx = backupHarness(), current = backupFixture(), original = JSON.stringify(current), incoming = ctx.makeProgressBackup({ xp: 0, lessons: {} }).progress;
  for (const failAt of [1, 2]) {
    let writes = 0; const values = new Map([['test.progress', original]]);
    const storage = { setItem: (k, v) => { if (++writes === failAt) throw Error('quota'); values.set(k, v); } };
    assert.throws(() => ctx.restoreProgressBackup(storage, current, incoming), /quota/);
    assert.equal(values.get('test.progress'), original); assert.equal(JSON.stringify(current), original);
  }
});
test('backup: restoring the same file twice does not add XP or discard prior reward flags', () => {
  const ctx = backupHarness(), original = backupFixture(), incoming = ctx.makeProgressBackup(original).progress;
  const storage = { setItem() {} }, next = ctx.restoreProgressBackup(storage, original, incoming);
  const again = ctx.restoreProgressBackup(storage, next, incoming);
  assert.equal(again.xp, 47); assert.equal(again.hifzAwarded['1:1'], true); assert.equal(again.hifzBonus[1], true);
});
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
  v.all().find(x => x.tag === 'button' && x.textContent === '1Объяснение').onclick();
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
    h, location, rememberRouteOrigin() {}, document: { querySelectorAll: () => [], body: { dataset: {} } },
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

function mistakeHarness(state = {}) {
  const S = { ex: {}, ...state };
  return load(section('function recordMistake(', '/* ───── контрольная'), {
    ...ui, S, save() {}, today: () => '2026-11-06', shuffle: x => x,
    setTimeout() {}, routeDelay() {}
  });
}
const mistakeMCQ = { kind: 'mcq', q: 'Question', options: [{ t: 'A' }, { t: 'B' }], answer: 1, explain: 'Rule' };
const answer = (box, label) => box.all().find(x => x.tag === 'button' && x.textContent === label).onclick();
test('mistakes: retries count once and correction in the same attempt never reinforces', () => {
  const c = mistakeHarness();
  const el = c.exEl(mistakeMCQ, '1.0', { n: 1, onSolve() {} });
  answer(el, 'A'); answer(el, 'A'); answer(el, 'B'); answer(el, 'B');
  assert.deepEqual(plain(c.S.mistakes['l:1:0']), { misses: 1, clean: 0, first: '2026-11-06', last: '2026-11-06' });
});
test('mistakes: two later clean attempts reinforce, another error reopens the item', () => {
  const c = mistakeHarness();
  c.recordMistake(c.S, 't:letters', false, '2026-11-05');
  for (let i = 1; i <= 2; i++) {
    const el = c.exEl(mistakeMCQ, 'm', null, { mistakeRef: 't:letters' });
    answer(el, 'B'); answer(el, 'B'); assert.equal(c.S.mistakes['t:letters'].clean, i);
  }
  assert.equal(c.mistakeEntries(c.S).length, 0); assert.equal(c.mistakeEntries(c.S, true).length, 1);
  c.recordMistake(c.S, 't:letters', false, '2026-11-06');
  assert.equal(c.S.mistakes['t:letters'].clean, 0); assert.equal(c.S.mistakes['t:letters'].misses, 2);
  assert.equal(c.S.mistakes['t:letters'].first, '2026-11-05'); assert.equal(c.S.mistakes['t:letters'].last, '2026-11-06');
});
test('mistakes: unseen correct answers do not create records and hints cannot reinforce', () => {
  const c = mistakeHarness();
  answer(c.exEl(mistakeMCQ, 'm', null, { mistakeRef: 't:letters' }), 'B');
  assert.deepEqual(plain(c.S.mistakes), {});
  c.recordMistake(c.S, 't:letters', false, '2026-11-06');
  const el = c.exEl(mistakeMCQ, 'm', null, { mistakeRef: 't:letters' });
  el.mistakeHint(); answer(el, 'B'); assert.equal(c.S.mistakes['t:letters'].clean, 0);
});
test('mistakes: generated topic reviews preserve course scores and award no lesson XP', () => {
  const c = mistakeHarness({ xp: 47, lessons: { 1: { done: true } }, tests: { '1.5': 70 }, tr: { n: 8, ok: 5 } });
  const before = JSON.stringify({ xp: c.S.xp, lessons: c.S.lessons, tests: c.S.tests, tr: c.S.tr });
  c.recordMistake(c.S, 't:letters', false, '2026-11-06');
  answer(c.exEl(mistakeMCQ, 'm', null, { mistakeRef: 't:letters' }), 'B');
  assert.equal(JSON.stringify({ xp: c.S.xp, lessons: c.S.lessons, tests: c.S.tests, tr: c.S.tr }), before);
});
test('mistakes: all trainer IDs match the backup schema, round-trip and old files default to empty', () => {
  const c = backupHarness(), state = backupFixture();
  const trainerIds = Array.from(section('const TRAINERS =', 'function pagePractice(').matchAll(/\{ id: "([a-z]+)"/g), m => m[1]);
  state.mistakes = Object.fromEntries([...trainerIds.map(id => 't:' + id), 'l:1:0', 'q:30:68:2'].map(id => [id, { misses: 2, clean: 1, first: '2026-11-05', last: '2026-11-06' }]));
  assert.equal(trainerIds.length, 9);
  const backup = c.makeProgressBackup(state);
  assert.deepEqual(plain(c.parseProgressBackup(JSON.stringify(backup)).progress.mistakes), state.mistakes);
  delete backup.progress.mistakes;
  assert.deepEqual(plain(c.parseProgressBackup(JSON.stringify(backup)).progress.mistakes), {});
});
test('mistakes: backup rejects fabricated payloads, invalid IDs, counters and dates', () => {
  const c = backupHarness();
  const r = { misses: 1, clean: 0, first: '2026-11-05', last: '2026-11-06' };
  for (const [id, entry] of [['t:unknown', r], ['l:999:0', r], ['l:1:0:1', r], ['q:1:0', r], ['l:1:00', r],
    ['t:letters', { ...r, clean: 3 }], ['t:letters', { ...r, misses: 0 }], ['t:letters', { ...r, last: '2026-02-31' }],
    ['t:letters', { ...r, last: '2025-01-01' }], ['t:letters', { ...r, html: '<script>' }]]) {
    assert.throws(() => c.makeProgressBackup({ xp: 0, lessons: {}, mistakes: { [id]: entry } }));
  }
});
test('mistakes: missing original exercises and unknown trainers resolve safely', async () => {
  const c = mistakeHarness(); c.COURSE = { lessons: [{ n: 1, title: 'Lesson' }] }; c.TRAINERS = [];
  c.moduleOf = () => ({ id: 1 }); c.loadModule = async () => [{ n: 1, blocks: [] }];
  for (const id of ['t:unknown', 'q:1:999:0', 'l:1:999', 'untrusted']) assert.equal(await c.resolveMistake(id), null);
});
test('mistakes: tap, sort and order errors end single-attempt reviews exactly once', () => {
  for (const q of [
    { kind: 'tap', q: 'Find', grid: ['A', 'B'], target: 'B' },
    { kind: 'sort', q: 'Sort', cats: ['A', 'B'], items: [{ ar: 'X', cat: 1 }] },
    { kind: 'order', q: 'Order', pieces: ['A', 'B'], answer: 'AB' }
  ]) {
    const c = mistakeHarness(); let callbacks = 0, good;
    const el = c.exEl(q, 'm', null, { mistakeRef: 'l:1:0', single: true, onDone: ok => { callbacks++; good = ok; } });
    if (q.kind === 'order') { answer(el, 'B'); answer(el, 'A'); } else answer(el, 'A');
    answer(el, 'B'); answer(el, 'A');
    assert.equal(callbacks, 1, q.kind); assert.equal(good, false, q.kind);
    assert.equal(c.S.mistakes['l:1:0'].misses, 1); assert.equal(c.S.mistakes['l:1:0'].clean, 0);
  }
});
test('mistakes: quiz questions are tracked under original lesson/block/question references', () => {
  const refs = [];
  const c = load(section('function testEl(', '/* ═════════════ аяты'), {
    ...ui, S: { tests: {} }, save() {}, checkBadges() {}, focusLessonContent() {},
    exEl: (q, key, unused, opts) => { refs.push(opts.mistakeRef); return h('button', { onclick: () => opts.onDone(false) }, 'answer'); }
  });
  const el = c.testEl({ items: [{}, {}], pass: 70 }, '30.68', { n: 30 });
  answer(el, 'testStart'); answer(el, 'answer'); el.all().find(x => x.className === 'btn test-next').onclick();
  assert.deepEqual(refs, ['q:30:68:0', 'q:30:68:1']);
});

const menuHelpers = () => section('function menuCard(', 'async function pageHome(');
test('organization: all nine existing trainers belong to exactly one labelled group', () => {
  const c = load(section('function practiceGroups()', 'function pagePractice('), ui);
  const ids = c.practiceGroups().flatMap(g => Array.from(g.ids));
  const actual = Array.from(section('const TRAINERS =', 'function practiceGroups()').matchAll(/\{ id: "([a-z]+)"/g), m => m[1]);
  assert.deepEqual([...ids].sort(), actual.sort()); assert.equal(new Set(ids).size, ids.length);
  assert.equal(c.practiceGroups().length, 3);
});
test('organization: Quran memorization route reaches its selector and unknown modes remain 404', () => {
  let opened = 0, missing = 0;
  const c = load(section('function pageSuras(', 'function ayahBlock('), { pageHifz: () => opened++, notFound: () => missing++ });
  c.pageSuras({}, 'hifz'); c.pageSuras({}, 'unknown');
  assert.equal(opened, 1); assert.equal(missing, 1);
});
test('organization: memorization selector preserves all short surahs and prioritizes started ones', () => {
  const CORE = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core.json')));
  const c = load(menuHelpers() + section('function pageHifz(', '/* ═════════════ повторение:'), {
    ...ui, S: { hifz: { 112: { 1: '2026-11-06' } } }, CORE,
    pageHead: title => h('h1', {}, title), quranTabs: () => null,
    suraItem: (s, href) => h('a', { href }, s.n)
  });
  const v = h('main'); c.pageHifz(v);
  const links = v.all().filter(x => x.tag === 'a' && /#\/sura\/\d+\/hifz/.test(x.attrs.href));
  assert.equal(links[0].attrs.href, '#/sura/112/hifz');
  assert.equal(links.length, CORE.suras.filter(s => s.n === 1 || s.n >= 93 && s.c <= 11).length);
  assert.ok(v.all().some(x => x.tag === 'a' && x.attrs.href === '#/suras'));
});
test('design: home preserves next lesson and progress with open destinations', async () => {
  for (const [n, completed, allDone] of [[1, 0, false], [2, 1, false], [110, 110, true]]) {
    const c = load(menuHelpers() + section('async function pageHome(', '/* ═════════════ карта курса'), {
      ...ui, S: { lang: 'ru' }, COURSE: { lessons: Array.from({ length: 110 }, (_, i) => ({ n: i + 1, title: `Lesson ${i + 1}` })), modules: [{ id: 1, title: 'Alphabet', from: 1, to: 30 }] },
      ramadanShortcut: () => h("a", { href: "#/namaz/ramadan" }), homeLearningState: () => ({ n, completed, allDone, started: completed > 0, total: 110, points: 12, goal: 30 }),
      rvDue: () => [], mistakeEntries: () => [], heroGlyph: () => 'ا',
      pageHead: (title, sub) => h('header', {}, h('h1', {}, title), h('p', {}, sub)),
      ayahOfDay: () => h('div', {}, 'Daily ayah'), ramadanRow: () => null
    });
    const v = h('main'); await c.pageHome(v);
    const primary = v.all().filter(x => x.className === 'atelier-lesson');
    assert.equal(primary.length, 1); assert.equal(primary[0].attrs.href, allDone ? '#/practice' : `#/lesson/${n}`);
    const choices = v.all().find(x => x.className === 'home-portals');
    assert.deepEqual(choices.children.map(x => x.attrs.href), ['#/practice', '#/suras', '#/namaz']);
    const folds = v.all().filter(x => x.tag === 'details');
    assert.equal(folds.length, 0);
    assert.ok(v.all().some(x => x.tag === 'progress' && x.attrs.max === 110 && x.attrs.value === completed));
  }
});
test('design: all nine exercise choices stay open and recall only appears when available', () => {
  const ids = ['letters', 'lookalike', 'forms', 'harakat', 'listen', 'read', 'build', 'tajweed', 'madd'];
  for (const hasRecall of [false, true]) {
    const c = load(section('function practiceGroups()', 'function pageHifz('), {
      ...ui, S: {}, TRAINERS: ids.map(id => ({ id, t: [id, id, id], d: ['description', 'description', 'description'] })),
      rvDue: () => hasRecall ? ['a', 'b'] : [], mistakeEntries: () => hasRecall ? ['x'] : [],
      pageHead: title => h('h1', {}, title), learnTabs: () => null
    });
    const v = h('main'); c.pagePractice(v);
    assert.equal(v.all().filter(x => x.tag === 'details').length, 0);
    assert.deepEqual(v.all().filter(x => x.tag === 'a' && /^#\/practice\//.test(x.attrs.href)).map(x => x.attrs.href).sort(), ids.map(id => '#/practice/' + id).sort());
    assert.equal(v.all().some(x => x.tag === 'a' && x.attrs.href === '#/review'), hasRecall);
    assert.equal(v.all().some(x => x.tag === 'a' && x.attrs.href === '#/mistakes/train'), hasRecall);
  }
});


test('profile: initials follow the user name across scripts, spaces and combining marks', () => {
  const h = load(section('function profileInitial(', 'function pageMe('), { S: { lang: 'ru' } });
  assert.equal(h.profileInitial('  Boris Smith  '), 'B');
  assert.equal(h.profileInitial('Иса'), 'И');
  assert.equal(h.profileInitial('😀 ali'), 'A');
  assert.equal(h.profileInitial('c\u0327agla', 'tr'), 'Ç');
  assert.equal(h.profileInitial('isa', 'tr'), 'İ');
  assert.equal(h.profileInitial(null), '?');
});

function compassHarness(Device = {}) {
  const target = new EventTarget(), orientation = new EventTarget(); orientation.angle = 0;
  const headings = [], states = [], timers = new Map(); let nextTimer = 0;
  const c = load(section('const compassAngle =', 'function qiblaCard('), { window: {} });
  const tracker = c.compassTracker({ target, orientation, Device,
    onHeading: h => headings.push(h), onState: s => states.push(s),
    setTimer: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearTimer: id => timers.delete(id)
  });
  const emit = (attrs, type = 'deviceorientation') => { const e = new Event(type); Object.assign(e, attrs); target.dispatchEvent(e); };
  return { c, tracker, target, orientation, headings, states, timers, emit };
}
test('compass: relative, missing, invalid or uncalibrated data cannot supply north', () => {
  const { c } = compassHarness();
  for (const event of [{ alpha: 30, absolute: false }, { alpha: null, absolute: true }, { alpha: NaN, absolute: true }, { webkitCompassHeading: 20, webkitCompassAccuracy: -1 }]) assert.equal(c.compassHeading(event), null);
  assert.equal(c.compassHeading({ webkitCompassHeading: 0, webkitCompassAccuracy: 5 }), 0);
  assert.equal(c.compassHeading({ alpha: 90, absolute: true, beta: 0, gamma: 0 }), 270);
  assert.equal(c.compassHeading({ type: 'deviceorientationabsolute', alpha: 90 }), 270);
});
test('compass: screen orientation and tilt preserve cardinal directions', () => {
  const { c } = compassHarness();
  assert.equal(c.compassHeading({ webkitCompassHeading: 350 }, 90), 80);
  for (const beta of [0, 20, 35]) {
    assert.ok(Math.abs(c.compassHeading({ absolute: true, alpha: 270, beta, gamma: 15 }) - 90) < 1e-8);
  }
  assert.equal(c.compassHeading({ absolute: true, alpha: 0, beta: 0, gamma: 0 }, 90), 90);
  assert.equal(c.compassHeading({ absolute: true, alpha: 0, beta: 90, gamma: 0 }), null);
});
test('compass: requests absolute permission, rotates across north without a full spin and disposes listeners', async () => {
  let asked;
  const h = compassHarness({ requestPermission: async absolute => { asked = absolute; return 'granted'; } });
  await h.tracker.start(); assert.equal(asked, true); assert.deepEqual(h.states, ['waiting']);
  h.emit({ webkitCompassHeading: 359 }); h.emit({ webkitCompassHeading: 1 });
  assert.deepEqual(h.headings, [359, 361]);
  h.orientation.angle = 90; h.orientation.dispatchEvent(new Event('change')); assert.equal(h.headings.at(-1), 451);
  h.tracker.dispose(); h.emit({ webkitCompassHeading: 30 });
  assert.equal(h.headings.length, 3); assert.equal(h.timers.size, 0);
});
test('compass: denial, silent sensor and stale data are explicit, never a false working compass', async () => {
  const denied = compassHarness({ requestPermission: async () => 'denied' }); await denied.tracker.start();
  assert.equal(denied.states.at(-1), 'denied'); denied.emit({ webkitCompassHeading: 0 }); assert.equal(denied.headings.length, 0);
  const h = compassHarness(); await h.tracker.start(); h.emit({ alpha: 20, absolute: false });
  assert.equal(h.headings.length, 0); [...h.timers.values()][0](); assert.equal(h.states.at(-1), 'unavailable');
  await h.tracker.start(); h.emit({ absolute: true, alpha: 10 });
  assert.equal(h.states.at(-1), 'active'); [...h.timers.values()][0](); assert.equal(h.states.at(-1), 'stale');
  h.emit({ absolute: true, alpha: 20 }); assert.equal(h.states.at(-1), 'active'); h.tracker.dispose();
});
test('compass: leaving while permission is pending cannot attach a sensor later', async () => {
  let allow;
  const h = compassHarness({ requestPermission: () => new Promise(resolve => { allow = resolve; }) });
  const pending = h.tracker.start(); h.tracker.dispose(); allow('granted'); await pending;
  h.emit({ webkitCompassHeading: 10 }); assert.equal(h.headings.length, 0); assert.equal(h.timers.size, 0);
});
test('navigation: origins survive rerender, reload state and browser back, with direct-link fallback', () => {
  const location = { hash: '#/' }, history = { state: null, replaceState(value) { this.state = value; } };
  const c = load(section('let ROUTE_HASH =', 'let ROUTE_SEQ ='), { location, history });
  c.rememberRouteOrigin(); const home = structuredClone(history.state); assert.equal(c.routeOrigin(), null);
  location.hash = '#/namaz/ramadan'; history.state = null; c.rememberRouteOrigin();
  assert.equal(c.routeOrigin(), '#/'); const calendar = structuredClone(history.state);
  c.rememberRouteOrigin(); assert.equal(c.routeOrigin(), '#/');
  location.hash = '#/'; history.state = home; c.rememberRouteOrigin(); assert.equal(c.routeOrigin(), null);
  location.hash = '#/namaz/ramadan'; history.state = calendar; c.rememberRouteOrigin(); assert.equal(c.routeOrigin(), '#/');
  const reloaded = load(section('let ROUTE_HASH =', 'let ROUTE_SEQ ='), { location, history }); reloaded.rememberRouteOrigin(); assert.equal(reloaded.routeOrigin(), '#/');
  location.hash = '#/namaz/times'; history.state = null; c.rememberRouteOrigin(); assert.equal(c.routeOrigin(), '#/namaz/ramadan');
});

test('zikr tabs: replacement keeps the outer entry and never stacks filter visits', () => {
  const location = { hash: '#/' }; let writes = 0;
  const history = { state: null, replaceState(state, title, hash) { this.state = state; if (hash) location.hash = hash; writes++; } };
  const c = load(section('let ROUTE_HASH =', 'let ROUTE_SEQ =') + section('function zikrExitHref()', 'function hadithQuote('), { location, history });
  c.rememberRouteOrigin(); location.hash = '#/zikr'; history.state = null; c.rememberRouteOrigin();
  assert.equal(c.zikrExitHref(), '#/');
  for (const tab of ['fav', 'morning', 'evening']) {
    c.replaceRouteHash('#/zikr/' + tab); c.rememberRouteOrigin();
    assert.equal(c.routeOrigin(), '#/'); assert.equal(c.zikrExitHref(), '#/');
  }
  const saved = structuredClone(history.state);
  const reload = load(section('let ROUTE_HASH =', 'let ROUTE_SEQ =') + section('function zikrExitHref()', 'function hadithQuote('), { location, history });
  reload.rememberRouteOrigin(); assert.equal(reload.zikrExitHref(), '#/');
  history.state = { ...saved, iqraNav: { hash: location.hash, from: '#/zikr/c/tawhid?evening' } };
  assert.equal(c.zikrExitHref(), '#/');
  assert.ok(writes > 0);
});
test('section back: zikr filters cannot override exit while Ramadan retains its real origin', () => {
  for (const [origin, sectionName, expected, pops] of [['#/zikr/fav', 'zikr', '#/namaz', 0], ['#/', 'zikr', '#/', 1], ['#/', undefined, '#/', 1]]) {
    let back = 0;
    const c = load(section('const backHead =', 'const fmtN =') + '\nthis.makeBack = backHead;', { h, routeOrigin: () => origin, T: x => x, icon: () => '', history: { back() { back++; } } });
    const header = c.makeBack('#/namaz', 'Zikr', null, null, sectionName), link = header.children[0];
    assert.equal(link.attrs.href, expected);
    link.onclick({ preventDefault() {} }); assert.equal(back, pops);
  }
});
test('Ramadan empty state: one city action opens the picker without routing to prayer times', async () => {
  let picks = 0;
  const c = load(section('async function nzRamadan(', 'async function nzTimes('), { h, S: { city: null }, backHead: () => h('header'), LX: x => x, esc: x => x, icon: () => '', cityPicker: () => picks++ });
  const v = h('main'); await c.nzRamadan(v);
  const buttons = v.all().filter(x => x.tag === 'button'); assert.equal(buttons.length, 1);
  assert.equal(buttons[0].textContent, 'Выбрать город'); buttons[0].onclick(); assert.equal(picks, 1);
  assert.equal(v.all().filter(x => x.tag === 'a' && x.attrs.href === '#/namaz/times').length, 0);
});

function normalizedArabic(text) {
  return String(text).replace(/ٱ/g, 'ا').replace(/ﷺ/g, 'صلى الله عليه وسلم').normalize('NFKD').replace(/[^\u0621-\u064a]/g, '');
}
test('zikr audio: all ten recorded Hisn formulas match the source and retain all three localizations', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/zikr.json')));
  const refs = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/zikr-audio-reference.json')));
  const recorded = data.items.filter(x => x.hm);
  assert.equal(recorded.length, 10); assert.equal(refs.items.length, recorded.length);
  for (const x of recorded) {
    const ref = refs.items.find(r => r.id === x.id); assert.ok(ref, x.id);
    assert.equal(x.hm, ref.hm, x.id); assert.equal(normalizedArabic(x.ar), normalizedArabic(ref.expected), x.id);
    for (const lang of ['ru', 'kk', 'tr']) { assert.ok(x.tl[lang], x.id + ':' + lang); assert.ok(x.m[lang]); }
  }
});
test('zikr audio: whole suras play every verse; Kursi remains one verse, invalid ranges cannot play', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/zikr.json')));
  const CORE = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/core.json')));
  const c = load(section('function zikrAudioTracks(', 'const TS_AFTER ='), { suraBy: n => CORE.suras.find(s => s.n === n), ayahURL: (s, a) => s + ':' + a, hisnURL: n => 'hisn:' + n });
  for (const [id, count] of [['fatiha', 7], ['ikhlas', 4], ['falaq', 5], ['nas', 6], ['kursi', 1]]) {
    const x = data.items.find(x => x.id === id), tracks = c.zikrAudioTracks(x);
    assert.equal(tracks.length, count, id); assert.equal(tracks[0], x.au.s + ':' + x.au.a);
    assert.equal(tracks.at(-1), x.au.s + ':' + (x.au.to || x.au.a));
  }
  for (const au of [{ s: 1, a: 1, to: 8 }, { s: 1, a: 3, to: 2 }, { s: 1, a: 0 }, { s: 999, a: 1 }]) assert.equal(c.zikrAudioTracks({ au }).length, 0);
  assert.equal(c.zikrAudioTracks({ hm: 98 })[0], 'hisn:98');
});
test('trainer hint: can open, close and reopen without disabling or counting help twice', () => {
  const c = load(section('function bindHintToggle(', 'function pageTrainer('), {});
  const button = h('button'), box = h('div'); box.hidden = true; let used = 0;
  c.bindHintToggle(button, box, () => used++);
  button.onclick(); assert.equal(box.hidden, false); assert.equal(button.attrs['aria-expanded'], 'true'); assert.equal(used, 1);
  button.onclick(); assert.equal(box.hidden, true); assert.equal(button.attrs['aria-expanded'], 'false'); assert.equal(used, 1);
  button.onclick(); assert.equal(box.hidden, false); assert.equal(used, 1); assert.ok(!button.disabled);
});

test('memorization transcription: Russian and Kazakh stay Cyrillic, Turkish stays Latin for every cached ayah', () => {
  const S = { lang: 'ru' };
  const c = load(section('const CYR_TR =', 'const LX =') + '\nthis.transcription = TLC;', { S, L: o => typeof o === 'string' ? o : o?.[S.lang] || o?.ru || o?.kk || '' });
  for (const file of fs.readdirSync(path.join(__dirname, '../quran')).filter(x => /^\d{3}\.json$/.test(x))) {
    const sura = JSON.parse(fs.readFileSync(path.join(__dirname, '../quran', file)));
    for (const ayah of sura.ayat) for (const lang of ['ru', 'kk', 'tr']) {
      S.lang = lang; const text = c.transcription(ayah.tr);
      assert.ok(text.trim(), file + ':' + ayah.n + ':' + lang);
      if (lang === 'tr') { assert.match(text, /[A-Za-z]/); assert.doesNotMatch(text, /\p{Script=Cyrillic}/u); }
      else assert.match(text, /\p{Script=Cyrillic}/u);
    }
  }
});
test('memorization transcription: a fresh memorization preference is enabled independently of reading', () => {
  const c = load(section('const blank =', 'let S = blank();') + '\nthis.defaults = blank;', {});
  const state = c.defaults(); state.view.tr = false;
  assert.equal(state.view.hifzTr, true); assert.equal(state.view.tr, false);
});
