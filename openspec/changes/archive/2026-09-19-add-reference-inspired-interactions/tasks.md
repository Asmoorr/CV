## 1. Контентный и motion-фундамент

- [x] 1.1 Расширить `src/content/schema.ts` и RU/EN-модули локализованными строками для входа, loader, scroll-подсказки, frontend-only формы, сообщения о будущей отправке, session-reset и GO UP; удалить `footer.signature` и проверить `npm test -- tests/content.test.ts tests/components.test.tsx`.
- [x] 1.2 Добавить в `tokens.css` общие duration/easing/layer-токены для entry/reveal и приглушённый opacity-токен marquee, согласовать их с `--motion-fast` и проверить, что `npm run lint` не сообщает нарушений.
- [x] 1.3 Подготовить общие progressive-enhancement и reduced-motion правила в базовых стилях так, чтобы SSR/no-JS контент оставался видимым; проверить no-JS сценарием Playwright для `/ru` и `/en`.

## 2. Входной экран и раскрытие Hero

- [x] 2.1 Реализовать клиентский `SiteEntry` со состояниями loading/ready/exiting/entered, `document.fonts.ready`, защитным таймаутом и флагом в `sessionStorage`; проверить первый вход, перезагрузку вкладки, смену локали, новую вкладку и fail-open при ошибке storage.
- [x] 2.2 Сверстать полноэкранный слой в палитре проекта с фигурной кнопкой `ENTER`, круговым pointer-акцентом, keyboard focus и адаптивными размерами; проверить отдельными визуальными снимками desktop/mobile для ready-состояния.
- [x] 2.3 Интегрировать `SiteEntry` в локализованную страницу, управлять scroll lock и переносом фокуса после входа без скрытия SSR-разметки; проверить Playwright-сценариями mouse, touch/viewport, Enter/Space и восстановление прокрутки.
- [x] 2.4 Связать завершение входа с последовательным раскрытием greeting, имени, роли, summary, CTA и meta Hero без layout shift; проверить измерением стабильности bounding boxes и reduced-motion сценарием.
- [x] 2.5 Перестроить переключатель языка в два равных сегмента с общими padding/центровкой и hover/focus без изменения layout-свойств; проверить равенство bounding boxes RU/EN и visual snapshots normal/hover/focus.

## 3. Scroll Down и reveal-система

- [x] 3.1 Добавить в Hero локализованную marquee-дорожку из двух одинаковых групп с пятью чередующимися заливными/контурными `Scroll Down`-элементами, статичной доступной подсказкой и пониженной непрозрачностью; проверить бесшовность, визуальный приоритет Hero, `aria`-контракт и отсутствие горизонтального overflow на 320, 768 и 1440 px.
- [x] 3.2 Реализовать один переиспользуемый IntersectionObserver-контроллер для одноразового раскрытия заголовков и крупных контентных групп, активирующий скрытое начальное состояние только после гидратации; проверить, что без JavaScript элементы видимы.
- [x] 3.3 Подключить reveal-маркеры к About, Timeline, Projects, Skills и Contact, сохранив предметную анимацию Timeline и естественный DOM-порядок; проверить прокруткой Playwright, что каждый элемент раскрывается один раз.
- [x] 3.4 Согласовать marquee/reveal с `SmoothWheelScroll`, `FinePointerCursor` и изменением `improve-scroll-and-language-switch`, исключив новые wheel/touch listeners и конфликтующие transforms; проверить wheel, тачпадоподобные малые delta и быструю смену направления в браузерных тестах.

## 4. Frontend контактной формы

- [x] 4.1 Перестроить Contact в текущей 12-колоночной системе: крупный textarea, компактные name/reply-to поля, CTA `SAY HI`, прямые email/phone/GitHub ссылки и локализованные доступные labels/errors; проверить компонентными тестами RU/EN и visual snapshots.
- [x] 4.2 Добавить локальную required/email/length валидацию и локализованный live-region, который после допустимого submit честно сообщает о будущей отправке, не очищая поля; проверить ошибки, сохранение значений и keyboard-поведение.
- [x] 4.3 Гарантировать отсутствие `fetch`, Server Action, beacon, аналитической передачи и стороннего submit SDK в форме; проверить Playwright-перехватом, что взаимодействие не создаёт сетевых запросов, а прямая email-ссылка работает.

## 5. Footer и возврат наверх

- [x] 5.1 Удалить нижнюю правую подпись из footer-разметки, типа и локалей и перестроить meta-композицию, сохранив имя, статус, роль, локацию и год; проверить компонентным тестом отсутствие прежней подписи в RU/EN.
- [x] 5.2 Добавить локализованную `BackToTop`-кнопку с SVG-квадратом, кругом и стрелкой, hover/focus/touch состояниями в текущей палитре; проверить keyboard-доступность и visual snapshots desktop/mobile.
- [x] 5.3 Реализовать возврат к `#top`, корректный перенос фокуса и мгновенный reduced-motion вариант без конфликта с smooth wheel; проверить Playwright-сценарием из нижней части страницы для обычного и reduced-motion режима.
- [x] 5.4 Добавить в meta-зону footer маленькую локализованную кнопку очистки session-флага с доступным touch target, focus и live-подтверждением; проверить удаление только нужного ключа, отсутствие немедленного overlay и повторный `ENTER` после следующей загрузки/навигации.

## 6. Интеграция и приёмка

- [x] 6.1 Обновить существующий full-page visual harness: для обычных снимков заранее устанавливать session-флаг, а entry/contact/footer состояния снимать отдельно; проверить RU/EN эталоны на desktop, tablet и mobile через `npm run test:visual`.
- [x] 6.2 Добавить end-to-end маршрут первого визита: loading → ENTER → смена локали без повторного входа → Hero reveal → приглушённый marquee → section reveal → локальная форма без сети → session-reset → GO UP; проверить прохождение сценария в Chromium для обеих локалей.
- [x] 6.3 Проверить клавиатуру, видимый focus, accessible names/live regions, no-JS и `prefers-reduced-motion`; зафиксировать результаты в тестах и устранить нарушения до прохождения `npm test`.
- [x] 6.4 Запустить `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:seo`, `npm run validate:deployment` и `npm run test:visual`; завершить изменение только после успешного прохождения полного набора и ручной проверки visual diff.
