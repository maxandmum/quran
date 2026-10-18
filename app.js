/* Iqra — онлайн-курс чтения Корана. Клиентская часть без зависимостей. */
(() => {
"use strict";

/* ═════════════ хранилище ═════════════ */
const KEY = "qoqu.v1";
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const blank = () => ({ lang: null, theme: null, xp: 0, days: {}, lessons: {}, ex: {}, tests: {},
  badges: {}, hifz: {}, reciter: "Husary_Muallim_128kbps", goal: 30, tr: { n: 0, ok: 0 }, view: { color: true, tr: true, tl: true },
  last: null, listen: { r: "mishary-alafasy/r1", s: 1 }, tsb: { i: 0, c: 0, total: 0 }, nzg: "m", at: 0 });
let S = blank();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) {}
S.view = Object.assign({ color: true, tr: true, tl: true }, S.view);
let onSave = null;
const save = () => { S.at = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (onSave) onSave(); };

/* ═════════════ язык и тема ═════════════ */
if (!S.lang) S.lang = /^ru/i.test(navigator.language || "") ? "ru" : "kk";
const L = o => o == null ? "" : (typeof o === "string" ? o : (o[S.lang] ?? o.kk ?? ""));
const applyTheme = () => {
  if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#e8efe9";
};
applyTheme();
// светлая тема по умолчанию; «system» — как в настройках устройства
const isDark = () => S.theme === "dark" || (S.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
// цвета таджвида: на тёмном фоне — светлее и насыщеннее
const RC_DARK = { izhar: "#f2c14e", qalqala: "#ff9447", madd2: "#b5d35b", madd46: "#ff6f61", madd6: "#ff4d8d", ghunna: "#e07be0",
  ikhfa: "#3fcf8e", ikhfa_sh: "#8ee3c0", idgham: "#5aa2ff", idgham_ng: "#a9c8ff", idgham_m: "#3fd0e0", iqlab: "#a78bfa" };
const RC = k => (isDark() && RC_DARK[k]) || (CORE && CORE.rules[k] ? CORE.rules[k].c : "inherit");

const UI = {
  brand: ["Iqra", "Iqra"], today: ["Бүгін", "Сегодня"], learn: ["Оқу", "Учёба"], menu: ["Мәзір", "Меню"], surasT: ["Сүрелер", "Суры"],
  salam: ["Ассаламу ағалейкум", "Ассаляму алейкум"],
  brandSub: ["Құранды нөлден оқу", "Коран с нуля"],
  home: ["Басты", "Главная"], course: ["Курс", "Курс"], ref: ["Анықтама", "Справочник"],
  suras: ["Құран", "Коран"], practice: ["Жаттығу", "Практика"], me: ["Профиль", "Профиль"],
  listen: ["Тыңдау", "Слушать"], readers: ["Қарилар", "Чтецы"], namaz: ["Намаз", "Намаз"],
  heroTitle: ["Құранды оқуды нөлден үйреніңіз", "Научитесь читать Коран с нуля"],
  heroLead: ["Араб әріптерінен бастап тәжуидпен оқуға дейін — 110 қысқа сабақ, жаттығулар және қарилардың дауысы.",
    "От арабских букв до чтения с таджвидом — 110 коротких уроков, упражнения и голоса чтецов."],
  heroWord: ["«Оқы!» — Құранның алғашқы түскен сөзі", "«Читай!» — первое ниспосланное слово Корана"],
  start: ["Бірінші сабақты бастау", "Начать первый урок"], cont: ["Жалғастыру", "Продолжить"],
  seeCourse: ["Курс картасы", "Карта курса"], nextLesson: ["Келесі сабақ", "Следующий урок"],
  streak: ["күн қатарынан", "дней подряд"], todayXp: ["бүгінгі ұпай", "очков сегодня"],
  lessonsDone: ["сабақ өтілді", "уроков пройдено"], of: ["/", "/"],
  modules: ["Төрт модуль", "Четыре модуля"], how: ["Қалай оқимыз", "Как заниматься"],
  how1t: ["Күнде 20 минут", "20 минут в день"], how1: ["Бір сабақ — бір отырыс. Күнделікті аздан оқу тиімдірек.", "Один урок — одно занятие. Понемногу каждый день — эффективнее."],
  how2t: ["Дауыстап оқыңыз", "Читайте вслух"], how2: ["Әр сөзді басып, қаридан тыңдаңыз да, қайталаңыз.", "Нажимайте на слова, слушайте чтеца и повторяйте."],
  how3t: ["Жаттығуды өткізбеңіз", "Не пропускайте практику"], how3: ["Білімді жаттығулар мен тренажёрлар бекітеді.", "Знание закрепляют упражнения и тренажёры."],
  lesson: ["Сабақ", "Урок"], module: ["Модуль", "Модуль"], goal: ["Мақсат", "Цель"],
  soon: ["дайындалуда", "в разработке"], doneL: ["өтілді", "пройден"],
  finish: ["Сабақты аяқтау", "Завершить урок"],
  finishHint: ["Жаттығуларды орындадыңыз ба? Сабақты белгілеп, жолды жалғастырыңыз.", "Упражнения сделаны? Отметьте урок и двигайтесь дальше."], finished: ["Сабақ аяқталды", "Урок завершён"],
  prev: ["Алдыңғы", "Назад"], next: ["Келесі", "Далее"],
  check: ["Өзін-өзі тексеру", "Проверьте себя"],
  right: ["Дұрыс!", "Верно!"], wrongTry: ["Қате. Тағы көріңіз.", "Неверно. Попробуйте ещё."],
  found: ["Табылды", "Найдено"], allFound: ["Барлығы табылды!", "Всё найдено!"],
  clear: ["Тазалау", "Очистить"], traceHint: ["Сұр үлгінің үстінен жүріңіз", "Обведите серый образец"],
  traceGood: ["Жақсы! Үлгі жабылды.", "Хорошо! Образец обведён."], traceMore: ["Үлгіні толығырақ жабыңыз", "Обведите образец полнее"],
  checkTrace: ["Тексеру", "Проверить"],
  reset: ["Қайта бастау", "Сбросить"], undo: ["Болдырмау", "Отменить"],
  play: ["Тыңдау", "Слушать"], pause: ["Тоқтату", "Пауза"],
  reciter: ["Қари", "Чтец"], repeat: ["Қайталау", "Повтор"], speed: ["Жылдамдық", "Скорость"],
  colors: ["Тәжуид түстері", "Цвета таджвида"], translit: ["Оқылуы", "Транскрипция"],
  hifz: ["Жаттау режимі", "Режим заучивания"], read: ["Оқу режимі", "Режим чтения"],
  memorized: ["Жаттадым", "Выучил(а)"], ayat: ["аят", "аятов"],
  hz0: ["Толық мәтін", "Полный текст"], hz1: ["Жартысын жасыру", "Скрыть половину"],
  hz2: ["Бірінші әріптер", "Первые буквы"], hz3: ["Толық жасыру", "Скрыть всё"],
  hzHint: ["Жасырылған сөзді басып, тексеріңіз. Аятты есте сақтағанда «Жаттадым» белгісін қойыңыз.",
    "Нажмите на скрытое слово, чтобы проверить себя. Отметьте «Выучил(а)», когда помните аят."],
  audioErr: ["Аудио жүктелмеді. Интернетті тексеріңіз.", "Аудио не загрузилось. Проверьте интернет."],
  tapWord: ["Сөзді басып, жеке тыңдауға болады", "Нажмите на слово, чтобы услышать его отдельно"],
  trainers: ["Тренажёрлар", "Тренажёры"], startTr: ["Бастау", "Начать"], again: ["Тағы бір рет", "Ещё раз"],
  question: ["Сұрақ", "Вопрос"], result: ["Нәтиже", "Результат"], correct: ["дұрыс", "верно"],
  backTr: ["Тренажёрлерге", "К тренажёрам"], plusXp: ["ұпай", "очков"],
  testTitle: ["Бақылау жұмысы", "Контрольная работа"], testStart: ["Бақылауды бастау", "Начать контрольную"],
  testPass: ["Өтті! Келесі модульге дайынсыз.", "Сдано! Вы готовы к следующему модулю."],
  testFail: ["Әлі ерте. Қате кеткен тақырыптарды қайталап, қайта тапсырыңыз.", "Пока рано. Повторите темы с ошибками и попробуйте снова."],
  best: ["Ең жақсы нәтиже", "Лучший результат"],
  level: ["Деңгей", "Уровень"], xp: ["ұпай", "очков"], badges: ["Марапаттар", "Награды"],
  dailyGoal: ["Күнделікті мақсат", "Цель на день"], week: ["Осы апта", "Эта неделя"],
  settings: ["Баптаулар", "Настройки"], theme: ["Тақырып", "Тема"], light: ["Күндізгі", "Дневная"],
  dark: ["Түнгі", "Ночная"], system: ["Жүйелік", "Как в системе"], language: ["Тіл", "Язык"],
  resetAll: ["Барлық прогресті өшіру", "Удалить весь прогресс"],
  resetAsk: ["Прогресс, ұпайлар мен марапаттар өшеді. Сенімдісіз бе?", "Прогресс, очки и награды будут удалены. Вы уверены?"],
  yesReset: ["Иә, өшіру", "Да, удалить"], cancel: ["Болдырмау", "Отмена"], resetDone: ["Прогресс өшірілді", "Прогресс удалён"],
  savedHere: ["Прогресс осы құрылғыдағы браузерде сақталады.", "Прогресс хранится в браузере на этом устройстве."],
  badgeGot: ["Жаңа марапат", "Новая награда"],
  alphabet: ["Әліпби", "Алфавит"], tajweed: ["Тәжуид ережелері", "Правила таджвида"], makhraj: ["Махраж картасы", "Карта махраджей"],
  forms4: ["жеке", "басында", "ортасында", "соңында"], forms4ru: ["отдельно", "в начале", "в середине", "в конце"],
  sound: ["Дыбысы", "Звук"], name: ["Аты", "Название"], mk: ["Махраж", "Махрадж"], sifat: ["Сипаттары", "Сифаты"],
  joins: ["Қосылуы", "Соединение"], joinsY: ["екі жағынан", "с обеих сторон"], joinsN: ["солға қосылмайды", "не соединяется слева"],
  openLesson: ["Сабақты ашу", "Открыть урок"], examples: ["Мысалдар", "Примеры"],
  notFound: ["Бет табылмады", "Страница не найдена"], toHome: ["Басты бетке", "На главную"],
  sortHint: ["Әріп қай топқа жатады?", "К какой группе относится буква?"],
  orderHint: ["Әріптерді басып, сөзді құрыңыз", "Собирайте слово, нажимая на буквы"],
  listenFirst: ["Алдымен тыңдаңыз", "Сначала послушайте"],
  wordsLearned: ["Бүкіл курс 110 сабақтан тұрады.", "Весь курс — 110 уроков."],
  dayNames: [["Дс","Сс","Ср","Бс","Жм","Сб","Жс"],["Пн","Вт","Ср","Чт","Пт","Сб","Вс"]],
  goals: ["Жеңіл", "Лёгкая"], goalm: ["Қалыпты", "Обычная"], goalh: ["Қарқынды", "Интенсивная"],
  ayahN: ["аят", "аят"], playAll: ["Барлығын тыңдау", "Слушать всё"],
  stopAt: ["Тоқтағанда", "При остановке"],
  welcomeBack: ["Қош келдіңіз!", "С возвращением!"],
  tl: ["Аударма", "Перевод"], tlBy: ["Мағына аудармасы: Халифа Алтай", "Перевод смыслов: Эльмир Кулиев"],
  tlErr: ["Аударма жүктелмеді. Интернетті тексеріңіз.", "Перевод не загрузился. Проверьте интернет."],
  search: ["Іздеу: атауы не нөмірі", "Поиск: название или номер"],
  all: ["Барлығы", "Все"], juz30: ["30-жүз", "Джуз 30"], started: ["Басталғандар", "Начатые"],
  mecca: ["Мекке", "Мекка"], medina: ["Медине", "Медина"], nothing: ["Ештеңе табылмады", "Ничего не найдено"],
  contRead: ["Оқуды жалғастыру", "Продолжить чтение"], quranLead: ["114 сүре: тәжуид түстері, оқылуы, мағына аудармасы және әр аяттың аудиосы.", "114 сур: цвета таджвида, транскрипция, перевод смыслов и аудио каждого аята."],
  listenLead: ["Қариді таңдаңыз — оның бетінде 114 сүренің бәрі бар. Басқа беттерге өтсеңіз де, дыбыс тоқтамайды.", "Выберите чтеца — на его странице все 114 сур. Звук не прерывается при переходах по сайту."],
  reciters: ["Қарилар", "Чтецы"], teach: ["үйретуші", "обучающее"], mujawwad: ["мужәууад", "муджаввад"],
  ref2: ["Анықтама: әліпби, тәжуид, махраж", "Справочник: алфавит, таджвид, махрадж"],
  sayName: ["Атын тыңдау", "Название"], syll: ["Буындар", "Слоги"],
  ttsNote: ["Әріп аты мен буындарды құрылғының араб дауысы оқиды. Сөз мысалдарын — қари оқиды.", "Название буквы и слоги читает арабский голос устройства. Примеры слов — голос чтеца."],
  noTts: ["Құрылғыда араб дауысы табылмады — қари оқыған мысал қосылады.", "На устройстве нет арабского голоса — включаю пример в исполнении чтеца."],
  acc: ["Аккаунт", "Аккаунт"], signIn: ["Кіру", "Войти"], signUp: ["Тіркелу", "Регистрация"],
  google: ["Google арқылы кіру", "Войти через Google"], email: ["Электрондық пошта", "Электронная почта"], password: ["Құпиясөз (кемінде 6 таңба)", "Пароль (не меньше 6 символов)"],
  forgot: ["Құпиясөзді ұмыттым", "Забыли пароль?"], signOut: ["Шығу", "Выйти"], orDiv: ["немесе", "или"],
  haveAcc: ["Аккаунтым бар — кіру", "Уже есть аккаунт — войти"], noAcc: ["Аккаунт жоқ — тіркелу", "Нет аккаунта — регистрация"],
  synced: ["Прогресс бұлтта сақталады: телефонда да, компьютерде де бірдей.", "Прогресс хранится в облаке: одинаково на телефоне и компьютере."],
  accWhy: ["Аккаунт ашсаңыз, прогресс жоғалмайды және барлық құрылғыда бірдей болады.", "С аккаунтом прогресс не потеряется и будет одинаковым на всех устройствах."],
  accSoon: ["Аккаунттар жақында қосылады. Әзірге прогресс осы құрылғыда сақталады.", "Аккаунты скоро появятся. Пока прогресс хранится на этом устройстве."],
  resetSent: ["Құпиясөзді қалпына келтіру сілтемесі поштаңызға жіберілді.", "Ссылка для сброса пароля отправлена на почту."],
  needEmail: ["Алдымен поштаңызды жазыңыз.", "Сначала введите почту."], hello: ["Сәлем", "Здравствуйте"],
  authErr: ["Кіру сәтсіз аяқталды", "Не удалось войти"], syncOk: ["Прогресс синхрондалды", "Прогресс синхронизирован"],
  install: ["Телефонға орнату", "Установить на телефон"],
  footer: ["Құран мәтіні — османдық жазу, Хафс риуаяты (Tanzil). Мағына аудармасы — Халифа Алтай. Аудио: EveryAyah, Quran.com, mp3quran.net.",
    "Текст Корана — усманский рисм, риваят Хафс (Tanzil). Перевод смыслов — Эльмир Кулиев. Аудио: EveryAyah, Quran.com, mp3quran.net."],
  footer2: ["Бұл курс оқуды үйретеді; мағынасын білу үшін сенімді тәпсірді оқыңыз. Мүмкіндігінше оқуыңызды ұстазға тексертіңіз.",
    "Курс учит чтению; для понимания смысла читайте надёжный тафсир. По возможности проверяйте чтение у преподавателя."],
};
const T = k => { const v = UI[k]; return v ? v[S.lang === "ru" ? 1 : 0] : k; };
const ayatN = n => { if (S.lang !== "ru") return n + " аят"; const m10 = n % 10, m100 = n % 100; return n + (m10 === 1 && m100 !== 11 ? " аят" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? " аята" : " аятов"); };

/* ═════════════ утилиты ═════════════ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
};
const AR_RUN = /[\u0600-\u06FF\u0750-\u077F\u08F0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF](?:[\u0600-\u06FF\u0750-\u077F\u08F0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-+=]*[\u0600-\u06FF\u0750-\u077F\u08F0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])?/g;
const md = s => {
  s = esc(L(s));
  const keep = [];
  s = s.replace(/⟦(.+?)⟧/g, (_, x) => { keep.push(x); return "\u0001" + (keep.length - 1) + "\u0002"; });
  s = s.replace(AR_RUN, m => { keep.push(m); return "\u0001" + (keep.length - 1) + "\u0002"; });
  s = s.replace(/\u0001(\d+)\u0002/g, (_, i) => '<span class="ar">' + keep[+i] + "</span>");
  s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  return s.split(/\n\n+/).map(par => {
    const lines = par.split("\n");
    if (lines.every(x => x.startsWith("- "))) return "<ul>" + lines.map(x => "<li>" + x.slice(2) + "</li>").join("") + "</ul>";
    return "<p>" + lines.join("<br>") + "</p>";
  }).join("");
};
const mdInline = s => md(s).replace(/<\/?p>/g, "");
const mdEl = (s, cls = "md") => h("div", { class: cls, html: md(s) });
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const AR_DIG = "٠١٢٣٤٥٦٧٨٩";
const arNum = n => String(n).split("").map(d => AR_DIG[d]).join("");

/* ═════════════ иконки ═════════════ */
const I = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  path: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6.5c5 0 7 2 7 5M15.5 13.5c0 3-2 4.5-7 4.5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 1h13v-3"/><path d="M9 8h6M9 11h4"/>',
  quran: '<path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z"/><path d="M12 6v13"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  learn: '<path d="M3 6.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8V19c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z"/><path d="M12 7.3v12.5"/>',
  stand: '<path d="M5 21l14-8.5M19 21L5 12.5"/><path d="M4.5 11c2.5-1.8 5-1.8 7.5 0 2.5-1.8 5-1.8 7.5 0V5.5c-2.5-1.8-5-1.8-7.5 0-2.5-1.8-5-1.8-7.5 0z"/>',
  mat: '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M8 4V2M10.7 4V2M13.3 4V2M16 4V2M8 22v-2M10.7 22v-2M13.3 22v-2M16 22v-2"/><path d="M12 8.5l3 3.5-3 3.5-3-3.5z"/>',
  beads: '<circle cx="12" cy="4.2" r="1.3"/><circle cx="16.5" cy="5.8" r="1.3"/><circle cx="18.2" cy="10" r="1.3"/><circle cx="16.5" cy="14.2" r="1.3"/><circle cx="7.5" cy="14.2" r="1.3"/><circle cx="5.8" cy="10" r="1.3"/><circle cx="7.5" cy="5.8" r="1.3"/><path d="M12 15.5v5M10.3 21.5h3.4"/>',
  flip: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5"/>', vib: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5.5-3.5-7-.5 2-1.5 3-3 3 .5-3-1-6-3.5-8 0 3-1.5 5-3 6.5C4.5 11 5 13 5 15c0 4 3 7 7 7z"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', rule: '<path d="M4 6h16M4 12h10M4 18h7"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>', bridge: '<path d="M3 17h18M5 17V9a7 7 0 0 1 14 0v8M9 17v-5M15 17v-5"/>',
  repeat: '<path d="M4 12a7 7 0 0 1 12-5l3 3M20 12a7 7 0 0 1-12 5l-3-3"/><path d="M19 4v6h-6M5 20v-6h6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  prevT: '<path d="M6 5v14"/><path d="M19 5.5v13L9 12z" fill="currentColor" stroke="none"/>',
  nextT: '<path d="M18 5v14"/><path d="M5 5.5v13L15 12z" fill="currentColor" stroke="none"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  headph: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4.5" height="7" rx="1.5"/><rect x="16" y="14" width="4.5" height="7" rx="1.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  out: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
};
const GOOGLE_G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const icon = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
// восьмиконечная розетка (как знак конца аята / руб-уль-хизб)
const ROS = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor"><rect x="18" y="18" width="64" height="64" rx="6"/><rect x="18" y="18" width="64" height="64" rx="6" transform="rotate(45 50 50)"/></g><circle cx="50" cy="50" r="27" fill="none" stroke="var(--surface)" stroke-width="2.5" opacity=".55"/></svg>';
const rosette = (label, cls = "") => `<span class="ros ${cls}">${ROS}<span class="rn">${label}</span></span>`;
const ayahMark = n => `<span class="an"><svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4"><rect x="20" y="20" width="60" height="60" rx="6"/><rect x="20" y="20" width="60" height="60" rx="6" transform="rotate(45 50 50)"/></g></svg>${arNum(n)}</span>`;

/* ═════════════ данные ═════════════ */
let CORE = null, COURSE = null;
const LESSONS = {};
const fetchJSON = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
async function loadModule(m) {
  if (!LESSONS[m]) LESSONS[m] = fetchJSON(`data/lessons-m${m}.json`).catch(() => []);
  return LESSONS[m];
}
const letterBy = ar => CORE.letters.find(x => x.ar === ar);
const suraBy = n => CORE.suras.find(s => s.n === +n);
// тексты сур подгружаются по одной: quran/001.json …
const SURA_P = {}, SURA_D = {};
const loadSura = n => SURA_P[n] || (SURA_P[n] = fetchJSON(`quran/${String(n).padStart(3, "0")}.json`)
  .then(d => (SURA_D[n] = d)).catch(e => { delete SURA_P[n]; throw e; }));
// перевод смыслов: Кулиев (ru) и Халифа Алтай (kk) — api.alquran.cloud, запасной источник — jsDelivr
const TL = {};
function loadTl(n) {
  const ru = S.lang === "ru", k = (ru ? "ru" : "kk") + n;
  if (!TL[k]) TL[k] = fetch(`https://api.alquran.cloud/v1/surah/${n}/${ru ? "ru.kuliev" : "kk.khalifahaltai"}`)
    .then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => j.data.ayahs.map(a => a.text))
    .catch(() => fetchJSON(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${ru ? "rus-elmirkuliev" : "kaz-khalifahaltai"}/${n}.json`).then(j => j.chapter.map(a => a.text)))
    .then(a => a.map(t => String(t).replace(/\r/g, "").trim()))
    .catch(e => { delete TL[k]; throw e; });
  return TL[k];
}
const moduleOf = n => COURSE.modules.find(m => n >= m.from && n <= m.to);

/* ═════════════ аудио ═════════════ */
const RECITERS = [
  ["Husary_Muallim_128kbps", ["Хусари — үйретуші", "Хусари — обучающее чтение"]],
  ["Minshawy_Teacher_128kbps", ["Миншауи — үйретуші", "Миншави — обучающее чтение"]],
  ["Husary_128kbps", ["Хусари", "Хусари"]],
  ["Alafasy_128kbps", ["Мишари Әл-Афаси", "Мишари Аль-Афаси"]],
  ["Minshawy_Murattal_128kbps", ["Миншауи", "Миншави"]],
];
const pad3 = n => String(n).padStart(3, "0");
const ayahURL = (s, a, rec = S.reciter) => `https://everyayah.com/data/${rec}/${pad3(s)}${pad3(a)}.mp3`;
const wordURL = loc => { const [s, a, w] = loc.split(":"); return `https://audio.qurancdn.com/wbw/${pad3(s)}_${pad3(a)}_${pad3(w)}.mp3`; };
const Audio1 = new Audio();
Audio1.preload = "auto";
let audioDone = null, audioEl = null;
function stopAudio() {
  Audio1.pause(); Audio1.onended = null; Audio1.onerror = null;
  if (audioEl) audioEl.classList.remove("playing"); audioEl = null;
  const f = audioDone; audioDone = null; if (f) f(false);
}
function playURL(url, el, rate = 1) {
  return new Promise(res => {
    stopAudio();
    if (LP && !LP.a.paused) LP.a.pause();
    audioDone = res; audioEl = el || null;
    if (el) el.classList.add("playing");
    Audio1.src = url; Audio1.playbackRate = rate;
    Audio1.onended = () => { if (el) el.classList.remove("playing"); audioEl = null; audioDone = null; res(true); };
    Audio1.onerror = () => { if (el) el.classList.remove("playing"); audioEl = null; audioDone = null; toast(T("audioErr")); res(false); };
    Audio1.play().catch(() => { if (audioDone === res) { audioDone = null; if (el) el.classList.remove("playing"); res(false); } });
  });
}

/* ───── озвучка букв: арабский голос устройства (Web Speech) ───── */
const AR_NAMES = { "ا": "أَلِف", "ب": "بَاء", "ت": "تَاء", "ث": "ثَاء", "ج": "جِيم", "ح": "حَاء", "خ": "خَاء", "د": "دَال", "ذ": "ذَال", "ر": "رَاء",
  "ز": "زَاي", "س": "سِين", "ش": "شِين", "ص": "صَاد", "ض": "ضَاد", "ط": "طَاء", "ظ": "ظَاء", "ع": "عَيْن", "غ": "غَيْن", "ف": "فَاء",
  "ق": "قَاف", "ك": "كَاف", "ل": "لَام", "م": "مِيم", "ن": "نُون", "ه": "هَاء", "و": "وَاو", "ي": "يَاء", "ء": "هَمْزَة" };
let arVoice;
const findVoice = () => { if (!("speechSynthesis" in window)) return null; const v = speechSynthesis.getVoices(); return v.find(x => /^ar(-|_|$)/i.test(x.lang) && /SA|Maged|Majed|Tarik/i.test(x.lang + x.name)) || v.find(x => /^ar/i.test(x.lang)) || null; };
if ("speechSynthesis" in window) { arVoice = findVoice(); speechSynthesis.onvoiceschanged = () => { arVoice = findVoice(); }; }
function speakAr(text, el, fallbackLoc) {
  stopAudio(); if (LP && !LP.a.paused) LP.a.pause();
  if (!arVoice) arVoice = findVoice();
  if (!arVoice) { if (fallbackLoc) { toast(T("noTts")); playURL(wordURL(fallbackLoc), el); } else toast(T("noTts")); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.voice = arVoice; u.lang = arVoice.lang; u.rate = 0.75;
  if (el) { el.classList.add("playing"); u.onend = u.onerror = () => el.classList.remove("playing"); }
  speechSynthesis.speak(u);
}

/* ───── прослушивание сур целиком (mp3quran.net), не прерывается при переходах ───── */
const MP3Q = "https://cdn.mp3quran.net/audio/";
// чтецы: фото только со свободной лицензией (Wikimedia Commons), автор и лицензия показываются на странице чтеца
const WM = "https://upload.wikimedia.org/wikipedia/commons/thumb/";
const READERS = [
  { id: "afasy", n: ["Мишари Рашид әл-Афаси", "Мишари Рашид аль-Афаси"], c: ["Кувейт", "Кувейт"], v: [["mishary-alafasy/r1", "m"]],
    img: [WM + "2/24/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg/250px-%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg", "quranic.ru", "Copyrighted free use", "https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg"],
    b: ["Кувейттегі Үлкен мешіттің имамы. Қазіргі ең танымал қарилардың бірі: таза, әуенді әрі асықпай оқиды.", "Имам Большой мечети Кувейта. Один из самых известных современных чтецов: чистое, мелодичное и неторопливое чтение."] },
  { id: "minshawi", n: ["Мұхаммед Сыддық әл-Миншауи", "Мухаммад Сиддик аль-Миншави"], c: ["Мысыр, 1920–1969", "Египет, 1920–1969"], v: [["muhammad-minshawi/r3", "t"], ["muhammad-minshawi/r1", "m"], ["muhammad-minshawi/r2", "j"]],
    img: [WM + "e/ee/Elminshwey.jpg/250px-Elminshwey.jpg", "", "Public domain", "https://commons.wikimedia.org/wiki/File:Elminshwey.jpg"],
    b: ["Оның «үйретуші мусхафы» балалармен бірге жазылған: қари оқиды, балалар қайталайды. Жаңа бастағандарға ең қолайлы қари.", "Его «обучающий мусхаф» записан вместе с детьми: чтец читает, дети повторяют. Лучший выбор для начинающих."] },
  { id: "husary", n: ["Махмұд Халил әл-Хусари", "Махмуд Халиль аль-Хусари"], c: ["Мысыр, 1917–1980", "Египет, 1917–1980"], v: [["mahmoud-husary/r1", "m"], ["mahmoud-husary/r2", "j"]],
    img: [WM + "7/70/Hussary.jpg/250px-Hussary.jpg", "Zubairkhan1", "Public domain", "https://commons.wikimedia.org/wiki/File:Hussary.jpg"],
    b: ["Мысыр қарилерінің басшысы болған. Құранды толық «мураттал» оқуымен алғаш жазғандардың бірі. Оқуы өте анық — тәжуидтің үлгісі.", "Был главой чтецов Египта, одним из первых записал весь Коран чтением муратталь. Очень чёткое чтение — образец таджвида."] },
  { id: "basit", n: ["Абдулбасит Абдуссамад", "Абдул-Басит Абдус-Самад"], c: ["Мысыр, 1927–1988", "Египет, 1927–1988"], v: [["abdulbasit-abdulsamad/r3", "m"], ["abdulbasit-abdulsamad/r1", "j"]],
    img: [WM + "b/b9/Abdul_Basit_Abd_us-Samad_in_South_Africa_in_1966_%283%29_%28cropped%29.jpg/250px-Abdul_Basit_Abd_us-Samad_in_South_Africa_in_1966_%283%29_%28cropped%29.jpg", "", "Public domain", "https://commons.wikimedia.org/wiki/File:Abdul_Basit_Abd_us-Samad_in_South_Africa_in_1966_(3)_(cropped).jpg"],
    b: ["Құранның «алтын дауысы»: әуенді мужәууад оқуы мен өте ұзақ тынысымен әйгілі.", "«Золотой голос» Корана: знаменит мелодичным чтением муджаввад и необычайно долгим дыханием."] },
  { id: "ghamdi", n: ["Сағд әл-Ғамиди", "Саад аль-Гамиди"], c: ["Сауд Арабиясы", "Саудовская Аравия"], v: [["saad-ghamdi/r1", "m"]],
    img: [WM + "4/43/Saad_al_Ghamdi.jpg/250px-Saad_al_Ghamdi.jpg", "الشيخ هيثم الدخين", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Saad_al_Ghamdi.jpg"],
    b: ["Сабырлы, анық оқу. Сүрелерді жаттау үшін жиі ұсынылады.", "Спокойное, ясное чтение. Его часто советуют для заучивания сур."] },
  { id: "maher", n: ["Махир әл-Мұғайқли", "Махер аль-Муайкли"], c: ["Сауд Арабиясы", "Саудовская Аравия"], v: [["maher-muaiqly/r1", "m"]],
    img: [WM + "c/c4/Professor_Maher_Al-Mu%27aiqly.jpg/250px-Professor_Maher_Al-Mu%27aiqly.jpg", "Real avdulmouhd", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Professor_Maher_Al-Mu%27aiqly.jpg"],
    b: ["Меккедегі Харам мешітінің имамы. Жұмсақ, таза оқу.", "Имам Запретной мечети в Мекке. Мягкое, чистое чтение."] },
  { id: "shuraim", n: ["Сағуд әш-Шурайм", "Сауд аш-Шурайм"], c: ["Сауд Арабиясы", "Саудовская Аравия"], v: [["saud-shuraim/r1", "m"]],
    img: ["https://upload.wikimedia.org/wikipedia/commons/8/8f/Saud_Shuraim.png", "Sazwanmisuari", "CC0", "https://commons.wikimedia.org/wiki/File:Saud_Shuraim.png"],
    b: ["Ұзақ жылдар Меккедегі Харам мешітінің имамы болды. Күшті әрі жинақы, бірден танылатын оқу.", "Долгие годы был имамом Запретной мечети в Мекке. Сильное, собранное, узнаваемое чтение."] },
  { id: "dosari", n: ["Ясир әд-Дәусари", "Ясир ад-Даусари"], c: ["Сауд Арабиясы", "Саудовская Аравия"], v: [["yasser-dosari/r1", "m"]],
    img: [WM + "8/8b/Yasser_Al-Dosari_%28cropped%29.jpg/250px-Yasser_Al-Dosari_%28cropped%29.jpg", "MAL MALDIVE", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Yasser_Al-Dosari_(cropped).jpg"],
    b: ["Меккедегі Харам мешітінің имамы. Жүрекке жететін, әсерлі оқу.", "Имам Запретной мечети в Мекке. Проникновенное, трогающее сердце чтение."] },
  { id: "qatami", n: ["Насир әл-Қатами", "Насер аль-Катами"], c: ["Сауд Арабиясы", "Саудовская Аравия"], v: [["nasser-qatami/r1", "m"]],
    img: [WM + "a/aa/%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg/250px-%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg", "Ayman dhū alghiná", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:%D8%B5%D9%88%D8%B1%D8%A9_%D8%B4%D8%AE%D8%B5%D9%8A%D8%A9_%D9%86%D8%A7%D8%B5%D8%B1_%D8%A7%D9%84%D9%82%D8%B7%D8%A7%D9%85%D9%8A.jpg"],
    b: ["Әсерлі, жүрекке жақын оқуымен танымал.", "Известен проникновенным, трогающим сердце чтением."] },
  { id: "ajmi", n: ["Ахмад әл-Ажми", "Ахмад аль-Аджми"], c: ["Сауд Арабиясы", "Саудовская Аравия"], v: [["ahmad-ajmi/r1", "m"]],
    img: [WM + "e/e5/Ahmad_bin_Ali_Al-Ajmi.png/250px-Ahmad_bin_Ali_Al-Ajmi.png", "أحمد زين", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Ahmad_bin_Ali_Al-Ajmi.png"],
    b: ["Күшті әрі әуенді оқу, бүкіл әлемде танымал.", "Сильное и мелодичное чтение, популярное во всём мире."] },
  { id: "ayyub", n: ["Мұхаммед Әйюб", "Мухаммад Айюб"], c: ["Сауд Арабиясы, 1952–2016", "Саудовская Аравия, 1952–2016"], v: [["muhammad-ayyub/r1", "m"]], img: null,
    b: ["Көп жыл Мединедегі Пайғамбар ﷺ мешітінің имамы болды. Баяу, жайлы оқу.", "Много лет был имамом Мечети Пророка ﷺ в Медине. Неспешное, спокойное чтение."] },
];
const STYLE = { m: ["Мураттал — бірқалыпты", "Муратталь — размеренное"], t: ["Үйретуші — балалармен", "Обучающее — с повторением"], j: ["Мужәууад — әуенді", "Муджаввад — мелодичное"] };
const readerOf = rid => READERS.find(r => r.v.some(v => v[0] === rid)) || READERS[0];
const LRECITERS = READERS.flatMap(r => r.v.map(([id, st]) => [id, r.n[0] + (r.v.length > 1 ? " — " + STYLE[st][0].split(" — ")[0].toLowerCase() : ""), r.n[1] + (r.v.length > 1 ? " — " + STYLE[st][1].split(" — ")[0].toLowerCase() : "")]));
const recName = id => { const r = LRECITERS.find(x => x[0] === id) || LRECITERS[0]; return S.lang === "ru" ? r[2] : r[1]; };
const initials = n => n.replace(/\b(әл|аль|аш|әш|ад|әд|ас)-/gi, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const readerAva = (r, cls = "") => r.img ? `<span class="rava ${cls}" data-i="${esc(initials(r.n[1]))}"><img src="${r.img[0]}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('mono');this.parentNode.textContent=this.parentNode.dataset.i"></span>` : `<span class="rava mono ${cls}">${esc(initials(r.n[1]))}</span>`;
const fmtT = t => { if (!isFinite(t)) return "0:00"; t = Math.floor(t); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0"); };
let LP = null; // { a: Audio, bar: Element }
function listenPlay(s, rec) {
  if (rec) S.listen.r = rec;
  S.listen.s = s; save();
  stopAudio();
  if (!LP) { const a = new Audio(); a.preload = "auto"; LP = { a }; a.onended = () => { if (S.listen.s < 114) listenPlay(S.listen.s + 1); else lpRender(); };
    a.ontimeupdate = lpTick; a.onplay = a.onpause = () => { lpRender(); if (typeof onListenChange === "function") onListenChange(); };
    a.onerror = () => { toast(T("audioErr")); lpRender(); }; }
  LP.a.src = MP3Q + S.listen.r + "/" + String(s).padStart(3, "0") + ".mp3";
  LP.a.playbackRate = S.listen.rate || 1;
  LP.a.play().catch(() => {});
  if ("mediaSession" in navigator) {
    const su = suraBy(s);
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${s}. ${L(su.name)} — ${su.ar}`, artist: recName(S.listen.r), album: "Iqra",
      artwork: [{ src: new URL("icon.svg", location.href).href, sizes: "any", type: "image/svg+xml" }] });
    navigator.mediaSession.setActionHandler("previoustrack", () => S.listen.s > 1 && listenPlay(S.listen.s - 1));
    navigator.mediaSession.setActionHandler("nexttrack", () => S.listen.s < 114 && listenPlay(S.listen.s + 1));
    navigator.mediaSession.setActionHandler("play", () => LP.a.play());
    navigator.mediaSession.setActionHandler("pause", () => LP.a.pause());
  }
  lpRender();
}
let onListenChange = null;
function lpTick() {
  const bar = $("#lp"); if (!bar || !LP) return;
  const a = LP.a, r = $("input[type=range]", bar);
  if (r && !r.matches(":active")) r.value = a.duration ? (a.currentTime / a.duration * 1000).toFixed(0) : 0;
  const t = $(".lp-t", bar); if (t) t.textContent = fmtT(a.currentTime) + " / " + fmtT(a.duration);
}
function lpRender() {
  let bar = $("#lp");
  if (!LP || !LP.a.src) { if (bar) bar.remove(); document.body.classList.remove("has-lp"); return; }
  if (!bar) { bar = h("div", { id: "lp", class: "lp", role: "region", "aria-label": T("listen") }); document.body.append(bar); }
  document.body.classList.add("has-lp");
  const s = suraBy(S.listen.s), a = LP.a;
  bar.innerHTML = "";
  const pp = h("button", { class: "lp-pp", title: a.paused ? T("play") : T("pause"), html: icon(a.paused ? "play" : "pause") });
  pp.onclick = () => a.paused ? a.play() : a.pause();
  const prev = h("button", { class: "lp-b", title: T("prev"), html: icon("prevT"), disabled: S.listen.s <= 1 }); prev.onclick = () => listenPlay(S.listen.s - 1);
  const next = h("button", { class: "lp-b", title: T("next"), html: icon("nextT"), disabled: S.listen.s >= 114 }); next.onclick = () => listenPlay(S.listen.s + 1);
  const range = h("input", { type: "range", min: 0, max: 1000, value: 0, "aria-label": T("listen") });
  range.oninput = () => { if (a.duration) a.currentTime = range.value / 1000 * a.duration; };
  const close = h("button", { class: "lp-b", title: T("cancel"), html: icon("close") });
  close.onclick = () => { a.pause(); a.removeAttribute("src"); a.load(); lpRender(); };
  bar.append(h("div", { class: "lp-in" },
    h("a", { class: "lp-info", href: `#/reader/${readerOf(S.listen.r).id}` }, h("b", {}, `${s.n}. ${L(s.name)}`), h("small", {}, recName(S.listen.r))),
    h("div", { class: "lp-ctl" }, prev, pp, next, close),
    h("div", { class: "lp-seek" }, range, h("span", { class: "lp-t num" }, "0:00 / 0:00"))));
  lpTick();
}

/* ═════════════ игровая часть ═════════════ */
const levelOf = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
const levelBounds = lv => [40 * (lv - 1) ** 2, 40 * lv ** 2];
function streak() {
  let n = 0; const d = new Date();
  if (!(S.days[today()] > 0)) d.setDate(d.getDate() - 1);
  for (;;) {
    const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (S.days[k] > 0) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}
function addXP(n, at) {
  if (!n) return;
  S.xp += n; S.days[today()] = (S.days[today()] || 0) + n; save();
  if (at && at.getBoundingClientRect) {
    const r = at.getBoundingClientRect();
    const f = h("div", { class: "xpfly", style: `left:${Math.round(r.left + r.width / 2 - 14)}px;top:${Math.round(r.top - 4)}px` }, "+" + n);
    document.body.append(f); setTimeout(() => f.remove(), 950);
  }
  checkBadges(); renderTopStats();
}
const BADGES = [
  ["first", "١", ["Алғашқы қадам", "Первый шаг"], ["Бірінші сабақты аяқтадыңыз", "Завершили первый урок"], () => doneCount() >= 1],
  ["m1", "ا", ["Әліпби", "Алфавит"], ["1-модульді аяқтадыңыз", "Завершили модуль 1"], () => modDone(1)],
  ["m2", "بَ", ["Оқырман", "Чтец"], ["2-модульді аяқтадыңыз", "Завершили модуль 2"], () => modDone(2)],
  ["m3", "ج", ["Тәжуид", "Таджвид"], ["3-модульді аяқтадыңыз", "Завершили модуль 3"], () => modDone(3)],
  ["m4", "ق", ["Қари жолы", "Путь чтеца"], ["Бүкіл курсты аяқтадыңыз", "Завершили весь курс"], () => modDone(4)],
  ["s3", "٣", ["Үш күн", "Три дня"], ["3 күн қатарынан", "3 дня подряд"], () => streak() >= 3],
  ["s7", "٧", ["Бір апта", "Неделя"], ["7 күн қатарынан", "7 дней подряд"], () => streak() >= 7],
  ["s30", "٣٠", ["Бір ай", "Месяц"], ["30 күн қатарынан", "30 дней подряд"], () => streak() >= 30],
  ["t100", "١٠٠", ["Жаттықтырушы", "Тренировка"], ["Тренажёрда 100 дұрыс жауап", "100 верных ответов в тренажёрах"], () => S.tr.ok >= 100],
  ["perfect", "✓", ["Мінсіз", "Без ошибок"], ["Бақылауды 100% тапсырдыңыз", "Сдали контрольную на 100%"], () => Object.values(S.tests).some(x => x >= 100)],
  ["fatiha", "ح", ["Фатиха", "Фатиха"], ["Фатиханы жаттадыңыз", "Выучили Фатиху"], () => suraMemorized(1)],
  ["hifz5", "٥", ["Бес сүре", "Пять сур"], ["5 сүре жаттадыңыз", "Выучили 5 сур"], () => CORE && CORE.suras.filter(s => suraMemorized(s.n)).length >= 5],
];
function doneCount() { return Object.values(S.lessons).filter(x => x && x.done).length; }
function modDone(m) { if (!COURSE) return false; const M = COURSE.modules[m - 1]; for (let n = M.from; n <= M.to; n++) if (!(S.lessons[n] && S.lessons[n].done)) return false; return true; }
function suraMemorized(n) { const s = CORE && suraBy(n); if (!s) return false; const st = S.hifz[n] || {}; let k = 0; for (let a = 1; a <= s.c; a++) if (st[a]) k++; return k >= s.c; }
function checkBadges() {
  if (!CORE || !COURSE) return;
  for (const [id, glyph, name] of BADGES) {
    if (S.badges[id]) continue;
    const b = BADGES.find(x => x[0] === id);
    if (b[4]()) { S.badges[id] = today(); save(); toast(T("badgeGot") + ": " + L({ kk: name[0], ru: name[1] }), glyph); }
  }
}

/* ═════════════ тосты ═════════════ */
const toasts = h("div", { class: "toasts", role: "status", "aria-live": "polite" });
function toast(msg, glyph) {
  const t = h("div", { class: "toast" });
  if (glyph) t.insertAdjacentHTML("beforeend", rosette(glyph));
  t.append(h("span", {}, msg));
  toasts.append(t); setTimeout(() => t.remove(), 3600);
}

/* ═════════════ оболочка ═════════════ */
const NAV = [["#/", "today", "sun"], ["#/course", "learn", "learn"], ["#/suras", "suras", "stand"], ["#/namaz", "namaz", "mat"], ["#/me", "me", "user"]];
// знак Iqra: восьмиконечная звезда, внутри алиф с фатхой
const MARK = `<svg class="mark" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="var(--primary)" stroke-width="6" stroke-linejoin="round"><rect x="20" y="20" width="80" height="80" rx="6"/><rect x="20" y="20" width="80" height="80" rx="6" transform="rotate(45 60 60)"/></g><rect x="56" y="47" width="8" height="30" rx="4" fill="var(--primary)"/><rect x="51.5" y="37.5" width="17" height="5" rx="2.5" fill="var(--brass)" transform="rotate(-18 60 40)"/></svg>`;
const brandEl = () => h("a", { class: "brand", href: "#/", "aria-label": "Iqra — " + T("brandSub"), html: MARK + '<span class="wm">iqra<i>.</i></span>' });
function shell() {
  document.body.innerHTML = "";
  const langSeg = h("div", { class: "lang", role: "group", "aria-label": T("language") },
    ["kk", "ru"].map(l => h("button", { "aria-pressed": String(S.lang === l), onclick: () => setLang(l) }, l === "kk" ? "ҚАЗ" : "РУС")));
  const side = h("aside", { class: "side" }, brandEl(),
    h("nav", { class: "snav", "aria-label": T("menu") }, NAV.map(([href, k, ic]) => h("a", { href, "data-k": k, html: icon(ic) + `<span>${esc(T(k))}</span>` }))),
    h("a", { class: "side-streak", href: "#/me", id: "sidestreak" }),
    h("div", { class: "side-f" }, langSeg, h("button", { class: "iconbtn", title: T("theme"), "aria-label": T("theme"), html: icon(isDark() ? "sun" : "moon"), onclick: toggleTheme })));
  const top = h("header", { class: "top" }, brandEl(), h("a", { class: "chip", href: "#/me", id: "topstats", "aria-label": T("streak") }));
  const tabbar = h("nav", { class: "tabbar", "aria-label": T("menu") }, NAV.map(([href, k, ic]) => h("a", { href, "data-k": k, "aria-label": T(k), html: icon(ic) + `<span>${esc(T(k))}</span>` })));
  const main = h("main", { id: "view", tabindex: "-1" });
  const foot = h("footer", { class: "site" }, h("p", {}, T("footer")), h("p", { style: "margin-top:6px" }, T("footer2")));
  document.body.append(side, top, main, foot, tabbar, toasts);
  document.documentElement.lang = S.lang === "ru" ? "ru" : "kk";
  document.title = S.lang === "ru" ? "Iqra — учимся читать Коран с нуля" : "Iqra — Құранды нөлден оқып үйрену";
  renderTopStats(); renderAvatar(); lpRender();
}
function renderTopStats() {
  const n = streak();
  const el = $("#topstats");
  if (el) { el.innerHTML = icon("flame") + `<span class="num">${n}</span>`; el.classList.toggle("on", n > 0); }
  const sd = $("#sidestreak");
  if (sd) { sd.innerHTML = `<span class="ss-ic">${icon("flame")}</span><span><b class="num">${n}</b><small>${esc(T("streak"))}</small></span>`; sd.classList.toggle("on", n > 0); }
}
function setLang(l) { S.lang = l; save(); shell(); route(); }
function toggleTheme() { S.theme = isDark() ? "light" : "dark"; save(); applyTheme(); shell(); route(); }
function markNav(k) { $$("[data-k]").forEach(a => { if (a.dataset.k === k) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }
const subTabs = (items, cur) => h("nav", { class: "subtabs" }, items.map(([href, label, k]) => h("a", { href, "aria-current": k === cur ? "page" : null }, label)));
const learnTabs = cur => subTabs([["#/course", T("course"), "course"], ["#/practice", T("practice"), "practice"], ["#/ref", T("ref"), "ref"]], cur);
const quranTabs = cur => subTabs([["#/suras", T("surasT"), "suras"], ["#/listen", T("readers"), "listen"]], cur);
const pageHead = (title, sub, extra) => h("header", { class: "phead" }, h("h1", {}, title), sub ? h("p", { class: "muted" }, sub) : null, extra || null);
const backHead = (href, title, sub, extra) => h("header", { class: "bhead" }, h("a", { class: "iconbtn back", href, "aria-label": T("prev"), html: icon("back") }),
  h("div", { class: "bh-t" }, h("h1", {}, title), sub ? h("p", { class: "muted small" }, sub) : null), extra || null);
const fmtN = n => Number(n || 0).toLocaleString(S.lang === "ru" ? "ru-RU" : "kk-KZ");

/* ═════════════ маршрутизация ═════════════ */
async function route() {
  if (ASK_DISMISS) ASK_DISMISS();
  stopAudio(); onListenChange = null;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const view = $("#view");
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
  const [p0, p1, p2] = parts;
  view.innerHTML = "";
  document.body.dataset.page = p0 || "home";
  window.scrollTo(0, 0);
  try {
    if (!p0) { markNav("today"); await pageHome(view); }
    else if (p0 === "course") { markNav("learn"); pageCourse(view); }
    else if (p0 === "lesson") { markNav("learn"); await pageLesson(view, +p1); }
    else if (p0 === "ref") { markNav("learn"); await pageRef(view, p1, p2); }
    else if (p0 === "suras") { markNav("suras"); pageSuras(view); }
    else if (p0 === "sura") { markNav("suras"); await pageSura(view, +p1, p2 === "hifz", /^\d+$/.test(p2 || "") ? +p2 : 0); }
    else if (p0 === "listen") { markNav("suras"); pageReaders(view); }
    else if (p0 === "reader") { markNav("suras"); pageReader(view, p1); }
    else if (p0 === "namaz") { markNav("namaz"); await pageNamaz(view, p1); }
    else if (p0 === "tasbih") { markNav("namaz"); await pageTasbih(view); }
    else if (p0 === "practice") { markNav("learn"); p1 ? pageTrainer(view, p1) : pagePractice(view); }
    else if (p0 === "me") { markNav("me"); pageMe(view); }
    else notFound(view);
  } catch (e) { console.error(e); notFound(view); }
  view.focus({ preventScroll: true });
}
function notFound(v) { v.append(h("div", { class: "loading" }, h("div", { class: "stack", style: "justify-items:center" }, h("h2", {}, T("notFound")), h("a", { class: "btn", href: "#/" }, T("toHome"))))); }

/* ═════════════ главная ═════════════ */
// аят дня: короткие известные аяты, один на каждый день
const AYAH_DAY = [[1, 2], [2, 152], [2, 153], [2, 186], [2, 201], [3, 8], [3, 139], [3, 173], [9, 51], [13, 28], [14, 7], [17, 24], [20, 25], [20, 114],
  [25, 74], [29, 69], [39, 53], [40, 60], [49, 13], [55, 13], [57, 4], [64, 11], [65, 3], [93, 5], [94, 5], [94, 6], [108, 1], [112, 1]];
function nextLessonN() {
  for (const l of COURSE.lessons) if (l.ready && !(S.lessons[l.n] && S.lessons[l.n].done)) return l.n;
  return 1;
}
const firstAr = o => { const m = String(L(o)).match(AR_RUN); return m ? m[0] : ""; };
const heroGlyph = les => { const g = firstAr(les.title); return g && g.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\s]/g, "").length <= 3 ? g : "ا"; };
function ayahOfDay() {
  const ru = S.lang === "ru";
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
  const [as, aa] = AYAH_DAY[day % AYAH_DAY.length];
  const su = suraBy(as);
  const box = h("section", { class: "aod", "aria-label": ru ? "Аят дня" : "Күн аяты" });
  const play = h("button", { class: "aod-play", type: "button", "aria-label": T("play"), html: icon("play") });
  play.onclick = () => playURL(ayahURL(as, aa), box);
  box.append(h("div", { class: "aod-h", html: `${icon("star")}<b>${esc(ru ? "Аят дня" : "Күн аяты")}</b><a href="#/sura/${as}/${aa}">${esc(L(su.name))}, ${aa}</a>` }, play));
  const arEl = h("div", { class: "aod-ar", lang: "ar" }, "…"), tlEl = h("p", { class: "aod-tl" });
  box.append(arEl, tlEl);
  loadSura(as).then(d => { const a = d.ayat[aa - 1]; arEl.innerHTML = esc(a.sp.map(x => x[0]).join("")) + " " + ayahMark(aa); }).catch(() => { arEl.textContent = ""; });
  loadTl(as).then(t => { tlEl.textContent = t[aa - 1] || ""; }).catch(() => {});
  return box;
}
async function pageHome(v) {
  const ru = S.lang === "ru";
  const started = doneCount() > 0;
  const n = nextLessonN(), les = COURSE.lessons[n - 1], M = moduleOf(n);
  const tx = S.days[today()] || 0, goal = S.goal;
  const sub = tx >= goal ? (ru ? `Цель дня выполнена: ${tx} очков. Машаллах!` : `Күндік мақсат орындалды: ${tx} ұпай. Машаллаһ!`)
    : started ? (ru ? `Сегодня ${tx} из ${goal} очков. Ещё один урок — и цель дня ближе.` : `Бүгін ${goal} ұпайдың ${tx}-і жиналды. Тағы бір сабақ — мақсатқа жақындайсыз.`)
    : T("heroLead");
  v.append(pageHead(T("salam"), sub));
  const pct = Math.round(doneCount() / 110 * 100);
  const hero = h("a", { class: "hero2", href: `#/lesson/${n}`, html:
    `<span class="h2-g" lang="ar">${esc(heroGlyph(les))}</span><span class="h2-t"><small>${esc(T("lesson"))} ${n} ${ru ? "из" : "/"} 110 · ${esc(T("module"))} ${M.id}</small><b>${mdInline(les.title)}</b>` +
    `<span class="h2-bar" aria-hidden="true"><i style="width:${Math.max(3, pct)}%"></i></span><span class="h2-btn">${icon("play")}${esc(started ? T("cont") : T("start"))}</span></span>` });
  v.append(h("div", { class: "home-top" }, hero, ayahOfDay()));

  const lastS = S.last && suraBy(S.last.s), st = streak(), ts = S.tsb || {};
  const tile = (href, ic, title, sub, cls = "") => h("a", { class: "tile " + cls, href, html: `<span class="t-ic">${icon(ic)}</span><b>${esc(title)}</b><small>${esc(sub)}</small>` });
  v.append(h("div", { class: "tiles" },
    tile(lastS ? `#/sura/${lastS.n}/${S.last.a}` : "#/suras", "stand", lastS ? T("contRead") : T("suras"),
      lastS ? `${L(lastS.name)}, ${S.last.a} ${T("ayahN")}` : (ru ? "114 сур с переводом" : "114 сүре, аудармасымен")),
    tile("#/me", "flame", ru ? `${st} ${plRu(st, "день", "дня", "дней")} подряд` : `${st} күн қатарынан`, ru ? `Цель на день — ${goal} очков` : `Күндік мақсат — ${goal} ұпай`, "warm"),
    tile("#/tasbih", "beads", ru ? "Тасбих" : "Тәсбих", ts.total ? fmtN(ts.total) : (ru ? "После намаза" : "Намаздан кейін")),
    tile("#/listen", "headph", T("listen"), ru ? `${READERS.length} чтецов` : `${READERS.length} қари`)));

  const mods = h("div", { class: "mods" });
  for (const Mo of COURSE.modules) {
    let d = 0; const tot = Mo.to - Mo.from + 1;
    for (let i = Mo.from; i <= Mo.to; i++) if (S.lessons[i] && S.lessons[i].done) d++;
    mods.append(h("a", { class: "mod", href: `#/course#m${Mo.id}`, html:
      `<div><h3>${esc(T("module"))} ${Mo.id}. ${esc(L(Mo.title))}</h3></div><span class="mar">${Mo.ar}</span>
       <p>${esc(L(Mo.desc))}</p><div class="bar"><i style="width:${(d / tot * 100).toFixed(0)}%"></i></div>
       <div class="meta"><span>${esc(T("lesson"))} ${Mo.from}–${Mo.to}</span><span class="num">${d} / ${tot}</span></div>` }));
  }
  v.append(h("section", { class: "section" }, h("div", { class: "section-h" }, h("h2", {}, T("modules")), h("a", { href: "#/course" }, T("seeCourse"))), mods));
  if (!started) v.append(h("section", { class: "section" }, h("div", { class: "section-h" }, h("h2", {}, T("how"))),
    h("div", { class: "steps" }, [1, 2, 3].map(i => h("div", { class: "step", html: `<b><i>${i}</i>${esc(T("how" + i + "t"))}</b><p>${esc(T("how" + i))}</p>` })))));
}

/* ═════════════ карта курса ═════════════ */
function pageCourse(v) {
  v.append(h("div", { class: "read" }, pageHead(T("learn"), T("wordsLearned"), learnTabs("course"))));
  const cur = nextLessonN();
  for (const M of COURSE.modules) {
    const sec = h("section", { class: "path-mod read", id: "m" + M.id });
    sec.append(h("header", {}, h("span", { class: "mar" }, M.ar),
      h("div", {}, h("h2", {}, `${T("module")} ${M.id}. ${L(M.title)}`), h("p", { class: "muted small" }, L(M.result)))));
    const ul = h("ol", { class: "path" });
    for (let n = M.from; n <= M.to; n++) {
      const les = COURSE.lessons[n - 1];
      const done = S.lessons[n] && S.lessons[n].done;
      const locked = !done && n > cur;
      const cls = done ? "done" : (n === cur ? "cur" : "");
      const sub = done ? T("doneL") : (!les.ready ? T("soon") : (n === cur ? T("nextLesson") : ""));
      ul.append(h("li", { class: locked ? "locked" : null }, h("a", { href: les.ready ? `#/lesson/${n}` : null, "aria-disabled": les.ready ? null : "true",
        html: `${rosette(n, cls)}<div class="lt"><b>${mdInline(les.title)}</b>${sub ? `<span>${esc(sub)}</span>` : ""}</div>${locked ? `<span class="lk" title="${esc(S.lang === "ru" ? "Сначала завершите предыдущие уроки" : "Алдымен алдыңғы сабақтарды аяқтаңыз")}">${icon("lock")}</span>` : ""}` })));
    }
    sec.append(ul);
    v.append(sec);
  }
  const target = location.hash.split("#")[2];
  if (target) setTimeout(() => { const el = document.getElementById(target); if (el) el.scrollIntoView({ block: "start" }); }, 30);
}

/* ═════════════ окно подтверждения ═════════════ */
let ASK_DISMISS = null; // закрыть открытый диалог без ответа (при переходе на другую страницу)
function ask({ title, text, yes, no, icon: ic = "alert" }) {
  return new Promise(res => {
    const prev = document.activeElement;
    const close = v => { wrap.remove(); document.removeEventListener("keydown", onKey); ASK_DISMISS = null; if (v !== null && prev && prev.focus) prev.focus(); res(v); };
    if (ASK_DISMISS) ASK_DISMISS(); ASK_DISMISS = () => close(null);
    const onKey = e => { if (e.key === "Escape") close(false); };
    const yb = h("button", { class: "btn ghost" }, yes), nb = h("button", { class: "btn" }, no);
    yb.onclick = () => close(true); nb.onclick = () => close(false);
    const box = h("div", { class: "modal", role: "alertdialog", "aria-modal": "true", "aria-labelledby": "mdl-t" },
      h("span", { class: "modal-ic", html: icon(ic) }), h("h2", { id: "mdl-t" }, title), mdEl(text), h("div", { class: "modal-btns" }, nb, yb));
    const wrap = h("div", { class: "modal-bg" }, box);
    wrap.onclick = e => { if (e.target === wrap) close(false); };
    document.body.append(wrap); document.addEventListener("keydown", onKey); nb.focus();
  });
}

/* ═════════════ порядок уроков ═════════════ */
const SKIP_KEY = "iqra.skipOK";
const skipOK = () => { try { return sessionStorage.getItem(SKIP_KEY) === "1"; } catch (e) { return false; } };
const isDone = n => !!(S.lessons[n] && S.lessons[n].done);
const undoneBefore = n => { const u = []; for (let i = 1; i < n; i++) if (!isDone(i)) u.push(i); return u; };
const plRu = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; };
function listLessons(u) {
  const contiguous = u.every((x, i) => i === 0 || x === u[i - 1] + 1);
  if (contiguous && u.length >= 3) return `${u[0]}–${u[u.length - 1]}`;
  return u.length <= 4 ? u.join(", ") : `${u.slice(0, 3).join(", ")}…`;
}
async function allowLesson(n) {
  const u = undoneBefore(n);
  if (!u.length || skipOK()) return true;
  const ru = S.lang === "ru", one = u.length === 1, cnt = u.length;
  const title = ru ? (one ? "Предыдущий урок не завершён" : "Предыдущие уроки не завершены") : (one ? "Алдыңғы сабақ аяқталмаған" : "Алдыңғы сабақтар аяқталмаған");
  const what = ru
    ? (one ? `Вы ещё не закончили **урок ${u[0]}**.` : `Вы ещё не закончили **уроки ${listLessons(u)}** — всего ${cnt} ${plRu(cnt, "урок", "урока", "уроков")}.`)
    : (one ? `Сіз әлі **${u[0]}-сабақты** аяқтамадыңыз.` : `Сіз әлі **${listLessons(u)} сабақтарды** аяқтамадыңыз — барлығы ${cnt} сабақ.`);
  const why = ru ? `Уроки идут по порядку: каждый опирается на предыдущие. Точно хотите перейти к уроку ${n}?\n\nЭто предупреждение больше не появится до конца сеанса.`
    : `Сабақтар ретімен жүреді: әрқайсысы алдыңғыларына сүйенеді. ${n}-сабаққа өтуге сенімдісіз бе?\n\nБұл ескерту осы сеанстың соңына дейін қайта шықпайды.`;
  const ok = await ask({ title, text: what + "\n\n" + why, icon: "lock",
    yes: ru ? `Да, открыть урок ${n}` : `Иә, ${n}-сабақты ашу`,
    no: ru ? `Вернуться к уроку ${u[0]}` : `${u[0]}-сабаққа оралу` });
  if (ok) { try { sessionStorage.setItem(SKIP_KEY, "1"); } catch (e) {} }
  return ok;
}

/* ═════════════ урок ═════════════ */
async function pageLesson(v, n) {
  const meta = COURSE.lessons[n - 1];
  if (!meta || !meta.ready) return notFound(v);
  const okL = await allowLesson(n);
  if (okL === null) return; // ушли на другую страницу, пока был открыт диалог
  if (!okL) { location.replace(`#/lesson/${undoneBefore(n)[0]}`); return; }
  const M = moduleOf(n);
  const list = await loadModule(M.id);
  const les = list.find(x => x.n === n);
  if (!les) return notFound(v);
  const need = new Set();
  les.blocks.forEach(b => { if (b.type === "ayah") need.add(b.s); if (b.type === "sura") need.add(b.n); });
  await Promise.all([...need].map(loadSura));
  exCounter = 0;
  const wrap = h("article", { class: "read" });
  const total = les.blocks.filter(b => b.type === "ex").length;
  wrap.append(h("div", { class: "lhead" },
    h("div", { class: "crumbs", html: `<a href="#/course#m${M.id}">${esc(T("module"))} ${M.id} · ${esc(L(M.title))}</a><span>·</span><span>${esc(T("lesson"))} ${n} / 110</span>` }),
    h("h1", { html: mdInline(les.title) }),
    h("p", { class: "goal", html: esc(T("goal")) + ": " + md(les.goal).replace(/<\/?p>/g, "") })));
  const progBar = h("div", { class: "bar" }, h("i", { style: "width:0%" }));
  if (total) wrap.append(h("div", { class: "lprog" }, progBar));
  const blocksEl = h("div", { class: "blocks" });
  const ctx = { n, solved: new Set(), total, onSolve(key, el, xp = 5) {
    if (!ctx.solved.has(key)) { ctx.solved.add(key); if (!S.ex[key]) { S.ex[key] = 1; addXP(xp, el); } save(); }
    progBar.firstChild.style.width = (ctx.solved.size / Math.max(1, total) * 100).toFixed(0) + "%";
  } };
  les.blocks.forEach((b, i) => { const el = renderBlock(b, `${n}.${i}`, ctx); if (el) blocksEl.append(el); });
  wrap.append(blocksEl);

  const done = S.lessons[n] && S.lessons[n].done;
  const fin = h("button", { class: "btn" + (done ? " ghost" : ""), html: (done ? icon("check") : "") + esc(done ? T("finished") : T("finish")) });
  fin.onclick = () => {
    if (!(S.lessons[n] && S.lessons[n].done)) {
      S.lessons[n] = { done: true, at: today() }; save(); addXP(20, fin);
      fin.className = "btn ghost"; fin.innerHTML = icon("check") + esc(T("finished"));
    }
    checkBadges();
    const nx = COURSE.lessons[n];
    if (nx && nx.ready) setTimeout(() => location.hash = `#/lesson/${n + 1}`, 650);
  };
  wrap.append(h("div", { class: "done-bar" }, h("p", { class: "muted small" }, T("finishHint")), fin));
  const prev = COURSE.lessons[n - 2], next = COURSE.lessons[n];
  wrap.append(h("div", { class: "lnav" },
    prev ? h("a", { class: "btn ghost", href: `#/lesson/${n - 1}`, html: icon("back") + esc(T("prev")) }) : h("span"),
    next && next.ready ? h("a", { class: "btn ghost", href: `#/lesson/${n + 1}`, html: esc(T("next")) + icon("arrow") }) : h("span")));
  v.append(wrap);
  // восстановить решённые
  progBar.firstChild.style.width = "0%";
}

/* ═════════════ блоки ═════════════ */
function renderBlock(b, key, ctx) {
  switch (b.type) {
    case "p": return mdEl(b.t);
    case "h": return h("h3", { html: mdInline(b.t) });
    case "sep": return h("div", { class: "sep" });
    case "box": {
      const ic = { rule: "rule", tip: "bulb", warn: "alert", kz: "bridge" }[b.kind] || "rule";
      return h("div", { class: "box " + b.kind }, h("h4", { html: icon(ic) + "<span>" + md(b.title).replace(/<\/?p>/g, "") + "</span>" }), mdEl(b.body));
    }
    case "direction": return h("div", { class: "dir", html: `<div class="ar">بِسْمِ ٱللَّهِ</div><svg viewBox="0 0 300 28" preserveAspectRatio="none"><path d="M280 14H24M36 4L22 14l14 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="cap">${esc(S.lang === "ru" ? "Читаем и пишем справа налево" : "Оңнан солға оқимыз және жазамыз")}</div>` });
    case "forms": return formsEl(letterBy(b.ar));
    case "letter": { const Lt = letterBy(b.ar); return h("div", { class: "stack", style: "gap:10px" }, letterCard(Lt), sayBtns(Lt)); }
    case "makhraj": return makhrajEl(b.keys);
    case "words": return wordsEl(letterBy(b.ar).words);
    case "wordlist": return wordsEl(b.items);
    case "grid": {
      const g = h("div", { class: "argrid", style: `grid-template-columns:repeat(${Math.min(b.cols, 6)},1fr)` });
      b.items.forEach(x => g.append(h("div", { class: "sz-" + b.size }, x)));
      return g;
    }
    case "ar": {
      const el = h("div", { class: "arblock" });
      const a = h("div", { class: "ar sz-" + (b.size || "lg") }, b.text);
      el.append(a);
      if (b.tr) el.append(h("div", { class: "tr" }, L(b.tr)));
      if (b.loc) { const btn = h("button", { class: "btn ghost", style: "margin-top:8px;min-height:38px", html: icon("sound") + esc(T("play")) }); btn.onclick = () => playURL(b.loc.split(":").length === 3 ? wordURL(b.loc) : ayahURL(...b.loc.split(":").map(Number)), el); el.append(btn); }
      if (b.note) el.append(h("div", { class: "tr" }, L(b.note)));
      return el;
    }
    case "ayah": return ayahBlock(b.s, b.a, b.color);
    case "sura": return suraEmbed(b.n);
    case "legend": return legendEl(b.keys);
    case "table": return tableEl(b);
    case "trace": return traceEl(b.ar, key, ctx);
    case "ex": return exEl(b, key, ctx);
    case "check": return checksEl(b.items, key);
    case "test": return testEl(b, key, ctx);
    case "modules": return h("div", { class: "mods" }, COURSE.modules.map(M => h("div", { class: "mod", html: `<div><h3>${M.id}. ${esc(L(M.title))}</h3></div><span class="mar">${M.ar}</span><p>${esc(L(M.desc))}</p><div class="meta"><span>${esc(T("lesson"))} ${M.from}–${M.to}</span></div>` })));
    case "rulecard": return ruleCards(b.keys);
    case "hifzlinks": return h("div", { class: "slist" }, b.suras.map(n => suraItem(suraBy(n), `#/sura/${n}/hifz`)));
    case "rex": {
      const g = h("div", { class: "rex" });
      for (const it of b.items) {
        const [s, a] = it.src.split(":").map(Number);
        const row = h("div", { class: "rex-i" });
        const pb = h("button", { class: "pa", html: icon("play"), title: T("play") });
        pb.onclick = () => playURL(ayahURL(s, a), row);
        row.append(h("div", { class: "ar rex-a", html: spansHTML(it.sp) }), h("span", { class: "pill" }, `${L(suraBy(s).name)} ${it.src}`), pb);
        g.append(row);
      }
      return g;
    }
    default: return null;
  }
}
function formsEl(Lt) {
  const names = S.lang === "ru" ? UI.forms4ru : UI.forms4;
  return h("div", { class: "forms" }, Lt.forms.map((f, i) => h("div", {}, h("div", { class: "f" }, f), h("div", { class: "c" }, names[i]))));
}
const nameParts = s => { const m = String(s).match(/^(.*?)\s*\((.+)\)$/); return m ? [m[1], m[2]] : [String(s), ""]; };
function sayBtns(Lt, big) {
  const ex = Lt.words && Lt.words[0] && Lt.words[0].loc;
  const row = h("div", { class: "say" + (big ? " big" : "") });
  const nb = h("button", { class: "saybtn", type: "button", html: icon("sound") + `<span>${esc(T("sayName"))}</span><span class="ar">${AR_NAMES[Lt.ar] || Lt.ar}</span>` });
  nb.onclick = () => speakAr(AR_NAMES[Lt.ar] || Lt.ar, nb, ex);
  row.append(nb);
  if (!"اوي".includes(Lt.ar) && Lt.ar !== "ء") ["َ", "ِ", "ُ"].forEach(v => {
    const b = h("button", { class: "saybtn syl", type: "button", html: `<span class="ar">${Lt.ar + v}</span>` });
    b.onclick = () => speakAr(Lt.ar + v, b, ex); row.append(b);
  });
  return row;
}
function letterCard(Lt) {
  const mk = CORE.makhraj[Lt.mk];
  const [nm, note] = nameParts(L(Lt.name));
  return h("div", { class: "lcard", html: `<div class="g">${Lt.ar}</div><dl>
    <dt>${esc(T("name"))}</dt><dd>${esc(nm)}${note ? `<small class="note">${esc(note)}</small>` : ""}</dd>
    <dt>${esc(T("sound"))}</dt><dd><span class="snd">${esc(L(Lt.sound))}</span></dd>
    <dt>${esc(T("mk"))}</dt><dd>${esc(L(mk.name))}</dd>
    <dt>${esc(T("sifat"))}</dt><dd style="font-weight:500">${Lt.sifat.map(s => esc(L(s))).join(", ")}</dd>
    <dt>${esc(T("joins"))}</dt><dd>${esc(Lt.joins ? T("joinsY") : T("joinsN"))}</dd></dl>` });
}
function wordsEl(items) {
  const g = h("div", { class: "words" });
  for (const w of items) {
    const b = h("button", { class: "word", type: "button", title: T("play"), html: `<span class="w">${w.w}</span><span class="t">${esc(L(w.tr))}</span>${w.m ? `<span class="m">${esc(L(w.m))}</span>` : ""}<span class="s">${w.loc.split(":").slice(0, 2).join(":")}</span>` });
    b.onclick = () => playURL(wordURL(w.loc), b);
    g.append(b);
  }
  return g;
}
function tableEl(b) {
  const cell = c => typeof c === "string" ? esc(c) : c.ar ? `<span class="ar">${esc(c.ar)}</span>` : md(c).replace(/^<p>|<\/p>$/g, "");
  return h("div", { class: "tbl", html: `<table><thead><tr>${b.head.map(x => `<th>${esc(L(x))}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${cell(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>` });
}
function checksEl(items, key) {
  const box = h("div", { class: "checks" }, h("h4", {}, T("check")));
  items.forEach((it, i) => {
    const k = "c" + key + "." + i;
    const cb = h("input", { type: "checkbox", id: k });
    cb.checked = !!S.ex[k];
    cb.onchange = () => { if (cb.checked) S.ex[k] = 1; else delete S.ex[k]; save(); };
    box.append(h("label", { for: k }, cb, h("span", {}, L(it))));
  });
  return box;
}
function legendEl(keys) {
  keys = keys || Object.keys(CORE.rules);
  return h("div", { class: "legend", html: keys.map(k => `<span><i style="background:${RC(k)}"></i>${esc(L(CORE.rules[k].name))}</span>`).join("") });
}
function ruleCards(keys) {
  const wrap = h("div", { class: "rules" });
  for (const k of keys || Object.keys(CORE.rules)) {
    const r = CORE.rules[k];
    const ex = CORE.quiz.filter(q => q.r === k).slice(0, 2);
    wrap.append(h("a", { class: "rcard", href: `#/ref/rule/${k}`, html: `<h4><i style="background:${RC(k)}"></i>${esc(L(r.name))}</h4><p>${esc(L(r.short))}</p>${ex.map(e => `<div class="ex-ar">${spansHTML(e.sp)}</div>`).join("")}<span class="more">${esc(S.lang === "ru" ? "Подробнее" : "Толығырақ")} →</span>` }));
  }
  return wrap;
}

/* ───── махрадж ───── */
// Анатомическая схема махраджей: срединный (сагиттальный) разрез головы, лицо слева.
// Зона губ, зубов и кончика языка показана во вставке с увеличением.
let MK_UID = 0;
function makhrajSVG(lang, hl) {
  hl = new Set(hl || []);
  const u = "mk" + (++MK_UID);
  const OX = 34, OY = 4;
  const ru = lang === "ru";
  const A = ru
    ? { nose: "носовая полость", conch: "носовые раковины", hard: "твёрдое нёбо", soft: "мягкое нёбо", uvula: "язычок", tongue: "язык",
        alv: "альвеолы", teeth: "резцы", lips: "губы", phar: "глотка", epi: "надгортанник", lar: "гортань", folds: "голосовые связки",
        trach: "трахея", eso: "пищевод", zoom: "увеличено" }
    : { nose: "мұрын қуысы", conch: "мұрын қалқандары", hard: "қатты таңдай", soft: "жұмсақ таңдай", uvula: "тілшік", tongue: "тіл",
        alv: "қызыл иек", teeth: "күрек тістер", lips: "ерін", phar: "жұтқыншақ", epi: "көмей қақпағы", lar: "көмей", folds: "дауыс желбезектері",
        trach: "кеңірдек", eso: "өңеш", zoom: "үлкейтілген" };

  // точки в координатах головы; z — показывать номер во вставке
  const P = {
    jawf: [214, 308], halq_far: [355, 440], halq_mid: [399, 386], halq_near: [401, 318],
    aqsa_lisan_q: [336, 291], aqsa_lisan_k: [294, 281], wasat: [250, 278], hafa: [205, 282], lam: [160, 288],
    ra: [118, 289], nun: [110, 292], nitaa: [101, 299], lith: [88, 318], shafa_b: [74, 318], shafa_f: [81, 326], safir: [98, 330],
    khayshum: [236, 222],
  };
  const ZOOM = new Set(["ra", "nun", "nitaa", "lith", "shafa_b", "shafa_f", "safir"]);
  const NUM = { jawf: 1, halq_far: 2, halq_mid: 3, halq_near: 4, aqsa_lisan_q: 5, aqsa_lisan_k: 6, wasat: 7, hafa: 8, lam: 9, nun: 10,
    ra: 11, nitaa: 12, safir: 13, lith: 14, shafa_f: 15, shafa_b: 16, khayshum: 17 };
  const any = hl.size > 0;
  const id = s => `${u}${s}`;

  const head = `
  <g id="${id("H")}">
    <path fill="url(#${id("skin")})" stroke="#cf9576" stroke-width="1.6" d="M262,10 C380,4 492,52 530,150 C552,206 548,262 522,304
      C500,336 488,366 486,410 L486,606 L300,606 C302,560 304,520 306,486 C300,462 292,450 280,442 C230,434 150,428 112,414
      C88,406 78,392 78,376 C78,364 84,356 86,350 C82,346 74,342 72,336 C68,328 70,322 76,318 C70,314 66,306 70,298
      C74,290 82,282 86,278 C72,276 50,270 40,258 C34,250 38,240 50,228 C66,212 82,186 92,160 C98,140 100,118 104,98
      C116,52 170,16 262,10 Z"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${428 + i * 2}" y="${238 + i * 62}" width="48" height="52" rx="10" fill="url(#${id("spine")})" stroke="#cdb994" stroke-width="1.2"/>`).join("")}
    <path fill="url(#${id("cav")})" d="M62,262 C70,236 92,200 120,180 C160,156 240,148 320,164 C360,172 390,190 404,214 C412,230 414,250 414,272
      L414,500 L386,503 L382,606 L330,606 L328,524 L342,500 L342,458 C350,452 360,450 366,448 C368,430 370,412 372,398
      C360,406 334,412 300,414 C240,416 168,404 130,382 C112,370 102,352 98,336 L90,330 L84,324 L90,312
      C84,300 80,290 86,278 C78,272 68,268 62,262 Z"/>
    <g fill="#b04f5c" opacity=".85">
      <path d="M150,190 C200,176 280,176 330,190 C318,200 284,206 236,206 C196,206 166,200 150,190 Z"/>
      <path d="M128,222 C190,208 290,208 344,220 C330,232 290,238 236,238 C184,238 148,232 128,222 Z"/>
      <path d="M110,252 C180,240 290,240 352,252 C336,262 290,266 236,266 C178,266 136,262 110,252 Z"/></g>
    <path fill="url(#${id("tooth")})" stroke="#c4b899" stroke-width="1.1" d="M97,293 C95,301 92,310 89,319 L94,320 C99,312 104,304 107,296 C109,287 110,278 108,270 C103,273 99,282 97,293 Z"/>
    <path fill="url(#${id("tooth")})" stroke="#c4b899" stroke-width="1.1" d="M91,322 L96,321 C98,328 100,334 101,341 C103,350 103,360 101,368 C98,360 96,350 94,342 C92,336 91,329 91,322 Z"/>
    <path fill="url(#${id("bone")})" stroke="#c8b38c" stroke-width="1.3" d="M86,276 C96,272 112,270 130,268 L322,264 L326,276
      C300,274 262,272 226,272 C190,272 158,276 136,282 C126,286 118,290 112,294 L105,298 L99,292 C96,286 91,280 86,276 Z"/>
    <path fill="#e59aa0" d="M100,300 C106,292 116,286 130,284 C136,286 138,290 132,294 C124,298 114,300 106,304 Z"/>
    <path fill="url(#${id("soft")})" stroke="#a24f5a" stroke-width="1" d="M322,264 C350,262 372,276 382,296 C388,308 388,322 384,332
      C380,338 375,336 375,328 C374,314 366,300 352,292 C342,286 332,282 324,278 Z"/>
    <path fill="url(#${id("flesh")})" d="M108,368 C130,396 180,414 240,420 C280,423 310,422 330,420 L338,434 C300,440 230,438 176,430 C136,422 108,404 98,382 Z"/>
    <path fill="url(#${id("bone")})" stroke="#c8b38c" stroke-width="1.3" d="M95,342 C91,358 90,378 96,396 C102,410 118,414 132,408 C126,386 118,362 108,340 Z"/>
    <path fill="url(#${id("tongue")})" stroke="#a5444f" stroke-width="1.4" d="M101,327 C104,312 116,302 136,296 C170,288 220,286 262,288
      C300,290 330,298 350,314 C366,328 372,350 372,372 C372,386 369,398 364,406 C350,414 336,418 322,418
      C270,420 200,414 150,398 C126,388 112,372 106,358 C103,348 101,338 101,327 Z"/>
    <path d="M150,300 C200,292 270,292 330,304" fill="none" stroke="#f7c4c7" stroke-width="2" opacity=".6"/>
    <path d="M200,402 C220,370 250,330 290,300 M160,388 C180,360 210,326 250,296 M240,410 C255,380 285,340 330,308" fill="none" stroke="#c2606b" stroke-width="1" opacity=".35"/>
    <ellipse cx="330" cy="424" rx="12" ry="6" fill="url(#${id("bone")})" stroke="#c8b38c" stroke-width="1.2"/>
    <path fill="#eaa8ad" stroke="#b25c66" stroke-width="1" d="M366,446 C368,426 372,404 382,384 C387,384 387,394 384,408 C380,424 376,438 372,450 Z"/>
    <path fill="url(#${id("bone")})" stroke="#c8b38c" stroke-width="1.2" d="M316,430 C330,428 340,440 342,458 L342,500 C336,506 322,508 314,504 C310,480 310,452 316,430 Z"/>
    <path fill="#c46a75" stroke="#a24f5a" stroke-width=".8" d="M342,452 L380,458 L380,462 L342,463 Z"/>
    <path fill="url(#${id("bone")})" stroke="#c8b38c" stroke-width="1" d="M330,504 C350,502 372,500 386,498 L388,518 C366,520 346,522 330,522 Z"/>
    <g stroke="#ead7bd" stroke-width="4">${[0, 1, 2, 3, 4].map(i => `<line x1="334" y1="${536 + i * 15}" x2="380" y2="${534 + i * 15}"/>`).join("")}</g>
    <path fill="#9c4d58" d="M386,503 L414,500 L416,606 L384,606 Z"/>
    <path fill="#fbf7ee" stroke="#cfc3a4" stroke-width="1" opacity=".8" d="M190,272 C194,266 214,266 218,272 L220,282 C212,287 196,287 190,282 Z"/>
    <path fill="url(#${id("lip")})" stroke="#a24e55" stroke-width="1" d="M86,278 C76,286 68,298 70,306 C71,313 74,317 78,318 L90,318 C92,306 92,292 90,282 Z"/>
    <path fill="url(#${id("lip")})" stroke="#a24e55" stroke-width="1" d="M78,320 C70,322 66,330 70,338 C74,346 86,348 94,340 C98,334 98,328 96,322 Z"/>
  </g>`;

  const defs = `<defs>
    <linearGradient id="${id("skin")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7d7bf"/><stop offset=".55" stop-color="#eebf9f"/><stop offset="1" stop-color="#dfa686"/></linearGradient>
    <linearGradient id="${id("flesh")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5ab92"/><stop offset="1" stop-color="#d8987e"/></linearGradient>
    <linearGradient id="${id("cav")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a2a35"/><stop offset="1" stop-color="#4f1820"/></linearGradient>
    <radialGradient id="${id("tongue")}" cx=".42" cy=".22" r=".85"><stop offset="0" stop-color="#f3a3a8"/><stop offset=".5" stop-color="#dd7680"/><stop offset="1" stop-color="#b9505c"/></radialGradient>
    <linearGradient id="${id("bone")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcf6ea"/><stop offset="1" stop-color="#e6d6b6"/></linearGradient>
    <linearGradient id="${id("soft")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3949b"/><stop offset="1" stop-color="#c0606c"/></linearGradient>
    <linearGradient id="${id("tooth")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7dfca"/></linearGradient>
    <linearGradient id="${id("lip")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8787a"/><stop offset="1" stop-color="#bb5a60"/></linearGradient>
    <radialGradient id="${id("spine")}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fbf3e2"/><stop offset="1" stop-color="#e2d0ad"/></radialGradient>
    <clipPath id="${id("clip")}"><rect x="12" y="430" width="196" height="186" rx="16"/></clipPath>
  </defs>`;

  const ann = [];
  const T = (x, y) => [x + OX, y + OY];
  const note = (pt, x2, y2, s) => { const [x1, y1] = T(...pt); ann.push(`<path d="M${x1},${y1} L${x2 - 4},${y2 - 4}" class="mk-lead"/><text x="${x2}" y="${y2}" class="mk-a">${s}</text>`); };
  const inside = (x, y, s) => { const [a, b] = T(x, y); ann.push(`<text x="${a}" y="${b}" text-anchor="middle" class="mk-in">${s}</text>`); };
  inside(236, 178, A.nose); inside(236, 350, A.tongue);
  note([300, 198], 566, 70, A.conch); note([250, 270], 566, 100, A.hard); note([356, 282], 566, 130, A.soft);
  note([382, 330], 566, 160, A.uvula); note([414, 352], 566, 352, A.phar); note([381, 404], 566, 404, A.epi);
  note([376, 461], 566, 456, A.folds); note([316, 480], 566, 492, A.lar); note([360, 572], 566, 548, A.trach); note([400, 590], 566, 590, A.eso);

  // вставка: область губ и зубов, масштаб S
  const RX = 62, RY = 270, RW = 74, RH = 72, S = 2.5, IX = 16, IY = 436;
  const inset = (x, y) => [IX + (x - RX) * S, IY + (y - RY) * S];
  const [bx, by] = T(RX, RY);
  let pts = "";
  const circle = (x, y, n, r, k) => {
    const on = hl.has(k), cls = "mk-pt" + (on ? " on" : "") + (any && !on ? " dim" : "");
    return `<g class="${cls}"><circle cx="${x}" cy="${y}" r="${r}" class="mk-c"/><text x="${x}" y="${y + r * 0.36}" text-anchor="middle" class="mk-n" style="font-size:${r * 1.1}px">${n}</text></g>`;
  };
  for (const [k, p] of Object.entries(P)) {
    const [x, y] = T(...p);
    if (ZOOM.has(k)) {
      const on = hl.has(k);
      pts += `<circle cx="${x}" cy="${y}" r="${on ? 3.2 : 2.2}" class="mk-mini${on ? " on" : ""}"/>`;
      const [ix, iy] = inset(...p);
      pts += circle(ix, iy, NUM[k], 10, k);
    } else pts += circle(x, y, NUM[k], 10.5, k);
  }
  const insetEl = `<g class="mk-inset">
    <rect x="${bx}" y="${by}" width="${RW}" height="${RH}" rx="6" class="mk-zoomrect"/>
    <path d="M${bx + 10},${by + RH} L${IX + 60},${IY - 6}" class="mk-lead"/>
    <g clip-path="url(#${id("clip")})"><rect x="12" y="430" width="196" height="186" fill="#f3d2bb"/>
      <use href="#${id("H")}" transform="translate(${IX + OX * 0 - RX * S},${IY - RY * S}) scale(${S})"/></g>
    <rect x="12" y="430" width="196" height="186" rx="16" class="mk-zoomframe"/>
    <text x="22" y="608" class="mk-z">${A.zoom} ×${S}</text>
    ${[[78, 300, A.lips], [104, 284, A.teeth], [124, 300, A.alv]].map(([x, y, s]) => { const [a, b] = inset(x, y); return ""; }).join("")}
  </g>`;
  // подписи внутри вставки
  const il = [[A.lips, 22, 452], [A.teeth, 118, 452], [A.alv, 140, 520]];
  const insetLabels = il.map(([s, x, y]) => `<text x="${x}" y="${y}" class="mk-z">${s}</text>`).join("");

  return `<svg viewBox="0 0 708 624" role="img" class="mk-svg">${defs}<g transform="translate(${OX},${OY})">${head}</g>${insetEl}${insetLabels}<g>${ann.join("")}</g>${pts}</svg>`;
}
const MK_ORDER = ["jawf", "halq_far", "halq_mid", "halq_near", "aqsa_lisan_q", "aqsa_lisan_k", "wasat", "hafa", "lam", "nun", "ra", "nitaa", "safir", "lith", "shafa_f", "shafa_b", "khayshum"];
const MK_LETTERS = { jawf: "ا و ي", halq_far: "ء ه", halq_mid: "ع ح", halq_near: "غ خ", aqsa_lisan_q: "ق", aqsa_lisan_k: "ك", wasat: "ج ش ي",
  hafa: "ض", lam: "ل", nun: "ن", ra: "ر", nitaa: "ط د ت", safir: "ص س ز", lith: "ظ ذ ث", shafa_f: "ف", shafa_b: "ب م و", khayshum: "ن م" };
function makhrajEl(keys = []) {
  const hl = new Set(keys);
  const leg = MK_ORDER.map((k, i) => `<div class="${hl.has(k) ? "on" : ""}"><i>${i + 1}</i><span>${esc(L(CORE.makhraj[k].name))}</span><span class="ar">${MK_LETTERS[k]}</span></div>`);
  const show = keys.length ? leg.filter((_, i) => hl.has(MK_ORDER[i])) : leg;
  const el = h("div", { class: "mk", html: makhrajSVG(S.lang, keys) + `<div class="mk-leg">${show.join("")}</div>` });
  $("svg", el).setAttribute("aria-label", T("makhraj"));
  const zb = h("button", { class: "mk-zoom", type: "button", html: icon("search") + esc(S.lang === "ru" ? "Увеличить схему" : "Сызбаны үлкейту") });
  const openZoom = () => {
    const bg = h("div", { class: "mk-full", role: "dialog", "aria-modal": "true", "aria-label": T("makhraj") });
    const close = h("button", { class: "iconbtn mk-x", title: T("cancel"), html: icon("close") });
    const sc = h("div", { class: "mk-scroll", html: makhrajSVG(S.lang, keys) });
    const done = () => { bg.remove(); document.removeEventListener("keydown", esc_); zb.focus(); };
    const esc_ = e => { if (e.key === "Escape") done(); };
    close.onclick = done; document.addEventListener("keydown", esc_);
    bg.append(close, sc, h("p", { class: "mk-hint" }, S.lang === "ru" ? "Двигайте схему пальцем, приближайте двумя пальцами" : "Сызбаны саусақпен жылжытыңыз, екі саусақпен жақындатыңыз"));
    document.body.append(bg); close.focus();
    sc.scrollLeft = 0;
  };
  zb.onclick = openZoom;
  $("svg", el).addEventListener("click", openZoom);
  el.prepend(zb);
  if (keys.length === 1) el.append(h("p", { class: "muted small", style: "margin-top:6px;text-align:center" }, L(CORE.makhraj[keys[0]].desc)));
  return el;
}

/* ───── письмо пальцем ───── */
function traceEl(ch, key, ctx) {
  const wrap = h("div", { class: "trace" });
  const cv = h("canvas", { width: 840, height: 600, "aria-label": T("traceHint") });
  const fb = h("p", { class: "fb", style: "text-align:center" }, T("traceHint"));
  const g = cv.getContext("2d");
  let guide = null;
  const drawGuide = () => {
    g.clearRect(0, 0, cv.width, cv.height);
    g.save(); g.font = `300px "Iqra Quran", "Amiri Quran", serif`; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.direction = "rtl";
    g.fillStyle = isDark() ? "rgba(230,236,239,.22)" : "rgba(20,32,27,.16)";
    const m = g.measureText(ch); const asc = m.actualBoundingBoxAscent || 150, desc = m.actualBoundingBoxDescent || 40;
    g.fillText(ch, cv.width / 2, cv.height / 2 + (asc - desc) / 2); g.restore();
    const img = g.getImageData(0, 0, cv.width, cv.height).data;
    guide = []; for (let y = 0; y < cv.height; y += 6) for (let x = 0; x < cv.width; x += 6) if (img[(y * cv.width + x) * 4 + 3] > 20) guide.push([x, y]);
  };
  const ready = document.fonts && document.fonts.load ? document.fonts.load('300px "Iqra Quran"', ch) : Promise.resolve();
  ready.then(drawGuide, drawGuide);
  let down = false, last = null;
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
  cv.addEventListener("pointerdown", e => { down = true; last = pos(e); cv.setPointerCapture(e.pointerId); e.preventDefault(); });
  cv.addEventListener("pointermove", e => { if (!down) return; const p = pos(e); g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--primary"); g.lineWidth = 26; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(...last); g.lineTo(...p); g.stroke(); last = p; });
  const up = () => { down = false; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  const checkBtn = h("button", { class: "btn" }, T("checkTrace"));
  checkBtn.onclick = () => {
    if (!guide || !guide.length) return;
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    const pr = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    let hit = 0;
    for (const [x, y] of guide) { const i = (y * cv.width + x) * 4; if (d[i + 3] > 200) hit++; }
    const cov = hit / guide.length;
    if (cov > 0.55) { fb.className = "fb ok"; fb.textContent = T("traceGood"); ctx && ctx.onSolve && ctx.onSolve("t" + key, checkBtn, 3); }
    else { fb.className = "fb bad"; fb.textContent = T("traceMore") + ` (${Math.round(cov * 100)}%)`; }
  };
  wrap.append(cv, h("div", { class: "row" }, h("button", { class: "btn ghost", onclick: () => { drawGuide(); fb.className = "fb"; fb.textContent = T("traceHint"); } }, T("clear")), checkBtn), fb);
  return wrap;
}

/* ───── упражнения ───── */
let exCounter = 0;
function exEl(b, key, ctx, opts = {}) {
  const el = h("div", { class: "ex" });
  const head = h("div", { class: "q" });
  if (!opts.noTag) head.append(h("span", { class: "tag" }, ++exCounter));
  head.append(mdEl(b.q));
  el.append(head);
  const fb = h("div", { class: "fb" });
  const done = (xp = 5) => { el.classList.add("solved"); if (ctx && ctx.onSolve) ctx.onSolve("e" + key, el, xp); if (opts.onDone) opts.onDone(true); };
  const fail = () => { if (opts.onDone) opts.onDone(false); };
  if (b.kind === "mcq") {
    if (b.prompt) el.append(h("div", { class: "prompt" }, b.prompt));
    const box = h("div", { class: "opts" });
    let tries = 0, over = false;
    b.options.forEach((o, i) => {
      const btn = h("button", { class: "opt" + (o.ar ? " ar-o" : ""), type: "button" });
      if (o.ar) btn.textContent = o.ar; else btn.innerHTML = md(o.t).replace(/^<p>|<\/p>$/g, "");
      btn.onclick = () => {
        if (over) return;
        if (i === b.answer) {
          over = true; btn.classList.add("right"); fb.className = "fb ok"; fb.innerHTML = esc(T("right")) + (b.explain ? " " + md(b.explain).replace(/<\/?p>/g, "") : "");
          done(tries ? 2 : 5);
        } else {
          tries++; btn.classList.add("wrong"); fb.className = "fb bad"; fb.textContent = T("wrongTry");
          if (opts.single) { over = true; box.children[b.answer].classList.add("right"); if (b.explain) fb.innerHTML += " " + md(b.explain).replace(/<\/?p>/g, ""); fail(); }
        }
      };
      box.append(btn);
    });
    el.append(box, fb);
  } else if (b.kind === "tap") {
    const tg = b.targets || [b.target];
    const need = b.grid.filter(x => tg.includes(x)).length;
    let got = 0;
    const g = h("div", { class: "tapgrid", style: `grid-template-columns:repeat(${Math.min(b.cols || 8, 8)},1fr)` });
    const cnt = h("div", { class: "counter" }, `${T("found")}: 0 / ${need}`);
    b.grid.forEach(x => {
      const bt = h("button", { type: "button" }, x);
      bt.onclick = () => {
        if (bt.classList.contains("hit")) return;
        if (tg.includes(x)) { bt.classList.add("hit"); got++; cnt.textContent = `${T("found")}: ${got} / ${need}`; if (got === need) { fb.className = "fb ok"; fb.textContent = T("allFound"); done(); } }
        else { bt.classList.add("miss"); setTimeout(() => bt.classList.remove("miss"), 500); }
      };
      g.append(bt);
    });
    el.append(g, cnt, fb);
  } else if (b.kind === "sort") {
    const items = shuffle(b.items);
    let i = 0, errors = 0;
    const cur = h("div", { class: "cur" });
    const cats = h("div", { class: "cats" });
    const doneRow = h("div", { class: "done" });
    const show = () => { cur.textContent = i < items.length ? items[i].ar : ""; };
    b.cats.forEach((c, ci) => {
      const bt = h("button", { class: "opt", type: "button" }, L(c));
      bt.onclick = () => {
        if (i >= items.length) return;
        if (items[i].cat === ci) {
          doneRow.append(h("span", { title: L(c) }, items[i].ar)); i++; fb.className = "fb"; fb.textContent = "";
          show();
          if (i >= items.length) { fb.className = "fb ok"; fb.textContent = T("right"); cats.hidden = true; done(errors ? 3 : 5); }
        } else { errors++; bt.classList.add("wrong"); setTimeout(() => bt.classList.remove("wrong"), 400); fb.className = "fb bad"; fb.textContent = T("wrongTry"); if (opts.single) { i++; show(); if (i >= items.length) { cats.hidden = true; fail(); } } }
      };
      cats.append(bt);
    });
    show();
    el.append(h("div", { class: "sortq" }, cur, cats, doneRow), fb);
  } else if (b.kind === "order") {
    const box = h("div", { class: "ordr" });
    const slots = h("div", { class: "slots" });
    const pieces = h("div", { class: "pieces" });
    let built = [];
    if (b.tr || b.loc) {
      const r = h("div", { class: "row", style: "justify-content:center;margin-top:10px" });
      if (b.tr) r.append(h("span", { class: "pill primary" }, L(b.tr)));
      if (b.loc) { const pb = h("button", { class: "iconbtn", html: icon("sound"), title: T("play") }); pb.onclick = () => playURL(wordURL(b.loc), pb); r.append(pb); }
      box.append(r);
    }
    const order = shuffle(b.pieces.map((p, i) => [p, i]));
    const btns = [];
    const reset = () => { built = []; slots.textContent = ""; btns.forEach(x => x.disabled = false); };
    order.forEach(([p, i]) => {
      const bt = h("button", { type: "button" }, p);
      bt.onclick = () => {
        bt.disabled = true; built.push(i); slots.append(h("span", {}, p));
        if (built.length === b.pieces.length) {
          const ok = built.every((v, k) => b.pieces[v] === b.pieces[k]);
          if (ok) { slots.textContent = b.answer; fb.className = "fb ok"; fb.textContent = T("right"); pieces.hidden = true; done(); }
          else { fb.className = "fb bad"; fb.textContent = T("wrongTry"); setTimeout(reset, 700); if (opts.single) fail(); }
        }
      };
      btns.push(bt); pieces.append(bt);
    });
    box.append(slots, pieces, h("div", { class: "row", style: "justify-content:center;margin-top:8px" }, h("button", { class: "btn ghost", style: "min-height:38px", onclick: reset }, T("reset"))));
    el.append(h("p", { class: "muted small", style: "margin-top:6px" }, T("orderHint")), box, fb);
  }
  return el;
}

/* ───── контрольная ───── */
function testEl(b, key, ctx) {
  const box = h("div", { class: "test" });
  const best = S.tests[key];
  const intro = () => {
    box.innerHTML = "";
    box.append(h("h3", {}, T("testTitle")), h("p", { class: "muted", style: "margin:6px 0 14px" }, `${b.items.length} ${S.lang === "ru" ? "заданий" : "тапсырма"}${best != null ? ` · ${T("best")}: ${S.tests[key]}%` : ""}`),
      h("button", { class: "btn", onclick: run }, T("testStart")));
  };
  const run = () => {
    let i = 0, score = 0;
    const step = () => {
      box.innerHTML = "";
      if (i >= b.items.length) {
        const pct = Math.round(score / b.items.length * 100);
        const pass = pct >= b.pass;
        S.tests[key] = Math.max(S.tests[key] || 0, pct); save();
        if (pass && ctx) ctx.onSolve("test" + key, box, 30);
        checkBadges();
        box.append(h("div", { class: "result" }, h("div", { class: "big", style: `color:${pass ? "var(--ok)" : "var(--bad)"}` }, pct + "%"),
          h("p", {}, pass ? T("testPass") : T("testFail")), h("button", { class: "btn ghost", onclick: run }, T("again"))));
        return;
      }
      box.append(h("div", { class: "tprog" }, h("span", {}, `${T("question")} ${i + 1} / ${b.items.length}`), h("span", { class: "num" }, `${score} ✓`)),
        h("div", { class: "bar" }, h("i", { style: `width:${i / b.items.length * 100}%` })));
      const it = b.items[i];
      box.append(exEl(it, key + "q" + i, null, { noTag: true, single: true, onDone: ok => { if (ok) score++; i++; setTimeout(step, ok ? 500 : 1300); } }));
    };
    step();
  };
  intro();
  return box;
}

/* ═════════════ аяты ═════════════ */
const spansHTML = sp => sp.map(([t, r]) => r ? `<span class="tj" style="color:${RC(r)}">${esc(t)}</span>` : esc(t)).join("");
const spansTarget = sp => sp.map(([t, r]) => r ? `<span class="tgt">${esc(t)}</span>` : esc(t)).join("");
function ayahWordsHTML(sp) {
  // разбить спаны на слова, сохраняя раскраску
  const words = [[]];
  for (const [t, r] of sp) {
    const parts = t.split(" ");
    parts.forEach((p, k) => { if (k > 0) words.push([]); if (p) words[words.length - 1].push([p, r]); });
  }
  return words.filter(w => w.length);
}
function ayahLine(sura, ay, mode = 0, peek) {
  const at = h("div", { class: "at", lang: "ar" });
  const ws = ayahWordsHTML(ay.sp);
  ws.forEach((w, i) => {
    const html = w.map(([t, r]) => r ? `<span class="tj" style="color:${RC(r)}">${esc(t)}</span>` : esc(t)).join("");
    const sp = h("span", { class: "wd", html });
    const hide = mode === 3 || (mode === 1 && i % 2 === 1);
    if (hide) sp.classList.add("hidew");
    if (mode === 2) { const plain = w.map(x => x[0]).join(""); const first = plain.match(/^[\u0621-\u064A\u0671][\u064B-\u0670\u06D6-\u06ED\u08F0-\u08F2]*/u); sp.innerHTML = `<span>${esc(first ? first[0] : plain[0])}</span><span class="rest">${esc(plain.slice(first ? first[0].length : 1))}</span>`; sp.classList.add("firstl"); }
    sp.onclick = () => {
      if (sp.classList.contains("hidew")) { sp.classList.add("peek"); }
      if (sp.classList.contains("firstl")) { sp.classList.remove("firstl"); sp.innerHTML = html; }
      playURL(wordURL(`${sura.n}:${ay.n}:${i + 1}`), sp);
    };
    at.append(sp, " ");
  });
  at.insertAdjacentHTML("beforeend", ayahMark(ay.n));
  return at;
}

/* ═════════════ суры ═════════════ */
function suraItem(s, href) {
  const st = S.hifz[s.n] || {}; const m = Object.keys(st).length;
  return h("a", { class: "sitem", href: href || `#/sura/${s.n}`, html: `${rosette(s.n, suraMemorized(s.n) ? "done" : "")}<div class="si-t"><b>${esc(L(s.name))}</b><small>${esc(ayatN(s.c))} · ${esc(T(s.p === "m" ? "mecca" : "medina"))}${m ? ` · ${m} ✓` : ""}</small></div><span class="ar" lang="ar">${s.ar}</span>` });
}
const norm = x => String(x).toLowerCase().replace(/ё/g, "е").replace(/[әғқңөұүһі]/g, c => ({ ә: "а", ғ: "г", қ: "к", ң: "н", ө: "о", ұ: "у", ү: "у", һ: "х", і: "и" }[c])).replace(/^(аль|ал|ан|ар|ас|аш|ат|ад|аз|әл)[-\s]/, "").replace(/[^a-zа-я0-9ء-ي]/g, "");
function suraFilter(listEl, q, mode, hrefOf) {
  const nq = norm(q);
  const items = CORE.suras.filter(s => {
    if (mode === "j30" && !(s.n === 1 || s.n >= 78)) return false;
    if (mode === "st" && !(S.hifz[s.n] && Object.keys(S.hifz[s.n]).length) && !(S.last && S.last.s === s.n)) return false;
    if (!nq) return true;
    return String(s.n) === q.trim() || norm(s.name.kk).includes(nq) || norm(s.name.ru).includes(nq) || s.ar.includes(q.trim());
  });
  listEl.innerHTML = "";
  if (!items.length) listEl.append(h("p", { class: "muted" }, T("nothing")));
  items.forEach(s => listEl.append(suraItem(s, hrefOf ? hrefOf(s) : null)));
}
function suraSearch(onChange) {
  let mode = "all";
  const inp = h("input", { type: "search", class: "search", placeholder: T("search"), "aria-label": T("search"), enterkeyhint: "search" });
  const seg = h("div", { class: "seg" }, [["all", "all"], ["j30", "juz30"], ["st", "started"]].map(([k, t]) => {
    const b = h("button", { "aria-pressed": String(k === mode) }, T(t));
    b.onclick = () => { mode = k; $$("button", seg).forEach(x => x.setAttribute("aria-pressed", String(x === b))); onChange(inp.value, mode); };
    return b;
  }));
  inp.oninput = () => onChange(inp.value, mode);
  return h("div", { class: "sfind" }, h("label", { class: "sbox", html: icon("search") }, inp), seg);
}
function pageSuras(v) {
  v.append(pageHead(T("suras"), T("quranLead"), quranTabs("suras")));
  const ls = S.last && suraBy(S.last.s);
  if (ls) v.append(h("a", { class: "next", style: "margin-bottom:16px", href: `#/sura/${ls.n}/${S.last.a}`, html: `${rosette(ls.n)}<div><small>${esc(T("contRead"))}</small><b>${esc(L(ls.name))} · ${S.last.a} ${esc(T("ayahN"))}</b></div><span class="go">${icon("arrow")}</span>` }));
  const g = h("div", { class: "slist" });
  v.append(suraSearch((q, m) => suraFilter(g, q, m)), g);
  suraFilter(g, "", "all");
}
function ayahBlock(s, a, color = true) {
  const sura = suraBy(s), ay = SURA_D[s].ayat[a - 1];
  const el = h("div", { class: "ay" + (color ? "" : " nocolor") });
  el.append(ayahLine(sura, ay));
  const pb = h("button", { class: "pa", html: icon("play"), title: T("play") });
  pb.onclick = () => playURL(ayahURL(s, a), el);
  el.append(h("div", { class: "meta" }, h("span", { class: "tr" }, L(ay.tr)), h("span", { class: "row" }, h("span", { class: "pill" }, `${L(sura.name)} ${s}:${a}`), pb)));
  return el;
}
function suraEmbed(n) {
  const s = suraBy(n), d = SURA_D[n];
  const wrap = h("div", { class: "stack" });
  wrap.append(h("div", { class: "row" }, h("a", { class: "btn", href: `#/sura/${n}`, html: icon("play") + esc(T("playAll")) }), h("a", { class: "btn ghost", href: `#/sura/${n}/hifz` }, T("hifz"))));
  const list = h("div", { class: "ayahs" });
  d.ayat.forEach(a => list.append(ayahBlock(n, a.n)));
  wrap.append(legendEl([...new Set(d.ayat.flatMap(a => a.r))]), list);
  return wrap;
}
async function pageSura(v, n, hifz, goto) {
  const s = suraBy(n);
  if (!s) return notFound(v);
  const loading = h("div", { class: "loading" }, "…"); v.append(loading);
  let d;
  try { d = await loadSura(n); } catch (e) { loading.textContent = T("audioErr"); return; }
  loading.remove();
  const wrap = h("div", { class: "read" });
  wrap.append(h("div", { class: "crumbs", html: `<a href="#/suras">${esc(T("suras"))}</a><span>·</span><span>${s.n}</span>` }),
    h("div", { class: "shead" },
      h("div", {}, h("h1", {}, L(s.name)), h("p", { class: "muted" }, `${ayatN(s.c)} · ${T(s.p === "m" ? "mecca" : "medina")}`)),
      h("div", { class: "ar sname", lang: "ar" }, s.ar)));
  const modeTabs = h("div", { class: "seg", style: "margin-bottom:12px" },
    h("button", { "aria-pressed": String(!hifz), onclick: () => location.hash = `#/sura/${n}` }, T("read")),
    h("button", { "aria-pressed": String(!!hifz), onclick: () => location.hash = `#/sura/${n}/hifz` }, T("hifz")));
  wrap.append(modeTabs);

  // плеер по аятам
  let playing = false, idx = 0, rep = 1, rate = 1, hzLevel = 0;
  const playBtn = h("button", { class: "play", html: icon("play"), title: T("playAll") });
  const recSel = h("select", { "aria-label": T("reciter") }, RECITERS.map(([id, nm]) => h("option", { value: id, selected: id === S.reciter ? "" : null }, L({ kk: nm[0], ru: nm[1] }))));
  recSel.onchange = () => { S.reciter = recSel.value; save(); };
  const repSel = h("select", { "aria-label": T("repeat") }, [1, 3, 5, 10].map(k => h("option", { value: k }, `${T("repeat")} ×${k}`)));
  repSel.onchange = () => rep = +repSel.value;
  if (hifz) { rep = 3; repSel.value = "3"; }
  const rateSel = h("select", { "aria-label": T("speed") }, [[0.75, "0.75×"], [1, "1×"], [1.25, "1.25×"]].map(([k, t]) => h("option", { value: k, selected: k === 1 ? "" : null }, t)));
  rateSel.onchange = () => rate = +rateSel.value;
  const colorT = h("button", { class: "tog", "aria-pressed": String(S.view.color) }, T("colors"));
  const trT = h("button", { class: "tog", "aria-pressed": String(S.view.tr) }, T("translit"));
  const tlT = h("button", { class: "tog", "aria-pressed": String(S.view.tl) }, T("tl"));
  recSel.classList.add("rec");
  const moreBtn = h("button", { class: "iconbtn more", title: T("settings"), "aria-expanded": "false", html: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>' });
  const player = h("div", { class: "player" }, playBtn, recSel, moreBtn, h("div", { class: "xtra" }, repSel, rateSel, hifz ? null : colorT, hifz ? null : trT, hifz ? null : tlT));
  moreBtn.onclick = () => { player.classList.toggle("open"); moreBtn.setAttribute("aria-expanded", String(player.classList.contains("open"))); };
  wrap.append(player);

  if (hifz) {
    const lv = h("div", { class: "hz-levels", style: "margin-top:12px" });
    ["hz0", "hz1", "hz2", "hz3"].forEach((k, i) => { const b = h("button", { class: "tog", "aria-pressed": String(i === 0) }, T(k)); b.onclick = () => { hzLevel = i; $$("button", lv).forEach((x, j) => x.setAttribute("aria-pressed", String(j === i))); draw(); }; lv.append(b); });
    wrap.append(lv, h("p", { class: "muted small", style: "margin-top:8px" }, T("hzHint")));
  } else {
    wrap.append(h("p", { class: "muted small", style: "margin-top:10px" }, T("tapWord")));
  }
  if (n !== 1 && n !== 9) wrap.append(h("div", { class: "bism", lang: "ar" }, "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"));
  const list = h("div", { class: "ayahs" + (S.view.color || hifz ? "" : " nocolor") + (S.view.tr && !hifz ? "" : " notr") + (S.view.tl && !hifz ? "" : " notl") });
  const cards = [];
  let tlData = null;
  const fillTl = () => { if (!tlData) return; cards.forEach((c, i) => { const el = $(".tl", c); if (el) el.textContent = tlData[i] || ""; }); };
  const draw = () => {
    list.innerHTML = ""; cards.length = 0;
    d.ayat.forEach((a, i) => {
      const card = h("div", { class: "ay", id: "a" + a.n, "data-n": a.n });
      card.append(ayahLine(s, a, hifz ? hzLevel : 0));
      const pb = h("button", { class: "pa", html: icon("play"), title: T("play") });
      pb.onclick = () => { stopAll(); playOne(i, true); };
      const right = h("span", { class: "row" });
      if (hifz) {
        const st = S.hifz[n] || (S.hifz[n] = {});
        const mb = h("button", { class: "mem", "aria-pressed": String(!!st[a.n]), html: icon("check") + esc(T("memorized")) });
        mb.onclick = () => {
          const on = !st[a.n]; if (on) { st[a.n] = today(); addXP(10, mb); } else delete st[a.n];
          mb.setAttribute("aria-pressed", String(on)); save();
          if (on && suraMemorized(n)) { addXP(50, mb); toast((S.lang === "ru" ? "Сура выучена: " : "Сүре жатталды: ") + L(s.name), "✓"); }
          checkBadges();
        };
        right.append(mb);
      }
      right.append(pb);
      const meta = h("div", { class: "meta" }, h("span", { class: "tr" }, L(a.tr)), h("span", { class: "rl" }), right);
      $(".rl", meta).innerHTML = hifz ? "" : a.r.map(r => `<span style="color:${RC(r)}">${esc(L(CORE.rules[r].name))}</span>`).join("");
      card.append(meta);
      if (!hifz) card.append(h("p", { class: "tl" }, tlData ? tlData[i] || "" : ""));
      cards.push(card); list.append(card);
    });
  };
  draw();
  const tlNote = h("p", { class: "muted small tlby" }, T("tlBy"));
  const getTl = () => { if (hifz || tlData) return; loadTl(n).then(t => { tlData = t; fillTl(); }).catch(() => { tlNote.textContent = T("tlErr"); }); };
  if (S.view.tl) getTl();
  colorT.onclick = () => { S.view.color = !S.view.color; save(); colorT.setAttribute("aria-pressed", String(S.view.color)); list.classList.toggle("nocolor", !S.view.color); };
  trT.onclick = () => { S.view.tr = !S.view.tr; save(); trT.setAttribute("aria-pressed", String(S.view.tr)); list.classList.toggle("notr", !S.view.tr); };
  tlT.onclick = () => { S.view.tl = !S.view.tl; save(); tlT.setAttribute("aria-pressed", String(S.view.tl)); list.classList.toggle("notl", !S.view.tl); if (S.view.tl) getTl(); };

  // место чтения запоминается
  const mark = a => { if (hifz) return; if (!S.last || S.last.s !== n || S.last.a !== a) { S.last = { s: n, a }; save(); } };
  if ("IntersectionObserver" in window && !hifz) {
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) mark(+e.target.dataset.n); }, { rootMargin: "-45% 0px -50% 0px" });
    cards.forEach(c => io.observe(c));
  }

  let token = 0;
  const stopAll = () => { token++; playing = false; playBtn.innerHTML = icon("play"); cards.forEach(c => c.classList.remove("cur")); stopAudio(); };
  const playOne = async (i, single) => {
    const my = ++token; playing = true; playBtn.innerHTML = icon("pause");
    for (; i < d.ayat.length; i++) {
      idx = i; mark(i + 1);
      cards.forEach(c => c.classList.remove("cur")); cards[i].classList.add("cur");
      cards[i].scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      for (let r = 0; r < rep; r++) {
        const ok = await playURL(ayahURL(n, d.ayat[i].n), null, rate);
        if (my !== token || !ok) { if (my === token) stopAll(); return; }
      }
      if (single) break;
    }
    if (my === token) stopAll();
  };
  playBtn.onclick = () => { if (playing) stopAll(); else playOne(idx >= d.ayat.length - 1 ? 0 : idx, false); };
  wrap.append(list);
  if (!hifz) wrap.append(tlNote, h("div", { style: "margin-top:16px" }, legendEl([...new Set(d.ayat.flatMap(a => a.r))])));
  const pv = suraBy(n - 1), nx = suraBy(n + 1);
  wrap.append(h("div", { class: "lnav" },
    pv ? h("a", { class: "btn ghost", href: `#/sura/${pv.n}${hifz ? "/hifz" : ""}`, html: icon("back") + esc(L(pv.name)) }) : h("span"),
    nx ? h("a", { class: "btn ghost", href: `#/sura/${nx.n}${hifz ? "/hifz" : ""}`, html: esc(L(nx.name)) + icon("arrow") }) : h("span")));
  const sl = h("div", { class: "slist" });
  const sHref = hifz ? x => `#/sura/${x.n}/hifz` : null;
  const markCur = () => { const a = sl.querySelector(`a[href="#/sura/${n}${hifz ? "/hifz" : ""}"]`); if (a) a.classList.add("now"); };
  const side = h("aside", { class: "sura-side", "aria-label": T("surasT") }, suraSearch((q, m) => { suraFilter(sl, q, m, sHref); markCur(); }), sl);
  suraFilter(sl, "", "all", sHref); markCur();
  v.append(h("div", { class: "sura-layout" }, side, wrap));
  setTimeout(() => { const a = sl.querySelector(".now"); if (a && sl.offsetParent) sl.scrollTop = a.offsetTop - sl.offsetTop - 140; }, 40);
  if (goto && cards[goto - 1]) { idx = goto - 1; setTimeout(() => cards[goto - 1].scrollIntoView({ block: "center" }), 60); cards[goto - 1].classList.add("flash"); }
}

/* ═════════════ чтецы ═════════════ */
function pageReaders(v) {
  const ru = S.lang === "ru";
  v.append(pageHead(T("suras"), T("listenLead"), quranTabs("listen")));
  if (LP && LP.a.src) {
    const r = readerOf(S.listen.r), su = suraBy(S.listen.s);
    v.append(h("a", { class: "next", style: "margin-bottom:16px", href: `#/reader/${r.id}`, html: `${readerAva(r, "sm")}<div><small>${esc(ru ? "Сейчас звучит" : "Қазір ойнап тұр")}</small><b>${esc(L(su.name))} · ${esc(L({ kk: r.n[0], ru: r.n[1] }))}</b></div><span class="go">${icon("arrow")}</span>` }));
  }
  const g = h("div", { class: "readers" });
  READERS.forEach(r => {
    const cur = r.v.some(x => x[0] === S.listen.r);
    g.append(h("a", { class: "reader" + (cur ? " cur" : ""), href: `#/reader/${r.id}`, html:
      `${readerAva(r)}<div class="rd-t"><b>${esc(L({ kk: r.n[0], ru: r.n[1] }))}</b><small>${esc(L({ kk: r.c[0], ru: r.c[1] }))}</small>
       <span class="rd-st">${r.v.map(([, st]) => `<i>${esc(L({ kk: STYLE[st][0], ru: STYLE[st][1] }).split(" — ")[0])}</i>`).join("")}</span></div><span class="go">${icon("arrow")}</span>` }));
  });
  v.append(g);
  v.append(h("p", { class: "muted small", style: "margin-top:14px" }, ru ? "Аудио — mp3quran.net. Фото — Wikimedia Commons, под свободными лицензиями (авторы указаны на страницах чтецов)." : "Аудио — mp3quran.net. Суреттер — Wikimedia Commons, еркін лицензиямен (авторлары қари беттерінде көрсетілген)."));
}
function pageReader(v, id) {
  const r = READERS.find(x => x.id === id);
  if (!r) return notFound(v);
  const ru = S.lang === "ru";
  let rid = (r.v.find(x => x[0] === S.listen.r) || r.v[0])[0];
  const wrap = h("div", { class: "read" });
  wrap.append(h("div", { class: "crumbs", html: `<a href="#/listen">${esc(T("readers"))}</a><span>·</span><span>${esc(L({ kk: r.n[0], ru: r.n[1] }))}</span>` }),
    h("header", { class: "rd-head", html: `${readerAva(r, "lg")}<div><h1>${esc(L({ kk: r.n[0], ru: r.n[1] }))}</h1><p class="muted">${esc(L({ kk: r.c[0], ru: r.c[1] }))}</p></div>` }),
    h("p", { class: "rd-bio" }, L({ kk: r.b[0], ru: r.b[1] })));
  if (r.img) wrap.append(h("p", { class: "muted small rd-credit", html: `${esc(ru ? "Фото" : "Сурет")}: ${r.img[1] ? esc(r.img[1]) + ", " : ""}<a href="${r.img[3]}" target="_blank" rel="noopener">${esc(r.img[2])}, Wikimedia Commons</a>` }));
  if (r.v.length > 1) {
    const seg = h("div", { class: "seg rd-seg", role: "group", "aria-label": ru ? "Стиль чтения" : "Оқу мәнері" });
    r.v.forEach(([vid, st]) => {
      const b = h("button", { "aria-pressed": String(vid === rid) }, L({ kk: STYLE[st][0], ru: STYLE[st][1] }));
      b.onclick = () => { rid = vid; $$("button", seg).forEach(x => x.setAttribute("aria-pressed", String(x === b))); if (LP && LP.a.src && r.v.some(x => x[0] === S.listen.r)) listenPlay(S.listen.s, rid); fill(lastQ, lastM); };
      seg.append(b);
    });
    wrap.append(seg);
  } else wrap.append(h("p", { class: "pill primary", style: "margin-top:4px" }, L({ kk: STYLE[r.v[0][1]][0], ru: STYLE[r.v[0][1]][1] })));
  const g = h("div", { class: "slist" });
  const fill = (q, m) => {
    suraFilter(g, q, m, () => null);
    $$("a.sitem", g).forEach(a => {
      const n = +a.querySelector(".rn").textContent;
      a.removeAttribute("href"); a.setAttribute("role", "button"); a.tabIndex = 0;
      const mine = LP && LP.a.src && S.listen.s === n && S.listen.r === rid;
      a.classList.toggle("now", !!mine);
      a.insertAdjacentHTML("beforeend", `<span class="lplay">${icon(mine && !LP.a.paused ? "pause" : "play")}</span>`);
      a.onclick = () => { if (mine) { LP.a.paused ? LP.a.play() : LP.a.pause(); } else listenPlay(n, rid); };
      a.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); a.click(); } };
    });
  };
  let lastQ = "", lastM = "all";
  wrap.append(h("h2", { style: "margin:22px 0 10px" }, ru ? "Все 114 сур" : "114 сүренің бәрі"), suraSearch((q, m) => { lastQ = q; lastM = m; fill(q, m); }), g);
  fill("", "all");
  onListenChange = () => fill(lastQ, lastM);
  v.append(wrap);
}

/* ═════════════ намаз ═════════════ */
let NZ = null;
const loadNZ = () => NZ || (NZ = fetchJSON("data/namaz.json").catch(e => { NZ = null; throw e; }));
function duaCard(t, opts = {}) {
  const ru = S.lang === "ru";
  const card = h("div", { class: "dua" });
  const head = h("div", { class: "dua-h" }, h("b", {}, L(t.t)));
  if (t.x) head.append(h("span", { class: "pill gold" }, t.x));
  card.append(head);
  if (t.quran) {
    const su = suraBy(t.quran.s), ay = SURA_D[t.quran.s] && SURA_D[t.quran.s].ayat[t.quran.a - 1];
    if (ay) { const at = ayahLine(su, ay); at.classList.add("dua-ar"); card.append(at, h("p", { class: "dua-tr" }, L(ay.tr))); }
    const m = h("p", { class: "dua-m" }, "…"); card.append(m);
    loadTl(t.quran.s).then(a => { m.textContent = a[t.quran.a - 1]; }).catch(() => { m.textContent = T("tlErr"); });
  } else {
    card.append(h("p", { class: "dua-ar", lang: "ar" }, t.ar), h("p", { class: "dua-tr" }, L(t.tr)), h("p", { class: "dua-m" }, L(t.m)));
  }
  const pb = h("button", { class: "saybtn", type: "button", html: icon("sound") + `<span>${esc(t.au ? (ru ? "Слушать чтеца" : "Қаридан тыңдау") : (ru ? "Озвучить" : "Дыбыстау"))}</span>` });
  pb.onclick = () => t.au ? playURL(ayahURL(t.au.s, t.au.a), pb) : speakAr(t.ar, pb);
  card.append(h("div", { class: "dua-f" }, pb, t.au ? null : h("small", { class: "muted" }, ru ? "голос устройства" : "құрылғы дауысы")));
  return card;
}
// позы намаза (ханафитский мазхаб): m_ — мужчины, f_ — женщины; лица не рисуем
const POSES = {"m_qiyam": "<path d=\"M48 58 L48 90\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M54 58 L54 90\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M48 90 L42 91\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M54 90 L48 91\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M51 28 L51 56\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"15\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"51\" cy=\"15\" r=\"7.5\" fill=\"currentColor\"/><path d=\"M43.4 13.5a7.6 7.6 0 0 1 15.2 0z\" fill=\"#b88a4e\" transform=\"rotate(0 51 15)\"/><path d=\"M55 31 L55 44 L44 49\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "m_ruku": "<path d=\"M64 56 L64 90\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M64 90 L57 91\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M64 54 L34 54\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"15\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"24\" cy=\"54\" r=\"7.5\" fill=\"currentColor\"/><path d=\"M16.4 52.5a7.6 7.6 0 0 1 15.2 0z\" fill=\"#b88a4e\" transform=\"rotate(-90 24 54)\"/><path d=\"M38 58 L46 68 L60 70\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "m_sujud": "<path d=\"M68 58 L62 88\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M62 88 L80 86 L76 91\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M66 59 L34 78\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"23\" cy=\"83\" r=\"7.5\" fill=\"currentColor\"/><path d=\"M15.4 81.5a7.6 7.6 0 0 1 15.2 0z\" fill=\"#b88a4e\" transform=\"rotate(-125 23 83)\"/><path d=\"M36 80 L46 83 L30 91\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "m_julus": "<path d=\"M58 80 L34 86\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"11\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M34 89 L64 89\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M68 89 L70 79\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M58 40 L58 78\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"15\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"58\" cy=\"27\" r=\"7.5\" fill=\"currentColor\"/><path d=\"M50.4 25.5a7.6 7.6 0 0 1 15.2 0z\" fill=\"#b88a4e\" transform=\"rotate(0 58 27)\"/><path d=\"M54 44 L50 62 L38 80\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "f_qiyam": "<path d=\"M43 30h16l6 60H37z\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"6\" stroke-linejoin=\"round\"/><g transform=\"rotate(0 51 16)\"><path d=\"M51 6a10 10 0 0 1 10 10c0 6-2 10-2 14H43c0-4-2-8-2-14A10 10 0 0 1 51 6z\" fill=\"#b88a4e\"/></g><circle cx=\"51\" cy=\"16\" r=\"6\" fill=\"#f3e3c8\"/><path d=\"M56 34 L54 41 L44 41\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "f_ruku": "<path d=\"M60 54L62 90H48L50 60z\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"7\" stroke-linejoin=\"round\"/><path d=\"M60 56 L36 42\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"15\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"rotate(-60 30 38)\"><path d=\"M30 28a10 10 0 0 1 10 10c0 6-2 10-2 14H22c0-4-2-8-2-14A10 10 0 0 1 30 28z\" fill=\"#b88a4e\"/></g><circle cx=\"30\" cy=\"38\" r=\"6\" fill=\"#f3e3c8\"/><path d=\"M40 48 L46 60 L51 68\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "f_sujud": "<path d=\"M50 92C51 78 60 66 70 66C79 66 84 78 84 92Z\" fill=\"currentColor\"/><path d=\"M64 72 L36 84\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"rotate(-120 25 85)\"><path d=\"M25 75a10 10 0 0 1 10 10c0 6-2 10-2 14H17c0-4-2-8-2-14A10 10 0 0 1 25 75z\" fill=\"#b88a4e\"/></g><circle cx=\"25\" cy=\"85\" r=\"6\" fill=\"#f3e3c8\"/><path d=\"M38 86 L47 91 L30 91\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "f_julus": "<path d=\"M30 92C30 80 40 72 56 72C70 72 77 82 79 92Z\" fill=\"currentColor\"/><path d=\"M80 90 L87 90\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M56 42 L56 74\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"15\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><g transform=\"rotate(0 56 25)\"><path d=\"M56 15a10 10 0 0 1 10 10c0 6-2 10-2 14H48c0-4-2-8-2-14A10 10 0 0 1 56 15z\" fill=\"#b88a4e\"/></g><circle cx=\"56\" cy=\"25\" r=\"6\" fill=\"#f3e3c8\"/><path d=\"M52 46 L49 62 L40 77\" fill=\"none\" stroke=\"#5f9a7a\" stroke-width=\"6.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"};
const POSE_NAMES = { qiyam: ["Қиям", "Стояние"], ruku: ["Рукуғ", "Поклон"], sujud: ["Сәжде", "Суджуд"], julus: ["Отырыс", "Сидение"] };
const POSE_OF = ["qiyam", "qiyam", "qiyam", "qiyam", "qiyam", "qiyam", "ruku", "qiyam", "sujud", "qiyam", "julus", "julus"];
const poseSVG = k => `<svg class="pose" viewBox="6 4 88 92" aria-hidden="true">${POSES[(S.nzg === "f" ? "f" : "m") + "_" + k]}</svg>`;
function genderSeg(onChange, cls = "") {
  const ru = S.lang === "ru";
  const seg = h("div", { class: "gseg " + cls, role: "group", "aria-label": ru ? "Для кого" : "Кім үшін" });
  [["m", ru ? "Мужчины" : "Ер адамдар"], ["f", ru ? "Женщины" : "Әйелдер"]].forEach(([g, t]) => {
    const b = h("button", { type: "button", "aria-pressed": String((S.nzg === "f" ? "f" : "m") === g) }, t);
    b.onclick = e => { e.preventDefault(); e.stopPropagation(); S.nzg = g; save(); $$("button", seg).forEach(x => x.setAttribute("aria-pressed", String(x === b))); onChange(); };
    seg.append(b);
  });
  return seg;
}
const shelf = (title, note, href) => h("div", { class: "shelf" }, h("h2", {}, title), note ? h(href ? "a" : "span", { href: href || null }, note) : null);
const prayerName = p => L(p.n).replace(/\s*\(.*\)\s*$/, "");
async function pageNamaz(v, sub) {
  const d = await loadNZ();
  const ru = S.lang === "ru";
  if (sub === "how") return nzHow(v, d);
  if (sub === "prayers") return nzPrayers(v, d);
  if (sub === "read") return nzRead(v, d);
  if (sub === "after") { await loadSura(2); return nzAfter(v, d); }
  if (sub === "witr") return nzWitr(v, d);
  if (sub) return notFound(v);
  v.append(pageHead(T("namaz"), ru ? "Ханафитский мазхаб · шаг за шагом" : "Ханафи мазһабы · қадам-қадаммен"));
  const poses = h("span", { class: "nz-poses" });
  const drawP = () => { poses.innerHTML = ["qiyam", "ruku", "sujud", "julus"].map(k => `<span class="nz-pose"><span class="pz">${poseSVG(k)}</span><small>${esc(L({ kk: POSE_NAMES[k][0], ru: POSE_NAMES[k][1] }))}</small></span>`).join(""); };
  drawP();
  v.append(h("div", { class: "nz-hero" },
    h("a", { class: "nz-hero-h", href: "#/namaz/how", html: `<span><b>${esc(ru ? "Как совершать намаз" : "Намаз қалай оқылады")}</b><small>${d.steps.length} ${esc(ru ? "шагов: что читать и когда" : "қадам: не және қашан оқылады")}</small></span><span class="go">${icon("chev")}</span>` }),
    genderSeg(drawP), h("a", { class: "nz-poses-a", href: "#/namaz/how", "aria-label": ru ? "Пошаговая инструкция" : "Қадамдық нұсқаулық" }, poses)));

  const fardOf = p => (p.r.find(([k]) => k === "f") || [0, 0])[1];
  v.append(shelf(ru ? "Пять намазов" : "Бес уақыт намаз", ru ? "ракааты фарда" : "парыз рәкағаттары"),
    h("div", { class: "nz-five" }, d.prayers.map(p => h("a", { href: "#/namaz/prayers", html: `<b class="num">${fardOf(p)}</b><small>${esc(prayerName(p))}</small>` }))));

  const firstW = s => String(s).split(/\s+/)[0];
  v.append(shelf(ru ? "Что читать в намазе" : "Намазда не оқылады", ru ? "все тексты →" : "барлық мәтін →", "#/namaz/read"),
    h("div", { class: "nz-rlist" }, [[L(d.texts.sana.t), firstW(d.texts.sana.ar)], [ru ? "Аль-Фатиха" : "Әл-Фатиха", "ٱلْحَمْدُ"], [L(d.texts.tashahhud.t), firstW(d.texts.tashahhud.ar)]].map(([t, ar], i) =>
      h("a", { href: "#/namaz/read", html: `<i>${i + 1}</i><b>${esc(t)}</b><span class="ar" lang="ar">${esc(ar)}</span>` }))));

  const ts = S.tsb || {};
  v.append(shelf(ru ? "После намаза" : "Намаздан кейін"),
    h("div", { class: "nz-after" },
      h("a", { class: "glass", href: "#/tasbih", html: `<span class="t-ic solid">${icon("beads")}</span><span><b>${esc(ru ? "Тасбих" : "Тәсбих")}</b><small class="num">${esc(ts.total ? fmtN(ts.total) : "33 · 33 · 33")}</small></span>` }),
      h("a", { class: "glass", href: "#/namaz/after", html: `<span class="t-ic ar" lang="ar">ٱللَّهُ</span><span><b>${esc(ru ? "Аят аль-Курси" : "Аятул-Күрси")}</b><small>${esc(ru ? "и азкары" : "және зікірлер")}</small></span>` })),
    h("a", { class: "nz-row", href: "#/namaz/witr", html: `<b>${esc(ru ? "Витр и дуа «Кунут»" : "Үтір және «Құнут» дұғасы")}</b>${icon("chev")}` }),
    h("div", { class: "box tip nz-note" }, mdEl(d.intro)));
}
function nzHow(v, d) {
  const ru = S.lang === "ru";
  const figs = [];
  v.append(backHead("#/namaz", ru ? "Как совершать намаз" : "Намаз қалай оқылады", ru ? "Намаз из 2 ракаатов — по порядку" : "2 рәкағатты намаз — ретімен"),
    genderSeg(() => figs.forEach(([el, k]) => { el.innerHTML = poseSVG(k); }), "light"));
  const ol = h("ol", { class: "nz-steps" });
  d.steps.forEach((st, i) => {
    const k = POSE_OF[i] || "qiyam";
    const fig = h("span", { class: "pz", html: poseSVG(k) }); figs.push([fig, k]);
    const li = h("li", {}, h("div", { class: "nz-st-h" }, fig, h("div", {}, h("small", { class: "muted" }, `${ru ? "Шаг" : "Қадам"} ${i + 1} · ${L({ kk: POSE_NAMES[k][0], ru: POSE_NAMES[k][1] })}`), h("h3", {}, L(st.t)))), mdEl(st.d));
    st.items.forEach(key => li.append(duaCard(d.texts[key])));
    if (st.sura) li.append(h("a", { class: "btn ghost", href: `#/sura/${st.sura}`, html: icon("stand") + esc(ru ? "Открыть «Аль-Фатиху» с аудио" : "«Фатиханы» аудиомен ашу") }));
    if (st.suras) li.append(h("div", { class: "nz-suras" }, st.suras.map(n => { const s = suraBy(n); return h("a", { class: "pill primary", href: `#/sura/${n}` }, `${n}. ${L(s.name)}`); })));
    ol.append(li);
  });
  v.append(ol);
}
function nzPrayers(v, d) {
  const ru = S.lang === "ru";
  v.append(backHead("#/namaz", ru ? "Пять намазов" : "Бес уақыт намаз", ru ? "Сколько ракаатов в каждом намазе" : "Әр намаз неше рәкағат"));
  v.append(h("div", { class: "nz-pr" }, d.prayers.map(p => h("div", { class: "nz-p", html: `<div><b>${esc(L(p.n))}</b><span class="ar" lang="ar">${p.ar}</span></div><div class="nz-k">${p.r.map(([k, n]) => `<span class="nz-${k}"><b>${n}</b> ${esc(L(d.kinds[k]))}</span>`).join("")}</div>` }))));
  v.append(h("p", { class: "muted small", style: "margin-top:12px" }, ru ? "Порядок внутри каждого намаза — слева направо." : "Әр намаздың ішіндегі реті — солдан оңға қарай."));
}
function nzRead(v, d) {
  const ru = S.lang === "ru";
  v.append(backHead("#/namaz", ru ? "Что читать в намазе" : "Намазда не оқылады", ru ? "Все тексты по порядку, с озвучкой" : "Барлық мәтін ретімен, дыбысымен"));
  const wrap = h("div", { class: "stack" });
  d.steps.forEach(st => {
    if (!st.items.length && !st.sura) return;
    wrap.append(h("h3", { class: "nz-rh" }, L(st.t)));
    if (st.sura) wrap.append(h("a", { class: "nz-row", href: `#/sura/${st.sura}`, html: `<b>${esc(ru ? "Сура «Аль-Фатиха» — с аудио и переводом" : "«Фатиха» сүресі — аудиосы және аудармасымен")}</b>${icon("chev")}` }));
    st.items.forEach(key => wrap.append(duaCard(d.texts[key])));
  });
  v.append(wrap);
}
function nzAfter(v, d) {
  const ru = S.lang === "ru";
  v.append(backHead("#/namaz", ru ? "После намаза" : "Намаздан кейін", ru ? "Истигфар, дуа и Аят аль-Курси" : "Истиғфар, дұға және Аятул-Күрси"));
  const wrap = h("div", { class: "stack" });
  d.after.filter(k => !["subhan", "hamd", "akbar", "tahlil"].includes(k)).forEach(k => wrap.append(duaCard(d.texts[k])));
  wrap.append(h("a", { class: "glass", href: "#/tasbih", html: `<span class="t-ic solid">${icon("beads")}</span><span><b>${esc(ru ? "Тасбих: 33 · 33 · 33 и тахлиль" : "Тәсбих: 33 · 33 · 33 және тәһлил")}</b><small>${esc(ru ? "Счётчик с карточками" : "Карточкалы санағыш")}</small></span>` }));
  v.append(wrap);
}
function nzWitr(v, d) {
  const ru = S.lang === "ru";
  v.append(backHead("#/namaz", ru ? "Витр" : "Үтір намазы", ru ? "3 ракаата после ночного намаза" : "Құптан намазынан кейін 3 рәкағат"),
    h("div", { class: "stack" }, h("div", { class: "box tip" }, mdEl(d.witr)), duaCard(d.texts.qunut)));
}

/* ───── тасбих: карточка-зикр переворачивается, счёт сохраняется ───── */
const TS_FACT = {
  subhan: { kk: ["«Субханаллаһ» мен «Әлхамдулиллаһ» аспан мен жердің арасын толтырады", "Пайғамбар ﷺ осы екі қысқа сөздің сауабы соншалықты үлкен екенін айтқан.", "Хадис, Муслим, 223"],
    ru: ["«Субханаллах» и «Альхамдулиллях» наполняют пространство между небесами и землёй", "Пророк ﷺ сказал, что награда за эти два коротких слова настолько велика.", "Хадис, Муслим, 223"] },
  hamd: { kk: ["«Әлхамдулиллаһ» таразыны толтырады", "Пайғамбар ﷺ осы бір қысқа сөз Қиямет күні таразы табағын толтыратындай салмақты екенін айтқан.", "Хадис, Муслим, 223"],
    ru: ["«Альхамдулиллях» наполняет Весы", "Пророк ﷺ сказал, что одно это короткое слово так весомо, что заполняет чашу Весов в Судный день.", "Хадис, Муслим, 223"] },
  akbar: { kk: ["Аллаһқа ең сүйікті төрт сөз", "«Субханаллаһ, Әлхамдулиллаһ, Лә иләһә илләллаһ, Аллаһу әкбар». Қайсысынан бастасаң да, бәрібір.", "Хадис, Муслим, 2137"],
    ru: ["Четыре самых любимых Аллахом слова", "«Субханаллах, Альхамдулиллях, Ля иляха илляллах, Аллаху акбар». Неважно, с какого из них начать.", "Хадис, Муслим, 2137"] },
  tahlil: { kk: ["Күнәлар теңіз көбігіндей болса да кешіріледі", "Әр намаздан кейін 33 тәсбих, 33 тахмид, 33 тәкбір айтып, жүзін осы тәһлилмен толықтырған адамға осылай уәде етілген.", "Хадис, Муслим, 597"],
    ru: ["Грехи простятся, даже если их как морской пены", "Так обещано тому, кто после каждого намаза скажет 33 раза тасбих, 33 — тахмид, 33 — такбир и завершит сотню этим тахлилем.", "Хадис, Муслим, 597"] },
};
const TS_SEQ = [["subhan", 33], ["hamd", 33], ["akbar", 33], ["tahlil", 1]];
async function pageTasbih(v) {
  const d = await loadNZ();
  const ru = S.lang === "ru";
  const st = S.tsb = Object.assign({ i: 0, c: 0, total: 0 }, S.tsb);
  if (!(st.i >= 0 && st.i < TS_SEQ.length)) { st.i = 0; st.c = 0; }
  const canVib = typeof navigator.vibrate === "function";
  v.append(backHead("#/namaz", ru ? "Тасбих" : "Тәсбих", null,
    canVib ? h("span", { class: "pill vib", html: icon("vib") + esc(ru ? "Вибрация каждые 33" : "Әр 33-те діріл") }) : null));
  const front = h("span", { class: "ts-face ts-front" }), back = h("span", { class: "ts-face ts-back" });
  const card = h("button", { class: "ts-card", type: "button" }, h("span", { class: "ts-inner" }, front, back));
  const btn = h("button", { class: "ts-count", type: "button" });
  v.append(h("div", { class: "ts-wrap" }, card, btn));
  const draw = () => {
    const [k] = TS_SEQ[st.i], tx = d.texts[k], f = TS_FACT[k][ru ? "ru" : "kk"];
    front.innerHTML = `<span class="ts-stages" aria-label="${st.i + 1} / 4">${TS_SEQ.map((_, j) => `<i class="${j < st.i ? "on" : j === st.i ? "cur" : ""}${j === 3 ? " sm" : ""}"></i>`).join("")}<small>${st.i + 1} ${ru ? "из" : "/"} 4</small></span>` +
      `<span class="ts-ar${tx.ar.length > 30 ? " long" : ""}" lang="ar">${esc(tx.ar)}</span><span class="ts-tl">${esc(L(tx.tr))}</span><span class="ts-m">${esc(L(tx.m))}</span>` +
      `<span class="ts-hint">${icon("flip")}${esc(ru ? "Нажмите — узнаете об этом зикре" : "Басыңыз — осы зікір туралы біліңіз")}</span>`;
    back.innerHTML = `<span class="ts-know">${icon("bulb")}${esc(ru ? "Знаете ли вы" : "Білесіз бе")}</span><b class="ts-q">«${esc(f[0])}»</b><span class="ts-d">${esc(f[1])}</span><span class="pill">${esc(f[2])}</span>` +
      `<span class="ts-hint">${icon("flip")}${esc(ru ? "Нажмите, чтобы вернуться" : "Қайту үшін басыңыз")}</span>`;
    card.setAttribute("aria-label", (card.classList.contains("flipped") ? f[0] : L(tx.m)) + ". " + (ru ? "Нажмите, чтобы перевернуть карточку" : "Карточканы аудару үшін басыңыз"));
    btn.innerHTML = `<b class="num">${st.c}</b><small class="num" aria-label="${ru ? "Всего" : "Барлығы"}">${fmtN(st.total)}</small>`;
    btn.setAttribute("aria-label", `${ru ? "Посчитать" : "Санау"}: ${st.c}`);
  };
  card.onclick = () => { card.classList.toggle("flipped"); draw(); };
  btn.onclick = () => {
    st.c++; st.total++;
    if (st.c >= TS_SEQ[st.i][1]) {
      if (TS_SEQ[st.i][1] === 33 && canVib) navigator.vibrate(250);
      st.i++; st.c = 0; card.classList.remove("flipped");
      if (st.i >= TS_SEQ.length) { st.i = 0; toast(ru ? "Тасбих завершён. Да примет Аллах!" : "Тәсбих аяқталды. Аллаһ қабыл етсін!", "✓"); }
    }
    save(); draw();
    btn.classList.remove("tap"); void btn.offsetWidth; btn.classList.add("tap");
  };
  draw();
}

/* ═════════════ справочник ═════════════ */
let TJ = null;
const loadTJ = () => TJ || (TJ = fetchJSON("data/tajweed.json").catch(e => { TJ = null; throw e; }));
function rexEl(items) {
  const g = h("div", { class: "rex" });
  for (const it of items) {
    const [s, a] = it.src.split(":").map(Number);
    const row = h("div", { class: "rex-i" });
    const pb = h("button", { class: "pa", html: icon("play"), title: T("play") });
    pb.onclick = () => playURL(ayahURL(s, a), row);
    row.append(h("div", { class: "ar rex-a", html: spansHTML(it.sp) }), h("span", { class: "pill" }, `${L(suraBy(s).name)} ${it.src}`), pb);
    g.append(row);
  }
  return g;
}
async function pageTajweed(v) {
  const d = await loadTJ();
  const ru = S.lang === "ru";
  v.append(h("div", { class: "read stack tj-intro" },
    h("div", { class: "box rule" }, h("h4", { html: icon("bulb") + `<span>${ru ? "Что такое таджвид?" : "Тәжуид деген не?"}</span>` }), mdEl(d.intro.what)),
    h("div", { class: "box kz" }, h("h4", { html: icon("repeat") + `<span>${ru ? "Как считать харакаты (счёты)" : "Харакатты қалай санаймыз"}</span>` }), mdEl(d.intro.count)),
    h("p", { class: "muted small" }, L(d.intro.colors))));
  for (const G of d.groups) {
    const sec = h("section", { class: "section read" }, h("h2", {}, L(G.t)), h("p", { class: "muted", style: "margin:6px 0 12px" }, L(G.d)));
    const list = h("div", { class: "tj-list" });
    G.rules.forEach(k => {
      const r = d.rules[k], c = CORE.rules[k];
      list.append(h("a", { class: "tj-card", href: `#/ref/rule/${k}`, style: `--rc:${RC(k)}`, html:
        `<span class="tj-sw"></span><div class="tj-tx"><b>${esc(L(c.name))}</b><small>${esc(L(r.remember))}</small></div><span class="ar tj-arname">${r.ar}</span><span class="go">${icon("arrow")}</span>` }));
    });
    sec.append(list); v.append(sec);
  }
}
async function pageRule(v, k) {
  const d = await loadTJ();
  const r = d.rules[k], c = CORE.rules[k];
  if (!r) return notFound(v);
  const ru = S.lang === "ru";
  const keys = Object.keys(d.rules), i = keys.indexOf(k);
  const wrap = h("article", { class: "read stack rule-page", style: `--rc:${RC(k)}` });
  wrap.append(h("div", { class: "crumbs", html: `<a href="#/ref/tajweed">${esc(T("tajweed"))}</a><span>·</span><span>${esc(L(c.name))}</span>` }),
    h("header", { class: "rule-h" }, h("span", { class: "rule-sw" }), h("div", {}, h("h1", {}, L(r.tr)), h("p", { class: "ar rule-ar", lang: "ar" }, r.ar))),
    h("div", { class: "box rule" }, h("h4", { html: icon("bulb") + `<span>${ru ? "Простыми словами" : "Қарапайым тілмен"}</span>` }), mdEl(r.simple)),
    h("div", { class: "rule-when" }, h("h3", {}, ru ? "Когда?" : "Қашан?"), mdEl(r.when),
      h("div", { class: "rule-letters", lang: "ar" }, r.letters.split(" ").map(x => h("span", {}, x)))),
    h("div", {}, h("h3", { style: "margin-bottom:8px" }, ru ? "Как читать — шаг за шагом" : "Қалай оқимыз — қадам бойынша"),
      h("ol", { class: "rule-steps" }, r.how.map(x => h("li", { html: mdInline(x) })))),
    h("div", { class: "box kz" }, h("h4", { html: icon("bridge") + `<span>${ru ? "Представьте…" : "Елестетіп көріңіз…"}</span>` }), mdEl(r.image)));
  if (r.note) wrap.append(h("div", { class: "box tip" }, h("h4", { html: icon("rule") + `<span>${ru ? "Важно" : "Маңызды"}</span>` }), mdEl(r.note)));
  if (r.examples && r.examples.length) wrap.append(h("h3", {}, ru ? "Послушайте примеры из Корана" : "Құраннан мысалдарды тыңдаңыз"),
    h("p", { class: "muted small" }, ru ? "Цветом выделено место, где действует правило. Нажмите ▶ и повторите за чтецом." : "Ереже орны түспен белгіленген. ▶ басып, қаридан кейін қайталаңыз."), rexEl(r.examples));
  wrap.append(h("div", { class: "box warn" }, h("h4", { html: icon("alert") + `<span>${ru ? "Частая ошибка" : "Жиі кездесетін қате"}</span>` }), mdEl(r.mistake)),
    h("div", { class: "remember" }, h("span", {}, ru ? "Запомните" : "Есте сақтаңыз"), h("b", { html: mdInline(r.remember) })));
  const pv = keys[i - 1], nx = keys[i + 1];
  wrap.append(h("div", { class: "lnav" },
    pv ? h("a", { class: "btn ghost", href: `#/ref/rule/${pv}`, html: icon("back") + esc(L(CORE.rules[pv].name)) }) : h("span"),
    nx ? h("a", { class: "btn ghost", href: `#/ref/rule/${nx}`, html: esc(L(CORE.rules[nx].name)) + icon("arrow") }) : h("span")));
  v.append(wrap);
}
async function pageRef(v, sec, arg) {
  if (sec === "letter" && arg) return pageLetter(v, arg);
  if (sec === "rule" && arg) return pageRule(v, arg);
  sec = sec || "alphabet";
  const tabs = h("div", { class: "tabs" }, [["alphabet", "alphabet"], ["tajweed", "tajweed"], ["makhraj", "makhraj"]].map(([k, t]) =>
    h("a", { class: "tog", href: `#/ref/${k}`, "aria-pressed": String(sec === k), style: "display:inline-flex;align-items:center;text-decoration:none" }, T(t))));
  v.append(pageHead(T("learn"), null, learnTabs("ref")), tabs);
  if (sec === "alphabet") {
    const g = h("div", { class: "agrid" });
    CORE.letters.forEach(x => { const [nm] = nameParts(L(x.name)); g.append(h("a", { class: "alt", href: `#/ref/letter/${encodeURIComponent(x.ar)}`, html: `<span class="g" lang="ar">${x.ar}</span><span class="n">${esc(nm)}</span><span class="s">${esc(L(x.sound))}</span>` })); });
    v.append(h("p", { class: "muted small", style: "margin-bottom:12px" }, S.lang === "ru" ? "Нажмите на букву: название, звук, махрадж, примеры и озвучка." : "Әріпті басыңыз: аты, дыбысы, махражы, мысалдар және дыбыстау."), g);
  } else if (sec === "tajweed") {
    await pageTajweed(v);
  } else if (sec === "makhraj") {
    v.append(makhrajEl([]));
  }
}
function pageLetter(v, ar) {
  const Lt = letterBy(ar);
  if (!Lt) return notFound(v);
  const lesson = Object.entries({ 3: "ب", 4: "م", 5: "وف", 7: "ت", 8: "د", 9: "ط", 11: "ث", 12: "ذ", 13: "ظ", 15: "س", 16: "ز", 17: "ص", 19: "ج", 20: "ش", 21: "ي", 23: "قك", 24: "ض", 25: "لن", 26: "ر", 28: "ءه", 29: "عح", 30: "غخا" }).find(([, s]) => s.includes(ar));
  const wrap = h("div", { class: "read stack" });
  wrap.append(h("div", { class: "crumbs", html: `<a href="#/ref/alphabet">${esc(T("alphabet"))}</a><span>·</span><span>${esc(nameParts(L(Lt.name))[0])}</span>` }),
    letterCard(Lt), sayBtns(Lt, true), h("p", { class: "muted small" }, T("ttsNote")), formsEl(Lt), makhrajEl([Lt.mk]),
    h("div", { class: "box kz" }, h("h4", { html: icon("bridge") + esc(S.lang === "ru" ? "Сравнение" : "Салыстыру") }), mdEl(Lt.cmp)),
    h("div", { class: "box warn" }, h("h4", { html: icon("alert") + esc(S.lang === "ru" ? "Частая ошибка" : "Жиі қате") }), mdEl({ kk: Lt.err.kk + "\n\n" + Lt.fix.kk, ru: Lt.err.ru + "\n\n" + Lt.fix.ru })),
    h("h3", {}, T("examples")), wordsEl(Lt.words), traceEl(Lt.forms[0], "ref" + ar, null));
  if (lesson) wrap.append(h("a", { class: "btn ghost", href: `#/lesson/${lesson[0]}`, html: esc(T("openLesson")) + icon("arrow") }));
  const i = CORE.letters.indexOf(Lt);
  wrap.append(h("div", { class: "lnav" },
    CORE.letters[i - 1] ? h("a", { class: "btn ghost", href: `#/ref/letter/${encodeURIComponent(CORE.letters[i - 1].ar)}`, html: icon("back") + `<span class="ar" style="font-size:22px">${CORE.letters[i - 1].ar}</span>` }) : h("span"),
    CORE.letters[i + 1] ? h("a", { class: "btn ghost", href: `#/ref/letter/${encodeURIComponent(CORE.letters[i + 1].ar)}`, html: `<span class="ar" style="font-size:22px">${CORE.letters[i + 1].ar}</span>` + icon("arrow") }) : h("span")));
  v.append(wrap);
}

/* ═════════════ тренажёры ═════════════ */
const HARAKAT = [["َ", "а"], ["ِ", "и"], ["ُ", "у"], ["ْ", ""]];
const consonants = () => CORE.letters.filter(x => !"اءوي".includes(x.ar));
const TRAINERS = [
  { id: "letters", ic: "ب", t: ["Әріпті тану", "Узнай букву"], d: ["Әріптің формасы — атын табыңыз", "Форма буквы — найдите название"],
    make() { const x = pick(CORE.letters); const w = shuffle(CORE.letters.filter(y => y !== x)).slice(0, 3); const o = shuffle([x, ...w]);
      return { kind: "mcq", q: { kk: "Бұл қай әріп?", ru: "Что это за буква?" }, prompt: pick(x.forms), options: o.map(y => ({ t: y.name })), answer: o.indexOf(x) }; } },
  { id: "lookalike", ic: "ث", t: ["Ұқсас әріптер", "Похожие буквы"], d: ["Нүктесі мен пішіні ұқсас әріптерді ажыратыңыз", "Различайте буквы с похожими точками и формой"],
    make() { const x = pick(CORE.letters.filter(y => y.look)); const w = x.look.split("").map(letterBy).filter(Boolean).slice(0, 3); const o = shuffle([x, ...w]);
      return { kind: "mcq", q: { kk: `«${x.name.kk}» қайсысы?`, ru: `Где «${x.name.ru}»?` }, options: o.map(y => ({ ar: y.ar })), answer: o.indexOf(x) }; } },
  { id: "forms", ic: "ـبـ", t: ["Әріп формалары", "Формы букв"], d: ["Сөз басы, ортасы, соңы — дұрыс форманы табыңыз", "Начало, середина, конец — найдите нужную форму"],
    make() { const x = pick(CORE.letters.filter(y => y.joins)); const pi = 1 + Math.floor(Math.random() * 3); const names = [["басындағы", "в начале"], ["ортасындағы", "в середине"], ["соңындағы", "в конце"]][pi - 1];
      const o = shuffle([...new Set(x.forms)]); return { kind: "mcq", q: { kk: `⟦${x.ar}⟧ — сөз ${names[0]} формасы?`, ru: `⟦${x.ar}⟧ — форма ${names[1]} слова?` }, options: o.map(y => ({ ar: y })), answer: o.indexOf(x.forms[pi]) }; } },
  { id: "harakat", ic: "بَ", t: ["Буын оқу", "Чтение слогов"], d: ["Харакатты буынды оқып, дұрыс оқылуын табыңыз", "Прочитайте слог с огласовкой и выберите чтение"],
    make() { const x = pick(consonants()); const snd = L(x.sound).split(" ")[0]; const hk = pick(HARAKAT.slice(0, 3)); const opts = shuffle(HARAKAT.slice(0, 3).map(([, v]) => snd + v).concat([snd]));
      return { kind: "mcq", q: { kk: "Қалай оқылады?", ru: "Как читается?" }, prompt: x.ar + hk[0], options: opts.map(o => ({ t: { kk: o, ru: o } })), answer: opts.indexOf(snd + hk[1]) }; } },
  { id: "listen", ic: "♪", t: ["Тыңдап табу", "Найди на слух"], d: ["Қаридың дауысын тыңдап, сөзді табыңыз", "Послушайте чтеца и найдите слово"],
    make() { const pool = CORE.words.filter(w => w.base.length >= 3 && w.base.length <= 6); const x = pick(pool); const w = shuffle(pool.filter(y => y !== x && Math.abs(y.base.length - x.base.length) <= 1)).slice(0, 3); const o = shuffle([x, ...w]);
      return { kind: "mcq", listen: x.loc, q: { kk: "Естіген сөзіңізді табыңыз", ru: "Найдите услышанное слово" }, options: o.map(y => ({ ar: y.w })), answer: o.indexOf(x) }; } },
  { id: "build", ic: "قل", t: ["Сөз құрастыру", "Собери слово"], d: ["Тыңдап, әріптерден сөз құрыңыз", "Послушайте и соберите слово из букв"],
    make() { const pool = CORE.words.filter(w => w.base.length >= 2 && w.base.length <= 4 && !/[ٱآ]/.test(w.base)); const x = pick(pool);
      return { kind: "order", q: { kk: "Сөзді құрастырыңыз", ru: "Соберите слово" }, pieces: [...x.base], answer: x.w, loc: x.loc, tr: x.tr }; } },
  { id: "tajweed", ic: "ن", t: ["Тәжуид ережесі", "Правило таджвида"], d: ["Түспен белгіленген жердің ережесін анықтаңыз", "Определите правило в выделенном месте"],
    make() { const q = pick(CORE.quiz); const w = shuffle(Object.keys(CORE.rules).filter(k => k !== q.r)).slice(0, 3); const o = shuffle([q.r, ...w]);
      return { kind: "mcq", q: { kk: `Қандай ереже? (${q.src})`, ru: `Какое правило? (${q.src})` }, promptHTML: spansTarget(q.sp), options: o.map(k => ({ t: CORE.rules[k].name })), answer: o.indexOf(q.r) }; } },
  { id: "madd", ic: "آ", t: ["Созым ұзақтығы", "Длина мадда"], d: ["Белгіленген созымды неше харакат созу керек?", "На сколько счётов тянуть выделенный мадд?"],
    make() { const q = pick(CORE.quiz.filter(x => x.r.startsWith("madd"))); const o = [{ kk: "2 харакат", ru: "2 счёта" }, { kk: "4–5 харакат", ru: "4–5 счётов" }, { kk: "6 харакат", ru: "6 счётов" }];
      return { kind: "mcq", q: { kk: `Неше харакат? (${q.src})`, ru: `Сколько счётов? (${q.src})` }, promptHTML: spansTarget(q.sp), options: o.map(t => ({ t })), answer: { madd2: 0, madd46: 1, madd6: 2 }[q.r] }; } },
];
function pagePractice(v) {
  v.append(pageHead(T("learn"), null, learnTabs("practice")), h("h2", {}, T("trainers")), h("p", { class: "muted", style: "margin:6px 0 16px" }, S.lang === "ru" ? "Короткие сессии по 10 вопросов. Каждый верный ответ — +2 очка." : "10 сұрақтан тұратын қысқа жаттығулар. Әр дұрыс жауап — +2 ұпай."));
  const g = h("div", { class: "trs" });
  TRAINERS.forEach(t => g.append(h("a", { class: "tr-card", href: `#/practice/${t.id}`, html: `<span class="ic">${esc(t.ic)}</span><b>${esc(L({ kk: t.t[0], ru: t.t[1] }))}</b><p>${esc(L({ kk: t.d[0], ru: t.d[1] }))}</p>` })));
  v.append(g);
  v.append(h("section", { class: "section" }, h("div", { class: "section-h" }, h("h2", {}, T("hifz"))),
    h("p", { class: "muted", style: "margin-bottom:12px" }, S.lang === "ru" ? "Выберите суру и учите её по аятам: слушайте с повтором, скрывайте слова, отмечайте выученное." : "Сүрені таңдап, аятпен жаттаңыз: қайталап тыңдаңыз, сөздерді жасырыңыз, жаттағаныңызды белгілеңіз."),
    h("div", { class: "slist" }, CORE.suras.filter(s => s.n === 1 || (s.n >= 93 && s.c <= 11)).map(s => suraItem(s, `#/sura/${s.n}/hifz`))),
    h("p", { style: "margin-top:12px" }, h("a", { href: "#/suras" }, S.lang === "ru" ? "Любая из 114 сур — откройте её и выберите «Режим заучивания» →" : "114 сүренің кез келгенін ашып, «Жаттау режимін» таңдаңыз →"))));
  v.append(h("section", { class: "section" }, h("a", { class: "qcard", href: "#/ref", html: `<span class="qi">${icon("book")}</span><div><b>${esc(T("ref"))}</b><small>${esc(S.lang === "ru" ? "Алфавит с озвучкой, правила таджвида, карта махраджей" : "Дыбысталған әліпби, тәжуид ережелері, махраж картасы")}</small></div>` })));
}
function pageTrainer(v, id) {
  const tr = TRAINERS.find(t => t.id === id);
  if (!tr) return notFound(v);
  const wrap = h("div", { class: "session" });
  wrap.append(h("div", { class: "crumbs", html: `<a href="#/practice">${esc(T("trainers"))}</a><span>·</span><span>${esc(L({ kk: tr.t[0], ru: tr.t[1] }))}</span>` }),
    h("h1", { style: "margin-bottom:14px" }, L({ kk: tr.t[0], ru: tr.t[1] })));
  const box = h("div");
  wrap.append(box);
  const N = 10;
  const run = () => {
    let i = 0, ok = 0;
    const step = () => {
      box.innerHTML = "";
      if (i >= N) {
        box.append(h("div", { class: "panel result" }, h("div", { class: "big" }, `${ok} / ${N}`), h("p", { class: "muted" }, `+${ok * 2} ${T("plusXp")}`),
          h("div", { class: "row", style: "justify-content:center" }, h("button", { class: "btn", onclick: run }, T("again")), h("a", { class: "btn ghost", href: "#/practice" }, T("backTr")))));
        checkBadges(); return;
      }
      const q = tr.make();
      box.append(h("div", { class: "tprog", style: "display:flex;justify-content:space-between;font-size:13.5px;color:var(--muted);margin-bottom:6px" }, h("span", {}, `${T("question")} ${i + 1} / ${N}`), h("span", { class: "num" }, `${ok} ✓`)),
        h("div", { class: "bar", style: "margin-bottom:12px" }, h("i", { style: `width:${i / N * 100}%` })));
      const el = exEl(q, "tr", null, { noTag: true, single: true, onDone: good => {
        S.tr.n++; if (good) { S.tr.ok++; ok++; addXP(2, el); } save(); i++; setTimeout(step, good ? 450 : 1400);
      } });
      if (q.promptHTML) el.querySelector(".q").after(h("div", { class: "prompt", style: "font-size:44px", html: q.promptHTML }));
      if (q.listen) { const lb = h("button", { class: "listen-btn", html: icon("sound"), title: T("play") }); lb.onclick = () => playURL(wordURL(q.listen), lb); el.querySelector(".q").after(lb); setTimeout(() => playURL(wordURL(q.listen), lb), 250); }
      box.append(el);
    };
    step();
  };
  run();
  v.append(wrap);
}

/* ═════════════ профиль ═════════════ */
const BADGE_IC = { first: "learn", m1: "ab", m2: "stand", m3: "rule", m4: "star", s3: "flame", s7: "flame", s30: "flame", t100: "target", perfect: "check", fatiha: "stand", hifz5: "star" };
const badgeIcon = id => BADGE_IC[id] === "ab" ? '<span class="ar" lang="ar">أ ب</span>' : icon(BADGE_IC[id] || "star");
function pageMe(v) {
  const ru = S.lang === "ru";
  const lv = levelOf(S.xp), [lo, hi] = levelBounds(lv);
  const u = AUTH.user;
  const name = u ? (u.displayName || u.email) : (ru ? "Гость" : "Қонақ");
  const ava = u && u.photoURL ? `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : esc((String(name).trim()[0] || "?").toUpperCase());
  const wrap = h("div", { class: "read" });
  wrap.append(h("header", { class: "me-h", html: `<span class="me-ava">${ava}</span><div><h1>${esc(name)}</h1><p class="muted small">${esc(T("level"))} ${lv} · ${S.xp} ${esc(T("xp"))}</p><div class="bar"><i style="width:${((S.xp - lo) / (hi - lo) * 100).toFixed(0)}%"></i></div></div>` }));
  wrap.append(accountPanel());
  const memN = CORE.suras.filter(s => suraMemorized(s.n)).length, st = streak(), dc = doneCount();
  wrap.append(h("div", { class: "me-stats" },
    h("a", { href: "#/course", html: `<b class="num">${dc}</b><small>${esc(ru ? plRu(dc, "урок", "урока", "уроков") : "сабақ")}</small>` }),
    h("div", { class: "warm", html: `<b class="num">${st}</b><small>${esc(T("streak"))}</small>` }),
    h("a", { href: "#/practice", html: `<b class="num">${memN}</b><small>${esc(ru ? plRu(memN, "сура наизусть", "суры наизусть", "сур наизусть") : "сүре жатқа")}</small>` })));
  // награды
  const got = BADGES.filter(b => S.badges[b[0]]).length;
  const aw = h("div", { class: "awards" });
  [...BADGES].sort((a, b) => (!!S.badges[b[0]]) - (!!S.badges[a[0]])).forEach(([id, , nm, desc]) =>
    aw.append(h("div", { class: "award" + (S.badges[id] ? " on" : ""), html: `<span class="aw-ic">${S.badges[id] ? badgeIcon(id) : icon("lock")}</span><b>${esc(L({ kk: nm[0], ru: nm[1] }))}</b><small>${esc(L({ kk: desc[0], ru: desc[1] }))}</small>` })));
  wrap.append(h("section", { class: "card" }, h("div", { class: "card-h" }, h("h2", {}, ru ? "Награды" : "Марапаттар"), h("span", { class: "muted small" }, `${got} ${ru ? "из" : "/"} ${BADGES.length}`)), aw));
  // неделя и цель
  const days = S.lang === "ru" ? UI.dayNames[1] : UI.dayNames[0];
  const wk = h("div", { class: "week" });
  const d0 = new Date(); const dow = (d0.getDay() + 6) % 7; d0.setDate(d0.getDate() - dow);
  for (let i = 0; i < 7; i++) {
    const d = new Date(d0); d.setDate(d0.getDate() + i);
    const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const x = S.days[k] || 0;
    wk.append(h("div", { class: k === today() ? "today" : "", html: `<i><b style="height:${Math.min(100, x / S.goal * 100)}%"></b></i>${days[i]}` }));
  }
  const goalSeg = h("div", { class: "seg" }, [[15, "goals"], [30, "goalm"], [60, "goalh"]].map(([g, k]) => h("button", { "aria-pressed": String(S.goal === g), onclick: () => { S.goal = g; save(); route(); } }, `${T(k)} · ${g}`)));
  wrap.append(h("section", { class: "card stack" }, h("h2", {}, T("week")), wk, h("h3", {}, T("dailyGoal")), goalSeg));
  // настройки
  const themeSeg = h("div", { class: "seg" }, [["light", "light"], ["dark", "dark"], ["system", "system"]].map(([th, k]) => h("button", { "aria-pressed": String((S.theme || "light") === th), onclick: () => { S.theme = th; save(); applyTheme(); shell(); route(); } }, T(k))));
  const langSeg = h("div", { class: "seg" }, [["kk", "Қазақша"], ["ru", "Русский"]].map(([l, t]) => h("button", { "aria-pressed": String(S.lang === l), onclick: () => setLang(l) }, t)));
  const confirmBox = h("div", { class: "box warn", hidden: true }, h("p", {}, T("resetAsk")),
    h("div", { class: "row", style: "margin-top:10px" }, h("button", { class: "btn", style: "background:var(--bad);color:#fff", onclick: () => { const keep = { lang: S.lang, theme: S.theme }; S = Object.assign(blank(), keep); save(); toast(T("resetDone")); shell(); route(); } }, T("yesReset")),
      h("button", { class: "btn ghost", onclick: () => confirmBox.hidden = true }, T("cancel"))));
  wrap.append(h("section", { class: "card stack" }, h("h2", {}, T("settings")),
    h("div", { class: "setrow" }, h("span", {}, T("language")), langSeg),
    h("div", { class: "setrow" }, h("span", {}, T("theme")), themeSeg),
    h("p", { class: "muted small" }, AUTH.user ? T("synced") : T("savedHere")),
    h("div", {}, h("button", { class: "btn ghost", onclick: () => confirmBox.hidden = false }, T("resetAll"))), confirmBox));
  v.append(wrap);
}

/* ═════════════ аккаунт и синхронизация (Firebase) ═════════════ */
const FB_V = "10.12.5";
const AUTH = { off: true, user: null, fb: null };
const AUTH_MSG = {
  "auth/invalid-credential": ["Пошта немесе құпиясөз қате", "Неверная почта или пароль"],
  "auth/wrong-password": ["Пошта немесе құпиясөз қате", "Неверная почта или пароль"],
  "auth/user-not-found": ["Мұндай аккаунт жоқ — тіркеліңіз", "Такого аккаунта нет — зарегистрируйтесь"],
  "auth/email-already-in-use": ["Бұл пошта тіркелген — кіріңіз", "Эта почта уже зарегистрирована — войдите"],
  "auth/weak-password": ["Құпиясөз тым қысқа (кемінде 6 таңба)", "Слишком короткий пароль (не меньше 6 символов)"],
  "auth/invalid-email": ["Пошта дұрыс жазылмаған", "Почта указана неверно"],
  "auth/missing-password": ["Құпиясөзді жазыңыз", "Введите пароль"],
  "auth/network-request-failed": ["Интернет байланысы жоқ", "Нет соединения с интернетом"],
  "auth/too-many-requests": ["Әрекет тым көп. Біраздан кейін қайталаңыз", "Слишком много попыток. Повторите позже"],
  "auth/unauthorized-domain": ["Бұл домен Firebase баптауларында рұқсат етілмеген", "Этот домен не разрешён в настройках Firebase"],
};
const authMsg = e => { const m = AUTH_MSG[e && e.code]; return m ? m[S.lang === "ru" ? 1 : 0] : (e && e.message) || "?"; };
async function initAuth() {
  let cfg;
  try { cfg = await fetchJSON("data/firebase.json"); } catch (e) { return; }
  if (!cfg || !cfg.apiKey) return;
  try {
    const [app, auth, fs] = await Promise.all(["app", "auth", "firestore"].map(m => import(`https://www.gstatic.com/firebasejs/${FB_V}/firebase-${m}.js`)));
    const fa = app.initializeApp(cfg);
    const A = auth.getAuth(fa); A.languageCode = S.lang === "ru" ? "ru" : "kk";
    AUTH.fb = { auth, fs, A, db: fs.getFirestore(fa) }; AUTH.off = false;
    auth.getRedirectResult(A).catch(e => toast(T("authErr") + ": " + authMsg(e)));
    auth.onAuthStateChanged(A, async u => {
      const was = AUTH.user; AUTH.user = u;
      if (u) { await syncDown(); onSave = pushSoon; } else onSave = null;
      renderAvatar();
      if ((!!was !== !!u) && /^#\/me/.test(location.hash)) route();
    });
    if (/^#\/me/.test(location.hash)) route();
  } catch (e) { console.warn("auth", e); }
}
function mergeState(a, b) { // объединяем прогресс двух устройств — ничего не теряем
  const newer = (a.at || 0) >= (b.at || 0) ? a : b, m = Object.assign(blank(), newer);
  m.xp = Math.max(a.xp || 0, b.xp || 0);
  const maxMap = (x = {}, y = {}) => { const o = Object.assign({}, x); for (const k in y) o[k] = Math.max(o[k] || 0, y[k] || 0); return o; };
  const union = (x = {}, y = {}) => Object.assign({}, y, x);
  m.days = maxMap(a.days, b.days); m.tests = maxMap(a.tests, b.tests);
  m.lessons = union(a.lessons, b.lessons); m.ex = union(a.ex, b.ex); m.badges = union(a.badges, b.badges);
  m.hifz = {}; for (const k of new Set([...Object.keys(a.hifz || {}), ...Object.keys(b.hifz || {})])) m.hifz[k] = union((a.hifz || {})[k], (b.hifz || {})[k]);
  m.tr = { n: Math.max(a.tr?.n || 0, b.tr?.n || 0), ok: Math.max(a.tr?.ok || 0, b.tr?.ok || 0) };
  m.tsb = ((a.tsb && a.tsb.total) || 0) >= ((b.tsb && b.tsb.total) || 0) ? a.tsb : b.tsb;
  m.at = Math.max(a.at || 0, b.at || 0);
  return m;
}
async function syncDown() {
  const { fs, db } = AUTH.fb, u = AUTH.user;
  try {
    const snap = await fs.getDoc(fs.doc(db, "users", u.uid));
    if (snap.exists()) {
      const remote = JSON.parse(snap.data().state || "{}");
      const keep = { lang: S.lang, theme: S.theme };
      S = Object.assign(mergeState(S, remote), keep);
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
      renderTopStats();
    }
    await pushNow();
  } catch (e) { console.warn("sync", e); }
}
let pushT = null;
const pushSoon = () => { clearTimeout(pushT); pushT = setTimeout(pushNow, 1500); };
async function pushNow() {
  if (!AUTH.user || !AUTH.fb) return;
  const { fs, db } = AUTH.fb;
  try { await fs.setDoc(fs.doc(db, "users", AUTH.user.uid), { state: JSON.stringify(S), at: Date.now(), name: AUTH.user.displayName || "" }); }
  catch (e) { console.warn("push", e); }
}
function renderAvatar() {
  const a = $("#avatar"); if (!a) return;
  const u = AUTH.user;
  a.classList.toggle("on", !!u);
  if (u && u.photoURL) a.innerHTML = `<img src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">`;
  else if (u) a.innerHTML = `<span>${esc(((u.displayName || u.email || "?").trim()[0] || "?").toUpperCase())}</span>`;
  else a.innerHTML = icon("user");
}
function accountPanel() {
  const box = h("div", { class: "panel stack acc" });
  if (AUTH.off) {
    box.append(h("div", { class: "row", style: "gap:12px;flex-wrap:nowrap" }, h("span", { class: "acc-ic", html: icon("cloud") }),
      h("div", {}, h("b", {}, T("acc")), h("p", { class: "muted small" }, T("accWhy") + " " + T("accSoon")))));
    return box;
  }
  const { auth, A } = AUTH.fb;
  const u = AUTH.user;
  if (u) {
    const out = h("button", { class: "btn ghost", html: icon("out") + esc(T("signOut")) });
    out.onclick = async () => { await pushNow(); await auth.signOut(A); };
    box.append(h("div", { class: "row", style: "gap:14px;flex-wrap:nowrap" },
      h("span", { class: "iconbtn avatar on big", html: $("#avatar") ? $("#avatar").innerHTML : icon("user") }),
      h("div", { style: "min-width:0" }, h("b", {}, `${T("hello")}, ${u.displayName || u.email}`), h("p", { class: "muted small" }, T("synced")))), h("div", {}, out));
    return box;
  }
  let mode = "in";
  const draw = () => {
    box.innerHTML = "";
    box.append(h("div", {}, h("h3", {}, mode === "in" ? T("signIn") : T("signUp")), h("p", { class: "muted small", style: "margin-top:4px" }, T("accWhy"))));
    const g = h("button", { class: "btn ghost gbtn", type: "button", html: GOOGLE_G + esc(T("google")) });
    g.onclick = async () => {
      const p = new auth.GoogleAuthProvider();
      try { await auth.signInWithPopup(A, p); }
      catch (e) {
        if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") auth.signInWithRedirect(A, p);
        else if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") err.textContent = authMsg(e);
      }
    };
    const em = h("input", { type: "email", autocomplete: "email", placeholder: T("email"), "aria-label": T("email"), required: true });
    const pw = h("input", { type: "password", autocomplete: mode === "in" ? "current-password" : "new-password", placeholder: T("password"), "aria-label": T("password"), minlength: 6, required: true });
    const nm = mode === "up" ? h("input", { type: "text", autocomplete: "name", placeholder: S.lang === "ru" ? "Имя" : "Атыңыз", "aria-label": S.lang === "ru" ? "Имя" : "Атыңыз" }) : null;
    const err = h("p", { class: "fb bad", role: "alert" });
    const sub = h("button", { class: "btn", type: "submit", html: icon("mail") + esc(mode === "in" ? T("signIn") : T("signUp")) });
    const form = h("form", { class: "stack", style: "gap:10px", novalidate: true }, nm, em, pw, sub, err);
    form.onsubmit = async e => {
      e.preventDefault(); err.textContent = ""; sub.disabled = true;
      try {
        if (mode === "in") await auth.signInWithEmailAndPassword(A, em.value.trim(), pw.value);
        else { const c = await auth.createUserWithEmailAndPassword(A, em.value.trim(), pw.value); if (nm && nm.value.trim()) await auth.updateProfile(c.user, { displayName: nm.value.trim() }); }
      } catch (x) { err.textContent = authMsg(x); }
      sub.disabled = false;
    };
    const links = h("div", { class: "row", style: "justify-content:space-between" });
    const sw = h("button", { class: "linkbtn", type: "button" }, mode === "in" ? T("noAcc") : T("haveAcc"));
    sw.onclick = () => { mode = mode === "in" ? "up" : "in"; draw(); };
    links.append(sw);
    if (mode === "in") {
      const fg = h("button", { class: "linkbtn", type: "button" }, T("forgot"));
      fg.onclick = async () => { if (!em.value.trim()) { err.textContent = T("needEmail"); em.focus(); return; } try { await auth.sendPasswordResetEmail(A, em.value.trim()); err.className = "fb ok"; err.textContent = T("resetSent"); } catch (x) { err.className = "fb bad"; err.textContent = authMsg(x); } };
      links.append(fg);
    }
    box.append(g, h("div", { class: "or" }, h("span", {}, T("orDiv"))), form, links);
  };
  draw();
  return box;
}

/* ═════════════ запуск ═════════════ */
async function boot() {
  shell();
  $("#view").append(h("div", { class: "loading" }, "…"));
  try {
    [CORE, COURSE] = await Promise.all([fetchJSON("data/core.json"), fetchJSON("data/course.json")]);
  } catch (e) {
    $("#view").innerHTML = ""; $("#view").append(h("div", { class: "loading" }, S.lang === "ru" ? "Не удалось загрузить данные. Обновите страницу." : "Деректер жүктелмеді. Бетті жаңартыңыз."));
    return;
  }
  window.addEventListener("hashchange", route);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (S.theme === "system") { applyTheme(); shell(); route(); } });
  route();
  checkBadges();
  initAuth();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
}
boot();
})();
