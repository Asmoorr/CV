# Tasks

## 1. Контент и раннее состояние входа

- [x] 1.1 Расширить схему локализованного контента строками overlay и footer-reset для RU/EN.
- [x] 1.2 Добавить namespaced session-ключ, inline fail-open bootstrap и data-атрибуты entry-состояния в locale layout.
- [x] 1.3 Подключить overlay к page shell так, чтобы server-rendered сайт оставался в DOM и загружался за ним, но при pending не принимал focus, pointer или scroll.

## 2. Entry-overlay и переход в Hero

- [x] 2.1 Реализовать доступный client-компонент overlay со состояниями loading/ready/opening/entered, локализованной кнопкой `ENTER`, focus management и защитным timeout.
- [x] 2.2 Оформить fullscreen-сцену, контурную кнопку со скошенным углом и круговой marker в существующих токенах проекта.
- [x] 2.3 Связать phase кнопки с раскрытием Hero через общий CSS transition без layout shift, снять scroll-lock только после завершения transition/fallback и не менять `SmoothWheelScroll`.
- [x] 2.4 Добавить reduced-motion ветку, в которой overlay остаётся функциональным, а масштаб/морфинг/stagger заменяются краткой opacity-сменой.

## 3. Session-флаг и footer reset

- [x] 3.1 Записывать session-флаг после успешного входа и пропускать overlay при reload, внутренних переходах и смене локали, сохраняя повторный вход в новой вкладке.
- [x] 3.2 Добавить малозаметную локализованную footer-кнопку очистки флага и live-region результата без сброса текущей страницы.
- [x] 3.3 Обработать исключения `sessionStorage` при чтении, записи и очистке с fail-open поведением.

## 4. Проверки и визуальная регрессия

- [ ] 4.1 Добавить Vitest-проверки server-rendered markup для overlay-контента, footer reset, локализации и сохранения существующих footer-данных.
- [ ] 4.2 Добавить Playwright-сценарии первого входа, блокировки underlying shell, перехода `ENTER → Hero`, reload/locale/new-tab, reset и no-JS fallback; проверить обе локали и доступность focus-visible.
- [ ] 4.3 Добавить отдельные visual snapshots entry-overlay и открытого Hero на desktop/tablet/mobile, затем осознанно обновить эталоны и просмотреть actual images.
- [x] 4.4 Запустить `npm run typecheck`, `npm run lint` и production `npm run build`; все три проверки проходят.
- [ ] 4.5 Запустить `npm test` и `npm run test:visual`, а после добавления сценариев проверить отсутствие горизонтального overflow, звука и регрессий smooth-scroll.
