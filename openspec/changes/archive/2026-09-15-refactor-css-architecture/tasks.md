## 1. Локализация и стратегия рендеринга

- [x] 1.1 Выделить лёгкий readonly locale registry, от которого выводятся `Locale`, `locales` и `isLocale`, не связывая клиентские импорты со всем RU/EN-контентом; проверить `npm run typecheck` и поиском отсутствие независимых массивов `ru`/`en` в исходном коде.
- [x] 1.2 Перенести locale-aware root layout в `src/app/[locale]/layout.tsx`, устанавливать `<html lang>` из проверенного route param и разместить `generateStaticParams` на локализованном сегменте; проверить production build output для `/ru` и `/en`.
- [x] 1.3 Удалить `x-resume-locale` и вызов `headers()`, затем удалить `proxy` либо оставить его только с самостоятельной ответственностью за redirect; проверить поиском отсутствие header bridge и работоспособность `/`, `/ru`, `/en` и неизвестной локали в production-сборке.
- [x] 1.4 Перевести `Header` и замену locale segment на общий registry без собственного массива языков и regex-перечня, сохранив текущий URL и hash при переключении; проверить `npm run typecheck`, `npm run lint` и существующий визуальный тест.

## 2. Границы Server и Client Components

- [x] 2.1 Проаудировать импорты от `src/app/[locale]` до секций и подтвердить, что page composition, metadata и контентные секции остаются Server Components; проверить поиском, что `use client` присутствует только у владельцев state, event handlers или browser APIs.
- [x] 2.2 Отделить общие locale-типы, константы и чистые функции от server-only content aggregation, чтобы Client Components не импортировали RU/EN-словари; проверить production build и состав импортов `Header`.
- [x] 2.3 Оценить разделение `Header` на серверную оболочку и клиентский контрол, применить его только при уменьшении client module graph без изменения DOM; проверить итоговую границу сборкой и неизменными visual snapshots.

## 3. CSS foundation

- [x] 3.1 Создать `src/styles/tokens.css`, `base.css` и `layout.css`, перенести в них существующие токены, document defaults и общие `.container`/`.section` без изменения вычисленных значений; проверить структуру файлов и выполнить `npm run build`.
- [x] 3.2 Превратить `src/app/globals.css` в точку импорта foundation-файлов и убедиться поиском по коду, что в нём не осталось селекторов конкретных компонентов; выполнить `npm run lint`.
- [x] 3.3 Выделить повторяющиеся значения с общей ролью в именованные custom properties, не токенизируя локальную геометрию компонентов; проверить поиском отсутствие заменённых магических значений и выполнить `npm run test:visual` без обновления snapshots.

## 4. Общие UI-примитивы и простые секции

- [x] 4.1 Перенести стили `SectionHeading` и `TagList` в одноимённые CSS Modules и подключить локальные классы в компонентах; проверить `npm run typecheck` и `npm run lint`.
- [x] 4.2 Определить владельца `skip-link` и общего визуального `status`, выделив модуль или задокументированную общую роль без изменения DOM-семантики; проверить все места использования поиском и выполнить `npm run build`.
- [x] 4.3 Перенести стили `About` и `Footer` вместе с их responsive-правилами в локальные модули; проверить отсутствие их прежних селекторов в глобальном слое и выполнить `npm run test:visual` без обновления snapshots.

## 5. Основные контентные секции

- [x] 5.1 Перенести базовые, дочерние и responsive-стили `Timeline` в `Timeline.module.css`, сохранив геометрию rail, маркеров и записей; проверить `npm run typecheck`, `npm run lint` и существующие visual snapshots.
- [x] 5.2 Перенести базовые и responsive-стили `Projects` в `Projects.module.css`, включая featured-вариант и декоративные псевдоэлементы; проверить desktop, tablet и mobile через `npm run test:visual` без обновления snapshots.
- [x] 5.3 Перенести базовые и responsive-стили `Skills` в `Skills.module.css`; проверить отсутствие глобальных `.skills-*`/`.core-*` селекторов и выполнить `npm run test:visual` без обновления snapshots.
- [x] 5.4 Перенести базовые и responsive-стили `Contact` в `Contact.module.css`, сохранив общий status-примитив и сетку ссылок; проверить рабочую production-сборку и существующие visual snapshots.

## 6. Интерактивные и декоративные компоненты

- [x] 6.1 Перенести стили `Header` в `Header.module.css`, заменить глобальное `.is-open` локальным state-классом и сохранить текущие desktop/mobile-состояния; проверить переключение классов в коде, `npm run typecheck` и `npm run test:visual`.
- [x] 6.2 Перенести стили `Hero` и `HeroField` в модули владельцев, сохранив stacking context, canvas-слой, орбиты, анимацию и responsive-композицию; проверить production build и неизменность всех snapshots.
- [x] 6.3 Заменить `Math.random()` в `HeroField` локальной детерминированной генерацией начальных точек и гарантировать одинаковый reduced-motion кадр для одинакового viewport; проверить повторными запусками существующих visual snapshots без их обновления.
- [x] 6.4 Ограничить animation loop `HeroField` периодами видимости и необходимости движения с корректной очисткой observers/listeners/frames; проверить код путей запуска и остановки, `npm run lint` и визуальную эквивалентность.
- [x] 6.5 Перенести стили `FinePointerCursor` в модуль с единственным явно ограниченным `:global(.has-fine-cursor)` bridge и запускать кадры только после движения до достижения покоя; проверить отсутствие постоянного idle-loop ревью кода и выполнить `npm run lint`.
- [x] 6.6 Перенести оставшиеся стили page shell и убедиться поиском, что JSX компонентов больше не ссылается на мигрированные глобальные class names; выполнить `npm run typecheck`.

## 7. Финальная проверка архитектуры и регрессий

- [x] 7.1 Проверить locale architecture: один registry обслуживает static params, content lookup и language switch, root layout не использует request-time API, а клиентский graph не включает полные словари; зафиксировать результат ревью в итоговом описании реализации.
- [x] 7.2 Проверить структуру CSS: `globals.css` только импортирует foundation, `src/styles` не содержит компонентных селекторов, а каждый компонент владеет базовыми, state- и responsive-правилами; зафиксировать результат ревью в итоговом описании реализации.
- [x] 7.3 Выполнить `npm run typecheck`, `npm run lint`, `npm test` и `npm run build`; исправить только ошибки реализации, не изменяя тестовые файлы.
- [x] 7.4 Выполнить `npm run test:visual` на существующих RU/EN desktop, tablet и mobile эталонах; считать задачу завершённой только при отсутствии diff и не запускать обновление snapshots.
- [x] 7.5 Проверить итоговый diff и подтвердить, что `tests/content.test.ts`, каталог `tests/visual`, Playwright-конфигурация, PNG-эталоны, контент, публичные URL и зависимости не изменены.

