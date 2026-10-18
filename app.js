/* Iqra — онлайн-курс чтения Корана. Клиентская часть без зависимостей. */
(() => {
"use strict";

/* ═════════════ хранилище ═════════════ */
const KEY = "qoqu.v1";
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const blank = () => ({ lang: null, theme: null, xp: 0, days: {}, lessons: {}, ex: {}, tests: {},
  badges: {}, hifz: {}, reciter: "Husary_Muallim_128kbps", goal: 30, tr: { n: 0, ok: 0 }, view: { color: true, tr: true, tl: true },
  last: null, listen: { r: "mishary-alafasy/r1", s: 1 }, at: 0 });
let S = blank();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) {}
S.view = Object.assign({ color: true, tr: true, tl: true }, S.view);
let onSave = null;
const save = () => { S.at = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (onSave) onSave(); };

/* ═════════════ язык и тема ═════════════ */
if (!S.lang) S.lang = /^ru/i.test(navigator.language || "") ? "ru" : "kk";
const L = o => o == null ? "" : (typeof o === "string" ? o : (o[S.lang] ?? o.kk ?? ""));
const applyTheme = () => { if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; };
applyTheme();
const isDark = () => S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;

const UI = {
  brand: ["Iqra", "Iqra"],
  brandSub: ["Құранды нөлден оқу", "Коран с нуля"],
  home: ["Басты", "Главная"], course: ["Курс", "Курс"], ref: ["Анықтама", "Справочник"],
  suras: ["Құран", "Коран"], practice: ["Жаттығу", "Практика"], me: ["Профиль", "Профиль"],
  listen: ["Тыңдау", "Слушать"],
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
  level: ["Деңгей", "Уровень"], xp: ["ұпай", "очков"], badges: ["Белгілер", "Значки"],
  dailyGoal: ["Күнделікті мақсат", "Цель на день"], week: ["Осы апта", "Эта неделя"],
  settings: ["Баптаулар", "Настройки"], theme: ["Тақырып", "Тема"], light: ["Ашық", "Светлая"],
  dark: ["Қараңғы", "Тёмная"], system: ["Жүйелік", "Как в системе"], language: ["Тіл", "Язык"],
  resetAll: ["Барлық прогресті өшіру", "Удалить весь прогресс"],
  resetAsk: ["Прогресс, ұпайлар мен белгілер өшеді. Сенімдісіз бе?", "Прогресс, очки и значки будут удалены. Вы уверены?"],
  yesReset: ["Иә, өшіру", "Да, удалить"], cancel: ["Болдырмау", "Отмена"], resetDone: ["Прогресс өшірілді", "Прогресс удалён"],
  savedHere: ["Прогресс осы құрылғыдағы браузерде сақталады.", "Прогресс хранится в браузере на этом устройстве."],
  badgeGot: ["Жаңа белгі", "Новый значок"],
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
  listenLead: ["Қарини таңдап, сүрені толық тыңдаңыз. Басқа беттерге өтсеңіз де, дыбыс тоқтамайды.", "Выберите чтеца и слушайте суры целиком. Звук не прерывается при переходе по сайту."],
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
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
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
const LRECITERS = [
  ["mishary-alafasy/r1", "Мишари Әл-Афаси", "Мишари Аль-Афаси"],
  ["muhammad-minshawi/r3", "Миншауи — үйретуші", "Миншави — обучающее"],
  ["mahmoud-husary/r1", "Махмұд Халил әл-Хусари", "Махмуд Халиль аль-Хусари"],
  ["abdulbasit-abdulsamad/r3", "Абдулбасит Абдуссамад", "Абдул-Басит Абдус-Самад"],
  ["muhammad-minshawi/r1", "Мұхаммед Сыддық әл-Миншауи", "Мухаммад Сиддик аль-Миншави"],
  ["saad-ghamdi/r1", "Сағд әл-Ғамиди", "Саад аль-Гамиди"],
  ["maher-muaiqly/r1", "Махир әл-Мұғайқли", "Махер аль-Муайкли"],
  ["saud-shuraim/r1", "Сағуд әш-Шурайм", "Сауд аш-Шурайм"],
  ["yasser-dosari/r1", "Ясир әд-Дәусари", "Ясир ад-Даусари"],
  ["nasser-qatami/r1", "Насир әл-Қатами", "Насер аль-Катами"],
  ["ahmad-ajmi/r1", "Ахмад әл-Ажми", "Ахмад аль-Аджми"],
  ["muhammad-ayyub/r1", "Мұхаммед Әйюб", "Мухаммад Айюб"],
  ["abdulbasit-abdulsamad/r1", "Абдулбасит — мужәууад", "Абдул-Басит — муджаввад"],
  ["mahmoud-husary/r2", "Хусари — мужәууад", "Хусари — муджаввад"],
];
const recName = id => { const r = LRECITERS.find(x => x[0] === id) || LRECITERS[0]; return S.lang === "ru" ? r[2] : r[1]; };
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
    h("a", { class: "lp-info", href: "#/listen" }, h("b", {}, `${s.n}. ${L(s.name)}`), h("small", {}, recName(S.listen.r))),
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
const NAV = [["#/", "home", "home", 1], ["#/course", "course", "path", 1], ["#/suras", "suras", "quran", 1], ["#/listen", "listen", "headph", 1], ["#/practice", "practice", "target", 1], ["#/ref", "ref", "book", 0]];
const LOGO = `<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><g fill="var(--primary)"><rect x="16" y="16" width="68" height="68" rx="8"/><rect x="16" y="16" width="68" height="68" rx="8" transform="rotate(45 50 50)"/></g><text x="50" y="66" text-anchor="middle" font-family="Iqra Quran, Amiri Quran, serif" font-size="48" fill="var(--primary-ink)">ق</text></svg>`;
function shell() {
  document.body.innerHTML = "";
  const top = h("header", { class: "top" }, h("div", { class: "top-in" },
    h("a", { class: "brand", href: "#/", html: LOGO + `<span><b>Iqra <i class="ar" lang="ar">اقرأ</i></b><small>${esc(T("brandSub"))}</small></span>` }),
    h("nav", { class: "nav", "aria-label": "main" }, NAV.map(([href, k]) => h("a", { href, "data-k": k }, T(k)))),
    h("a", { class: "chip", href: "#/me", id: "topstats", title: T("me") }),
    h("div", { class: "lang", role: "group", "aria-label": T("language") },
      ["kk", "ru"].map(l => h("button", { "aria-pressed": String(S.lang === l), onclick: () => setLang(l) }, l === "kk" ? "ҚАЗ" : "РУС"))),
    h("button", { class: "iconbtn hide-m", title: T("theme"), html: icon(isDark() ? "sun" : "moon"), onclick: toggleTheme }),
    h("a", { class: "iconbtn avatar", href: "#/me", id: "avatar", title: T("me"), html: icon("user") }),
  ));
  const tabbar = h("nav", { class: "tabbar", "aria-label": "main" }, NAV.filter(x => x[3]).map(([href, k, ic]) => h("a", { href, "data-k": k, html: icon(ic) + `<span>${esc(T(k))}</span>` })));
  const main = h("main", { id: "view", tabindex: "-1" });
  const foot = h("footer", { class: "site" }, h("p", {}, T("footer")), h("p", { style: "margin-top:6px" }, T("footer2")));
  document.body.append(top, main, foot, tabbar, toasts);
  document.documentElement.lang = S.lang === "ru" ? "ru" : "kk";
  document.title = S.lang === "ru" ? "Iqra — учимся читать Коран с нуля" : "Iqra — Құранды нөлден оқып үйрену";
  renderTopStats(); renderAvatar(); lpRender();
}
function renderTopStats() {
  const el = $("#topstats"); if (!el) return;
  el.innerHTML = icon("flame") + `<span class="num">${streak()}</span>` + `<span style="opacity:.35">|</span>` + icon("star") + `<span class="num">${S.xp}</span>`;
  el.querySelector("svg").style.color = streak() > 0 ? "var(--gold)" : "var(--muted)";
  el.querySelectorAll("svg")[1].style.color = "var(--gold)";
}
function setLang(l) { S.lang = l; save(); shell(); route(); }
function toggleTheme() { S.theme = isDark() ? "light" : "dark"; save(); applyTheme(); shell(); route(); }
function markNav(k) { $$("[data-k]").forEach(a => { if (a.dataset.k === k) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }

/* ═════════════ маршрутизация ═════════════ */
async function route() {
  stopAudio(); onListenChange = null;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  const view = $("#view");
  const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
  const [p0, p1, p2] = parts;
  view.innerHTML = "";
  window.scrollTo(0, 0);
  try {
    if (!p0) { markNav("home"); await pageHome(view); }
    else if (p0 === "course") { markNav("course"); pageCourse(view); }
    else if (p0 === "lesson") { markNav("course"); await pageLesson(view, +p1); }
    else if (p0 === "ref") { markNav("ref"); pageRef(view, p1, p2); }
    else if (p0 === "suras") { markNav("suras"); pageSuras(view); }
    else if (p0 === "sura") { markNav("suras"); await pageSura(view, +p1, p2 === "hifz", /^\d+$/.test(p2 || "") ? +p2 : 0); }
    else if (p0 === "listen") { markNav("listen"); pageListen(view); }
    else if (p0 === "practice") { markNav("practice"); p1 ? pageTrainer(view, p1) : pagePractice(view); }
    else if (p0 === "me") { markNav("me"); pageMe(view); }
    else notFound(view);
  } catch (e) { console.error(e); notFound(view); }
  view.focus({ preventScroll: true });
}
function notFound(v) { v.append(h("div", { class: "loading" }, h("div", { class: "stack", style: "justify-items:center" }, h("h2", {}, T("notFound")), h("a", { class: "btn", href: "#/" }, T("toHome"))))); }

/* ═════════════ главная ═════════════ */
function nextLessonN() {
  for (const l of COURSE.lessons) if (l.ready && !(S.lessons[l.n] && S.lessons[l.n].done)) return l.n;
  return 1;
}
async function pageHome(v) {
  const started = doneCount() > 0;
  const n = nextLessonN();
  const les = COURSE.lessons[n - 1];
  const hero = h("section", { class: "hero" },
    h("div", { class: "star-wrap", "aria-hidden": "true", html: `<svg class="star-bg" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".6">${[0, 1, 2, 3, 4].map(i => `<rect x="${20 + i * 3}" y="${20 + i * 3}" width="${60 - i * 6}" height="${60 - i * 6}"/><rect x="${20 + i * 3}" y="${20 + i * 3}" width="${60 - i * 6}" height="${60 - i * 6}" transform="rotate(45 50 50)"/>`).join("")}</g></svg>` }),
    h("div", {},
      h("h1", {}, T("heroTitle")),
      h("p", { class: "lead" }, T("heroLead")),
      h("div", { class: "row" },
        h("a", { class: "btn", href: `#/lesson/${n}`, html: esc(started ? T("cont") : T("start")) + icon("arrow") }),
        h("a", { class: "btn ghost", href: "#/course" }, T("seeCourse")))),
    h("div", { class: "hero-art" },
      h("div", { class: "hero-word", lang: "ar" }, "ٱقْرَأْ"),
      h("div", { class: "hero-word-cap" }, T("heroWord"))));
  v.append(hero);

  const goal = S.goal, tx = S.days[today()] || 0;
  const pct = Math.min(1, tx / goal);
  const ring = `<svg class="goal-ring" viewBox="0 0 40 40" style="width:36px;height:36px"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--surface-2)" stroke-width="5"/><circle cx="20" cy="20" r="16" fill="none" stroke="var(--gold)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(100.5 * pct).toFixed(1)} 200" transform="rotate(-90 20 20)"/></svg>`;
  v.append(h("div", { class: "stats" },
    h("a", { class: "stat", href: "#/me", style: "text-decoration:none;color:inherit", html: `<span style="color:${streak() ? "var(--gold)" : "var(--muted)"}">${icon("flame")}</span><div><b>${streak()}</b><span>${esc(T("streak"))}</span></div>` }),
    h("a", { class: "stat", href: "#/me", style: "text-decoration:none;color:inherit", html: `${ring}<div><b>${tx}<span style="font-size:14px;color:var(--muted)"> / ${goal}</span></b><span>${esc(T("todayXp"))}</span></div>` }),
    h("a", { class: "stat", href: "#/course", style: "text-decoration:none;color:inherit", html: `<span style="color:var(--primary)">${icon("path")}</span><div><b>${doneCount()}<span style="font-size:14px;color:var(--muted)"> / 110</span></b><span>${esc(T("lessonsDone"))}</span></div>` })));

  if (les) {
    const M = moduleOf(n);
    v.append(h("section", { class: "section" },
      h("a", { class: "next", href: `#/lesson/${n}`, html: `${rosette(n, "")}<div><small>${esc(T("nextLesson"))} · ${esc(T("module"))} ${M.id}</small><b>${esc(L(les.title))}</b></div><span class="go">${icon("arrow")}</span>` })));
    $(".next .ros", v).style.color = "var(--primary-ink)";
    $(".next .ros .rn", v).style.color = "var(--primary)";
  }

  const lastS = S.last && suraBy(S.last.s);
  v.append(h("section", { class: "section quick" },
    h("a", { class: "qcard", href: lastS ? `#/sura/${lastS.n}/${S.last.a}` : "#/suras", html: `<span class="qi">${icon("quran")}</span><div><b>${esc(lastS ? T("contRead") : T("suras"))}</b><small>${esc(lastS ? `${L(lastS.name)} · ${S.last.a} ${T("ayahN")}` : (S.lang === "ru" ? "114 сур с переводом" : "114 сүре, аудармасымен"))}</small></div>` }),
    h("a", { class: "qcard", href: "#/listen", html: `<span class="qi">${icon("headph")}</span><div><b>${esc(T("listen"))}</b><small>${esc(S.lang === "ru" ? "12 известных чтецов" : "12 танымал қари")}</small></div>` }),
    h("a", { class: "qcard", href: "#/ref", html: `<span class="qi">${icon("book")}</span><div><b>${esc(T("ref"))}</b><small>${esc(S.lang === "ru" ? "Алфавит, таджвид, махрадж" : "Әліпби, тәжуид, махраж")}</small></div>` })));

  const mods = h("div", { class: "mods" });
  for (const M of COURSE.modules) {
    let d = 0, tot = M.to - M.from + 1;
    for (let i = M.from; i <= M.to; i++) if (S.lessons[i] && S.lessons[i].done) d++;
    mods.append(h("a", { class: "mod", href: `#/course#m${M.id}`, html:
      `<div><h3>${esc(T("module"))} ${M.id}. ${esc(L(M.title))}</h3></div><span class="mar">${M.ar}</span>
       <p>${esc(L(M.desc))}</p><div class="bar"><i style="width:${(d / tot * 100).toFixed(0)}%"></i></div>
       <div class="meta"><span>${esc(T("lesson"))} ${M.from}–${M.to}</span><span class="num">${d} / ${tot}</span></div>` }));
  }
  v.append(h("section", { class: "section" }, h("div", { class: "section-h" }, h("h2", {}, T("modules")), h("a", { href: "#/course" }, T("seeCourse"))), mods));

  v.append(h("section", { class: "section" }, h("div", { class: "section-h" }, h("h2", {}, T("how"))),
    h("div", { class: "steps" }, [1, 2, 3].map(i => h("div", { class: "step", html: `<b><i>${i}</i>${esc(T("how" + i + "t"))}</b><p>${esc(T("how" + i))}</p>` })))));
}

/* ═════════════ карта курса ═════════════ */
function pageCourse(v) {
  v.append(h("div", { class: "read" },
    h("h1", {}, T("course")),
    h("p", { class: "muted", style: "margin-top:8px" }, T("wordsLearned"))));
  const cur = nextLessonN();
  for (const M of COURSE.modules) {
    const sec = h("section", { class: "path-mod read", id: "m" + M.id });
    sec.append(h("header", {}, h("span", { class: "mar" }, M.ar),
      h("div", {}, h("h2", {}, `${T("module")} ${M.id}. ${L(M.title)}`), h("p", { class: "muted small" }, L(M.result)))));
    const ul = h("ol", { class: "path" });
    for (let n = M.from; n <= M.to; n++) {
      const les = COURSE.lessons[n - 1];
      const done = S.lessons[n] && S.lessons[n].done;
      const cls = done ? "done" : (n === cur ? "cur" : "");
      const sub = done ? T("doneL") : (!les.ready ? T("soon") : (n === cur ? T("nextLesson") : ""));
      ul.append(h("li", {}, h("a", { href: les.ready ? `#/lesson/${n}` : null, "aria-disabled": les.ready ? null : "true",
        html: `${rosette(n, cls)}<div class="lt"><b>${mdInline(les.title)}</b>${sub ? `<span>${esc(sub)}</span>` : ""}</div>` })));
    }
    sec.append(ul);
    v.append(sec);
  }
  const target = location.hash.split("#")[2];
  if (target) setTimeout(() => { const el = document.getElementById(target); if (el) el.scrollIntoView({ block: "start" }); }, 30);
}

/* ═════════════ урок ═════════════ */
async function pageLesson(v, n) {
  const meta = COURSE.lessons[n - 1];
  if (!meta || !meta.ready) return notFound(v);
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
  return h("div", { class: "legend", html: keys.map(k => `<span><i style="background:${CORE.rules[k].c}"></i>${esc(L(CORE.rules[k].name))}</span>`).join("") });
}
function ruleCards(keys) {
  const wrap = h("div", { class: "rules" });
  for (const k of keys || Object.keys(CORE.rules)) {
    const r = CORE.rules[k];
    const ex = CORE.quiz.filter(q => q.r === k).slice(0, 2);
    wrap.append(h("div", { class: "rcard", html: `<h4><i style="background:${r.c}"></i>${esc(L(r.name))}</h4><p>${esc(L(r.short))}</p>${ex.map(e => `<div class="ex-ar">${spansHTML(e.sp)}</div>`).join("")}` }));
  }
  return wrap;
}

/* ───── махрадж ───── */
const MK = { jawf: [250, 128, 1], halq_far: [344, 232, 2], halq_mid: [340, 202, 3], halq_near: [330, 172, 4],
  aqsa_lisan_q: [298, 152, 5], aqsa_lisan_k: [266, 146, 6], wasat: [228, 142, 7], hafa: [196, 130, 8], lam: [160, 134, 9],
  nun: [130, 136, 10], ra: [146, 116, 11], nitaa: [122, 118, 12], safir: [112, 154, 13], lith: [102, 130, 14],
  shafa_f: [88, 152, 15], shafa_b: [78, 174, 16], khayshum: [150, 82, 17] };
const MK_LETTERS = { jawf: "ا و ي", halq_far: "ء ه", halq_mid: "ع ح", halq_near: "غ خ", aqsa_lisan_q: "ق", aqsa_lisan_k: "ك", wasat: "ج ش ي",
  hafa: "ض", lam: "ل", nun: "ن", ra: "ر", nitaa: "ط د ت", safir: "ص س ز", lith: "ظ ذ ث", shafa_f: "ف", shafa_b: "ب م و", khayshum: "ن م" };
function makhrajEl(keys = []) {
  const hl = new Set(keys);
  const lab = (x, y, s) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Onest,sans-serif" font-size="9" fill="var(--muted)">${esc(s)}</text>`;
  const tr = S.lang === "ru" ? { nose: "носовая полость", pal: "твёрдое нёбо", soft: "мягкое нёбо", tongue: "язык", teeth: "зубы", lips: "губы", throat: "горло", lar: "гортань" }
    : { nose: "мұрын қуысы", pal: "қатты таңдай", soft: "жұмсақ таңдай", tongue: "тіл", teeth: "тіс", lips: "ерін", throat: "көмей", lar: "кеңірдек" };
  let marks = "";
  for (const [k, [x, y, n]] of Object.entries(MK)) {
    const on = hl.has(k);
    marks += `<circle cx="${x}" cy="${y}" r="${on ? 10 : 7.5}" fill="${on ? "var(--mk-hl)" : "var(--surface)"}" stroke="${on ? "var(--mk-hl)" : "var(--muted)"}" stroke-width="1.3"/><text x="${x}" y="${y + 3.3}" text-anchor="middle" font-family="Onest,sans-serif" font-size="${on ? 9 : 8}" font-weight="700" fill="${on ? "#fff" : "var(--muted)"}">${n}</text>`;
  }
  const svg = `<svg viewBox="0 0 420 300" role="img" aria-label="${esc(T("makhraj"))}">
  <path d="M250,16 C150,16 74,62 62,110 C56,134 70,140 70,146 C70,152 58,156 60,164 C62,172 76,170 78,176 C80,184 70,190 76,198 C82,206 96,202 100,208 C104,216 100,232 112,240 C128,250 176,252 212,250 L212,288 L300,288 L300,228 C330,216 352,186 356,150 C362,98 330,16 250,16 Z" fill="var(--mk-skin)" stroke="var(--mk-skin-line)" stroke-width="1.6"/>
  <path d="M96,96 C130,78 188,74 232,82 C248,85 258,92 262,100 C240,104 190,106 150,104 C126,103 106,100 96,96 Z" fill="var(--mk-cavity)" stroke="var(--mk-skin-line)" stroke-width="1.2"/>
  ${lab(168, 95, tr.nose)}
  <path d="M100,122 C140,116 200,114 252,120" fill="none" stroke="var(--mk-skin-line)" stroke-width="2.4"/>
  <path d="M252,120 C278,124 300,134 312,152" fill="none" stroke="var(--mk-skin-line)" stroke-width="2.4" stroke-dasharray="4 2.5"/>
  ${lab(196, 112, tr.pal)}${lab(300, 134, tr.soft)}
  <path d="M100,126 C150,122 210,122 256,128 C290,136 306,154 310,168 C300,182 250,190 196,186 C150,182 116,170 104,156 Z" fill="var(--mk-cavity)"/>
  <path d="M104,160 C130,146 170,140 208,142 C248,144 282,152 306,170 C296,196 256,208 206,206 C158,204 118,188 104,170 Z" fill="var(--mk-tongue)" stroke="var(--mk-tongue-line)" stroke-width="1.3"/>
  <text x="212" y="182" text-anchor="middle" font-family="Onest,sans-serif" font-size="10" fill="var(--ink)" opacity=".7">${esc(tr.tongue)}</text>
  <rect x="98" y="120" width="9" height="13" rx="1.6" fill="var(--mk-bone)" stroke="var(--mk-skin-line)"/>
  <rect x="98" y="150" width="9" height="13" rx="1.6" fill="var(--mk-bone)" stroke="var(--mk-skin-line)"/>
  ${lab(84, 114, tr.teeth)}
  <path d="M80,132 C70,138 70,146 80,150" fill="none" stroke="var(--mk-tongue-line)" stroke-width="3.4" stroke-linecap="round"/>
  <path d="M80,160 C70,164 70,172 82,176" fill="none" stroke="var(--mk-tongue-line)" stroke-width="3.4" stroke-linecap="round"/>
  ${lab(60, 196, tr.lips)}
  <path d="M316,152 C326,180 326,214 318,246" fill="none" stroke="var(--mk-skin-line)" stroke-width="2.2"/>
  <path d="M340,146 C352,182 350,220 340,252" fill="none" stroke="var(--mk-skin-line)" stroke-width="2.2"/>
  ${lab(386, 200, tr.throat)}
  <ellipse cx="330" cy="262" rx="15" ry="11" fill="var(--mk-cavity)" stroke="var(--mk-skin-line)" stroke-width="1.4"/>
  ${lab(330, 284, tr.lar)}
  ${marks}</svg>`;
  const leg = Object.entries(MK).map(([k, [, , n]]) => `<div class="${hl.has(k) ? "on" : ""}"><i>${n}</i><span>${esc(L(CORE.makhraj[k].name))}</span><span class="ar">${MK_LETTERS[k]}</span></div>`);
  const show = keys.length ? leg.filter((_, i) => hl.has(Object.keys(MK)[i])) : leg;
  const el = h("div", { class: "mk", html: svg + `<div class="mk-leg">${show.join("")}</div>` });
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
const spansHTML = sp => sp.map(([t, r]) => r ? `<span class="tj" style="color:${CORE.rules[r].c}">${esc(t)}</span>` : esc(t)).join("");
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
    const html = w.map(([t, r]) => r ? `<span class="tj" style="color:${CORE.rules[r].c}">${esc(t)}</span>` : esc(t)).join("");
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
  v.append(h("h1", {}, T("suras")), h("p", { class: "muted", style: "margin:8px 0 16px" }, T("quranLead")));
  const ls = S.last && suraBy(S.last.s);
  if (ls) v.append(h("a", { class: "next", style: "margin-bottom:16px", href: `#/sura/${ls.n}/${S.last.a}`, html: `${rosette(ls.n)}<div><small>${esc(T("contRead"))}</small><b>${esc(L(ls.name))} · ${S.last.a} ${esc(T("ayahN"))}</b></div><span class="go">${icon("arrow")}</span>` }));
  if (ls) { $(".next .ros", v).style.color = "var(--primary-ink)"; $(".next .ros .rn", v).style.color = "var(--primary)"; }
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
      $(".rl", meta).innerHTML = hifz ? "" : a.r.map(r => `<span style="color:${CORE.rules[r].c}">${esc(L(CORE.rules[r].name))}</span>`).join("");
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
  v.append(wrap);
  if (goto && cards[goto - 1]) { idx = goto - 1; setTimeout(() => cards[goto - 1].scrollIntoView({ block: "center" }), 60); cards[goto - 1].classList.add("flash"); }
}

/* ═════════════ слушать ═════════════ */
function pageListen(v) {
  v.append(h("h1", {}, T("listen")), h("p", { class: "muted", style: "margin:8px 0 16px" }, T("listenLead")));
  const recs = h("div", { class: "recs", role: "radiogroup", "aria-label": T("reciters") });
  const drawRecs = () => {
    recs.innerHTML = "";
    LRECITERS.forEach(([id, kk, ru]) => {
      const on = S.listen.r === id;
      const b = h("button", { class: "rec-c", role: "radio", "aria-checked": String(on), html: `<span class="rav">${esc((S.lang === "ru" ? ru : kk).replace(/^(Мишари|Мұхаммед|Мухаммад|Махмұд|Махмуд|Сағд|Саад|Сағуд|Сауд|Ясир|Насир|Насер|Ахмад)\s+/, "").replace(/^(Әл-|Аль-|әл-|аль-|ад-|аш-|әд-|әш-)/, "").slice(0, 1))}</span><b>${esc(S.lang === "ru" ? ru : kk)}</b>` });
      b.onclick = () => { S.listen.r = id; save(); drawRecs(); if (LP && LP.a.src) listenPlay(S.listen.s, id); };
      recs.append(b);
    });
  };
  drawRecs();
  v.append(h("h2", { style: "margin-bottom:10px" }, T("reciters")), recs);
  const g = h("div", { class: "slist" });
  const href = () => null;
  const fill = (q, m) => {
    suraFilter(g, q, m, href);
    $$("a.sitem", g).forEach((a, i) => {
      const n = +a.querySelector(".rn").textContent;
      a.removeAttribute("href"); a.setAttribute("role", "button"); a.tabIndex = 0;
      const playing = LP && LP.a.src && !LP.a.paused && S.listen.s === n;
      a.classList.toggle("now", S.listen.s === n && !!(LP && LP.a.src));
      a.insertAdjacentHTML("beforeend", `<span class="lplay">${icon(playing ? "pause" : "play")}</span>`);
      a.onclick = () => { if (LP && LP.a.src && S.listen.s === n) { LP.a.paused ? LP.a.play() : LP.a.pause(); } else listenPlay(n); };
      a.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); a.click(); } };
    });
  };
  let lastQ = "", lastM = "all";
  v.append(h("h2", { style: "margin:24px 0 10px" }, T("suras")), suraSearch((q, m) => { lastQ = q; lastM = m; fill(q, m); }), g);
  fill("", "all");
  onListenChange = () => fill(lastQ, lastM);
}

/* ═════════════ справочник ═════════════ */
function pageRef(v, sec, arg) {
  if (sec === "letter" && arg) return pageLetter(v, arg);
  sec = sec || "alphabet";
  const tabs = h("div", { class: "tabs" }, [["alphabet", "alphabet"], ["tajweed", "tajweed"], ["makhraj", "makhraj"]].map(([k, t]) =>
    h("a", { class: "tog", href: `#/ref/${k}`, "aria-pressed": String(sec === k), style: "display:inline-flex;align-items:center;text-decoration:none" }, T(t))));
  v.append(h("h1", {}, T("ref")), h("div", { style: "height:14px" }), tabs);
  if (sec === "alphabet") {
    const g = h("div", { class: "agrid" });
    CORE.letters.forEach(x => { const [nm] = nameParts(L(x.name)); g.append(h("a", { class: "alt", href: `#/ref/letter/${encodeURIComponent(x.ar)}`, html: `<span class="g" lang="ar">${x.ar}</span><span class="n">${esc(nm)}</span><span class="s">${esc(L(x.sound))}</span>` })); });
    v.append(h("p", { class: "muted small", style: "margin-bottom:12px" }, S.lang === "ru" ? "Нажмите на букву: название, звук, махрадж, примеры и озвучка." : "Әріпті басыңыз: аты, дыбысы, махражы, мысалдар және дыбыстау."), g);
  } else if (sec === "tajweed") {
    v.append(ruleCards());
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
  v.append(h("h1", {}, T("trainers")), h("p", { class: "muted", style: "margin:8px 0 18px" }, S.lang === "ru" ? "Короткие сессии по 10 вопросов. Каждый верный ответ — +2 очка." : "10 сұрақтан тұратын қысқа жаттығулар. Әр дұрыс жауап — +2 ұпай."));
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
function pageMe(v) {
  const lv = levelOf(S.xp), [lo, hi] = levelBounds(lv);
  const wrap = h("div", { class: "read stack" });
  wrap.append(h("h1", {}, T("me")));
  wrap.append(accountPanel());
  wrap.append(h("div", { class: "panel stack" },
    h("div", { class: "row", style: "justify-content:space-between" },
      h("div", { html: `<b style="font-size:22px">${esc(T("level"))} ${lv}</b><div class="muted small">${S.xp} ${esc(T("xp"))}</div>` }),
      h("div", { class: "row", html: `<span class="pill gold">${icon("flame")} ${streak()} ${esc(T("streak"))}</span><span class="pill primary">${doneCount()} / 110</span>` })),
    h("div", { class: "bar gold" }, h("i", { style: `width:${((S.xp - lo) / (hi - lo) * 100).toFixed(0)}%` }))));
  // неделя
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
  wrap.append(h("div", { class: "panel stack" }, h("h3", {}, T("week")), wk, h("h3", {}, T("dailyGoal")), goalSeg));
  // значки
  const bg = h("div", { class: "badges" });
  BADGES.forEach(([id, glyph, name, desc]) => bg.append(h("div", { class: "badge" + (S.badges[id] ? " on" : ""), html: `${rosette(glyph)}<b>${esc(L({ kk: name[0], ru: name[1] }))}</b><span>${esc(L({ kk: desc[0], ru: desc[1] }))}</span>` })));
  wrap.append(h("h2", { style: "margin-top:10px" }, T("badges")), bg);
  // настройки
  const themeSeg = h("div", { class: "seg" }, [[null, "system"], ["light", "light"], ["dark", "dark"]].map(([th, k]) => h("button", { "aria-pressed": String(S.theme === th), onclick: () => { S.theme = th; save(); applyTheme(); shell(); route(); } }, T(k))));
  const langSeg = h("div", { class: "seg" }, [["kk", "Қазақша"], ["ru", "Русский"]].map(([l, t]) => h("button", { "aria-pressed": String(S.lang === l), onclick: () => setLang(l) }, t)));
  const confirmBox = h("div", { class: "box warn", hidden: true }, h("p", {}, T("resetAsk")),
    h("div", { class: "row", style: "margin-top:10px" }, h("button", { class: "btn", style: "background:var(--bad);color:#fff", onclick: () => { const keep = { lang: S.lang, theme: S.theme }; S = Object.assign(blank(), keep); save(); toast(T("resetDone")); shell(); route(); } }, T("yesReset")),
      h("button", { class: "btn ghost", onclick: () => confirmBox.hidden = true }, T("cancel"))));
  wrap.append(h("div", { class: "panel stack" }, h("h3", {}, T("settings")),
    h("div", { class: "row", style: "justify-content:space-between" }, h("span", {}, T("language")), langSeg),
    h("div", { class: "row", style: "justify-content:space-between" }, h("span", {}, T("theme")), themeSeg),
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
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (!S.theme) { shell(); route(); } });
  route();
  checkBadges();
  initAuth();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
}
boot();
})();
