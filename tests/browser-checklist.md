# Browser regression checklist

Run a local static server, e.g. `python3 -m http.server 8765`, from the repository. Use a new guest browser profile; never clear a learner's existing progress for testing.

- Lesson 1: finish disabled initially; answer one question; reload; 25% and completed-card status remain. Complete the other three; finish enables and awards completion once.
- Reopen a previously completed lesson: its completion remains. Tracing and control tests count toward the displayed total without exceeding 100%.
- Placement: double click “Не знаю” and answer choices; question 1 must advance to 2 only. Complete the first section normally and check the result count. Leave before transition; no delayed action/audio on another page.
- Sura 112 hifz: mark/unmark/re-mark and reload. The mark is reversible; the same verse and full-sura bonus never award XP twice. Previously saved marks survive the update.
- Sura words: focus using Tab and activate with Enter and Space; verify audio/meaning and visible focus. Hidden words must have action labels rather than reveal the answer in their label.
- Zikr: enter/leave a counter several times; on the list, arrows must not change the URL. In the active counter arrows still navigate.
- Navigate quickly from a loading tajweed/sura/lesson page to another page; late data must not mix with the current page or steal focus.
- Offline: save a short sura, verify actual playback after disabling network and reloading, with the same language/reader. Fail one audio request: no “saved” state. Change reader/language: old copy must not be advertised as the new selection. Old cached copies may be revalidated by downloading again.
- Prayer times: official API success has official source; simulate API failure and verify calculated-source notice. Missing coordinates must show an unavailable state, never a schedule calculated from null.
- TR lesson/course: clearly show the available material languages and working RU/KK buttons. Turkish lesson translations are still pending; do not mark them as completed.
- Check mobile widths 320/390 and desktop 1280; light/dark, reader player, bookmarks, namaz and course navigation. No console errors.
- Update a previously installed PWA: app.js/app.css and service worker all use version 22; missing offline JSON must fail as data, never return index.html.


## Резервная копия прогресса

- В отдельном тестовом профиле скачать JSON с уроками, очками, закладками и расписанием повторений. Проверить файл.
- В другом тестовом профиле выбрать копию: до «Заменить прогресс» данные не меняются. Проверить отмену.
- Подтвердить замену, перезагрузить страницу, проверить уроки, очки и закладки. «Вернуть предыдущий прогресс» открывает предварительный просмотр прежней копии.
- Повторный импорт не добавляет очки. Повреждённый JSON, чужой формат, новая неподдерживаемая версия и файл больше 2 МБ показывают ошибку без замены.
- На 320/390 пикселях проверить сравнение данных, кнопки, RU/KK/TR и светлую/тёмную тему.


## Панель чтения

- Проверить размер 80–160%, перевод, транскрипцию, цвета и легенду; выключение/включение возвращает прежние цвета.
- Диапазон 2–3 прослушивает только выбранные аяты. Неверный диапазон блокирует запуск; повтор каждого аята и диапазона целиком имеют разный порядок.
- Остановка, смена чтеца и уход на другую страницу отменяют очередь. Офлайн-статус соответствует выбранному чтецу и языку.
- Возврат к последнему аяту не прячет его за закреплённой панелью.
- В заучивании скрыты и цветные части слов. Нажатие открывает подсказку, самопроверка показывает текст, повторная отметка не добавляет XP. Сохранение прогресса поддерживает даты отметок заучивания.


## Работа над ошибками

- В уроке 1 дважды выбрать неверный ответ, затем исправить: одна ошибочная попытка, чистых ответов0/2. Проверить сохранение после перезагрузки.
- Открыть объяснение: отображается Разбор независимо от сохранённого шага.
- Пройти короткую тренировку дважды:1/2, затем Закреплено2/2. Новая ошибка возвращает задание на повторение.
- Проверить ошибки проверки урока и девяти тренажёров, новый вопрос той же темы и отсутствие повторной награды в работе над ошибками.
- Проверить вкладки, пустое состояние, профиль, карточку главной и практики, ручной переход к следующему вопросу.
- Резервная копия сохраняет список и счётчики, старые копии дают пустой список. Недопустимые ссылки и вложенный HTML отклоняются.
- Проверить320/390/1280, светлую/тёмную тему иRU/KK/TR; уйти из незавершённой тренировки и убедиться в отсутствии позднего перехода.


## Оформление и выборочная группировка (v31)

- Главная: следующий урок, открытый прогресс, четыре этапа курса и три перехода. Проверить новичка, продолжающего и завершившего курс.
- Практика: все девять тренировок доступны сразу без аккордеонов; визуальные образцы помещаются в карточки. Повторение показывает реальные задания.
- Намаз: восстановлены прежний экран, иллюстрации, выбор пола, пять намазов и тексты.
- Профиль: награды и неделя видны сразу; настройки, копия и подтверждение удаления работают как прежде.
- Проверить320/390/1280,RU/KK/TR, обе темы, отсутствие горизонтальной прокрутки, переходы из новых блоков, реальные ответы и восстановление прогресса.

## Шлифовка оформления (v32)

- На 390 пикселях вход в практику должен быть виден целиком на первом экране; при 320 пикселях не должно быть горизонтальной прокрутки и обрезанных кнопок.
- Проверить примеры: одна точка снизу у ба, две и три сверху у та/са; соединённые формы; отдельные буквы к, т, б и соединённое слово. Нажатие примера открывает соответствующий тренажёр.
- Проверить RU/KK/TR, обе темы, обычный компьютерный вид и сохранность прежнего оформления намаза.
